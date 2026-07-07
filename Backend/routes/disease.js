const express = require("express");
const multer = require("multer");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const PDFDocument = require("pdfkit");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/authMiddleware");
const DiseaseHistory = require("../models/diseaseHistory");
const diseaseDatabase = require("../data/diseaseDatabase.json");
const { analyzeCropImageWithGemini } = require("../utils/aiClient");
const Profile = require("../models/Profile");

const router = express.Router();

// Setup Multer Storage to keep file extensions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported image format."), false);
    }
  },
});

// Middleware to optionally extract user from JWT if available
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, "secretkey");
      req.user = decoded;
    } catch (err) {
      // Continue as guest
    }
  }
  next();
};

// POST / - AI Disease Detection
router.post("/", optionalAuth, async (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    let imagePath = null;
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image uploaded" });
      }

      console.log("[Disease] Image uploaded successfully:", req.file.path);
      console.log("[Disease] File size:", req.file.size, "bytes");
      imagePath = req.file.path;
      const crop = req.body.crop || "Auto-detect";
      console.log("[Disease] Crop selected:", crop);
      let responseData = null;

      // Determine if we should use the local Keras model (for Potato/Tomato)
      const useLocalModel = ["Potato", "Tomato"].includes(crop) || crop === "Auto-detect";

      let flaskOffline = false;

      if (useLocalModel) {
        console.log("[Disease] Calling Flask AI Server at http://127.0.0.1:5001/predict ...");
        try {
          const formData = new FormData();
          formData.append("image", fs.createReadStream(imagePath));

          const flaskResponse = await axios.post("http://127.0.0.1:5001/predict", formData, {
            headers: formData.getHeaders(),
            timeout: 30000, // 30s — TF model first run can be slow
          });

          console.log("[Disease] Flask HTTP status:", flaskResponse.status);
          console.log("[Disease] Flask raw response:", JSON.stringify(flaskResponse.data));

          const prediction = flaskResponse.data;
          const predictedLabel = prediction.disease;
          const confidence = prediction.confidence;

          console.log("[Disease] Predicted label:", predictedLabel);
          console.log("[Disease] Confidence:", confidence);

          if (!predictedLabel) {
            console.warn("[Disease] Flask returned no disease label. Data:", prediction);
          } else if (confidence < 20) {
            console.warn(`[Disease] Confidence too low (${confidence}%). Falling back to Gemini.`);
          } else {
            // Look up disease details from local JSON database
            const diseaseInfo = diseaseDatabase[predictedLabel];

            if (diseaseInfo) {
              console.log("[Disease] Found disease in DB:", diseaseInfo.disease_name);
              responseData = {
                disease_name: diseaseInfo.disease_name,
                raw_label: predictedLabel,
                crop: diseaseInfo.crop,
                confidence_score: confidence,
                severity: diseaseInfo.severity,
                symptoms: diseaseInfo.symptoms,
                causes: diseaseInfo.causes,
                treatmentOrganic: diseaseInfo.treatmentOrganic,
                treatmentChemical: diseaseInfo.treatmentChemical,
                prevention: diseaseInfo.prevention,
              };
            } else {
              // Label not in DB — build a minimal response so we don't fall to Gemini unnecessarily
              console.warn(`[Disease] Label "${predictedLabel}" not found in diseaseDatabase.json. Building minimal response.`);
              responseData = {
                disease_name: predictedLabel.replace(/___/g, " — ").replace(/_/g, " "),
                raw_label: predictedLabel,
                crop: predictedLabel.split("___")[0] || crop,
                confidence_score: confidence,
                severity: predictedLabel.toLowerCase().includes("healthy") ? "healthy" : "medium",
                symptoms: ["Refer to agricultural extension officer for detailed assessment."],
                causes: ["Detected by AI model. Detailed causes not available offline."],
                treatmentOrganic: ["Consult a local agronomist for organic treatment options."],
                treatmentChemical: ["Consult a local agronomist for chemical treatment options."],
                prevention: ["Follow standard crop hygiene practices."],
              };
            }
          }
        } catch (localError) {
          if (localError.code === "ECONNREFUSED" || localError.code === "ECONNABORTED" || localError.code === "ETIMEDOUT") {
            console.warn("[Disease] Flask server is offline or timed out. Code:", localError.code);
            flaskOffline = true;
          } else if (localError.response) {
            console.warn("[Disease] Flask returned error status:", localError.response.status, JSON.stringify(localError.response.data));
          } else {
            console.warn("[Disease] Flask request failed:", localError.message);
          }
        }
      }

      // Fallback to Gemini Vision if Flask failed, is offline, or returned low-confidence
      if (!responseData) {
        try {
          console.log("[Disease] Calling Gemini Cloud AI fallback...");
          const geminiResult = await analyzeCropImageWithGemini(imagePath, crop);
          console.log("[Disease] Gemini result:", JSON.stringify(geminiResult));
          responseData = geminiResult;
        } catch (geminiError) {
          console.error("[Disease] Gemini Vision prediction failed:", geminiError.message);
          let errorMsg = "Both local model and cloud AI failed to diagnose. Please try a clearer leaf photo.";
          if (flaskOffline) {
            errorMsg = "AI Server Offline";
          }
          return res.status(500).json({
            success: false,
            message: errorMsg,
          });
        }
      }

      // If authenticated, save the prediction history in MongoDB
      if (req.user && req.user.id) {
        try {
      // Normalize severity to match DB enum: ["low", "medium", "high", "healthy"]
          const rawSeverity = (responseData.severity || "").toLowerCase();
          let normalizedSeverity = "low";
          if (rawSeverity === "healthy") normalizedSeverity = "healthy";
          else if (["high", "severe", "critical"].includes(rawSeverity)) normalizedSeverity = "high";
          else if (["medium", "moderate", "mild"].includes(rawSeverity)) normalizedSeverity = "medium";
          else normalizedSeverity = "low";

          const historyItem = new DiseaseHistory({
            user: req.user.id,
            crop: responseData.crop,
            diseaseName: responseData.disease_name,
            rawLabel: responseData.raw_label || responseData.disease_name,
            confidence: responseData.confidence_score,
            severity: normalizedSeverity,
            symptoms: responseData.symptoms,
            causes: responseData.causes,
            treatmentOrganic: responseData.treatmentOrganic,
            treatmentChemical: responseData.treatmentChemical,
            prevention: responseData.prevention,
            imageUrl: `/uploads/${path.basename(imagePath)}`,
          });

          await historyItem.save();
          responseData.historyId = historyItem._id;
          responseData.imageUrl = historyItem.imageUrl;
          console.log("[Disease] History saved for user:", req.user.id);
        } catch (saveErr) {
          console.warn("[Disease] Could not save history:", saveErr.message);
          // Don't fail the whole request for a history save error
        }
      } else {
        // Guest user — clean up the image after a delay
        setTimeout(() => {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }, 5000);
      }

      console.log("[Disease] Prediction sent successfully. Disease:", responseData.disease_name, "Confidence:", responseData.confidence_score);
      return res.json({
        success: true,
        data: responseData,
      });

    } catch (error) {
      console.error("[Disease] Unhandled route error:", error);
      // Cleanup image on error
      if (imagePath && fs.existsSync(imagePath)) {
        try { fs.unlinkSync(imagePath); } catch (_) {}
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to process disease detection",
      });
    }
  }); // End of upload callback
});


// GET /history - Get user history
router.get("/history", authMiddleware, async (req, res, next) => {
  try {
    const history = await DiseaseHistory.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /history/:id - Delete prediction from history
router.delete("/history/:id", authMiddleware, async (req, res, next) => {
  try {
    const historyItem = await DiseaseHistory.findOne({ _id: req.params.id, user: req.user.id });
    if (!historyItem) {
      return res.status(404).json({ success: false, message: "History item not found" });
    }

    // Delete associated image file if it exists locally
    if (historyItem.imageUrl) {
      const fullPath = path.join(__dirname, "..", historyItem.imageUrl);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (fileErr) {
          console.warn("Could not delete image file from disk:", fileErr.message);
        }
      }
    }

    await DiseaseHistory.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: "Prediction deleted from history successfully",
    });
  } catch (error) {
    next(error);
  }
});

// GET /statistics - Get summary data for dashboard / analytics charts
router.get("/statistics", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const totalScans = await DiseaseHistory.countDocuments({ user: userId });
    
    // Aggregation for crop distribution
    const cropDistribution = await DiseaseHistory.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$crop", count: { $sum: 1 } } }
    ]);

    // Healthy vs Diseased count
    const healthStatus = await DiseaseHistory.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { 
        $group: { 
          _id: { $cond: [{ $eq: ["$severity", "healthy"] }, "Healthy", "Diseased"] }, 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Severity distribution
    const severityDistribution = await DiseaseHistory.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$severity", count: { $sum: 1 } } }
    ]);

    // Timeline count (Grouped by Month/Year)
    const monthlyScans = await DiseaseHistory.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Most common disease
    const commonDiseases = await DiseaseHistory.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), severity: { $ne: "healthy" } } },
      { $group: { _id: "$diseaseName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return res.json({
      success: true,
      data: {
        totalScans,
        cropDistribution: cropDistribution.map(c => ({ name: c._id, value: c.count })),
        healthDistribution: healthStatus.map(h => ({ status: h._id, count: h.count })),
        severityDistribution: severityDistribution.map(s => ({ level: s._id, count: s.count })),
        monthlyScans: monthlyScans.map(m => ({ month: `${m._id.month}/${m._id.year}`, count: m.count })),
        commonDiseases: commonDiseases.map(d => ({ disease: d._id, count: d.count })),
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /report/:id - Generate PDF Report for a diagnostic item
router.get("/report/:id", authMiddleware, async (req, res, next) => {
  try {
    const historyItem = await DiseaseHistory.findOne({ _id: req.params.id, user: req.user.id });
    if (!historyItem) {
      return res.status(404).json({ success: false, message: "History record not found" });
    }

    // Try fetching farmer profile for personalized PDF
    const profile = await Profile.findOne({ userId: req.user.id });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=disease-report-${historyItem._id}.pdf`);
    doc.pipe(res);

    // Cover Page Header
    doc
      .fillColor("#2E7D32")
      .fontSize(24)
      .text("SMART FARMER ADVISORY SYSTEM", { align: "center", bold: true })
      .fontSize(14)
      .fillColor("#555555")
      .text("AI-Powered Crop Pathology Report", { align: "center" })
      .moveDown(1.5);

    // Decorative line
    doc
      .strokeColor("#2E7D32")
      .lineWidth(2)
      .moveTo(50, doc.y)
      .lineTo(562, doc.y)
      .stroke()
      .moveDown(1.5);

    // Farmer Profile Section
    doc
      .fillColor("#333333")
      .fontSize(16)
      .text("Farmer & Location Details", { bold: true })
      .fontSize(12)
      .text(`Farmer Name: ${profile?.name || "Registered User"}`)
      .text(`State: ${profile?.state || "N/A"} | District: ${profile?.district || "N/A"}`)
      .text(`Farm Size: ${profile?.farmSize ? profile.farmSize + " Acres" : "N/A"}`)
      .text(`Report Date: ${new Date(historyItem.createdAt).toLocaleString()}`)
      .moveDown(1.5);

    // Diagnosis Summary Table
    doc
      .fillColor("#1B5E20")
      .fontSize(16)
      .text("Diagnostic Analysis Summary", { bold: true })
      .fontSize(12)
      .fillColor("#333333")
      .text(`Target Crop: ${historyItem.crop}`)
      .text(`Identified Condition: ${historyItem.diseaseName}`)
      .text(`Confidence Level: ${historyItem.confidence.toFixed(2)}%`)
      .text(`Severity Index: ${historyItem.severity.toUpperCase()}`)
      .moveDown(1.5);

    // If there is an image, we can optionally print it (if path exists on server)
    if (historyItem.imageUrl) {
      const localImagePath = path.join(__dirname, "..", historyItem.imageUrl);
      if (fs.existsSync(localImagePath)) {
        try {
          // Print leaf image preview resized to fit page
          doc.text("Leaf Image Snapshot Analyzed:", { oblique: true });
          doc.image(localImagePath, { fit: [250, 150], align: 'center' });
          doc.moveDown(8);
        } catch (imgErr) {
          // Skip image insert if invalid format/corrupted
        }
      }
    }

    // Detail Sections
    const printListSection = (title, items, color = "#2E7D32") => {
      if (items && items.length > 0) {
        doc.fillColor(color).fontSize(14).text(title, { bold: true }).moveDown(0.2);
        doc.fillColor("#444444").fontSize(11);
        items.forEach(item => {
          doc.text(`• ${item}`, { indent: 15 });
        });
        doc.moveDown(1);
      }
    };

    printListSection("Observed Symptoms", historyItem.symptoms);
    printListSection("Key Primary Causes", historyItem.causes);
    printListSection("Recommended Organic / Eco-Friendly Treatments", historyItem.treatmentOrganic);
    printListSection("Recommended Chemical Treatments", historyItem.treatmentChemical);
    printListSection("Prevention Guidelines", historyItem.prevention);

    // Footer
    doc
      .moveDown(2)
      .strokeColor("#E0E0E0")
      .lineWidth(0.5)
      .moveTo(50, doc.y)
      .lineTo(562, doc.y)
      .stroke()
      .moveDown(1);

    doc
      .fillColor("#888888")
      .fontSize(9)
      .text("This report is generated dynamically by an artificial intelligence advisory engine.", { align: "center" })
      .text("Please consult a local agricultural department specialist before applying massive chemical pesticides.", { align: "center" })
      .text("Smart Farmer Advisory System © 2026", { align: "center" });

    doc.end();

  } catch (error) {
    console.error("PDF generation failed:", error);
    res.status(500).json({ success: false, message: "Could not compile PDF report document" });
  }
});

module.exports = router;
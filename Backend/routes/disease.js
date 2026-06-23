const express = require("express");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPEG, PNG, WebP and GIF images are allowed"
        ),
        false
      );
    }
  },
});

// AI Disease Detection Route
router.post(
  "/",
  upload.single("image"),
  async (req, res) => {
    let uploadedFile = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image uploaded",
        });
      }

      uploadedFile = req.file.path;

      const formData = new FormData();

      formData.append(
        "image",
        fs.createReadStream(req.file.path)
      );

      const flaskResponse = await axios.post(
        "http://127.0.0.1:5001/predict",
        formData,
        {
          headers: formData.getHeaders(),
        }
      );

      const prediction = flaskResponse.data;
      console.log(flaskResponse.data);

      return res.json({
        success: true,
        data: {
          disease_name: prediction.disease,
          confidence_score:
            prediction.confidence,
          severity:
            prediction.confidence > 90
              ? "high"
              : prediction.confidence > 70
              ? "medium"
              : "low",
          symptoms: [],
          treatment: [],
          urgent_action_needed:
            prediction.confidence > 90,
        },
      });
    } catch (error) {
      console.error(
        "Disease Detection Error:"
      );
      console.error(
        error.response?.data ||
          error.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Disease prediction failed",
      });
    } finally {
      if (
        uploadedFile &&
        fs.existsSync(uploadedFile)
      ) {
        fs.unlinkSync(uploadedFile);
      }
    }
  }
);

// Optional detailed endpoint
router.post("/detailed", async (req, res) => {
  return res.json({
    success: true,
    message:
      "Detailed disease information feature coming soon",
  });
});

module.exports = router;
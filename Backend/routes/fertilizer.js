const express = require("express");
const axios = require("axios");
const Profile = require("../models/Profile");
const authMiddleware = require("../middleware/authMiddleware");
const {
  generateAIResponse,
} = require("../utils/aiClient");
// Import utilities
const cacheManager = require("../utils/cacheManager");
const validator = require("../utils/validator");
const responseFormatter = require("../utils/responseFormatter");
const { errorHandler } = require("../utils/errorHandler");
const logger = require("../utils/logger");
const translations = require("../utils/translations");

const router = express.Router();


/**
 * GET /fertilizer
 * Get fertilizer recommendations based on profile
 * Query params: language (optional, default: en)
 */
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { language = "en" } = req.query;

    // Validate language
    if (!validator.isValidLanguage(language)) {
      return res.status(400).json(
        responseFormatter.error("Invalid language", 400)
      );
    }

    // Create cache key
    const cacheKey = `fertilizer_recommendations_${req.user.id}_${language}`;

    // Check cache (6 hour TTL for fertilizer info)
    if (cacheManager.has(cacheKey)) {
      logger.debug("Cache hit for fertilizer recommendations", { cacheKey });
      return res.json(
        responseFormatter.advisory(
          cacheManager.get(cacheKey),
          "fertilizer",
          translations.getTranslation(language, "fertilizer.recommendations_generated")
        )
      );
    }

    // Fetch user profile
    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      logger.warn("No profile found for fertilizer recommendation");
      return res.status(404).json(
        responseFormatter.error("Farmer profile not found", 404)
      );
    }

    // Validate profile fields
    if (!validator.isValidCrop(profile.preferredCrop)) {
      return res.status(400).json(
        responseFormatter.error("Invalid crop in profile", 400)
      );
    }

    if (!validator.isValidSoilType(profile.soilType)) {
      return res.status(400).json(
        responseFormatter.error("Invalid soil type in profile", 400)
      );
    }

    // Get weather data for better recommendations
    let weatherInfo = "";
    try {
      const districtCoordinates = require("../data/districtCoordinates.json");
      const stateDistricts = districtCoordinates[profile.state];
      
      if (stateDistricts && stateDistricts[profile.district]) {
        const { latitude, longitude } = stateDistricts[profile.district];
        
        const weatherResponse = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,soil_temperature_0cm,soil_moisture_0_1cm`
        );
        
        const weather = weatherResponse.data.current;
        weatherInfo = `
Current Soil Conditions:
- Temperature: ${weather.temperature_2m}°C
- Soil Temperature: ${weather.soil_temperature_0cm}°C
- Soil Moisture: ${weather.soil_moisture_0_1cm}%
`;
      }
    } catch (weatherError) {
      logger.warn("Could not fetch soil/weather data", { error: weatherError.message });
    }

    // Enhanced prompt with comprehensive context
    const prompt = `You are an expert soil scientist and fertilizer specialist in Indian agriculture.

Farmer Profile:
- Crop: ${profile.preferredCrop}
- Soil Type: ${profile.soilType}
- District: ${profile.district}
- State: ${profile.state}
- Farm Size: ${profile.farmSize} acres
- Irrigation: ${profile.irrigationType || "Not specified"}
${weatherInfo}

Provide COMPREHENSIVE fertilizer recommendation including:
1. Primary NPK ratio and quantities (kg/acre)
2. Micronutrients needed (if any)
3. Month-wise application schedule
4. Estimated total cost per acre
5. Expected yield improvement percentage
6. Environmental considerations
7. Safety precautions
8. Signs of deficiency to watch for

Return ONLY valid JSON:
{
  "crop": "${profile.preferredCrop}",
  "soil_type": "${profile.soilType}",
  "npk_ratio": "...",
  "primary_fertilizer": {
    "name": "...",
    "quantity_kg_per_acre": ...,
    "cost_per_kg": ...
  },
  "micronutrients": [
    {"name": "...", "quantity": "...", "cost": ...}
  ],
  "application_schedule": {
    "month": "quantity_kg"
  },
  "total_estimated_cost": ...,
  "yield_improvement_percent": ...,
  "environmental_impact": "...",
  "precautions": "...",
  "deficiency_signs": "...",
  "tips": "..."
}

Respond ONLY in ${language} language.`;

    let responseText = await generateAIResponse(prompt);
    responseText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let fertilizeData;

try {
  fertilizeData = JSON.parse(responseText);
  if (fertilizeData.success === false || !fertilizeData.npk_ratio) {
    throw new Error("Invalid AI response");
  }
} catch (e) {
  fertilizeData = {
    crop: profile?.preferredCrop || "Rice",
    soil_type: profile?.soilType || "Black Soil",
    npk_ratio: "19:19:19",
    total_estimated_cost: 2500,
    yield_improvement_percent: 15,
    tips: "Apply fertilizer in split doses."
  };
}

    // Cache for 6 hours
    cacheManager.set(cacheKey, fertilizeData, 21600000);

    logger.info("Fertilizer recommendations generated", {
      profile: profile._id,
      language,
      crop: profile.preferredCrop
    });

    res.json(
      responseFormatter.advisory(
        fertilizeData,
        "fertilizer",
        translations.getTranslation(language, "fertilizer.recommendations_generated")
      )
    );

  } catch (error) {
    logger.error("Error in fertilizer route", error);
    next(error);
  }
});

/**
 * POST /fertilizer/analyze
 * Analyze soil and provide detailed fertilizer plan
 */
router.post("/analyze", authMiddleware, async (req, res, next) => {
  try {
    const { soil_ph, soil_nitrogen, soil_potassium, soil_phosphorus, language = "en" } = req.body;

    // Validate language
    if (!validator.isValidLanguage(language)) {
      return res.status(400).json(
        responseFormatter.error("Invalid language", 400)
      );
    }

    const profile = await Profile.findOne({ userId: req.user.id });

    if (!profile) {
      return res.status(404).json(
        responseFormatter.error("Farmer profile not found", 404)
      );
    }

    const cacheKey = `fertilizer_analysis_${req.user.id}_${language}`;

    if (cacheManager.has(cacheKey)) {
      return res.json(responseFormatter.advisory(cacheManager.get(cacheKey), "fertilizer", "Soil analysis"));
    }

    const analysisPrompt = `You are a soil chemist and agricultural expert.

Soil Analysis Results for ${profile.preferredCrop} farming:
- pH: ${soil_ph || "Unknown"}
- Nitrogen: ${soil_nitrogen || "Unknown"} mg/kg
- Phosphorus: ${soil_phosphorus || "Unknown"} mg/kg
- Potassium: ${soil_potassium || "Unknown"} mg/kg
- Soil Type: ${profile.soilType}

Based on this analysis, provide:
1. Soil health assessment
2. Deficiencies identified
3. Specific fertilizer recommendations
4. Corrective measures
5. Timeline for improvement
6. Cost estimate

Return ONLY valid JSON with these fields.

Respond ONLY in ${language} language.`;

    let responseText = await generateAIResponse(
  analysisPrompt
);
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let analysis;

try {
  analysis = JSON.parse(responseText);
  if (analysis.success === false || (!analysis.soil_health && !analysis.recommendation)) {
    throw new Error("Invalid AI response");
  }
} catch (e) {
  analysis = {
    soil_health: "Good",
    recommendation: "Balanced NPK fertilizer",
    cost_estimate: 2000
  };
}

    cacheManager.set(cacheKey, analysis, 86400000); // 24 hours

    res.json(responseFormatter.advisory(analysis, "fertilizer", "Detailed soil analysis"));

  } catch (error) {
    logger.error("Error in soil analysis", error);
    next(error);
  }
});

module.exports = router;
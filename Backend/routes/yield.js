const express = require("express");
const axios = require("axios");
const { generateAIResponse } = require("../utils/aiClient");

// Import utilities
const cacheManager = require("../utils/cacheManager");
const validator = require("../utils/validator");
const responseFormatter = require("../utils/responseFormatter");
const logger = require("../utils/logger");
const translations = require("../utils/translations");

const router = express.Router();
const Profile = require("../models/Profile");



/**
 * GET /yield
 * Predict yield based on profile and current conditions
 * Query params: language (optional, default: en)
 */
router.get("/", async (req, res, next) => {
  try {
    const { language = "en" } = req.query;

    // Validate language
    if (!validator.isValidLanguage(language)) {
      return res.status(400).json(
        responseFormatter.error("Invalid language", 400)
      );
    }

    // No caching for yield predictions (real-time based on weather)
    const profile = await Profile.findOne().sort({ _id: -1 });

    if (!profile) {
      logger.warn("No profile found for yield prediction");
      return res.status(404).json(
        responseFormatter.error("Farmer profile not found", 404)
      );
    }

    // Validate profile
    if (!validator.isValidCrop(profile.preferredCrop) || !validator.isValidFarmSize(profile.farmSize)) {
      return res.status(400).json(
        responseFormatter.error("Invalid profile data", 400)
      );
    }

    // Get current weather for yield factors
    let weatherContext = "";
    try {
      const districtCoordinates = require("../data/districtCoordinates.json");
      const stateDistricts = districtCoordinates[profile.state];
      
      if (stateDistricts && stateDistricts[profile.district]) {
        const { latitude, longitude } = stateDistricts[profile.district];
        
        const weatherResponse = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m`
        );
        
        const weather = weatherResponse.data.current;
        weatherContext = `
Current Weather Factors:
- Temperature: ${weather.temperature_2m}°C
- Humidity: ${weather.relative_humidity_2m}%
- Rainfall: ${weather.precipitation}mm
- Wind Speed: ${weather.wind_speed_10m} km/h
`;
      }
    } catch (weatherError) {
      logger.warn("Could not fetch weather for yield prediction", { error: weatherError.message });
    }

    // Build comprehensive yield prediction prompt
    const prompt = `You are an expert agricultural yield forecaster with deep knowledge of Indian farming.

Farmer Profile:
- Crop: ${profile.preferredCrop}
- Farm Size: ${profile.farmSize} acres
- Soil Type: ${profile.soilType}
- District: ${profile.district}
- State: ${profile.state}
- Irrigation Type: ${profile.irrigationType || "Not specified"}
${weatherContext}

Based on this information, predict the YIELD for this crop with detailed analysis:

1. Expected yield (kg/acre)
2. Total expected yield (quintals)
3. Confidence score (0-100)
4. Yield factors analysis (positive and negative)
5. Weather impact on yield
6. Soil impact on yield
7. Irrigation impact on yield
8. Recommendations to improve yield
9. Risk factors to consider
10. Comparison with state average

Return ONLY valid JSON:
{
  "crop": "${profile.preferredCrop}",
  "farm_size": ${profile.farmSize},
  "expected_yield_per_acre": ...,
  "total_expected_yield_quintals": ...,
  "confidence_score": ...,
  "confidence_level": "High/Medium/Low",
  "yield_analysis": {
    "positive_factors": ["..."],
    "negative_factors": ["..."],
    "weather_impact": "...",
    "soil_impact": "...",
    "irrigation_impact": "..."
  },
  "recommendations": ["..."],
  "risk_factors": ["..."],
  "state_average_comparison": "..."
}

Respond ONLY in ${language} language.`;

    let responseText = await generateAIResponse(prompt);
    responseText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

   let yieldData;

try {
  yieldData = JSON.parse(responseText);
} catch (err) {
  console.error("Yield JSON Parse Error:", responseText);

  yieldData = {
    crop: profile.preferredCrop,
    farm_size: profile.farmSize,
    expected_yield_per_acre: 25,
    total_expected_yield_quintals: profile.farmSize * 25,
    confidence_score: 75,
    confidence_level: "Medium",
    yield_analysis: {
      positive_factors: ["Suitable soil"],
      negative_factors: ["Weather uncertainty"],
      weather_impact: "Moderate",
      soil_impact: "Good",
      irrigation_impact: "Adequate"
    },
    recommendations: [
      "Maintain proper irrigation",
      "Apply balanced fertilizer"
    ],
    risk_factors: [
      "Pest infestation",
      "Irregular rainfall"
    ],
    state_average_comparison: "Near state average"
  };
}

    logger.info("Yield prediction generated", {
      profile: profile._id,
      language,
      crop: profile.preferredCrop,
      confidence: yieldData.confidence_score
    });

    res.json(
      responseFormatter.prediction(
        yieldData,
        "yield",
        yieldData.confidence_score / 100,
        translations.getTranslation(language, "yield.prediction_generated")
      )
    );

  } catch (error) {
    logger.error("Error in yield prediction route", error);
    next(error);
  }
});

/**
 * POST /yield/factors
 * Analyze specific factors affecting yield
 */
router.post("/factors", async (req, res, next) => {
  try {
    const { 
      temperature_avg, 
      rainfall_mm, 
      humidity_percent,
      language = "en" 
    } = req.body;

    // Validate inputs
    if (temperature_avg && !validator.isValidTemperature(temperature_avg)) {
      return res.status(400).json(
        responseFormatter.error("Invalid temperature value", 400)
      );
    }

    if (humidity_percent && !validator.isValidHumidity(humidity_percent)) {
      return res.status(400).json(
        responseFormatter.error("Invalid humidity value", 400)
      );
    }

    if (!validator.isValidLanguage(language)) {
      return res.status(400).json(
        responseFormatter.error("Invalid language", 400)
      );
    }

    const profile = await Profile.findOne().sort({ _id: -1 });

    if (!profile) {
      return res.status(404).json(
        responseFormatter.error("Farmer profile not found", 404)
      );
    }

    const factorsPrompt = `Analyze how these weather factors will affect ${profile.preferredCrop} yield:
- Average Temperature: ${temperature_avg}°C
- Rainfall: ${rainfall_mm}mm
- Humidity: ${humidity_percent}%
- Soil Type: ${profile.soilType}
- Farm Size: ${profile.farmSize} acres

Provide analysis with:
1. Optimal ranges for the crop
2. How current conditions compare
3. Impact on yield percentage
4. Recommendations for mitigation

Return ONLY valid JSON.

Respond ONLY in ${language} language.`;

    let responseText = await generateAIResponse(
  factorsPrompt
);
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let analysis;

try {
  analysis = JSON.parse(responseText);
} catch (err) {
  console.error("Yield Factors Parse Error:", responseText);

  analysis = {
    impact: "Moderate",
    recommendations: [
      "Monitor weather conditions",
      "Maintain soil moisture"
    ]
  };
}

    res.json(responseFormatter.prediction(analysis, "yield_factors", 0.8, "Factor analysis"));

  } catch (error) {
    logger.error("Error in yield factors analysis", error);
    next(error);
  }
});

module.exports = router;
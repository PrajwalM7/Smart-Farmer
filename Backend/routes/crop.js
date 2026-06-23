const express = require("express");
const axios = require("axios");
const Profile = require("../models/Profile");
const {
  generateAIResponse,
} = require("../utils/aiClient");

// Import utilities
const cacheManager = require("../utils/cacheManager");
const validator = require("../utils/validator");
const responseFormatter = require("../utils/responseFormatter");
const { errorHandler, APIError } = require("../utils/errorHandler");
const logger = require("../utils/logger");
const translations = require("../utils/translations");

const router = express.Router();


/**
 * GET /crop
 * Get crop recommendations based on farmer profile
 * Query params: language (optional, default: en)
 */
router.get("/", async (req, res, next) => {
  try {
    const { language = "en" } = req.query;

    // Validate language
    if (!validator.isValidLanguage(language)) {
      return res.status(400).json(
        responseFormatter.error("Invalid language. Supported: en, kn, hi, te, ta, ml, mr", 400)
      );
    }

    // Create cache key
    const cacheKey = `crop_recommendations_${language}`;

    // Check cache first (1 hour TTL)
    if (cacheManager.has(cacheKey)) {
      logger.debug("Cache hit for crop recommendations", { cacheKey });
      const cachedData = cacheManager.get(cacheKey);
      return res.json(
        responseFormatter.recommendation(
          cachedData.recommendations,
          "crop",
          translations.getTranslation(language, "crop.recommendations_generated")
        )
      );
    }

    // Fetch latest profile
    const profile = await Profile.findOne().sort({ _id: -1 });

    if (!profile) {
      logger.warn("No profile found for crop recommendation");
      // Return default recommendations
      const defaults = [
        {
          crop: "Rice",
          season: "Kharif",
          suitability: "Medium",
          reason: "Default recommendation"
        },
        {
          crop: "Maize",
          season: "Kharif",
          suitability: "Medium",
          reason: "Default recommendation"
        },
        {
          crop: "Sugarcane",
          season: "Year-round",
          suitability: "Low",
          reason: "Default recommendation"
        }
      ];

      // Cache for 1 hour
      cacheManager.set(cacheKey, { recommendations: defaults }, 3600000);

      return res.json(
        responseFormatter.recommendation(
          defaults,
          "crop",
          "Default recommendations"
        )
      );
    }

    // Get weather data for enhanced recommendations
    let weatherData = null;
    try {
      // Try to get weather from districtCoordinates
      const districtCoordinates = require("../data/districtCoordinates.json");
      const stateDistricts = districtCoordinates[profile.state];
      
      if (stateDistricts && stateDistricts[profile.district]) {
        const { latitude, longitude } = stateDistricts[profile.district];
        
        // Get weather from Open-Meteo API
        const weatherResponse = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation`
        );
        
        weatherData = weatherResponse.data.current;
      }
    } catch (weatherError) {
      logger.warn("Could not fetch weather data for crop recommendation", { error: weatherError.message });
      // Continue without weather data
    }

    // Build enhanced Gemini prompt
    const weatherInfo = weatherData
      ? `
Current Weather:
- Temperature: ${weatherData.temperature_2m}°C
- Humidity: ${weatherData.relative_humidity_2m}%
- Precipitation: ${weatherData.precipitation}mm
`
      : "Weather data not available.";

    const prompt = `You are an expert agricultural advisor specializing in Indian farming.

Farmer Profile:
- State: ${profile.state}
- District: ${profile.district}
- Soil Type: ${profile.soilType}
- Farm Size: ${profile.farmSize} acres
- Preferred Crop: ${profile.preferredCrop}
- Irrigation Type: ${profile.irrigationType || "Not specified"}

${weatherInfo}

Based on this comprehensive profile, recommend the 5 BEST SUITABLE crops for this season.

For each crop provide:
1. crop: Exact crop name
2. season: Kharif, Rabi, or Zaid
3. suitability: High, Medium, or Low (0-100 score)
4. yield: Estimated yield in kg/acre
5. reason: 2-3 sentence explanation
6. duration: Days to harvest
7. market_demand: High, Medium, or Low

CRITICAL: Return ONLY valid JSON array. No other text.

Return format:
{
  "recommendations": [
    {
      "crop": "Rice",
      "season": "Kharif",
      "suitability": 95,
      "yield": 25,
      "reason": "Perfect climate and soil match.",
      "duration": 120,
      "market_demand": "High"
    }
  ]
}

Respond ONLY in ${language} language.`;

    // Call Gemini API
    let responseText = await generateAIResponse(prompt);
       responseText = responseText
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();
    // Clean response
    responseText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Parse JSON
    let aiData;

try {
  aiData = JSON.parse(responseText);
} catch (e) {
  aiData = {
    recommendations: [
      {
        crop: "Rice",
        season: "Kharif",
        suitability: 95,
        yield: 25,
        reason: "Suitable for local climate",
        duration: 120,
        market_demand: "High",
      },
      {
        crop: "Maize",
        season: "Kharif",
        suitability: 88,
        yield: 20,
        reason: "Good profitability",
        duration: 100,
        market_demand: "High",
      },
    ],
  };
}

    // Validate AI response
    if (!aiData.recommendations || !Array.isArray(aiData.recommendations)) {
      throw new Error("Invalid AI response format");
    }

    // Cache the recommendations (1 hour TTL)
    cacheManager.set(cacheKey, aiData, 3600000);

    logger.info("Crop recommendations generated successfully", {
      profile: profile._id,
      language,
      count: aiData.recommendations.length
    });

    res.json(
      responseFormatter.recommendation(
        aiData.recommendations,
        "crop",
        translations.getTranslation(language, "crop.recommendations_generated")
      )
    );

  } catch (error) {
    logger.error("Error in crop recommendation route", error);
    next(error); // Pass to error middleware
  }
});

/**
 * POST /crop/recommendation
 * Get detailed recommendation for a specific crop
 */
router.post("/recommendation", async (req, res, next) => {
  try {
    const { crop, language = "en" } = req.body;

    // Validate inputs
    if (!validator.isValidCrop(crop)) {
      return res.status(400).json(
        responseFormatter.error("Invalid crop name", 400)
      );
    }

    if (!validator.isValidLanguage(language)) {
      return res.status(400).json(
        responseFormatter.error("Invalid language", 400)
      );
    }

    // Create cache key
    const cacheKey = `crop_detail_${crop}_${language}`;

    // Check cache
    if (cacheManager.has(cacheKey)) {
      logger.debug("Cache hit for crop details", { cacheKey });
      return res.json(
        responseFormatter.recommendation(
          [cacheManager.get(cacheKey)],
          "crop",
          "Crop details retrieved"
        )
      );
    }

    // Get profile for context
    const profile = await Profile.findOne().sort({ _id: -1 });

    const detailedPrompt = `You are an expert agricultural advisor.

Farmer is asking about growing ${crop}.

${profile ? `Their context: State=${profile.state}, Soil=${profile.soilType}, Farm Size=${profile.farmSize} acres` : "No profile context available."}

Provide detailed information about ${crop}:
1. Best season to plant (Kharif/Rabi/Zaid)
2. Soil requirements
3. Water requirements
4. Temperature range
5. Estimated yield (kg/acre)
6. Days to harvest
7. Key nutrients needed
8. Common pests & diseases
9. Market value (approx)
10. Precautions & tips

Return ONLY valid JSON:
{
  "crop": "${crop}",
  "season": "...",
  "soil_requirements": "...",
  "water_requirements": "...",
  "temperature_range": "...",
  "yield": ...,
  "days_to_harvest": ...,
  "nutrients": "...",
  "pests_diseases": "...",
  "market_value": "...",
  "tips": "..."
}

Respond ONLY in ${language} language.`;

    let responseText = await generateAIResponse(
  detailedPrompt
);


    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const cropDetails = JSON.parse(responseText);

    // Cache for 1 hour
    cacheManager.set(cacheKey, cropDetails, 3600000);

    res.json(responseFormatter.recommendation([cropDetails], "crop", "Detailed crop information"));

  } catch (error) {
    logger.error("Error in detailed crop recommendation", error);
    next(error);
  }
});

module.exports = router;
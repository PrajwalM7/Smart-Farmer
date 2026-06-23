const express = require("express");
const axios = require("axios");
const { generateAIResponse } = require("../utils/aiClient");

// Import utilities
const validator = require("../utils/validator");
const responseFormatter = require("../utils/responseFormatter");
const logger = require("../utils/logger");
const translations = require("../utils/translations");

const router = express.Router();
const Profile = require("../models/Profile");



/**
 * GET /pest
 * Get pest alert based on current conditions
 * Query params: temperature, humidity, language
 */
router.get("/", async (req, res, next) => {
  try {
    const { temperature, humidity, language = "en" } = req.query;
    
    // Validate language
    if (!validator.isValidLanguage(language)) {
      return res.status(400).json(
        responseFormatter.error("Invalid language", 400)
      );
    }

    // Validate weather parameters
    const temp = temperature ? parseFloat(temperature) : null;
    const humid = humidity ? parseFloat(humidity) : null;

    if (temp && !validator.isValidTemperature(temp)) {
      return res.status(400).json(
        responseFormatter.error("Invalid temperature", 400)
      );
    }

    if (humid && !validator.isValidHumidity(humid)) {
      return res.status(400).json(
        responseFormatter.error("Invalid humidity", 400)
      );
    }

    const profile = await Profile.findOne().sort({ _id: -1 });

    // Get real-time weather if not provided
    let weatherContext = "";
    let realTemp = temp;
    let realHumid = humid;

    if (!realTemp || !realHumid) {
      try {
        const districtCoordinates = require("../data/districtCoordinates.json");
        const stateDistricts = districtCoordinates[profile?.state || ""];
        
        if (stateDistricts && stateDistricts[profile?.district || ""]) {
          const { latitude, longitude } = stateDistricts[profile.district];
          
          const weatherResponse = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,soil_moisture_0_1cm`
          );
          
          const weather = weatherResponse.data.current;
          realTemp = realTemp || weather.temperature_2m;
          realHumid = realHumid || weather.relative_humidity_2m;
          
          weatherContext = `
Current Weather Conditions:
- Temperature: ${weather.temperature_2m}°C
- Humidity: ${weather.relative_humidity_2m}%
- Rainfall: ${weather.precipitation}mm
- Wind Speed: ${weather.wind_speed_10m} km/h
- Soil Moisture: ${weather.soil_moisture_0_1cm}%
`;
        }
      } catch (weatherError) {
        logger.warn("Could not fetch real weather for pest alert", { error: weatherError.message });
        // Use defaults
        realTemp = realTemp || 25;
        realHumid = realHumid || 60;
      }
    }

    // Build comprehensive pest analysis prompt
    const cropInfo = profile ? `Crop: ${profile.preferredCrop}, Soil: ${profile.soilType}` : "Crop data not available";
    
    const prompt = `You are an expert entomologist and integrated pest management (IPM) specialist in Indian agriculture.

Farmer Profile:
${cropInfo}
District: ${profile?.district || "Not specified"}

${weatherContext || `Temperature: ${realTemp}°C, Humidity: ${realHumid}%`}

Based on these conditions, provide a COMPREHENSIVE pest and disease alert including:

1. Pest risk level (Critical/High/Medium/Low)
2. Specific pests likely to appear
3. Disease risk assessment
4. Early warning signs to watch for
5. Immediate preventive measures
6. Chemical treatments (if needed)
7. Biological controls
8. When to seek professional help
9. Monitoring schedule
10. Weather impact on pest activity

Return ONLY valid JSON:
{
  "risk_level": "Low/Medium/High/Critical",
  "risk_score": ...,
  "identified_pests": [
    {
      "pest_name": "...",
      "likelihood": "High/Medium/Low",
      "damage_potential": "High/Medium/Low",
      "prevention": "...",
      "treatment": "..."
    }
  ],
  "disease_risk": {
    "type": "...",
    "likelihood": "...",
    "prevention": "..."
  },
  "early_warning_signs": ["..."],
  "immediate_actions": ["..."],
  "monitoring_frequency": "...",
  "weather_impact": "...",
  "treatment_options": {
    "organic": ["..."],
    "chemical": ["..."],
    "biological": ["..."]
  },
  "follow_up_schedule": "..."
}

Respond ONLY in ${language} language.`;

   let responseText = await generateAIResponse(prompt);
    responseText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const pestData = JSON.parse(responseText);

    // Determine alert level
    let alertLevel = "low";
    if (pestData.risk_level === "Critical") alertLevel = "critical";
    else if (pestData.risk_level === "High") alertLevel = "high";
    else if (pestData.risk_level === "Medium") alertLevel = "medium";

    logger.info("Pest alert generated", {
      profile: profile?._id,
      language,
      risk_level: pestData.risk_level
    });

    res.json(
      responseFormatter.alert(
        pestData,
        "pest",
        alertLevel,
        translations.getTranslation(language, "pest.alert_generated")
      )
    );

  } catch (error) {
    logger.error("Error in pest alert route", error);
    next(error);
  }
});

/**
 * POST /pest/identify
 * Identify specific pest or disease
 */
router.post("/identify", async (req, res, next) => {
  try {
    const { pest_or_disease_name, symptoms, language = "en" } = req.body;

    // Validate inputs
    if (!pest_or_disease_name || !symptoms) {
      return res.status(400).json(
        responseFormatter.error("pest_or_disease_name and symptoms are required", 400)
      );
    }

    if (!validator.isValidLanguage(language)) {
      return res.status(400).json(
        responseFormatter.error("Invalid language", 400)
      );
    }

    const identificationPrompt = `Provide detailed information about the pest/disease: "${pest_or_disease_name}"

Symptoms reported: ${symptoms}

Include:
1. Accurate identification
2. Disease cycle
3. Affected crop stages
4. Environmental conditions favoring it
5. Damage threshold
6. Control methods (cultural, biological, chemical)
7. Resistant varieties (if applicable)
8. Forecast conditions

Return ONLY valid JSON.

Respond ONLY in ${language} language.`;

    let responseText = await generateAIResponse(
  identificationPrompt
);
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const identification = JSON.parse(responseText);

    res.json(responseFormatter.alert(identification, "pest_identification", "medium", "Pest identification"));

  } catch (error) {
    logger.error("Error in pest identification", error);
    next(error);
  }
});

module.exports = router;
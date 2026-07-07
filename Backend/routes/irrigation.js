const express = require("express");
const axios = require("axios");
const { generateAIResponse } = require("../utils/aiClient");
const authMiddleware = require("../middleware/authMiddleware");
// Import utilities
const validator = require("../utils/validator");
const responseFormatter = require("../utils/responseFormatter");
const logger = require("../utils/logger");
const translations = require("../utils/translations");
const { DEFAULT_TTL, getCacheKey } = require("../config/cacheConfig");
const cacheManager = require("../utils/cacheManager");
const router = express.Router();
const Profile = require("../models/Profile");

/**
 * GET /irrigation
 * Get irrigation advisory based on profile and weather
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

    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      logger.warn("No profile found for irrigation advisory");
      return res.status(404).json(responseFormatter.error("Farmer profile not found", 404));
    }
    if (!profile.state || !profile.district) {
      return res.status(400).json(responseFormatter.error("Profile missing state or district information", 400));
    }

    // Validate profile
    if (!validator.isValidCrop(profile.preferredCrop)) {
      return res.status(400).json(
        responseFormatter.error("Invalid crop in profile", 400)
      );
    }

    // Get real-time weather data
    let weatherData = null;
    try {
      const districtCoordinates = require("../data/districtCoordinates.json");
      const stateDistricts = districtCoordinates[profile.state];
      
      if (stateDistricts && stateDistricts[profile.district]) {
        const { latitude, longitude } = stateDistricts[profile.district];
        
        // Get hourly weather forecast for next 7 days
        const weatherResponse = await axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=precipitation_sum,temperature_2m_max,temperature_2m_min&timezone=auto`
        );
        
        weatherData = weatherResponse.data;
      }
    } catch (weatherError) {
      logger.warn("Could not fetch weather for irrigation", { error: weatherError.message });
    }

    // Build weather context
    let weatherContext = "";
    if (weatherData) {
      const current = weatherData.current;
      const daily = weatherData.daily;
      
      weatherContext = `
Current Weather:
- Temperature: ${current.temperature_2m}°C
- Humidity: ${current.relative_humidity_2m}%
- Rainfall: ${current.precipitation}mm
- Wind Speed: ${current.wind_speed_10m} km/h

7-Day Forecast:
- Rainfall Expected: ${daily.precipitation_sum[0]}mm (today), avg ${(daily.precipitation_sum.reduce((a,b) => a+b, 0) / 7).toFixed(1)}mm
- Temperature Range: ${daily.temperature_2m_min[0]}°C to ${daily.temperature_2m_max[0]}°C
`;
    }

    // Build comprehensive irrigation prompt
    const prompt = `You are an expert irrigation engineer and agricultural specialist in India.

Farmer Profile:
- Crop: ${profile.preferredCrop}
- Soil Type: ${profile.soilType}
- Farm Size: ${profile.farmSize} acres
- Irrigation Type: ${profile.irrigationType || "Not specified"}
- District: ${profile.district}
- State: ${profile.state}
${weatherContext}

Provide DETAILED irrigation advisory including:

1. Daily water requirement (mm and liters)
2. Irrigation schedule (frequency and timing)
3. Best irrigation method for this crop & soil
4. Seasonal variation in water needs
5. Soil moisture monitoring tips
6. Water conservation techniques
7. Signs of over/under-watering
8. Cost-effective irrigation practices
9. Drainage requirements
10. Climate-specific recommendations

Return ONLY valid JSON:
{
  "crop": "${profile.preferredCrop}",
  "soil_type": "${profile.soilType}",
  "irrigation_type": "${profile.irrigationType || 'Unknown'}",
  "daily_water_requirement_mm": ...,
  "daily_water_requirement_liters_per_acre": ...,
  "irrigation_frequency_days": ...,
  "irrigation_timing": "...",
  "best_method": "...",
  "seasonal_requirements": {
    "kharif": "...",
    "rabi": "...",
    "summer": "..."
  },
  "moisture_monitoring": "...",
  "water_conservation": ["..."],
  "over_watering_signs": ["..."],
  "under_watering_signs": ["..."],
  "efficiency_tips": ["..."],
  "drainage_advice": "...",
  "cost_savings": "..."
}

Respond ONLY in ${language} language.`;

// Check cache before AI call
const cacheKey = getCacheKey(state, district, crop, language);
if (cacheManager.has(cacheKey)) {
  const cached = cacheManager.get(cacheKey);
  return res.json(responseFormatter.advisory(cached, "irrigation", translations.getTranslation(language, "irrigation.advisory_generated")));
}
let responseText = await generateAIResponse(prompt);

responseText = responseText
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

let irrigationData;

try {
  irrigationData = JSON.parse(responseText);
  if (irrigationData.success === false || !irrigationData.daily_water_requirement_mm) {
    throw new Error("Invalid AI response");
  }
} catch (err) {
  console.error(
    "Irrigation JSON Parse Error:",
    responseText
  );

  irrigationData = {
    crop: profile?.preferredCrop || "Rice",
    soil_type: profile?.soilType || "Black Soil",
    irrigation_type: profile?.irrigationType || "Rainfed",

    daily_water_requirement_mm: 50,
    daily_water_requirement_liters_per_acre: 10000,

    irrigation_frequency_days: 2,

    irrigation_timing:
      "Early morning or late evening",

    best_method:
      "Drip irrigation",

    seasonal_requirements: {
      kharif: "High water requirement",
      rabi: "Moderate water requirement",
      summer: "Low water requirement"
    },

    moisture_monitoring:
      "Check soil moisture regularly",

    water_conservation: [
      "Mulching",
      "Drip irrigation",
      "Rainwater harvesting"
    ],

    over_watering_signs: [
      "Yellow leaves",
      "Waterlogging"
    ],

    under_watering_signs: [
      "Wilting",
      "Dry soil"
    ],

    efficiency_tips: [
      "Irrigate early morning",
      "Use moisture sensors"
    ],

    drainage_advice:
      "Maintain proper drainage",

    cost_savings:
      "Use drip irrigation to reduce water usage"
  };
}

    logger.info("Irrigation advisory generated", {
      profile: profile._id,
      language,
      crop: profile.preferredCrop
    });

    // Store advisory in cache
cacheManager.set(cacheKey, irrigationData, DEFAULT_TTL);
return res.json(
  responseFormatter.advisory(
    irrigationData,
    "irrigation",
    translations.getTranslation(language, "irrigation.advisory_generated")
  )
);

  } catch (error) {
    logger.error("Error in irrigation route", error);
    next(error);
  }
});

/**
 * POST /irrigation/schedule
 * Get detailed irrigation schedule for specific period
 */
router.post("/schedule", authMiddleware, async (req, res, next) => {
  try {
    const { month, language = "en" } = req.body;

    if (!validator.isValidMonth(month)) {
      return res.status(400).json(
        responseFormatter.error("Invalid month", 400)
      );
    }

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

    const schedulePrompt = `Create a detailed irrigation schedule for ${profile.preferredCrop} in ${month}.

Farm Details:
- Soil Type: ${profile.soilType}
- Farm Size: ${profile.farmSize} acres
- Irrigation Type: ${profile.irrigationType || "Not specified"}

Provide week-by-week irrigation schedule with:
- Specific days to irrigate
- Water quantity for each irrigation
- Time of day (morning/evening)
- Expected rainfall considerations
- Soil moisture levels to maintain

Return ONLY valid JSON with weekly breakdown.

Respond ONLY in ${language} language.`;

   let responseText = await generateAIResponse(schedulePrompt);

responseText = responseText
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();
    
    let schedule;

try {
  schedule = JSON.parse(responseText);
  if (schedule.success === false || !schedule.week1) {
    throw new Error("Invalid AI response");
  }
} catch (err) {
  console.error(
    "Schedule JSON Parse Error:",
    responseText
  );

  schedule = {
    week1: "Irrigate twice",
    week2: "Irrigate twice",
    week3: "Irrigate once",
    week4: "Monitor soil moisture"
  };
}

    res.json(responseFormatter.advisory(schedule, "irrigation", "Monthly irrigation schedule"));

  } catch (error) {
    logger.error("Error in irrigation schedule", error);
    next(error);
  }
});

module.exports = router;
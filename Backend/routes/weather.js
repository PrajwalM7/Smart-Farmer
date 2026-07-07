const express = require("express");
const axios = require("axios");
const authMiddleware = require("../middleware/authMiddleware");
const Profile = require("../models/Profile");
const districtCoordinates = require("../data/districtCoordinates.json");
const responseFormatter = require("../utils/responseFormatter");

const router = express.Router();

const districts = {
  Mysuru: { latitude: 12.2958, longitude: 76.6394 },
  Mandya: { latitude: 12.5223, longitude: 76.8970 },
  Hassan: { latitude: 13.0072, longitude: 76.0960 },
  Tumakuru: { latitude: 13.3409, longitude: 77.1010 },
  Belagavi: { latitude: 15.8497, longitude: 74.4977 },
  Dharwad: { latitude: 15.4589, longitude: 75.0078 },
  Shivamogga: { latitude: 13.9299, longitude: 75.5681 },
  Udupi: { latitude: 13.3409, longitude: 74.7421 },
  Kodagu: { latitude: 12.3375, longitude: 75.8069 },
  Chikkamagaluru: { latitude: 13.3153, longitude: 75.7754 },
  Chamarajanagar: { latitude: 11.9261, longitude: 76.9400 },
  Davanagere: { latitude: 14.4644, longitude: 75.9218 },
  "Dakshina Kannada": { latitude: 12.9141, longitude: 74.8560 },
  "Uttara Kannada": { latitude: 14.8183, longitude: 74.1419 },
  "Bengaluru Urban": { latitude: 12.9716, longitude: 77.5946 },
  "Bengaluru Rural": { latitude: 13.2840, longitude: 77.6078 },
};

// Helper to find coordinates for a district
const findCoordinates = (districtName, stateName) => {
  // Check in the state if provided
  if (stateName && districtCoordinates[stateName]) {
    const stateDistricts = districtCoordinates[stateName];
    for (const dName in stateDistricts) {
      if (dName.toLowerCase() === districtName.toLowerCase()) {
        return stateDistricts[dName];
      }
    }
  }

  // Search all states
  for (const state in districtCoordinates) {
    const stateDistricts = districtCoordinates[state];
    for (const dName in stateDistricts) {
      if (dName.toLowerCase() === districtName.toLowerCase()) {
        return stateDistricts[dName];
      }
    }
  }

  // Fallback to hardcoded list
  const hardcoded = districts[districtName];
  if (hardcoded) return hardcoded;

  return districts["Mysuru"]; // Ultimate fallback
};

router.get("/", authMiddleware, async (req, res) => {
  try {
    // Get the user's profile if available
    const profile = await Profile.findOne({ userId: req.user.id });

    const district = req.query.district || profile?.district || "Mysuru";
    const state = req.query.state || profile?.state || "Karnataka";

    const location = findCoordinates(district, state);

    const weatherResponse = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          current: "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m",
          daily: "sunrise,sunset",
          timezone: "auto",
        },
      }
    );

    const current = weatherResponse.data.current || {};
    const daily = weatherResponse.data.daily || {};

    const formatTime = (isoString) => {
      if (!isoString) return "--:--";
      try {
        const parts = isoString.split("T");
        if (parts.length > 1) {
          return parts[1]; // Returns "HH:MM" e.g., "06:01"
        }
        return isoString;
      } catch (e) {
        return "--:--";
      }
    };

    const temp = current.temperature_2m;
    const humidity = current.relative_humidity_2m;

    const weatherData = {
      district,
      state,
      temperature: temp,
      humidity: humidity,
      feelsLike: current.apparent_temperature,
      windSpeed: current.wind_speed_10m,
      sunrise: formatTime(daily.sunrise ? daily.sunrise[0] : null),
      sunset: formatTime(daily.sunset ? daily.sunset[0] : null),
      advisory: temp > 35
        ? "High temperature. Irrigate crops adequately."
        : humidity > 80
        ? "High humidity. Watch for fungal diseases."
        : "Weather conditions are suitable for farming activities.",
    };
    res.json(responseFormatter.success(weatherData));

    } catch (error) {
      console.log("WEATHER ERROR:", error.response?.data || error.message);
      res.status(500).json(responseFormatter.error("Failed to fetch weather data", 500));
    }
});

module.exports = router;
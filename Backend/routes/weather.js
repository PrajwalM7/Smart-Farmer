const express = require("express");
const axios = require("axios");

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

  "Dakshina Kannada": {
    latitude: 12.9141,
    longitude: 74.8560,
  },

  "Uttara Kannada": {
    latitude: 14.8183,
    longitude: 74.1419,
  },

  "Bengaluru Urban": {
    latitude: 12.9716,
    longitude: 77.5946,
  },

  "Bengaluru Rural": {
    latitude: 13.2840,
    longitude: 77.6078,
  },
};

router.get("/", async (req, res) => {
  try {
    const district =
      req.query.district || "Mysuru";
      console.log("District received:", district);

    const location =
      districts[district];
      if (!location) {
  return res.status(404).json({
    message: "District not supported",
  });
}

    if (!location) {
      return res.status(404).json({
        message:
          "District not supported",
      });
    }

    const weatherResponse =
      await axios.get(
        "https://api.open-meteo.com/v1/forecast",
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            current:
              "temperature_2m,relative_humidity_2m,wind_speed_10m",
          },
        }
      );

    const weather =
      weatherResponse.data.current;

    res.json({
      district,

      temperature:
        weather.temperature_2m,

      humidity:
        weather.relative_humidity_2m,

      windSpeed:
        weather.wind_speed_10m,

      advisory:
        weather.temperature_2m > 35
          ? "High temperature. Irrigate crops adequately."
          : weather.relative_humidity_2m > 80
          ? "High humidity. Watch for fungal diseases."
          : "Weather conditions are suitable for farming activities.",
    });

  } catch (error) {

    console.log(
      "WEATHER ERROR:"
    );

    console.log(
      error.response?.data ||
      error.message
    );

    res.status(500).json({
      message:
        "Failed to fetch weather data",
    });
  }
});

module.exports = router;
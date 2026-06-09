const express = require("express");
const axios = require("axios");

const router = express.Router();

const cities = {
  Bangalore: {
    latitude: 12.9716,
    longitude: 77.5946,
  },

  Mysore: {
    latitude: 12.2958,
    longitude: 76.6394,
  },

  Tumkur: {
    latitude: 13.3409,
    longitude: 77.1010,
  },

  Belagavi: {
    latitude: 15.8497,
    longitude: 74.4977,
  },

  Hubli: {
    latitude: 15.3647,
    longitude: 75.1240,
  },
};

router.get("/", async (req, res) => {
  try {
    const city =
      req.query.city || "Bangalore";

    const location =
      cities[city] || cities.Bangalore;

    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`
    );

    const weather =
      response.data.current;

    res.json({
      city,
      temperature:
        weather.temperature_2m,
      humidity:
        weather.relative_humidity_2m,
      windSpeed:
        weather.wind_speed_10m,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Failed to fetch weather data",
    });
  }
});

module.exports = router;
const express = require("express");
const axios = require("axios");

const router = express.Router();

// Replace this with your actual API key
const API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24",
      {
        params: {
          "api-key": API_KEY,
          format: "json",
          limit: 20,
          "filters[State]": "Karnataka",
        },
      }
    );

    res.json(response.data.records);
  } catch (error) {
    console.log("ERROR RESPONSE:");
    console.log(error.response?.data);

    console.log("ERROR MESSAGE:");
    console.log(error.message);

    res.status(500).json({
      message: "Failed to fetch mandi data",
    });
  }
});

module.exports = router;
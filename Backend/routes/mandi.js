const express = require("express");
const axios = require("axios");

const router = express.Router();

const API_KEY =
  process.env.MANDI_API_KEY ||
  "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";

let cachedData = [];
let lastFetch = 0;

router.get("/", async (req, res) => {
  const now = Date.now();

  const state = req.query.state || "Karnataka";
  const district = req.query.district || "";

  // Return cache for 5 minutes
  if (
    cachedData.length > 0 &&
    now - lastFetch < 300000
  ) {
    console.log("Returning cached mandi data");
    return res.json(cachedData);
  }

  try {
    console.log("STEP 1: Starting Mandi API Call");

    const response = await axios.get(
      "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24",
      {
        params: {
          "api-key": API_KEY,
          format: "json",
          limit: 1000,
        },
        timeout: 15000,
      }
    );

    console.log("STEP 2: API Response Received");

    let records = response.data.records || [];

    console.log(
      "STEP 3: Total Records Before Filter:",
      records.length
    );

    // Filter by state
    records = records.filter((item) => {
      const itemState =
        item.State ||
        item.state ||
        "";

      return itemState
        .toLowerCase()
        .includes(
          state.toLowerCase()
        );
    });

    console.log(
      "STEP 4: Records After State Filter:",
      records.length
    );

    // Filter by district if provided
    if (district) {
      records = records.filter((item) => {
        const itemDistrict =
          item.District ||
          item.district ||
          "";

        return itemDistrict
          .toLowerCase()
          .includes(
            district.toLowerCase()
          );
      });

      console.log(
        "STEP 5: Records After District Filter:",
        records.length
      );
    }

   const mandiData = records.map((item) => ({
  crop: item.Commodity || item.commodity || "N/A",
  market: item.Market || item.market || "N/A",
  state: item.State || item.state || "N/A",
  district: item.District || item.district || "N/A",
  modal: item.Modal_Price || item.modal_price || 0,
}));

    console.log(
      "STEP 6: Sending",
      mandiData.length,
      "records"
    );

    cachedData = mandiData;
    lastFetch = now;

    return res.json({
  success: true,
  data: mandiData,
});

  } catch (error) {
  console.log("MANDI API ERROR:");

  console.log(
    error.response?.data ||
    error.message
  );

  return res.json({
    success: true,
    data: [
      {
        crop: "Rice",
        market: "Mysuru",
        state: "Karnataka",
        district: "Mysuru",
        modal: 2500,
      },
      {
        crop: "Maize",
        market: "Belagavi",
        state: "Karnataka",
        district: "Belagavi",
        modal: 2200,
      },
      {
        crop: "Ragi",
        market: "Tumakuru",
        state: "Karnataka",
        district: "Tumakuru",
        modal: 3200,
      },
    ],
  });
}
});

module.exports = router;
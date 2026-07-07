const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");

const router = express.Router();

// Optional JWT authentication — sets req.user if token is valid, continues as guest otherwise
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
      req.user = decoded;
    } catch (_) { /* invalid token — proceed as guest */ }
  }
  next();
};

const API_KEY =
  process.env.MANDI_API_KEY ||
  "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";

// State-specific Mandi Cache (5-minute TTL)
let mandiCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rich Karnataka fallback data — shown when external API is slow/unavailable
const KARNATAKA_FALLBACK = [
  { crop: "Rice",        market: "Mysuru APMC",     state: "Karnataka", district: "Mysuru",    modal: 2500 },
  { crop: "Maize",       market: "Belagavi APMC",   state: "Karnataka", district: "Belagavi",  modal: 2200 },
  { crop: "Ragi",        market: "Tumakuru APMC",   state: "Karnataka", district: "Tumakuru",  modal: 3200 },
  { crop: "Groundnut",   market: "Kalaburagi APMC", state: "Karnataka", district: "Kalaburagi",modal: 5800 },
  { crop: "Sunflower",   market: "Dharwad APMC",    state: "Karnataka", district: "Dharwad",   modal: 6100 },
  { crop: "Soyabean",    market: "Hubballi APMC",   state: "Karnataka", district: "Dharwad",   modal: 4600 },
  { crop: "Jowar",       market: "Bidar APMC",      state: "Karnataka", district: "Bidar",     modal: 2800 },
  { crop: "Cotton",      market: "Raichur APMC",    state: "Karnataka", district: "Raichur",   modal: 7200 },
  { crop: "Sugarcane",   market: "Mandya APMC",     state: "Karnataka", district: "Mandya",    modal: 3400 },
  { crop: "Tomato",      market: "Kolar APMC",      state: "Karnataka", district: "Kolar",     modal: 1800 },
  { crop: "Onion",       market: "Hassan APMC",     state: "Karnataka", district: "Hassan",    modal: 2100 },
  { crop: "Potato",      market: "Shivamogga APMC", state: "Karnataka", district: "Shivamogga",modal: 1600 },
];

const getStateFallback = (state) => {
  if (!state || state.toLowerCase() === "karnataka") {
    return KARNATAKA_FALLBACK;
  }
  // Generic fallback for other states
  return [
    { crop: "Rice",      market: `${state} APMC`, state, district: "Central", modal: 2400 },
    { crop: "Wheat",     market: `${state} APMC`, state, district: "Central", modal: 2100 },
    { crop: "Maize",     market: `${state} APMC`, state, district: "Central", modal: 2000 },
    { crop: "Onion",     market: `${state} APMC`, state, district: "Central", modal: 1900 },
    { crop: "Potato",    market: `${state} APMC`, state, district: "Central", modal: 1500 },
  ];
};

router.get("/", optionalAuth, async (req, res) => {
  const now = Date.now();

  // Get the user's profile if available (only when authenticated)
  let profile = null;
  try {
    if (req.user && req.user.id) {
      profile = await Profile.findOne({ userId: req.user.id });
    }
  } catch (_) { /* no-op */ }

  const state    = req.query.state    || profile?.state    || "Karnataka";
  const district = req.query.district || profile?.district || "";
  const crop     = req.query.crop     || profile?.preferredCrop || "";

  const cacheKey = `${state.toLowerCase()}_${district.toLowerCase()}_${crop.toLowerCase()}`;

  // Return cache if still fresh
  if (mandiCache[cacheKey] && now - mandiCache[cacheKey].timestamp < CACHE_TTL) {
    return res.json({ success: true, data: mandiCache[cacheKey].data, source: "cache" });
  }

  try {
    const response = await axios.get(
      "https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24",
      {
        params: {
          "api-key": API_KEY,
          format: "json",
          limit: 250, // Get more records to ensure crop filter matches
          "filters[state]": state,
        },
        timeout: 10000,
      }
    );

    let records = response.data.records || [];

    // Filter by district
    if (district) {
      records = records.filter((item) => {
        const itemDistrict = item.District || item.district || "";
        return itemDistrict.toLowerCase().includes(district.toLowerCase());
      });
    }

    // Filter by crop
    if (crop) {
      records = records.filter((item) => {
        const itemCrop = item.Commodity || item.commodity || "";
        return itemCrop.toLowerCase().includes(crop.toLowerCase());
      });
    }

    // No records found for this district/crop — serve fallback instead of 404
    if (records.length === 0) {
      const fallbackData = getStateFallback(state).map(item => ({
        ...item,
        minPrice: Math.round(item.modal * 0.9),
        maxPrice: Math.round(item.modal * 1.1),
        arrivalDate: new Date().toLocaleDateString(),
        priceTrend: "stable",
        source: "fallback",
      }));
      return success(res, fallbackData, `No live records for "${crop || state}". Showing regional averages.`);
    }

    const mandiData = records.map((item) => ({
      crop:         item.Commodity      || item.commodity      || "N/A",
      market:       item.Market         || item.market         || "N/A",
      state:        item.State          || item.state          || "N/A",
      district:     item.District       || item.district       || "N/A",
      minPrice:     item.Min_Price      || item.min_price      || 0,
      maxPrice:     item.Max_Price      || item.max_price      || 0,
      modal:        item.Modal_Price    || item.modal_price    || 0,
      arrivalDate:  item.Arrival_Date   || item.arrival_date   || new Date().toLocaleDateString(),
      priceTrend:   parseFloat(item.Modal_Price) > 3000 ? "up" : "stable", // simple calculated trend
    }));

    // Cache successful result
    mandiCache[cacheKey] = { data: mandiData, timestamp: now };

    return success(res, mandiData, "Live mandi data retrieved");

  } catch (error) {
    // Generate fallback data specific to state & crop
    const fallbackData = getStateFallback(state).map(item => ({
      ...item,
      minPrice: Math.round(item.modal * 0.9),
      maxPrice: Math.round(item.modal * 1.1),
      arrivalDate: new Date().toLocaleDateString(),
      priceTrend: "stable"
    }));

    let filteredFallback = fallbackData;
    if (crop) {
      filteredFallback = fallbackData.filter(item => 
        item.crop.toLowerCase().includes(crop.toLowerCase())
      );
    }

    if (filteredFallback.length === 0 && crop) {
      return res.status(404).json({
        success: false,
        message: `No records found for this crop (${crop}) in your district.`
      });
    }

    return success(res, filteredFallback || fallbackData, "Fallback mandi data");
  }
});

module.exports = router;
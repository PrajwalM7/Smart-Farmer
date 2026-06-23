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
 * Helper function to get live mandi prices
 */
async function getLiveMandiPrice(crop, district, state) {
  try {
    // This uses India's government open data portal
    // In production, use the actual endpoint with authentication
    const response = await axios.get(
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a5c0-3eea5208784d`,
      {
        params: {
          "api-key": process.env.MANDI_API_KEY,
          filters: {
            crop_name: crop,
            district: district,
            state: state
          }
        }
      }
    ).catch(() => {
      // If API fails, return null for fallback
      return null;
    });

    if (response?.data?.records?.length > 0) {
      const record = response.data.records[0];
      return {
        minPrice: record.min_price,
        maxPrice: record.max_price,
        modalPrice: record.modal_price,
        marketName: record.market_name,
        lastUpdated: new Date()
      };
    }

    return null;
  } catch (error) {
    logger.warn("Could not fetch mandi price", { crop, district, error: error.message });
    return null;
  }
}

/**
 * GET /profit
 * Calculate profit estimation with AI analysis
 * Query params: language (optional)
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

    const profile = await Profile.findOne().sort({ _id: -1 });

    if (!profile) {
      logger.warn("No profile found for profit calculation");
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

    // Try to get live mandi prices (no caching as prices change frequently)
    let mandiData = null;
    try {
      mandiData = await getLiveMandiPrice(
        profile.preferredCrop,
        profile.district,
        profile.state
      );
    } catch (error) {
      logger.warn("Mandi price fetch failed, using AI estimates", { error: error.message });
    }

    // Build profit calculation prompt
    const mandiContext = mandiData
      ? `Latest Mandi Data:
- Minimum Price: ₹${mandiData.minPrice}/kg
- Maximum Price: ₹${mandiData.maxPrice}/kg
- Modal Price: ₹${mandiData.modalPrice}/kg (typical market price)
- Market: ${mandiData.marketName}
- Updated: ${mandiData.lastUpdated.toLocaleDateString()}`
      : "Mandi data: Using AI estimates based on historical data";

    const prompt = `You are an agricultural economist specializing in Indian farming profitability.

Farmer Profile:
- Crop: ${profile.preferredCrop}
- Farm Size: ${profile.farmSize} acres
- Soil Type: ${profile.soilType}
- District: ${profile.district}
- State: ${profile.state}
- Irrigation Type: ${profile.irrigationType || "Not specified"}

${mandiContext}

Calculate DETAILED profit estimation including:

1. Expected yield (kg/acre based on soil & climate)
2. Market price estimation
3. Total investment breakdown:
   - Seeds
   - Fertilizers
   - Pesticides
   - Labor
   - Water/Irrigation
   - Equipment
   - Transportation
   - Other miscellaneous
4. Total revenue
5. Net profit
6. Profit margin percentage
7. ROI (Return on Investment)
8. Break-even point
9. Risk factors
10. Recommendations for profit improvement

Return ONLY valid JSON:
{
  "crop": "${profile.preferredCrop}",
  "farm_size": ${profile.farmSize},
  "soil_type": "${profile.soilType}",
  "expected_yield_kg_per_acre": ...,
  "total_expected_yield": ...,
  "market_price_per_kg": ...,
  "investment_breakdown": {
    "seeds": ...,
    "fertilizers": ...,
    "pesticides": ...,
    "labor": ...,
    "water_irrigation": ...,
    "equipment": ...,
    "transportation": ...,
    "miscellaneous": ...
  },
  "total_investment": ...,
  "total_revenue": ...,
  "net_profit": ...,
  "profit_margin_percent": ...,
  "roi_percent": ...,
  "break_even_point_kg": ...,
  "risk_factors": ["..."],
  "improvement_suggestions": ["..."],
  "comparison_with_averages": "..."
}

Respond ONLY in ${language} language.`;

    let responseText = await generateAIResponse(prompt);
    responseText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let profitData;

try {
  profitData = JSON.parse(responseText);
} catch (err) {
  console.error("Profit JSON Parse Error:", responseText);

  profitData = {
    crop: profile.preferredCrop,
    farm_size: profile.farmSize,
    soil_type: profile.soilType,
    expected_yield_kg_per_acre: 3000,
    total_expected_yield: profile.farmSize * 3000,
    market_price_per_kg: 25,
    investment_breakdown: {
      seeds: 5000,
      fertilizers: 8000,
      pesticides: 3000,
      labor: 10000,
      water_irrigation: 4000,
      equipment: 5000,
      transportation: 2000,
      miscellaneous: 3000
    },
    total_investment: 40000,
    total_revenue: 75000,
    net_profit: 35000,
    profit_margin_percent: 46,
    roi_percent: 87,
    break_even_point_kg: 1600,
    risk_factors: [
      "Weather uncertainty",
      "Market fluctuations"
    ],
    improvement_suggestions: [
      "Use drip irrigation",
      "Optimize fertilizer usage"
    ],
    comparison_with_averages: "Above average profitability"
  };
}

    logger.info("Profit calculation generated", {
      profile: profile._id,
      language,
      crop: profile.preferredCrop,
      net_profit: profitData.net_profit
    });

    res.json(
      responseFormatter.success(
        profitData,
        translations.getTranslation(language, "profit.calculation_complete")
      )
    );

  } catch (error) {
    logger.error("Error in profit calculation route", error);
    next(error);
  }
});

/**
 * POST /profit/compare
 * Compare profitability of different crops
 */
router.post("/compare", async (req, res, next) => {
  try {
    const { crops = [], language = "en" } = req.body;

    // Validate inputs
    if (!validator.isValidArray(crops, 2, 5)) {
      return res.status(400).json(
        responseFormatter.error("Please provide 2-5 crops to compare", 400)
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

    const cropsStr = crops.join(", ");

    const comparisonPrompt = `Compare profitability of these crops for a farmer in ${profile.district}, ${profile.state}:
Crops: ${cropsStr}

Farm Size: ${profile.farmSize} acres
Soil Type: ${profile.soilType}

For each crop, estimate:
1. Yield potential
2. Market price
3. Total investment
4. Expected profit
5. Risk level
6. Market demand

Provide a ranking and recommendation.

Return ONLY valid JSON with comparison data.

Respond ONLY in ${language} language.`;

    let responseText = await generateAIResponse(
  comparisonPrompt
);
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let comparison;

try {
  comparison = JSON.parse(responseText);
} catch (err) {
  console.error("Comparison Parse Error:", responseText);

  comparison = {
    recommendation: crops[0],
    rankings: crops
  };
}

    res.json(responseFormatter.success(comparison, "Crop profitability comparison"));

  } catch (error) {
    logger.error("Error in crop comparison", error);
    next(error);
  }
});

module.exports = router;

/**
 * Phase 2: AI Integration Guide
 * 
 * This document outlines the integration of utility services and AI enhancements
 * into the Smart Farmer backend routes.
 */

// ============================================================================
// STEP 1: IMPORT PATTERN FOR ALL ROUTES
// ============================================================================

// Add these imports at the top of each route file:
/*
const express = require("express");
const router = express.Router();
const axios = require("axios");

// Import utilities
const cacheManager = require("../utils/cacheManager");
const validator = require("../utils/validator");
const responseFormatter = require("../utils/responseFormatter");
const { errorHandler, APIError } = require("../utils/errorHandler");
const logger = require("../utils/logger");
const translations = require("../utils/translations");
*/

// ============================================================================
// STEP 2: VALIDATION PATTERN
// ============================================================================

/*
Example in route handler:

router.post("/route-name", async (req, res, next) => {
  try {
    // Validate inputs
    const { crop, state, district, language } = req.body;
    
    if (!validator.isValidCrop(crop)) {
      return errorHandler.badRequest("Invalid crop name");
    }
    
    if (!validator.isValidState(state)) {
      return errorHandler.badRequest("Invalid state");
    }
    
    if (!validator.isValidDistrict(district)) {
      return errorHandler.badRequest("Invalid district");
    }
    
    if (!validator.isValidLanguage(language)) {
      return errorHandler.badRequest("Invalid language. Supported: en, kn, hi, te, ta, ml, mr");
    }
    
    // Process request
    // ...
    
  } catch (error) {
    logger.error("Route error", error);
    next(error); // Pass to error middleware
  }
});
*/

// ============================================================================
// STEP 3: CACHING PATTERN
// ============================================================================

/*
Example for API caching:

// Create cache key
const cacheKey = `mandi_${state}_${district}`;

// Check cache first
if (cacheManager.has(cacheKey)) {
  const cachedData = cacheManager.get(cacheKey);
  logger.debug("Cache hit", { cacheKey });
  return res.json(responseFormatter.success(cachedData, "Data from cache"));
}

// Fetch from API if not in cache
const response = await axios.get(API_URL);
const data = response.data;

// Store in cache with 5-minute TTL (300000ms)
cacheManager.set(cacheKey, data, 300000);

return res.json(responseFormatter.success(data, "Data retrieved successfully"));
*/

// ============================================================================
// STEP 4: RESPONSE FORMATTING PATTERN
// ============================================================================

/*
// For crop recommendations
return res.json(responseFormatter.recommendation(recommendations, "crop", "Crops recommended based on your profile"));

// For advisories
return res.json(responseFormatter.advisory(irrigationAdvice, "irrigation", "Advisory generated"));

// For alerts
return res.json(responseFormatter.alert(pestAlert, "pest", "high", "Pest alert detected"));

// For predictions
return res.json(responseFormatter.prediction(yieldPrediction, "yield", 0.85, "Yield prediction"));

// For localized responses
return res.json(responseFormatter.localized(translatedData, language, "Data with localization"));

// For paginated data
return res.json(responseFormatter.paginated(items, page, limit, total));

// For errors
return res.status(400).json(responseFormatter.error("Invalid input", 400));
*/

// ============================================================================
// STEP 5: MULTI-LANGUAGE RESPONSE PATTERN
// ============================================================================

/*
// Get translation
const advisoryMessage = translations.getTranslation(language, "advisory.irrigation");

// Or get full language pack
const languageData = translations.getLanguageTranslations(language);

// Build localized response
const response = {
  success: true,
  message: advisoryMessage,
  data: {
    // Your data
  },
  language: language
};

return res.json(response);
*/

// ============================================================================
// PRIORITY ROUTES FOR PHASE 2 AI INTEGRATION
// ============================================================================

/*
1. Backend/routes/crop.js
   - Add crop weather data to Gemini prompt
   - Improve confidence scoring
   - Multi-language output
   - Caching with 1-hour TTL

2. Backend/routes/fertilizer.js
   - Add soil analysis to prompt
   - Include market prices for cost estimation
   - Localized output
   - Caching

3. Backend/routes/irrigation.js
   - Full AI implementation (currently template)
   - Use weather + soil type for irrigation scheduling
   - Real-time advisories
   - No caching needed

4. Backend/routes/pest.js
   - Full AI implementation (currently hardcoded)
   - Multi-factor analysis using temperature, humidity, crop type
   - Prevention + treatment recommendations
   - Caching

5. Backend/routes/yield.js
   - Dynamic AI prediction (currently hardcoded)
   - Use historical data + current weather + soil type
   - Confidence scores
   - Caching

6. Backend/routes/profit.js
   - Integration with live Mandi prices
   - Use predicted yields
   - Dynamic investment estimation
   - NO CACHING (prices change frequently)
*/

// ============================================================================
// ENHANCED PROMPTING EXAMPLES FOR GEMINI
// ============================================================================

/*
Example 1: Crop Recommendation
const cropPrompt = `
You are an expert agricultural advisor in India.

User Profile:
- Farm Size: ${farmSize} acres
- Soil Type: ${soilType}
- State: ${state}
- District: ${district}
- Current Weather: Temperature ${temp}°C, Humidity ${humidity}%, Rainfall ${rainfall}mm
- Preferred Crops: ${preferredCrop}
- Language Preference: ${language}

Based on this profile, recommend 5 suitable crops for this season with:
1. Crop name
2. Suitability score (0-100)
3. Estimated yield (kg/acre)
4. Planting season
5. Why it's suitable
6. Market demand

Return ONLY valid JSON array with objects containing: crop, suitability, yield, season, reason, demand

Respond ONLY in ${language} language.
`;

Example 2: Fertilizer Suggestion
const fertilizerPrompt = `
You are an expert soil scientist and fertilizer advisor.

Farm Details:
- Crop: ${crop}
- Soil Type: ${soilType}
- Farm Size: ${farmSize} acres
- Current Season: ${season}
- Soil pH (if known): ${soilPH || "not provided"}

Recommend fertilizer plan with:
1. Primary fertilizers and quantities (kg/acre)
2. Application schedule (monthly breakdown)
3. Estimated cost
4. Expected yield improvement percentage
5. Advantages and precautions
6. Environmental impact

Return ONLY valid JSON with: fertilizer, quantity, schedule, cost, improvement, precautions

Respond ONLY in ${language} language.
`;

Example 3: Disease/Pest Detection
const diseasePrompt = `
You are an expert plant pathologist and pest management specialist.

Image Analysis Task:
- Analyze the provided crop leaf/plant image
- Identify any diseases, pests, or deficiencies visible

Return a structured response with:
1. Disease/Pest Name (if identified)
2. Confidence score (0-100)
3. Symptoms observed
4. Severity level (mild/moderate/severe)
5. Immediate treatment
6. Prevention measures
7. Affected crop area recommendation for monitoring
8. Weather conditions promoting spread

Return ONLY valid JSON with: name, confidence, symptoms, severity, treatment, prevention, area, conditions

Respond ONLY in ${language} language.
`;
*/

// ============================================================================
// DATABASE INTEGRATION CHECKLIST
// ============================================================================

/*
Before integrating utilities into routes, ensure:

✓ Models Updated
  - User model includes language field
  - Profile model includes language field
  - Expense model has category field

✓ Utilities Created
  - cacheManager.js exists
  - validator.js exists
  - errorHandler.js exists
  - responseFormatter.js exists
  - logger.js exists
  - translations.js exists

✓ Data Files Created
  - districtCoordinates.json (for weather API)
  - completeStatesDistricts.js (frontend)

✓ Error Middleware Integrated
  - errorMiddleware added to server.js
  - Order: all routes, then error middleware

✓ App Context Integrated
  - LanguageProvider wrapping BrowserRouter in App.js
*/

// ============================================================================
// TESTING PATTERN
// ============================================================================

/*
Example test structure for route:

1. Test without cache (first call)
   - Verify API call made
   - Verify response formatted correctly
   - Verify cache populated

2. Test with cache (second call)
   - Verify API NOT called
   - Verify cache returned
   - Verify response identical

3. Test validation
   - Invalid crop: should return 400
   - Invalid language: should return 400
   - Missing required fields: should return 400

4. Test localization
   - Same data, different languages
   - Verify translations present
   - Verify response includes language code

5. Test error scenarios
   - API timeout
   - Invalid API response
   - Database connection error
*/

// ============================================================================
// GEMINI API INTEGRATION TEMPLATE
// ============================================================================

/*
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateAIResponse(prompt, language) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const responseText = result.response.text();
    
    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.error("Could not extract JSON from Gemini response", { responseText });
      throw new Error("Invalid Gemini response format");
    }

    const aiResponse = JSON.parse(jsonMatch[0]);
    
    // Apply translations if needed
    const localizedResponse = {
      ...aiResponse,
      language: language,
      generatedAt: new Date().toISOString()
    };

    return localizedResponse;
    
  } catch (error) {
    logger.error("Gemini API error", error);
    throw error;
  }
}
*/

// ============================================================================
// MANDI PRICE INTEGRATION TEMPLATE
// ============================================================================

/*
const mandiPrices = async (crop, district, state) => {
  const cacheKey = `mandi_${crop}_${district}_${state}`;
  
  // Check cache first
  if (cacheManager.has(cacheKey)) {
    return cacheManager.get(cacheKey);
  }

  try {
    // Call India Government Mandi API
    const response = await axios.get(
      `https://data.gov.in/resource/${resourceId}`,
      {
        params: {
          crop_name: crop,
          district: district,
          state: state
        }
      }
    );

    const prices = {
      crop: crop,
      market: response.data[0]?.market,
      minPrice: response.data[0]?.min_price,
      maxPrice: response.data[0]?.max_price,
      modalPrice: response.data[0]?.modal_price,
      lastUpdated: new Date()
    };

    // Cache with 5-minute TTL for mandi data
    cacheManager.set(cacheKey, prices, 300000);
    
    return prices;
    
  } catch (error) {
    logger.error("Mandi API error", error);
    // Return cached data if available, otherwise throw
    throw error;
  }
};
*/

module.exports = { documentation: "See comments for implementation details" };

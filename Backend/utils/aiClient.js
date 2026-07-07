const Groq = require("groq-sdk");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const logger = require("./logger");

// Initialize APIs
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates text completions with Groq and falls back to Gemini if rate limits (429) or other errors occur.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function generateAIResponse(prompt) {
  try {
    logger.debug("Attempting AI response generation with Groq...");
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });
    logger.debug("Groq response generated successfully.");
    return completion.choices[0].message.content;
  } catch (error) {
    logger.warn(`Groq API request failed (${error.message}). Falling back to Gemini API...`);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      logger.info("Gemini fallback text response generated successfully.");
      return response.text();
    } catch (geminiError) {
      logger.error("Both Groq and Gemini APIs failed", geminiError);
      return JSON.stringify({
        success: false,
        message: "AI services are temporarily unavailable.",
      });
    }
  }
}

/**
 * Helper to convert a local file to a Google Generative AI Part object.
 * @param {string} path 
 * @param {string} mimeType 
 * @returns {object}
 */
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

/**
 * Analyzes crop leaf image using Gemini Vision model (multimodal).
 * @param {string} imagePath 
 * @param {string} cropHint 
 * @returns {Promise<object>}
 */
async function analyzeCropImageWithGemini(imagePath, cropHint = "Auto-detect") {
  try {
    logger.info(`Analyzing image using Gemini Vision for crop: ${cropHint}...`);
    
    // Choose appropriate mime type
    let mimeType = "image/jpeg";
    if (imagePath.endsWith(".png")) mimeType = "image/png";
    if (imagePath.endsWith(".webp")) mimeType = "image/webp";
    if (imagePath.endsWith(".gif")) mimeType = "image/gif";
    
    const imagePart = fileToGenerativePart(imagePath, mimeType);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `You are a plant pathologist and agriculture AI assistant. Analyze this crop leaf image.
Crop Type Hint from farmer: ${cropHint}

If the leaf is healthy, indicate that clearly.
Otherwise, identify the specific disease affecting the crop leaf.

Return ONLY a valid JSON object matching the following structure. Do NOT include any markdown code blocks (e.g. \`\`\`json ... \`\`\`), backticks, or extra commentary. Return only raw, valid JSON text.

Response Schema:
{
  "disease_name": "Human Readable Disease Name (e.g., Rice Blast or Tomato Late Blight or Healthy)",
  "raw_label": "Format: Crop___Disease_name (e.g., Rice___Blast, Maize___Rust, Potato___healthy)",
  "crop": "Detected or Hinted Crop Name (e.g., Rice, Maize, Tomato, Potato)",
  "severity": "low / medium / high / healthy",
  "confidence_score": 85.5,
  "symptoms": ["list of 3 key visible symptoms from the image"],
  "causes": ["list of 2-3 primary causes of this disease"],
  "treatmentOrganic": ["3 detailed organic/eco-friendly treatments"],
  "treatmentChemical": ["2 chemical treatments, or indicate 'None' if healthy"],
  "prevention": ["3 preventative cultivation measures to avoid recurrences"]
}`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const responseText = response.text().trim();
    
    // Clean response of any accidental markdown blocks
    const cleanedText = responseText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
      
    logger.debug("Raw cleaned Gemini response:", cleanedText);
    const parsedData = JSON.parse(cleanedText);
    
    // Make sure confidence_score is a number
    if (parsedData.confidence_score) {
      parsedData.confidence_score = parseFloat(parsedData.confidence_score);
    } else {
      parsedData.confidence_score = 80.0;
    }
    
    return parsedData;
  } catch (error) {
    logger.error("Error analyzing image with Gemini:", error);
    throw new Error("Failed to analyze crop image using Gemini AI: " + error.message);
  }
}

module.exports = {
  generateAIResponse,
  analyzeCropImageWithGemini,
};
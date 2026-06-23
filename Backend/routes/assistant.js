
const express = require("express");
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
const { v4: uuidv4 } = require("uuid");

// Import utilities
const validator = require("../utils/validator");
const responseFormatter = require("../utils/responseFormatter");
const logger = require("../utils/logger");
const translations = require("../utils/translations");
const Profile = require("../models/Profile");
const ConversationHistory = require("../models/ConversationHistory");



const router = express.Router();




async function generateAIResponse(prompt) {
  const completion =
    await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

  return completion.choices[0].message.content;
}
/**
 * POST /assistant/ask
 * Ask the AI farming assistant a question with conversation context
 * Body: { question, conversationId (optional) }
 * Query params: language (optional), userId (optional)
 */
router.post("/ask", async (req, res, next) => {
  try {
    const { question, conversationId: providedConversationId } = req.body;
    const { language = "en", userId } = req.query;

    // Validate inputs
    if (!question || question.trim().length === 0) {
      return res.status(400).json(
        responseFormatter.error("Question cannot be empty", 400)
      );
    }

    if (question.length > 2000) {
      return res.status(400).json(
        responseFormatter.error("Question is too long (max 2000 characters)", 400)
      );
    }

    if (!validator.isValidLanguage(language)) {
      return res.status(400).json(
        responseFormatter.error("Invalid language", 400)
      );
    }

    // Create or use provided conversation ID
    const conversationId = providedConversationId || uuidv4();

    logger.apiRequest("POST", "/assistant/ask", 200, 0, {
      questionLength: question.length,
      conversationId,
      language,
    });

    // Get farmer profile for context
    const profile = await Profile.findOne().sort({ _id: -1 });

    // Fetch previous messages in conversation for context (last 10)
    const previousMessages = await ConversationHistory.find({
      conversationId: conversationId,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Build conversation context string
    let conversationContext = "";
    if (previousMessages.length > 0) {
      conversationContext = "\n\nPrevious discussion:\n";
      previousMessages.reverse().forEach((msg, index) => {
        conversationContext += `${index + 1}. User: ${msg.question}\nAdvisor: ${msg.answer.substring(0, 100)}...\n`;
      });
    }

    // Build user context from profile
    let userContext = "General farmer";
    if (profile) {
      userContext = `A farmer growing ${profile.preferredCrop || "various crops"} 
        with ${profile.farmSize || "unknown"} acres of ${profile.soilType || "unknown"} soil 
        in ${profile.district || "unknown"}, ${profile.state || "unknown"} 
        using ${profile.irrigationType || "unknown"} irrigation`;
    }

    // Build comprehensive assistant prompt
    const assistantPrompt = `You are an intelligent and empathetic agricultural advisor for Indian farmers. 
You have deep expertise in:
- Crop management and selection
- Soil health and fertility
- Pest and disease management
- Irrigation and water management
- Weather patterns and climate adaptation
- Government schemes and subsidies
- Sustainable farming practices
- Profitable farming strategies

Farmer Profile: ${userContext}
${conversationContext}

Current Question: ${question}

Guidelines:
1. Provide practical, actionable advice
2. Consider local climate and soil conditions
3. Mention relevant government schemes when applicable
4. Include prevention tips
5. Suggest next steps or follow-up actions
6. Keep language simple and clear
7. If you need more information, ask clarifying questions

Respond in ${language} language.
Provide practical farming advice that is specific to the farmer's situation.`;

   console.log("About to call Gemini API...");

const answer = await generateAIResponse(
  assistantPrompt
);

    // Save conversation to database
  // Conversation history disabled temporarily
console.log("Assistant response generated successfully");

    logger.info("Assistant response generated and saved", {
      conversationId,
      questionLength: question.length,
      answerLength: answer.length,
    });

    // Return formatted response
    res.json(
      responseFormatter.success(
        {
          conversationId,
          question,
          answer,
          context: {
            farmerProfile: userContext,
            language,
            timestamp: new Date(),
          },
        },
        "Assistant response generated"
      )
    );
  } catch (error) {
  console.error("ASSISTANT ERROR:");
  console.error(error);

  logger.error("Error in assistant ask endpoint", error);
  next(error);
}
});

/**
 * GET /assistant/history
 * Retrieve conversation history
 * Query params: conversationId (optional), limit (optional, default 20), language (optional)
 */
router.get("/history", async (req, res, next) => {
  try {
    const { conversationId, limit = 20, userId, language } = req.query;

    // Validate limit
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

    if (!validator.isValidLanguage(language) && language) {
      return res.status(400).json(
        responseFormatter.error("Invalid language", 400)
      );
    }

    logger.apiRequest("GET", "/assistant/history", 200, 0, {
      conversationId,
      limit: parsedLimit,
    });

    let query = {};

    if (conversationId) {
      query.conversationId = conversationId;
    } else if (userId) {
      query.userId = userId;
    }

    if (language) {
      query.language = language;
    }

    const history = await ConversationHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(parsedLimit)
      .lean();

    // Group by conversation if not filtered by conversationId
    const grouped = {};
    history.forEach((item) => {
      if (!grouped[item.conversationId]) {
        grouped[item.conversationId] = [];
      }
      grouped[item.conversationId].push(item);
    });

    res.json(
      responseFormatter.success(
        {
          total_conversations: Object.keys(grouped).length,
          total_messages: history.length,
          conversations: grouped,
        },
        `Retrieved ${history.length} messages from conversation history`
      )
    );
  } catch (error) {
    logger.error("Error retrieving conversation history", error);
    next(error);
  }
});

/**
 * DELETE /assistant/conversation/:conversationId
 * Delete a specific conversation
 * Params: conversationId
 */
router.delete("/conversation/:conversationId", async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json(
        responseFormatter.error("Conversation ID is required", 400)
      );
    }

    logger.apiRequest("DELETE", "/assistant/conversation/:conversationId", 200, 0, {
      conversationId,
    });

    const result = await ConversationHistory.deleteMany({
      conversationId,
    });

    logger.info("Conversation deleted", {
      conversationId,
      messagesDeleted: result.deletedCount,
    });

    res.json(
      responseFormatter.success(
        {
          conversationId,
          messagesDeleted: result.deletedCount,
        },
        "Conversation deleted successfully"
      )
    );
  } catch (error) {
    logger.error("Error deleting conversation", error);
    next(error);
  }
});

/**
 * DELETE /assistant/history
 * Clear all conversation history for a user
 * Query params: userId (optional)
 */
router.delete("/history", async (req, res, next) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json(
        responseFormatter.error("User ID is required for clearing history", 400)
      );
    }

    logger.apiRequest("DELETE", "/assistant/history", 200, 0, { userId });

    const result = await ConversationHistory.deleteMany({ userId });

    logger.info("All conversation history deleted", {
      userId,
      messagesDeleted: result.deletedCount,
    });

    res.json(
      responseFormatter.success(
        {
          userId,
          messagesDeleted: result.deletedCount,
        },
        "All conversation history deleted successfully"
      )
    );
  } catch (error) {
    logger.error("Error clearing conversation history", error);
    next(error);
  }
});

/**
 * POST /assistant/feedback
 * Submit feedback on an assistant response
 * Body: { conversationHistoryId, helpfulness (1, -1, 0), feedback (optional) }
 */
router.post("/feedback", async (req, res, next) => {
  try {
    const { conversationHistoryId, helpfulness, feedback } = req.body;

    if (!conversationHistoryId) {
      return res.status(400).json(
        responseFormatter.error("Conversation History ID is required", 400)
      );
    }

    if (![1, -1, 0].includes(helpfulness)) {
      return res.status(400).json(
        responseFormatter.error("Helpfulness must be 1, -1, or 0", 400)
      );
    }

    logger.apiRequest("POST", "/assistant/feedback", 200, 0, {
      conversationHistoryId,
      helpfulness,
    });

    const result = await ConversationHistory.findByIdAndUpdate(
      conversationHistoryId,
      {
        helpfulness,
        feedback: feedback || null,
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json(
        responseFormatter.error("Conversation not found", 404)
      );
    }

    logger.info("Feedback submitted", {
      conversationHistoryId,
      helpfulness,
    });

    res.json(
      responseFormatter.success(
        result,
        "Feedback recorded successfully"
      )
    );
  } catch (error) {
    logger.error("Error submitting feedback", error);
    next(error);
  }
});

module.exports = router;
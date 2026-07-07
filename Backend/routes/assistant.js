const express = require("express");
const { v4: uuidv4 } = require("uuid");

const authMiddleware = require("../middleware/authMiddleware");
const { generateAIResponse } = require("../utils/aiClient");
const Profile = require("../models/Profile");
const ConversationHistory = require("../models/ConversationHistory");
const validator = require("../utils/validator");
const responseFormatter = require("../utils/responseFormatter");
const logger = require("../utils/logger");
const translations = require("../utils/translations");

const router = express.Router();

/**
 * POST /assistant/ask
 * Ask the AI farming assistant a question with conversation context
 * Body: { question, conversationId (optional) }
 * Query params: language (optional)
 */
router.post("/ask", authMiddleware, async (req, res, next) => {
  try {
    const { question, conversationId: providedConversationId } = req.body;
    const { language = "en" } = req.query;
    const userId = req.user.id;

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

    // Fetch latest profile of this farmer
    const profile = await Profile.findOne({ userId: req.user.id });

    // Fetch previous messages in conversation for context (last 5 for token efficiency)
    const previousMessages = await ConversationHistory.find({
      conversationId: conversationId,
      userId: userId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Build conversation context string
    let conversationContext = "";
    if (previousMessages.length > 0) {
      conversationContext = "\n\nPrevious discussion:\n";
      previousMessages.reverse().forEach((msg) => {
        conversationContext += `User: ${msg.question}\nAssistant: ${msg.answer}\n`;
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
You have deep expertise in crop management, soil health, pest control, irrigation, weather adaptation, sustainable farming, and government schemes.

Farmer Profile: ${userContext}
${conversationContext}

Current Question: ${question}

Guidelines:
1. Provide practical, actionable advice.
2. Consider local Indian climate and soil conditions based on the profile.
3. Mention relevant Indian government schemes if applicable.
4. Provide crop disease symptoms, control, and prevention tips when asked.
5. Suggest clear, numbered next steps.
6. Keep the response formatted using clean Markdown (headers, bullet points, bolding).
7. Respond in the ${language} language.

Answer:`;

    logger.debug("Generating farming advisor answer...");
    const answer = await generateAIResponse(assistantPrompt);

    // Save conversation history to MongoDB
    const chatRecord = new ConversationHistory({
      userId,
      conversationId,
      question,
      answer,
      language,
      context: profile ? {
        crop: profile.preferredCrop,
        state: profile.state,
        district: profile.district,
        farmSize: profile.farmSize,
        soilType: profile.soilType,
        irrigationType: profile.irrigationType,
      } : undefined,
    });

    await chatRecord.save();

    logger.info("Assistant response generated and saved to MongoDB", {
      conversationId,
      userId,
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
    logger.error("Error in assistant ask endpoint", error);
    next(error);
  }
});

/**
 * GET /assistant/history
 * Retrieve conversation history for the logged-in user
 */
router.get("/history", authMiddleware, async (req, res, next) => {
  try {
    const { conversationId, limit = 20, language } = req.query;
    const userId = req.user.id;

    // Validate limit
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

    if (language && !validator.isValidLanguage(language)) {
      return res.status(400).json(
        responseFormatter.error("Invalid language", 400)
      );
    }

    let query = { userId };

    if (conversationId) {
      query.conversationId = conversationId;
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
          messages: history, // Return flat array as well for easy chat interface parsing
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
 * Delete a specific conversation for the logged-in user
 */
router.delete("/conversation/:conversationId", authMiddleware, async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!conversationId) {
      return res.status(400).json(
        responseFormatter.error("Conversation ID is required", 400)
      );
    }

    const result = await ConversationHistory.deleteMany({
      conversationId,
      userId,
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
 * Clear all conversation history for the logged-in user
 */
router.delete("/history", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await ConversationHistory.deleteMany({ userId });

    res.json(
      responseFormatter.success(
        {
          userId,
          messagesDeleted: result.deletedCount,
        },
        "All conversation history cleared successfully"
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
 */
router.post("/feedback", authMiddleware, async (req, res, next) => {
  try {
    const { conversationHistoryId, helpfulness, feedback } = req.body;
    const userId = req.user.id;

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

    const result = await ConversationHistory.findOneAndUpdate(
      { _id: conversationHistoryId, userId },
      {
        helpfulness,
        feedback: feedback || null,
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json(
        responseFormatter.error("Conversation message not found or unauthorized", 404)
      );
    }

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
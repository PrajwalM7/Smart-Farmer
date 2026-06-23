const mongoose = require("mongoose");

const conversationHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    context: {
      crop: String,
      state: String,
      district: String,
      farmSize: Number,
      soilType: String,
      irrigationType: String,
    },
    language: {
      type: String,
      enum: ["en", "kn", "hi", "te", "ta", "ml", "mr"],
      default: "en",
    },
    tokens_used: {
      input_tokens: Number,
      output_tokens: Number,
    },
    helpfulness: {
      type: Number,
      enum: [1, -1, 0],
      default: 0,
    },
    feedback: String,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
conversationHistorySchema.index({
  userId: 1,
  createdAt: -1,
});
conversationHistorySchema.index({
  conversationId: 1,
  createdAt: -1,
});

module.exports = mongoose.model("ConversationHistory", conversationHistorySchema);

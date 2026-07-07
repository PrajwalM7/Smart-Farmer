const mongoose = require("mongoose");

const diseaseHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  crop: {
    type: String,
    required: true
  },
  diseaseName: {
    type: String,
    required: true
  },
  rawLabel: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    enum: ["low", "medium", "high", "healthy"],
    default: "low"
  },
  symptoms: [String],
  causes: [String],
  treatmentOrganic: [String],
  treatmentChemical: [String],
  prevention: [String],
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for fast analytics aggregations by user
diseaseHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("DiseaseHistory", diseaseHistorySchema);

const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  
  // Location Information
  village: String,
  district: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  
  // Farm Information
  farmSize: {
    type: Number, // in acres
    required: true
  },
  soilType: {
    type: String,
    enum: ["Black Soil", "Red Soil", "Laterite Soil", "Alluvial Soil", "Clay Soil", "Sandy Soil"],
    required: true
  },
  preferredCrop: {
    type: String,
    required: true
  },
  
  // Additional Farm Details
  irrigationType: {
    type: String,
    enum: ["Drip", "Sprinkler", "Flood", "Mixed", "Rainfed"],
    default: "Rainfed"
  },
  farmerType: {
    type: String,
    enum: ["Marginal", "Small", "Medium", "Large"],
    default: "Small"
  },
  
  // Language Preference
  language: {
    type: String,
    enum: ["en", "kn", "hi", "te", "ta", "ml", "mr"],
    default: "en"
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Profile", profileSchema);
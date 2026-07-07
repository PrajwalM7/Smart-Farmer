const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: true,
    unique: true
  },
  // Personal Information
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    default: ""
  },
  
  // Location Information
  village: {
    type: String,
    default: ""
  },
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
    required: true,
    min: 0.1
  },
  soilType: {
    type: String,
    enum: [
      "Black Soil", "Black Cotton Soil", "Red Soil", "Laterite Soil",
      "Alluvial Soil", "Clay Soil", "Sandy Soil", "Loamy Soil",
      "Mountain Soil", "Other"
    ],
    required: true
  },
  preferredCrop: {
    type: String,
    required: true
  },
  
  // Additional Farm Details
  irrigationType: {
    type: String,
    enum: [
      "Drip", "Drip Irrigation", "Sprinkler", "Flood", "Flood Irrigation",
      "Mixed", "Rainfed", "Canal", "Borewell", "Rainwater", "None", "Other"
    ],
    default: "None"
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
profileSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("Profile", profileSchema);
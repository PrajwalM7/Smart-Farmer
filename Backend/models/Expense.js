const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  // Reference to profile or user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // Expense Details
  crop: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: [
      "Seeds",
      "Fertilizer",
      "Pesticides",
      "Labor",
      "Water/Irrigation",
      "Equipment",
      "Electricity",
      "Transport",
      "Miscellaneous"
    ],
    required: true
  },

  expenseType: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true,
    min: 0
  },

  // Description
  description: {
    type: String,
    default: ""
  },

  // Date of expense
  date: {
    type: Date,
    required: true
  },

  // Month and year for aggregation
  month: {
    type: Number,
    required: true
  },

  year: {
    type: Number,
    required: true
  },

  // Tracking
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ year: 1, month: 1 });
expenseSchema.index({ category: 1 });

// Update the updatedAt timestamp before saving
expenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  // Extract month and year from date if not provided
  if (!this.month || !this.year) {
    this.month = this.date.getMonth() + 1;
    this.year = this.date.getFullYear();
  }
  next();
});

module.exports = mongoose.model("Expense", expenseSchema);
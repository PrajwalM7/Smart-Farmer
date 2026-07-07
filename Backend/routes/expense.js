const express = require("express");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// POST / - Add expense or income
router.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { isValidPrice, isValidString } = require("../utils/validator");
    const { success, error } = require("../middleware/standardResponse");
    const { crop, type, category, expenseType, amount, description, date } = req.body;
    // Basic validation
    if (!isValidString(crop) || !isValidString(type) || !isValidString(category) || !isValidString(expenseType) || !isValidString(description)) {
      return error(res, "Invalid string fields", 400);
    }
    if (!isValidPrice(amount)) {
      return error(res, "Invalid amount; must be a positive number", 400);
    }
    // Date validation (optional)
    let expenseDate = date ? new Date(date) : new Date();
    if (isNaN(expenseDate)) {
      return error(res, "Invalid date format", 400);
    }

    const month = expenseDate.getMonth() + 1;
    const year = expenseDate.getFullYear();

    const expense = new Expense({
      userId: req.user.id,
      crop,
      type: type || "Expense",
      category: category || "Miscellaneous",
      expenseType: expenseType || "General",
      amount,
      description,
      date: expenseDate,
      month,
      year,
    });

    await expense.save();
    return res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
});

// GET / - Retrieve user's transaction records
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    return res.json(expenses);
  } catch (error) {
    next(error);
  }
});

// GET /statistics - Financial statistics
router.get("/statistics", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const mongoose = require("mongoose");
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Aggregate totals for Income vs Expense
    const totals = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let income = 0;
    let expense = 0;

    totals.forEach(t => {
      if (t._id === "Income") income = t.total;
      if (t._id === "Expense") expense = t.total;
    });

    // Category wise Expense distribution
    const categoryDistribution = await Expense.aggregate([
      { $match: { userId: userObjectId, type: "Expense" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Monthly Expense breakdown
    const monthlyFinancials = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: {
            month: "$month",
            year: "$year",
            type: "$type"
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    return res.json({
      success: true,
      data: {
        totals: {
          income,
          expense,
          profit: income - expense
        },
        categoryDistribution: categoryDistribution.map(c => ({ category: c._id, amount: c.total })),
        monthlyBreakdown: monthlyFinancials.map(m => ({
          month: `${m._id.month}/${m._id.year}`,
          type: m._id.type,
          amount: m.total
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /:id - Delete transaction record
router.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!expense) {
      return res.status(404).json({ message: "Record not found or unauthorized" });
    }

    await Expense.findByIdAndDelete(req.params.id);
    return res.json({ message: "Transaction record deleted successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
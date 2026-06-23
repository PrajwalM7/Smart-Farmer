const express = require("express");
const Expense = require("../models/Expense");

const router = express.Router();

router.post("/", async (req, res) => {
  try {

    const expense =
      new Expense(req.body);

    await expense.save();

    res.status(201).json(expense);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
});

router.get("/", async (req, res) => {
  try {

    const expenses =
      await Expense.find().sort({
        date: -1,
      });

    res.json(expenses);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
});

router.delete("/:id", async (req, res) => {
  try {

    await Expense.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Expense deleted",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
});

module.exports = router;
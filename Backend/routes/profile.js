const express = require("express");
const mongoose = require("mongoose");
const Profile = require("../models/Profile");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create or Update Profile (upsert — avoids _id mutation errors)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.userId;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.json(profile);
  } catch (error) {
    console.error("[Profile POST] Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Get User's Latest Profile
router.get("/latest", authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    res.json(profile || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Profiles of User
router.get("/", authMiddleware, async (req, res) => {
  try {
    const profiles = await Profile.find({ userId: req.user.id });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Profile by ID (also upserts safely)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.userId;

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.json(profile);
  } catch (error) {
    console.error("[Profile PUT] Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
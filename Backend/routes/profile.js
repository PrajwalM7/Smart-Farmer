const express = require("express");
const router = express.Router();

const Profile = require("../models/Profile");

// Create Profile
router.post("/", async (req, res) => {
  try {
    const profile = new Profile(req.body);
    await profile.save();

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get Latest Profile
router.get("/latest", async (req, res) => {
  try {
    const profile = await Profile.findOne().sort({
      _id: -1,
    });

    res.json(profile);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Get All Profiles
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find();

    res.json(profiles);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update Profile
router.put("/:id", async (req, res) => {
  try {
    const profile = await Profile.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    res.json(profile);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;
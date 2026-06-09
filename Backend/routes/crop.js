const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    {
      crop: "Rice",
      season: "Kharif",
      suitability: "High"
    },
    {
      crop: "Maize",
      season: "Kharif",
      suitability: "Medium"
    }
  ]);
});

module.exports = router;
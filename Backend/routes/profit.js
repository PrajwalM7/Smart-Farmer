const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    crop: "Rice",
    investment: 30000,
    revenue: 50000,
    profit: 20000
  });
});

module.exports = router;
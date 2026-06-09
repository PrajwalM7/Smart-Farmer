const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json([
    {
      crop: "Rice",
      fertilizer: "Urea",
      quantity: "50 kg/acre"
    },
    {
      crop: "Maize",
      fertilizer: "DAP",
      quantity: "40 kg/acre"
    }
  ]);
});

module.exports = router;
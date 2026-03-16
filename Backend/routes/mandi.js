const express = require("express");
const router = express.Router();

router.get("/prices", (req, res) => {

    const mandiPrices = [
        { crop: "Tomato", mandi: "Bangalore", price: 1800 },
        { crop: "Tomato", mandi: "Kolar", price: 2100 },
        { crop: "Tomato", mandi: "Tumkur", price: 1700 }
    ];

    res.json(mandiPrices);
});

module.exports = router;
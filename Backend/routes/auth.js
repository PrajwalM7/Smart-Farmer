const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {

    const { name, email, password, location } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
        name,
        email,
        password: hashed,
        location
    });

    await user.save();

    res.json({ message: "User Registered" });
});

router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, "secretkey");

    res.json({ token });
});

module.exports = router;
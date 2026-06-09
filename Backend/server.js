const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const weatherRoutes = require("./routes/weather");
const mandiRoute = require("./routes/mandi");
const authRoute = require("./routes/auth");
const cropRoutes = require("./routes/crop");
const fertilizerRoutes = require("./routes/fertilizer");
const profitRoutes = require("./routes/profit");
const profileRoutes = require("./routes/profile"); // NEW

// Route Setup
app.use("/weather", weatherRoutes);
app.use("/mandi", mandiRoute);
app.use("/auth", authRoute);
app.use("/crop", cropRoutes);
app.use("/fertilizer", fertilizerRoutes);
app.use("/profit", profitRoutes);
app.use("/profile", profileRoutes); // NEW

// Test Route
app.get("/", (req, res) => {
  res.send("Server Running");
});

// Server Start
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
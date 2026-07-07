
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
connectDB();

const app = express();

const path = require("path");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
const weatherRoutes = require("./routes/weather");
const mandiRoute = require("./routes/mandi");
const authRoute = require("./routes/auth");
const cropRoutes = require("./routes/crop");
const fertilizerRoutes = require("./routes/fertilizer");
const profitRoutes = require("./routes/profit");
const profileRoutes = require("./routes/profile");
const irrigationRoutes = require("./routes/irrigation");
const expenseRoutes =
  require("./routes/expense");
const reportRoutes =
  require("./routes/report");
const pestRoutes =
  require("./routes/pest");
const yieldRoutes =
  require("./routes/yield");
const diseaseRoutes = require("./routes/disease");

const assistantRoutes =
  require("./routes/assistant");

// Error Handler
const { errorMiddleware } = require("./utils/errorHandler");

// Route Setup — mounted under both /api and root for frontend compatibility
const mountRoutes = (prefix, router) => {
  app.use(`/api/${prefix}`, router);
  app.use(`/${prefix}`, router);
};

mountRoutes("weather", weatherRoutes);
mountRoutes("mandi", mandiRoute);
mountRoutes("auth", authRoute);
mountRoutes("crop", cropRoutes);
mountRoutes("fertilizer", fertilizerRoutes);
mountRoutes("profit", profitRoutes);
mountRoutes("profile", profileRoutes);
mountRoutes("irrigation", irrigationRoutes);
mountRoutes("expense", expenseRoutes);
mountRoutes("report", reportRoutes);
mountRoutes("pest", pestRoutes);
mountRoutes("yield", yieldRoutes);
mountRoutes("assistant", assistantRoutes);
mountRoutes("disease", diseaseRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Server Running");
});

// Error Middleware (must be last)
app.use(errorMiddleware);

// Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
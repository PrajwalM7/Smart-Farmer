
require("dotenv").config();
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

app.use("/api/disease", diseaseRoutes);
const assistantRoutes =
  require("./routes/assistant");

// Error Handler
const { errorMiddleware } = require("./utils/errorHandler");

// Route Setup
app.use("/weather", weatherRoutes);
app.use("/mandi", mandiRoute);
app.use("/auth", authRoute);
app.use("/crop", cropRoutes);
app.use("/fertilizer", fertilizerRoutes);
app.use("/api/fertilizer", fertilizerRoutes);
app.use("/profit", profitRoutes);
app.use("/profile", profileRoutes);
app.use("/irrigation", irrigationRoutes);
app.use(
  "/expense",
  expenseRoutes
);
app.use(
  "/report",
  reportRoutes
);
app.use(
  "/pest",
  pestRoutes
);
app.use(
  "/yield",
  yieldRoutes
);
app.use(
  "/disease",
  diseaseRoutes
);
app.use(
  "/assistant",
  assistantRoutes
);


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
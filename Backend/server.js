const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ MANDI ROUTE
const mandiRoute = require("./routes/mandi");
app.use("/mandi", mandiRoute);

// ✅ AUTH ROUTE (VERY IMPORTANT)
const authRoute = require("./routes/auth");
app.use("/auth", authRoute);

// TEST
app.get("/", (req, res) => {
    res.send("Server Running");
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
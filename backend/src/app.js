const express = require("express");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Auth Routes
app.use("/api/auth", authRoutes);

module.exports = app;

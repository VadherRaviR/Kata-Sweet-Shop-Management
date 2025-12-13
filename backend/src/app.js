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
const adminRoutes = require("./routes/admin.routes");

app.use("/api/admin", adminRoutes);


module.exports = app;

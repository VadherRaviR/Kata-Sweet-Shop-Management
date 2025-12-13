const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ email, password });

  res.status(201).json({
    id: user._id,
    email: user.email
  });
});

module.exports = router;

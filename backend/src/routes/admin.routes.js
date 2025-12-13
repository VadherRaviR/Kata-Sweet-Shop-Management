const express = require("express");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const router = express.Router();

router.get("/test", auth, admin, (req, res) => {
  res.status(200).json({ message: "Admin access granted" });
});

module.exports = router;

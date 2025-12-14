const express = require("express");
const Sweet = require("../models/Sweet");
const auth = require("../middleware/auth.middleware");
const admin = require("../middleware/admin.middleware");

const router = express.Router();

router.post("/", auth, admin, async (req, res) => {
  const sweet = await Sweet.create(req.body);
  res.status(201).json(sweet);
});

router.post("/:id/purchase", auth, async (req, res) => {
  const sweet = await Sweet.findById(req.params.id);

  if (!sweet) {
    return res.status(404).json({ message: "Sweet not found" });
  }

  if (sweet.quantity <= 0) {
    return res.status(400).json({ message: "Out of stock" });
  }

  sweet.quantity -= 1;
  await sweet.save();

  res.status(200).json(sweet);
});

router.post("/:id/restock", auth, admin, async (req, res) => {
  const { amount } = req.body;

  const sweet = await Sweet.findById(req.params.id);
  if (!sweet) {
    return res.status(404).json({ message: "Sweet not found" });
  }

  sweet.quantity += amount;
  await sweet.save();

  res.status(200).json(sweet);
});


module.exports = router;

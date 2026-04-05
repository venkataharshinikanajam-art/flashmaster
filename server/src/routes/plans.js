// ===================================================================
// StudyPlan CRUD — scoped to req.user.
// Mounted at /api/plans
// ===================================================================

import { Router } from "express";
import { StudyPlan } from "../models/StudyPlan.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.post("/", async (req, res) => {
  try {
    const plan = await StudyPlan.create({ ...req.body, userId: req.user._id });
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const plans = await StudyPlan.find({ userId: req.user._id }).sort({ examDate: 1 });
  res.json(plans);
});

router.get("/:id", async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ error: "Not found" });
    res.json(plan);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!plan) return res.status(404).json({ error: "Not found" });
    res.json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!plan) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true, id: plan._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

export default router;

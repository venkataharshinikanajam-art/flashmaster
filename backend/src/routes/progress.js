import { Router } from "express";
import { Progress } from "../models/Progress.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// LIST — all progress entries for the current user
router.get("/", async (req, res) => {
  const entries = await Progress.find({ userId: req.user._id }).sort({ subject: 1 });
  res.json(entries);
});

// GET one by subject name (convenient lookup)
router.get("/subject/:subject", async (req, res) => {
  const entry = await Progress.findOne({
    userId: req.user._id,
    subject: req.params.subject,
  });
  if (!entry) return res.status(404).json({ error: "Not found" });
  res.json(entry);
});

// UPSERT — POST /api/progress creates or updates the doc for (user, subject).
router.post("/", async (req, res) => {
  try {
    const { subject, ...rest } = req.body;
    if (!subject) return res.status(400).json({ error: "subject is required" });

    const entry = await Progress.findOneAndUpdate(
      { userId: req.user._id, subject },
      { $set: { ...rest, userId: req.user._id, subject } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE by id
router.delete("/:id", async (req, res) => {
  try {
    const entry = await Progress.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!entry) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true, id: entry._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

export default router;

import { Router } from "express";
import { Progress } from "../models/Progress.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/progress - list all progress entries for the current user.
router.get("/", async function (req, res) {
  const entries = await Progress.find({ userId: req.user._id }).sort({ subject: 1 });
  res.json(entries);
});

// GET /api/progress/subject/:subject - lookup by subject name.
router.get("/subject/:subject", async function (req, res) {
  const entry = await Progress.findOne({
    userId: req.user._id,
    subject: req.params.subject,
  });
  if (!entry) {
    return res.status(404).json({ error: "Not found" });
  }
  res.json(entry);
});

// POST /api/progress - create or update progress for (user, subject).
router.post("/", async function (req, res) {
  try {
    const subject = req.body.subject;
    if (!subject) {
      return res.status(400).json({ error: "subject is required" });
    }

    const updateFields = {
      userId: req.user._id,
      subject: subject,
    };
    if (req.body.totalTopics !== undefined) {
      updateFields.totalTopics = req.body.totalTopics;
    }
    if (req.body.completedTopics !== undefined) {
      updateFields.completedTopics = req.body.completedTopics;
    }
    if (req.body.flashcardsReviewed !== undefined) {
      updateFields.flashcardsReviewed = req.body.flashcardsReviewed;
    }
    if (req.body.notes !== undefined) {
      updateFields.notes = req.body.notes;
    }

    const entry = await Progress.findOneAndUpdate(
      { userId: req.user._id, subject: subject },
      { $set: updateFields },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
    res.json(entry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/progress/:id
router.delete("/:id", async function (req, res) {
  try {
    const entry = await Progress.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!entry) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ deleted: true, id: entry._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

export default router;

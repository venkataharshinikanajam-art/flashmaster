// ===================================================================
// Flashcard CRUD — scoped to req.user.
// Mounted at /api/flashcards
// Supports optional ?materialId= and ?difficulty= query filters.
// Supports ?populate=material to embed the source material.
// ===================================================================

import { Router } from "express";
import { Flashcard } from "../models/Flashcard.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// CREATE
router.post("/", async (req, res) => {
  try {
    const card = await Flashcard.create({ ...req.body, userId: req.user._id });
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LIST with optional filters
router.get("/", async (req, res) => {
  const { materialId, difficulty, subject, topic, populate } = req.query;
  const filter = { userId: req.user._id };
  if (materialId) filter.materialId = materialId;
  if (difficulty) filter.difficulty = difficulty;
  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;

  let query = Flashcard.find(filter).sort({ createdAt: -1 });
  if (populate === "material") query = query.populate("materialId", "title subject");

  const cards = await query;
  res.json(cards);
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const card = await Flashcard.findOne({ _id: req.params.id, userId: req.user._id });
    if (!card) return res.status(404).json({ error: "Not found" });
    res.json(card);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// UPDATE (e.g., mark difficulty, bump lastReviewedAt)
router.patch("/:id", async (req, res) => {
  try {
    const card = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!card) return res.status(404).json({ error: "Not found" });
    res.json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const card = await Flashcard.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!card) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true, id: card._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

export default router;

import { Router } from "express";
import { Flashcard } from "../models/Flashcard.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// POST /api/flashcards - create one card
router.post("/", async function (req, res) {
  try {
    const card = await Flashcard.create({
      userId: req.user._id,
      materialId: req.body.materialId || null,
      subject: req.body.subject,
      topic: req.body.topic || "",
      question: req.body.question,
      answer: req.body.answer,
      difficulty: req.body.difficulty || "medium",
    });
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/flashcards - list with optional filters
router.get("/", async function (req, res) {
  const filter = { userId: req.user._id };
  if (req.query.materialId) {
    filter.materialId = req.query.materialId;
  }
  if (req.query.difficulty) {
    filter.difficulty = req.query.difficulty;
  }
  if (req.query.subject) {
    filter.subject = req.query.subject;
  }
  if (req.query.topic) {
    filter.topic = req.query.topic;
  }

  let query = Flashcard.find(filter).sort({ createdAt: -1 });
  if (req.query.populate === "material") {
    query = query.populate("materialId", "title subject");
  }

  const cards = await query;
  res.json(cards);
});

// GET /api/flashcards/:id - one card
router.get("/:id", async function (req, res) {
  try {
    const card = await Flashcard.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!card) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(card);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// PATCH /api/flashcards/:id - edit a card (used to change difficulty)
router.patch("/:id", async function (req, res) {
  try {
    const card = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!card) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/flashcards/:id
router.delete("/:id", async function (req, res) {
  try {
    const card = await Flashcard.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!card) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ deleted: true, id: card._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

export default router;

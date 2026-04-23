import { Router } from "express";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { Flashcard } from "../models/Flashcard.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { generateFlashcards } from "../services/flashcardGenerator.js";
import { generateFlashcardsWithOllama } from "../services/ollamaGenerator.js";
import { PDFParse } from "pdf-parse";

// Try the local AI first. If it returns nothing, fall back to the heuristic.
async function generateCards(text) {
  const ai = await generateFlashcardsWithOllama(text);
  if (ai && ai.length > 0) {
    return { cards: ai, source: "ollama" };
  }
  const cards = generateFlashcards(text, { max: 20 });
  return { cards: cards, source: "heuristic" };
}

const router = Router();
router.use(requireAuth);

// Create a material from text (no file).
router.post("/", async function (req, res) {
  try {
    const material = await StudyMaterial.create({
      title: req.body.title,
      subject: req.body.subject,
      topic: req.body.topic || "",
      content: req.body.content,
      userId: req.user._id,
    });
    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Upload a PDF or .txt, save as a material, and auto-generate flashcards.
router.post("/upload", upload.single("file"), async function (req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "file field is required" });
    }

    const title = req.body.title;
    const subject = req.body.subject;
    const topic = req.body.topic || "";

    if (!title || !subject) {
      return res.status(400).json({ error: "title and subject are required" });
    }

    // Extract the text from the uploaded file.
    const buffer = req.file.buffer;
    let content = "";

    if (req.file.mimetype === "application/pdf") {
      const parser = new PDFParse({ data: buffer });
      try {
        const parsed = await parser.getText();
        content = (parsed.text || "").trim();
      } finally {
        await parser.destroy();
      }
    } else if (req.file.mimetype === "text/plain") {
      content = buffer.toString("utf8").trim();
    }

    if (!content) {
      content = "(no extractable text found in uploaded file)";
    }

    // Save the material.
    const material = await StudyMaterial.create({
      userId: req.user._id,
      title: title,
      subject: subject,
      topic: topic,
      content: content,
      sourceFile: req.file.originalname,
    });

    // Generate flashcards from the text.
    const result = await generateCards(content);
    const generated = result.cards;
    const source = result.source;

    // Add userId/materialId/subject/topic to each card before inserting.
    const cardsToInsert = [];
    for (let i = 0; i < generated.length; i++) {
      const c = generated[i];
      cardsToInsert.push({
        question: c.question,
        answer: c.answer,
        difficulty: c.difficulty,
        userId: req.user._id,
        materialId: material._id,
        subject: subject,
        topic: topic,
      });
    }
    const cards = await Flashcard.insertMany(cardsToInsert);

    res.status(201).json({
      material: material,
      flashcardsCreated: cards.length,
      generator: source,
      meta: {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        extractedLength: content.length,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/materials - list materials for the logged-in user.
// Supports ?subject=... and ?topic=... filters.
router.get("/", async function (req, res) {
  const filter = { userId: req.user._id };
  if (req.query.subject) {
    filter.subject = req.query.subject;
  }
  if (req.query.topic) {
    filter.topic = req.query.topic;
  }
  const materials = await StudyMaterial.find(filter).sort({ createdAt: -1 });
  res.json(materials);
});

// GET /api/materials/:id - one material
router.get("/:id", async function (req, res) {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!material) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// PATCH /api/materials/:id - edit fields
router.patch("/:id", async function (req, res) {
  try {
    const material = await StudyMaterial.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!material) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/materials/:id/generate-flashcards - regenerate cards for a material.
// ?replace=true deletes the old cards first.
router.post("/:id/generate-flashcards", async function (req, res) {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }

    if (req.query.replace === "true") {
      await Flashcard.deleteMany({ userId: req.user._id, materialId: material._id });
    }

    const result = await generateCards(material.content);
    const generated = result.cards;
    const source = result.source;

    const cardsToInsert = [];
    for (let i = 0; i < generated.length; i++) {
      const c = generated[i];
      cardsToInsert.push({
        question: c.question,
        answer: c.answer,
        difficulty: c.difficulty,
        userId: req.user._id,
        materialId: material._id,
        subject: material.subject,
        topic: material.topic || "",
      });
    }
    const cards = await Flashcard.insertMany(cardsToInsert);

    res.status(201).json({ created: cards.length, generator: source, cards: cards });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/materials/:id
router.delete("/:id", async function (req, res) {
  try {
    const material = await StudyMaterial.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!material) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ deleted: true, id: material._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

export default router;

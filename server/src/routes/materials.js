// ===================================================================
// StudyMaterial CRUD — all routes require auth and scope to req.user.
// Mounted at /api/materials
// ===================================================================

import { Router } from "express";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { Flashcard } from "../models/Flashcard.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { generateFlashcards } from "../services/flashcardGenerator.js";
import { generateFlashcardsWithOllama } from "../services/ollamaGenerator.js";

// Try Ollama first (local LLM), fall back to the heuristic generator.
// Returns { cards, source } — source is "ollama" or "heuristic".
const generateCards = async (text) => {
  const ai = await generateFlashcardsWithOllama(text);
  if (ai && ai.length > 0) return { cards: ai, source: "ollama" };
  return { cards: generateFlashcards(text, { max: 20 }), source: "heuristic" };
};

// pdf-parse v2 uses a class-based API.
import { PDFParse } from "pdf-parse";

const router = Router();
router.use(requireAuth); // every route below needs a valid JWT

// CREATE (text-only — for pasted content)
router.post("/", async (req, res) => {
  try {
    const material = await StudyMaterial.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPLOAD — POST /api/materials/upload
// multipart/form-data with fields:
//   - file   (the PDF or .txt)
//   - title  (string)
//   - subject (string)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file field is required" });
    const { title, subject } = req.body;
    if (!title || !subject) {
      return res.status(400).json({ error: "title and subject are required" });
    }

    // With memory storage, the file bytes live at req.file.buffer.
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

    const material = await StudyMaterial.create({
      userId: req.user._id,
      title,
      subject,
      content,
      sourceFile: req.file.originalname,
    });

    // Auto-generate flashcards from the extracted text (Ollama if available, else heuristic).
    const { cards: generated, source } = await generateCards(content);
    const cards = await Flashcard.insertMany(
      generated.map((c) => ({
        ...c,
        userId: req.user._id,
        materialId: material._id,
        subject,
      }))
    );

    res.status(201).json({
      material,
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

// LIST (only the current user's)
router.get("/", async (req, res) => {
  const materials = await StudyMaterial.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(materials);
});

// READ ONE (ownership enforced via filter)
router.get("/:id", async (req, res) => {
  try {
    const material = await StudyMaterial.findOne({ _id: req.params.id, userId: req.user._id });
    if (!material) return res.status(404).json({ error: "Not found" });
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// UPDATE
router.patch("/:id", async (req, res) => {
  try {
    const material = await StudyMaterial.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!material) return res.status(404).json({ error: "Not found" });
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GENERATE flashcards from an existing material.
// Optional query: ?replace=true  → delete existing cards for this material first.
router.post("/:id/generate-flashcards", async (req, res) => {
  try {
    const material = await StudyMaterial.findOne({ _id: req.params.id, userId: req.user._id });
    if (!material) return res.status(404).json({ error: "Material not found" });

    if (req.query.replace === "true") {
      await Flashcard.deleteMany({ userId: req.user._id, materialId: material._id });
    }

    const { cards: generated, source } = await generateCards(material.content);
    const cards = await Flashcard.insertMany(
      generated.map((c) => ({
        ...c,
        userId: req.user._id,
        materialId: material._id,
        subject: material.subject,
      }))
    );

    res.status(201).json({ created: cards.length, generator: source, cards });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const material = await StudyMaterial.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!material) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true, id: material._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

export default router;

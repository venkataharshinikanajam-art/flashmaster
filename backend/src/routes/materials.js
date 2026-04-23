import { Router } from "express";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { Flashcard } from "../models/Flashcard.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { generateFlashcards } from "../services/flashcardGenerator.js";
import { generateFlashcardsWithOllama } from "../services/ollamaGenerator.js";
import { PDFParse } from "pdf-parse";

const generateCards = async (text) => {
  const ai = await generateFlashcardsWithOllama(text);
  if (ai && ai.length > 0) return { cards: ai, source: "ollama" };
  return { cards: generateFlashcards(text, { max: 20 }), source: "heuristic" };
};

const router = Router();
router.use(requireAuth);

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

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file field is required" });
    const { title, subject, topic = "" } = req.body;
    if (!title || !subject) {
      return res.status(400).json({ error: "title and subject are required" });
    }

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
      topic,
      content,
      sourceFile: req.file.originalname,
    });

    const { cards: generated, source } = await generateCards(content);
    const cards = await Flashcard.insertMany(
      generated.map((c) => ({
        ...c,
        userId: req.user._id,
        materialId: material._id,
        subject,
        topic,
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

router.get("/", async (req, res) => {
  const { subject, topic } = req.query;
  const filter = { userId: req.user._id };
  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;
  const materials = await StudyMaterial.find(filter).sort({ createdAt: -1 });
  res.json(materials);
});

router.get("/:id", async (req, res) => {
  try {
    const material = await StudyMaterial.findOne({ _id: req.params.id, userId: req.user._id });
    if (!material) return res.status(404).json({ error: "Not found" });
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

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
        topic: material.topic || "",
      }))
    );

    res.status(201).json({ created: cards.length, generator: source, cards });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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

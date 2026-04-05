// ===================================================================
// StudyMaterial CRUD — all routes require auth and scope to req.user.
// Mounted at /api/materials
// ===================================================================

import { Router } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

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
      // Clean up the uploaded file if metadata is missing.
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ error: "title and subject are required" });
    }

    // Read the file and extract text based on its type.
    const buffer = await fs.readFile(req.file.path);
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
      // Save the file path (relative to server/) so we can reference it later.
      // Using path.basename avoids leaking absolute paths in responses.
      sourceFile: path.basename(req.file.path),
    });

    res.status(201).json({
      material,
      meta: {
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        extractedLength: content.length,
      },
    });
  } catch (err) {
    // Clean up on failure.
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
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

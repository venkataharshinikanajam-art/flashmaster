// ===================================================================
// StudyMaterial CRUD — all routes require auth and scope to req.user.
// Mounted at /api/materials
// ===================================================================

import { Router } from "express";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth); // every route below needs a valid JWT

// CREATE
router.post("/", async (req, res) => {
  try {
    const material = await StudyMaterial.create({
      ...req.body,
      userId: req.user._id, // force ownership — ignore any client-supplied userId
    });
    res.status(201).json(material);
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

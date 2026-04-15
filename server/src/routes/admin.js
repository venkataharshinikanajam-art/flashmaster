// ===================================================================
// Admin-only routes — mounted at /api/admin
// Every route here requires both a valid JWT AND the "admin" role.
// ===================================================================

import { Router } from "express";
import { User } from "../models/User.js";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { Flashcard } from "../models/Flashcard.js";
import { StudyPlan } from "../models/StudyPlan.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

// GET /api/admin/materials — every user's uploads, with owner info attached
router.get("/materials", async (req, res) => {
  const materials = await StudyMaterial.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name email");
  res.json(materials);
});

// DELETE /api/admin/materials/:id — admin can remove any upload
router.delete("/materials/:id", async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ error: "Not found" });
    await Flashcard.deleteMany({ materialId: material._id });
    res.json({ deleted: true, id: material._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// GET /api/admin/stats — platform-wide counts for the reports view
router.get("/stats", async (req, res) => {
  const [users, students, admins, materials, flashcards, plans] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "admin" }),
    StudyMaterial.countDocuments(),
    Flashcard.countDocuments(),
    StudyPlan.countDocuments(),
  ]);

  const hardCards = await Flashcard.countDocuments({ difficulty: "hard" });
  const recentMaterials = await StudyMaterial.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "name email");

  res.json({
    users: { total: users, students, admins },
    materials,
    flashcards: { total: flashcards, hard: hardCards },
    plans,
    recentMaterials,
  });
});

export default router;

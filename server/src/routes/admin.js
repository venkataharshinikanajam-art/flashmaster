import { Router } from "express";
import { User } from "../models/User.js";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { Flashcard } from "../models/Flashcard.js";
import { StudyPlan } from "../models/StudyPlan.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

router.get("/materials", async (req, res) => {
  const materials = await StudyMaterial.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name email");
  res.json(materials);
});

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

router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "student"].includes(role)) {
      return res.status(400).json({ error: "role must be 'admin' or 'student'" });
    }
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: "You cannot change your own role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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

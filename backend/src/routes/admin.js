import { Router } from "express";
import { User } from "../models/User.js";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { Flashcard } from "../models/Flashcard.js";
import { StudyPlan } from "../models/StudyPlan.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
// Every admin endpoint requires login AND admin role.
router.use(requireAuth, requireRole("admin"));

// GET /api/admin/materials - every user's uploads
router.get("/materials", async function (req, res) {
  const materials = await StudyMaterial.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name email");
  res.json(materials);
});

// DELETE /api/admin/materials/:id - delete a material and its flashcards
router.delete("/materials/:id", async function (req, res) {
  try {
    const material = await StudyMaterial.findByIdAndDelete(req.params.id);
    if (!material) {
      return res.status(404).json({ error: "Not found" });
    }
    // Also delete all flashcards linked to this material.
    await Flashcard.deleteMany({ materialId: material._id });
    res.json({ deleted: true, id: material._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// PATCH /api/admin/users/:id/role - promote/demote a user
router.patch("/users/:id/role", async function (req, res) {
  try {
    const role = req.body.role;
    if (role !== "admin" && role !== "student") {
      return res.status(400).json({ error: "role must be 'admin' or 'student'" });
    }
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: "You cannot change your own role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: role },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/admin/stats - platform-wide statistics
router.get("/stats", async function (req, res) {
  // Run the counts one after another (simple and easy to read).
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: "student" });
  const totalAdmins = await User.countDocuments({ role: "admin" });
  const totalMaterials = await StudyMaterial.countDocuments();
  const totalFlashcards = await Flashcard.countDocuments();
  const totalPlans = await StudyPlan.countDocuments();
  const hardCards = await Flashcard.countDocuments({ difficulty: "hard" });

  const recentMaterials = await StudyMaterial.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "name email");

  res.json({
    users: {
      total: totalUsers,
      students: totalStudents,
      admins: totalAdmins,
    },
    materials: totalMaterials,
    flashcards: {
      total: totalFlashcards,
      hard: hardCards,
    },
    plans: totalPlans,
    recentMaterials: recentMaterials,
  });
});

export default router;

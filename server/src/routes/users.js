import { Router } from "express";
import { User } from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// NOTE: direct POST /api/users is deprecated now that signup exists
// on /api/auth/signup. Keeping it here for Phase 3 continuity, but
// later phases will remove it. It still requires auth below.

// READ ALL — GET /api/users  (admin only)
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

// READ ONE — GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// UPDATE — PATCH /api/users/:id
router.patch("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,           // return the updated doc, not the old one
      runValidators: true, // re-run schema validation on the changes
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE — DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ deleted: true, id: user._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

export default router;

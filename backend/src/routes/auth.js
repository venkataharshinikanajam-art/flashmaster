import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Make a JWT token for a user.
function signToken(user) {
  const payload = { userId: user._id.toString(), role: user.role };
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn: expiresIn });
}

// POST /api/auth/signup
router.post("/signup", async function (req, res) {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Only allow these two roles. Default to student.
    let finalRole = "student";
    if (role === "student" || role === "admin") {
      finalRole = role;
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name: name,
      email: email,
      passwordHash: passwordHash,
      role: finalRole,
    });
    const token = signToken(user);

    res.status(201).json({ user: user, token: token });
  } catch (err) {
    // Mongo error code 11000 means duplicate key (email already exists).
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already in use" });
    }
    res.status(400).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);
    res.json({ user: user, token: token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me - returns the current logged-in user
router.get("/me", requireAuth, function (req, res) {
  res.json({ user: req.user });
});

export default router;

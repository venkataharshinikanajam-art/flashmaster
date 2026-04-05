// ===================================================================
// Auth middleware
// ===================================================================
// - requireAuth: verifies a JWT from the Authorization header,
//                loads the user, attaches it to req.user.
// - requireRole: after requireAuth, enforces a specific role.
// ===================================================================

import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    // Expect header:  Authorization: Bearer <jwt>
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing or malformed Authorization header" });
    }

    // Verify the signature + expiry. Throws if invalid.
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Load the current user (so we have fresh role info, etc.)
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    // Make user available to downstream handlers
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (req.user.role !== role) {
    return res.status(403).json({ error: `Requires '${role}' role` });
  }
  next();
};

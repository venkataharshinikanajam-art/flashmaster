// ===================================================================
// User model — defines the shape of a user document in MongoDB.
// Password handling arrives in Phase 4 (auth) — for now, no password.
// ===================================================================

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,         // MongoDB rejects duplicates
      trim: true,
      lowercase: true,      // store emails in lowercase
      match: [/.+@.+\..+/, "Invalid email format"],
    },
    role: {
      type: String,
      enum: ["student", "admin"],   // only these two values allowed
      default: "student",
    },
  },
  {
    timestamps: true, // auto-adds createdAt and updatedAt fields
  }
);

// Mongoose takes "User" and makes the collection name "users" (lowercased + pluralized).
export const User = mongoose.model("User", userSchema);

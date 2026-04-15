// ===================================================================
// Flashcard — one Q/A pair. Belongs to a user and optionally a material.
// ===================================================================

import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudyMaterial",
      default: null, // flashcards can exist without a source material
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      trim: true,
      default: "",
    },
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Flashcard = mongoose.model("Flashcard", flashcardSchema);

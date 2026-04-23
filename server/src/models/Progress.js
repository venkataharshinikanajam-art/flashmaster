import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    totalTopics: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedTopics: {
      type: Number,
      default: 0,
      min: 0,
    },
    flashcardsReviewed: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// A user has at most one Progress doc per subject.
progressSchema.index({ userId: 1, subject: 1 }, { unique: true });

export const Progress = mongoose.model("Progress", progressSchema);

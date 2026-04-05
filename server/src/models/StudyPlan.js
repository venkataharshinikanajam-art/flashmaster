// ===================================================================
// StudyPlan — a user's plan for preparing for a specific exam.
// ===================================================================

import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
    },
    examDate: {
      type: Date,
      required: [true, "Exam date is required"],
    },
    dailyStudyHours: {
      type: Number,
      required: true,
      min: [0.5, "At least 0.5 hours per day"],
      max: [16, "At most 16 hours per day"],
    },
    topics: {
      type: [String], // ["Linked Lists", "Trees", "Graphs", ...]
      default: [],
    },
    completedTopics: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const StudyPlan = mongoose.model("StudyPlan", studyPlanSchema);

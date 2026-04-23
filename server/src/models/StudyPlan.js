import mongoose from "mongoose";

const scheduleDaySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    date: { type: String, required: true },        // "2026-04-09"
    type: { type: String, enum: ["study", "review", "revision"], required: true },
    topics: { type: [String], default: [] },
    hours: { type: Number, required: true },
    topicHours: { type: Map, of: Number, default: {} }, // { "Trees": 1.75, "Graphs": 1.25 }
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

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
      type: [String],
      default: [],
    },
    topicDifficulties: {
      type: Map,
      of: { type: String, enum: ["easy", "medium", "hard"] },
      default: {},
    },
    schedule: {
      type: [scheduleDaySchema],
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

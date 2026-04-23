import mongoose from "mongoose";

const studyMaterialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // makes "find all for this user" fast
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 160,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: 80,
    },
    topic: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    sourceFile: {
      type: String,     // basename of the file in server/uploads/, if uploaded
      default: null,
    },
  },
  { timestamps: true }
);

export const StudyMaterial = mongoose.model("StudyMaterial", studyMaterialSchema);

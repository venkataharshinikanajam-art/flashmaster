import { Router } from "express";
import { StudyPlan } from "../models/StudyPlan.js";
import { Flashcard } from "../models/Flashcard.js";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { requireAuth } from "../middleware/auth.js";
import { generateSchedule } from "../services/planGenerator.js";

const router = Router();
router.use(requireAuth);

// --- Create a plan (auto-generates schedule) ---
router.post("/", async (req, res) => {
  try {
    const { subject, examDate, dailyStudyHours, topics, topicDifficulties } = req.body;

    const schedule = generateSchedule({
      topics: topics || [],
      examDate,
      dailyStudyHours: Number(dailyStudyHours),
      topicDifficulties: topicDifficulties || {},
    });

    const plan = await StudyPlan.create({
      userId: req.user._id,
      subject,
      examDate,
      dailyStudyHours,
      topics,
      topicDifficulties: topicDifficulties || {},
      schedule,
    });

    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- List all plans (with today info) ---
router.get("/", async (req, res) => {
  const plans = await StudyPlan.find({ userId: req.user._id }).sort({ examDate: 1 });

  const enriched = await Promise.all(plans.map((p) => enrichPlan(p, req.user._id)));
  res.json(enriched);
});

// --- Get single plan (with flashcard stats) ---
router.get("/:id", async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ error: "Not found" });

    const enriched = await enrichPlan(plan, req.user._id);
    res.json(enriched);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// --- Update plan (mark days completed, edit fields) ---
router.patch("/:id", async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ error: "Not found" });

    // If marking a specific day as completed
    if (req.body.completeDayNumber !== undefined) {
      const dayIdx = plan.schedule.findIndex((d) => d.day === req.body.completeDayNumber);
      if (dayIdx !== -1) {
        plan.schedule[dayIdx].completed = true;
      }
      await plan.save();
      const enriched = await enrichPlan(plan, req.user._id);
      return res.json(enriched);
    }

    // If uncompleting a day
    if (req.body.uncompleteDayNumber !== undefined) {
      const dayIdx = plan.schedule.findIndex((d) => d.day === req.body.uncompleteDayNumber);
      if (dayIdx !== -1) {
        plan.schedule[dayIdx].completed = false;
      }
      await plan.save();
      const enriched = await enrichPlan(plan, req.user._id);
      return res.json(enriched);
    }

    // General field updates
    const allowed = ["subject", "examDate", "dailyStudyHours", "topics", "topicDifficulties"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // If topics or schedule-affecting fields changed, regenerate schedule
    if (updates.topics || updates.examDate || updates.dailyStudyHours || updates.topicDifficulties) {
      const newTopics = updates.topics || plan.topics;
      const newExamDate = updates.examDate || plan.examDate;
      const newHours = updates.dailyStudyHours || plan.dailyStudyHours;
      const newDifficulties = updates.topicDifficulties || plan.topicDifficulties;

      updates.schedule = generateSchedule({
        topics: newTopics,
        examDate: newExamDate,
        dailyStudyHours: Number(newHours),
        topicDifficulties: newDifficulties instanceof Map ? Object.fromEntries(newDifficulties) : newDifficulties,
      });
    }

    Object.assign(plan, updates);
    await plan.save();

    const enriched = await enrichPlan(plan, req.user._id);
    res.json(enriched);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Delete ---
router.delete("/:id", async (req, res) => {
  try {
    const plan = await StudyPlan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!plan) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true, id: plan._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// --- Helper: enrich a plan with flashcard/material stats ---
async function enrichPlan(plan, userId) {
  const obj = plan.toJSON();

  // Get flashcard counts and difficulty breakdown for this subject
  const flashcards = await Flashcard.find({ userId, subject: plan.subject });
  const materials = await StudyMaterial.find({ userId, subject: plan.subject });

  obj.stats = {
    totalFlashcards: flashcards.length,
    flashcardsByDifficulty: {
      easy: flashcards.filter((f) => f.difficulty === "easy").length,
      medium: flashcards.filter((f) => f.difficulty === "medium").length,
      hard: flashcards.filter((f) => f.difficulty === "hard").length,
    },
    totalMaterials: materials.length,
    daysCompleted: obj.schedule.filter((d) => d.completed).length,
    totalDays: obj.schedule.length,
    progressPercent: obj.schedule.length > 0
      ? Math.round((obj.schedule.filter((d) => d.completed).length / obj.schedule.length) * 100)
      : 0,
  };

  // Find today's entry
  const todayStr = new Date().toISOString().split("T")[0];
  obj.today = obj.schedule.find((d) => d.date === todayStr) || null;

  return obj;
}

export default router;

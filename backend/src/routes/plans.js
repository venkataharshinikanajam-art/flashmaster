import { Router } from "express";
import { StudyPlan } from "../models/StudyPlan.js";
import { Flashcard } from "../models/Flashcard.js";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { requireAuth } from "../middleware/auth.js";
import { generateSchedule } from "../services/planGenerator.js";

const router = Router();
router.use(requireAuth);

// Create a plan. Also auto-generates the day-by-day schedule.
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

// List all plans for the logged-in user.
router.get("/", async (req, res) => {
  const plans = await StudyPlan.find({ userId: req.user._id }).sort({ examDate: 1 });
  const enriched = [];
  for (const plan of plans) {
    const data = await enrichPlan(plan, req.user._id);
    enriched.push(data);
  }
  res.json(enriched);
});

// Get one plan by id.
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

// Update plan. Handles three cases:
//   1. Mark a specific day as completed.
//   2. Mark a specific day as not completed.
//   3. Edit plan fields (subject, topics, dates, etc.).
router.patch("/:id", async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!plan) return res.status(404).json({ error: "Not found" });

    if (req.body.completeDayNumber !== undefined) {
      setDayCompleted(plan, req.body.completeDayNumber, true);
      await plan.save();
      return res.json(await enrichPlan(plan, req.user._id));
    }

    if (req.body.uncompleteDayNumber !== undefined) {
      setDayCompleted(plan, req.body.uncompleteDayNumber, false);
      await plan.save();
      return res.json(await enrichPlan(plan, req.user._id));
    }

    // Update plain fields
    const allowed = ["subject", "examDate", "dailyStudyHours", "topics", "topicDifficulties"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // If something that affects the schedule changed, rebuild the schedule.
    const scheduleFieldsChanged =
      updates.topics ||
      updates.examDate ||
      updates.dailyStudyHours ||
      updates.topicDifficulties;

    if (scheduleFieldsChanged) {
      const newTopics = updates.topics || plan.topics;
      const newExamDate = updates.examDate || plan.examDate;
      const newHours = updates.dailyStudyHours || plan.dailyStudyHours;
      let newDifficulties = updates.topicDifficulties || plan.topicDifficulties;
      // Mongoose stores Map-type fields as Map; convert to a plain object.
      if (newDifficulties instanceof Map) {
        newDifficulties = Object.fromEntries(newDifficulties);
      }

      updates.schedule = generateSchedule({
        topics: newTopics,
        examDate: newExamDate,
        dailyStudyHours: Number(newHours),
        topicDifficulties: newDifficulties,
      });
    }

    Object.assign(plan, updates);
    await plan.save();

    res.json(await enrichPlan(plan, req.user._id));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a plan.
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

// Helper: change the completed flag on a single day inside the plan.
function setDayCompleted(plan, dayNumber, completed) {
  const dayIndex = plan.schedule.findIndex((d) => d.day === dayNumber);
  if (dayIndex !== -1) {
    plan.schedule[dayIndex].completed = completed;
  }
}

// Helper: add stats (flashcard counts, progress %, today's entry) to a plan object.
async function enrichPlan(plan, userId) {
  const obj = plan.toJSON();

  const flashcards = await Flashcard.find({ userId, subject: plan.subject });
  const materials = await StudyMaterial.find({ userId, subject: plan.subject });

  const easyCount = flashcards.filter((f) => f.difficulty === "easy").length;
  const mediumCount = flashcards.filter((f) => f.difficulty === "medium").length;
  const hardCount = flashcards.filter((f) => f.difficulty === "hard").length;

  const daysCompleted = obj.schedule.filter((d) => d.completed).length;
  const totalDays = obj.schedule.length;
  const progressPercent =
    totalDays > 0 ? Math.round((daysCompleted / totalDays) * 100) : 0;

  obj.stats = {
    totalFlashcards: flashcards.length,
    flashcardsByDifficulty: {
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
    },
    totalMaterials: materials.length,
    daysCompleted,
    totalDays,
    progressPercent,
  };

  const todayStr = new Date().toISOString().split("T")[0];
  obj.today = obj.schedule.find((d) => d.date === todayStr) || null;

  return obj;
}

export default router;

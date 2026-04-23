import { Router } from "express";
import { StudyPlan } from "../models/StudyPlan.js";
import { Flashcard } from "../models/Flashcard.js";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { requireAuth } from "../middleware/auth.js";
import { generateSchedule } from "../services/planGenerator.js";

const router = Router();
router.use(requireAuth);

// POST /api/plans - create a new study plan and auto-generate its schedule.
router.post("/", async function (req, res) {
  try {
    const subject = req.body.subject;
    const examDate = req.body.examDate;
    const dailyStudyHours = req.body.dailyStudyHours;
    const topics = req.body.topics || [];
    const topicDifficulties = req.body.topicDifficulties || {};

    const schedule = generateSchedule({
      topics: topics,
      examDate: examDate,
      dailyStudyHours: Number(dailyStudyHours),
      topicDifficulties: topicDifficulties,
    });

    const plan = await StudyPlan.create({
      userId: req.user._id,
      subject: subject,
      examDate: examDate,
      dailyStudyHours: dailyStudyHours,
      topics: topics,
      topicDifficulties: topicDifficulties,
      schedule: schedule,
    });

    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/plans - list all plans for the logged-in user.
router.get("/", async function (req, res) {
  const plans = await StudyPlan.find({ userId: req.user._id }).sort({ examDate: 1 });
  const enriched = [];
  for (let i = 0; i < plans.length; i++) {
    const data = await enrichPlan(plans[i], req.user._id);
    enriched.push(data);
  }
  res.json(enriched);
});

// GET /api/plans/:id - read one plan.
router.get("/:id", async function (req, res) {
  try {
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!plan) {
      return res.status(404).json({ error: "Not found" });
    }
    const enriched = await enrichPlan(plan, req.user._id);
    res.json(enriched);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// PATCH /api/plans/:id - three cases:
//   1. Mark a specific day as completed.
//   2. Mark a specific day as not completed.
//   3. Edit plan fields (subject, topics, dates, etc.).
router.patch("/:id", async function (req, res) {
  try {
    const plan = await StudyPlan.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!plan) {
      return res.status(404).json({ error: "Not found" });
    }

    // Case 1: mark day as done
    if (req.body.completeDayNumber !== undefined) {
      setDayCompleted(plan, req.body.completeDayNumber, true);
      await plan.save();
      const enriched = await enrichPlan(plan, req.user._id);
      return res.json(enriched);
    }

    // Case 2: mark day as not done
    if (req.body.uncompleteDayNumber !== undefined) {
      setDayCompleted(plan, req.body.uncompleteDayNumber, false);
      await plan.save();
      const enriched = await enrichPlan(plan, req.user._id);
      return res.json(enriched);
    }

    // Case 3: update plain fields.
    const allowed = ["subject", "examDate", "dailyStudyHours", "topics", "topicDifficulties"];
    const updates = {};
    for (let i = 0; i < allowed.length; i++) {
      const key = allowed[i];
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
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

    // Copy the allowed updates onto the plan.
    Object.assign(plan, updates);
    await plan.save();

    const enriched = await enrichPlan(plan, req.user._id);
    res.json(enriched);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/plans/:id
router.delete("/:id", async function (req, res) {
  try {
    const plan = await StudyPlan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!plan) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ deleted: true, id: plan._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// Helper: flip the completed flag for one day in a plan.
function setDayCompleted(plan, dayNumber, completed) {
  for (let i = 0; i < plan.schedule.length; i++) {
    if (plan.schedule[i].day === dayNumber) {
      plan.schedule[i].completed = completed;
      return;
    }
  }
}

// Helper: add stats (flashcard counts, progress %, today's entry) to a plan.
async function enrichPlan(plan, userId) {
  const obj = plan.toJSON();

  const flashcards = await Flashcard.find({ userId: userId, subject: plan.subject });
  const materials = await StudyMaterial.find({ userId: userId, subject: plan.subject });

  // Count flashcards by difficulty using a simple for-loop.
  let easyCount = 0;
  let mediumCount = 0;
  let hardCount = 0;
  for (let i = 0; i < flashcards.length; i++) {
    if (flashcards[i].difficulty === "easy") easyCount++;
    else if (flashcards[i].difficulty === "medium") mediumCount++;
    else if (flashcards[i].difficulty === "hard") hardCount++;
  }

  // Count completed days.
  let daysCompleted = 0;
  for (let i = 0; i < obj.schedule.length; i++) {
    if (obj.schedule[i].completed) daysCompleted++;
  }
  const totalDays = obj.schedule.length;
  let progressPercent = 0;
  if (totalDays > 0) {
    progressPercent = Math.round((daysCompleted / totalDays) * 100);
  }

  obj.stats = {
    totalFlashcards: flashcards.length,
    flashcardsByDifficulty: {
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
    },
    totalMaterials: materials.length,
    daysCompleted: daysCompleted,
    totalDays: totalDays,
    progressPercent: progressPercent,
  };

  // Find today's entry in the schedule.
  const todayStr = new Date().toISOString().split("T")[0];
  obj.today = null;
  for (let i = 0; i < obj.schedule.length; i++) {
    if (obj.schedule[i].date === todayStr) {
      obj.today = obj.schedule[i];
      break;
    }
  }

  return obj;
}

export default router;

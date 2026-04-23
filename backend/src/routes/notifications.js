import { Router } from "express";
import { StudyPlan } from "../models/StudyPlan.js";
import { Flashcard } from "../models/Flashcard.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/notifications - computes notifications from the user's plans and cards.
router.get("/", async function (req, res) {
  try {
    const userId = req.user._id;
    const plans = await StudyPlan.find({ userId: userId });
    const flashcards = await Flashcard.find({ userId: userId });

    const notifications = [];
    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Welcome: if the user has no plans AND no flashcards.
    if (plans.length === 0 && flashcards.length === 0) {
      notifications.push({
        id: "welcome",
        type: "welcome",
        title: "Welcome to FLASHMASTER!",
        message: "Upload some study material or create a plan to get started.",
        priority: "info",
        createdAt: new Date().toISOString(),
      });
    }

    // Exam-soon alerts (within 7 days).
    for (let i = 0; i < plans.length; i++) {
      const p = plans[i];
      const examDate = new Date(p.examDate);
      examDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntil >= 0 && daysUntil <= 7) {
        let urgency = "low";
        if (daysUntil <= 2) urgency = "high";
        else if (daysUntil <= 5) urgency = "medium";

        let title;
        if (daysUntil === 0) {
          title = p.subject + " exam is TODAY!";
        } else if (daysUntil === 1) {
          title = p.subject + " exam is TOMORROW!";
        } else {
          title = p.subject + " exam in " + daysUntil + " days";
        }

        let topicCount = 0;
        if (p.topics) topicCount = p.topics.length;

        notifications.push({
          id: "exam-" + p._id,
          type: "exam_soon",
          title: title,
          message: "Stay focused - you have " + topicCount + " topics to cover.",
          priority: urgency,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Today's study reminders.
    for (let i = 0; i < plans.length; i++) {
      const p = plans[i];
      if (!p.schedule) continue;

      let todayEntry = null;
      for (let j = 0; j < p.schedule.length; j++) {
        if (p.schedule[j].date === todayStr) {
          todayEntry = p.schedule[j];
          break;
        }
      }

      if (todayEntry && !todayEntry.completed) {
        let topicsText = "Review time";
        if (todayEntry.topics && todayEntry.topics.length > 0) {
          topicsText = todayEntry.topics.join(", ");
        }
        notifications.push({
          id: "today-" + p._id,
          type: "study_today",
          title: "Today: " + p.subject,
          message: topicsText + " (" + todayEntry.hours + "h planned)",
          priority: "medium",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Overdue days (past dates not completed).
    for (let i = 0; i < plans.length; i++) {
      const p = plans[i];
      if (!p.schedule) continue;

      let overdueCount = 0;
      for (let j = 0; j < p.schedule.length; j++) {
        const dayDate = new Date(p.schedule[j].date);
        dayDate.setHours(0, 0, 0, 0);
        if (dayDate < now && !p.schedule[j].completed) {
          overdueCount++;
        }
      }

      if (overdueCount > 0) {
        let dayWord = "day";
        if (overdueCount > 1) dayWord = "days";
        notifications.push({
          id: "overdue-" + p._id,
          type: "overdue",
          title: overdueCount + " overdue " + dayWord + " in " + p.subject,
          message: "Catch up to stay on track with your study plan.",
          priority: "high",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Milestone notifications (50%, 75%, 100% complete).
    for (let i = 0; i < plans.length; i++) {
      const p = plans[i];
      if (!p.schedule || p.schedule.length === 0) continue;

      let completed = 0;
      for (let j = 0; j < p.schedule.length; j++) {
        if (p.schedule[j].completed) completed++;
      }
      const total = p.schedule.length;
      const percent = Math.round((completed / total) * 100);

      if (percent === 100) {
        notifications.push({
          id: "milestone-100-" + p._id,
          type: "milestone",
          title: p.subject + " plan complete!",
          message: "Amazing work - you finished all study days.",
          priority: "info",
          createdAt: new Date().toISOString(),
        });
      } else if (percent >= 75) {
        notifications.push({
          id: "milestone-75-" + p._id,
          type: "milestone",
          title: p.subject + ": 75% complete",
          message: "You are on the home stretch!",
          priority: "info",
          createdAt: new Date().toISOString(),
        });
      } else if (percent >= 50) {
        notifications.push({
          id: "milestone-50-" + p._id,
          type: "milestone",
          title: p.subject + ": halfway there",
          message: "Keep the momentum going.",
          priority: "info",
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Hard-cards weak area reminder.
    const hardCards = [];
    for (let i = 0; i < flashcards.length; i++) {
      if (flashcards[i].difficulty === "hard") {
        hardCards.push(flashcards[i]);
      }
    }
    if (hardCards.length >= 5) {
      const hardSubjects = [];
      for (let i = 0; i < hardCards.length; i++) {
        const sub = hardCards[i].subject;
        if (sub && hardSubjects.indexOf(sub) === -1) {
          hardSubjects.push(sub);
        }
      }
      notifications.push({
        id: "weak-areas",
        type: "weak_areas",
        title: hardCards.length + " hard flashcards need review",
        message: "Focus on: " + hardSubjects.slice(0, 3).join(", "),
        priority: "medium",
        createdAt: new Date().toISOString(),
      });
    }

    // Sort so urgent items come first.
    const priorityRank = { high: 0, medium: 1, low: 2, info: 3 };
    notifications.sort(function (a, b) {
      return priorityRank[a.priority] - priorityRank[b.priority];
    });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

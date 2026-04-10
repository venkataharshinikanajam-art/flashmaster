// ===================================================================
// Notifications — computed on the fly from user's plans + flashcards.
// Mounted at /api/notifications
//
// Not stored in DB. Each request returns a fresh list based on
// current state. Frontend tracks read/dismissed via localStorage.
// ===================================================================

import { Router } from "express";
import { StudyPlan } from "../models/StudyPlan.js";
import { Flashcard } from "../models/Flashcard.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const userId = req.user._id;
    const plans = await StudyPlan.find({ userId });
    const flashcards = await Flashcard.find({ userId });

    const notifications = [];
    const todayStr = new Date().toISOString().split("T")[0];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // --- Welcome: if user has no plans AND no flashcards ---
    if (plans.length === 0 && flashcards.length === 0) {
      notifications.push({
        id: "welcome",
        type: "welcome",
        icon: "👋",
        title: "Welcome to FLASHMASTER!",
        message: "Upload some study material or create a plan to get started.",
        priority: "info",
        createdAt: new Date().toISOString(),
      });
    }

    // --- Exam-soon alerts (within 7 days) ---
    plans.forEach((p) => {
      const examDate = new Date(p.examDate);
      examDate.setHours(0, 0, 0, 0);
      const daysUntil = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));

      if (daysUntil >= 0 && daysUntil <= 7) {
        const urgency = daysUntil <= 2 ? "high" : daysUntil <= 5 ? "medium" : "low";
        notifications.push({
          id: `exam-${p._id}`,
          type: "exam_soon",
          icon: daysUntil <= 2 ? "🚨" : "⏰",
          title:
            daysUntil === 0
              ? `${p.subject} exam is TODAY!`
              : daysUntil === 1
                ? `${p.subject} exam is TOMORROW!`
                : `${p.subject} exam in ${daysUntil} days`,
          message: `Stay focused — you have ${p.topics?.length || 0} topics to cover.`,
          priority: urgency,
          createdAt: new Date().toISOString(),
        });
      }
    });

    // --- Today's study reminders ---
    plans.forEach((p) => {
      const todayEntry = p.schedule?.find((d) => d.date === todayStr);
      if (todayEntry && !todayEntry.completed) {
        const typeEmoji = {
          study: "📖",
          review: "🔄",
          revision: "📝",
        };
        notifications.push({
          id: `today-${p._id}`,
          type: "study_today",
          icon: typeEmoji[todayEntry.type] || "📚",
          title: `Today: ${p.subject}`,
          message: `${todayEntry.topics?.join(", ") || "Review time"} (${todayEntry.hours}h planned)`,
          priority: "medium",
          createdAt: new Date().toISOString(),
        });
      }
    });

    // --- Overdue days (past dates not completed) ---
    plans.forEach((p) => {
      const overdueCount =
        p.schedule?.filter((d) => {
          const dayDate = new Date(d.date);
          dayDate.setHours(0, 0, 0, 0);
          return dayDate < now && !d.completed;
        }).length || 0;

      if (overdueCount > 0) {
        notifications.push({
          id: `overdue-${p._id}`,
          type: "overdue",
          icon: "⚠️",
          title: `${overdueCount} overdue day${overdueCount > 1 ? "s" : ""} in ${p.subject}`,
          message: "Catch up to stay on track with your study plan.",
          priority: "high",
          createdAt: new Date().toISOString(),
        });
      }
    });

    // --- Milestone notifications (50%, 75%, 100% complete) ---
    plans.forEach((p) => {
      if (!p.schedule || p.schedule.length === 0) return;
      const completed = p.schedule.filter((d) => d.completed).length;
      const total = p.schedule.length;
      const percent = Math.round((completed / total) * 100);

      if (percent === 100) {
        notifications.push({
          id: `milestone-100-${p._id}`,
          type: "milestone",
          icon: "🎉",
          title: `${p.subject} plan complete!`,
          message: "Amazing work — you finished all study days.",
          priority: "info",
          createdAt: new Date().toISOString(),
        });
      } else if (percent >= 75) {
        notifications.push({
          id: `milestone-75-${p._id}`,
          type: "milestone",
          icon: "💪",
          title: `${p.subject}: 75% complete`,
          message: "You're on the home stretch!",
          priority: "info",
          createdAt: new Date().toISOString(),
        });
      } else if (percent >= 50) {
        notifications.push({
          id: `milestone-50-${p._id}`,
          type: "milestone",
          icon: "✨",
          title: `${p.subject}: halfway there`,
          message: "Keep the momentum going.",
          priority: "info",
          createdAt: new Date().toISOString(),
        });
      }
    });

    // --- Hard-cards weak area reminder ---
    const hardCards = flashcards.filter((f) => f.difficulty === "hard");
    if (hardCards.length >= 5) {
      const hardSubjects = [...new Set(hardCards.map((f) => f.subject))];
      notifications.push({
        id: "weak-areas",
        type: "weak_areas",
        icon: "🔴",
        title: `${hardCards.length} hard flashcards need review`,
        message: `Focus on: ${hardSubjects.slice(0, 3).join(", ")}`,
        priority: "medium",
        createdAt: new Date().toISOString(),
      });
    }

    // Sort by priority: high > medium > low > info
    const priorityRank = { high: 0, medium: 1, low: 2, info: 3 };
    notifications.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

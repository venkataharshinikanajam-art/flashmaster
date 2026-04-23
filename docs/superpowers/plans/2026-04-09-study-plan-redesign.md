# Study Plan Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current "sticky note" study plan with an auto-generated day-by-day schedule that includes review days, connects to flashcards/materials, shows a today's checklist, and tracks progress.

**Architecture:** A new pure-function service (`planGenerator.js`) generates day-by-day schedules from topics + exam date. The existing StudyPlan model gets a `schedule` array and `topicDifficulties` map. Existing CRUD routes are enhanced (no new endpoints). The frontend Plans.jsx is rewritten with a Today card + expandable plan list.

**Tech Stack:** Express.js, Mongoose, React 18, Tailwind CSS (all already in the project)

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `server/src/services/planGenerator.js` | Pure function: (topics, examDate, hours, difficulties) → schedule array |
| Modify | `server/src/models/StudyPlan.js` | Add `schedule` array and `topicDifficulties` map to schema |
| Modify | `server/src/routes/plans.js` | Call generator on create, compute flashcard stats on GET |
| Rewrite | `client/src/pages/Plans.jsx` | Today card + create form + plan list with full schedule |

---

### Task 1: Plan Generator Service

**Files:**
- Create: `server/src/services/planGenerator.js`

This is the brain of the feature. A pure function with zero database calls — just math and arrays.

- [ ] **Step 1: Create the generator file with the main export**

```js
// server/src/services/planGenerator.js
// ===================================================================
// planGenerator — turns (topics, examDate, dailyHours, difficulties)
// into a day-by-day study schedule.
//
// Algorithm:
//   1. Count available days from today to the day before exam
//   2. Reserve last 2 days for full revision (all topics)
//   3. Remaining days follow a study-study-review cycle:
//      - Day A: study new topic(s)
//      - Day B: study new topic(s)
//      - Day C: review topics from days A & B
//   4. Hard topics get ~1.5x the time of easy topics
//   5. Topics are ordered hard-first within each day
// ===================================================================

/**
 * @param {Object} opts
 * @param {string[]} opts.topics - e.g. ["Arrays", "Trees", "Graphs"]
 * @param {Date|string} opts.examDate - the exam date
 * @param {number} opts.dailyStudyHours - hours per day (e.g. 3)
 * @param {Object} opts.topicDifficulties - e.g. { "Trees": "hard", "Arrays": "easy" }
 * @returns {{ schedule: Array<{ day: number, date: string, type: string, topics: string[], hours: number }> }}
 */
export function generateSchedule({ topics, examDate, dailyStudyHours, topicDifficulties = {} }) {
  const exam = new Date(examDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);

  const totalDays = Math.floor((exam - today) / (1000 * 60 * 60 * 24));

  // Edge case: exam is today or in the past
  if (totalDays <= 0) {
    return [
      {
        day: 1,
        date: formatDate(today),
        type: "revision",
        topics: [...topics],
        hours: dailyStudyHours,
      },
    ];
  }

  // Edge case: only 1-2 days — all revision
  if (totalDays <= 2) {
    return buildRevisionOnly(topics, today, totalDays, dailyStudyHours);
  }

  // Reserve last 2 days for revision (or 1 if only 3 days total)
  const revisionDays = totalDays >= 5 ? 2 : 1;
  const studyDays = totalDays - revisionDays;

  // Distribute topics across study days in study-study-review pattern
  const schedule = [];
  const topicQueue = sortByDifficulty([...topics], topicDifficulties);
  let dayNum = 1;
  let cycleBuffer = []; // topics covered in current cycle (for review day)

  let topicIndex = 0;
  const topicsPerStudyDay = Math.max(1, Math.ceil(topics.length / countStudyDaysInCycle(studyDays)));

  for (let d = 0; d < studyDays; d++) {
    const date = addDays(today, d);
    const posInCycle = d % 3; // 0=study, 1=study, 2=review

    if (posInCycle < 2) {
      // Study day: assign new topics
      const dayTopics = [];
      for (let t = 0; t < topicsPerStudyDay && topicIndex < topicQueue.length; t++) {
        dayTopics.push(topicQueue[topicIndex]);
        topicIndex++;
      }

      // If no new topics left, make it a review day instead
      if (dayTopics.length === 0) {
        schedule.push({
          day: dayNum,
          date: formatDate(date),
          type: "review",
          topics: [...cycleBuffer],
          hours: dailyStudyHours,
        });
      } else {
        cycleBuffer.push(...dayTopics);
        const hours = allocateHours(dayTopics, dailyStudyHours, topicDifficulties);
        schedule.push({
          day: dayNum,
          date: formatDate(date),
          type: "study",
          topics: dayTopics,
          hours: dailyStudyHours,
          topicHours: hours,
        });
      }
    } else {
      // Review day
      schedule.push({
        day: dayNum,
        date: formatDate(date),
        type: "review",
        topics: [...cycleBuffer],
        hours: dailyStudyHours,
      });
      cycleBuffer = []; // reset for next cycle
    }
    dayNum++;
  }

  // Add revision days at the end
  for (let r = 0; r < revisionDays; r++) {
    const date = addDays(today, studyDays + r);
    schedule.push({
      day: dayNum,
      date: formatDate(date),
      type: "revision",
      topics: [...topics], // all topics
      hours: dailyStudyHours,
    });
    dayNum++;
  }

  return schedule;
}

// --- Helper functions ---

function formatDate(d) {
  return d.toISOString().split("T")[0]; // "2026-04-09"
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function sortByDifficulty(topics, difficulties) {
  const order = { hard: 0, medium: 1, easy: 2 };
  return topics.sort((a, b) => {
    const da = order[difficulties[a] || "medium"] ?? 1;
    const db = order[difficulties[b] || "medium"] ?? 1;
    return da - db;
  });
}

function countStudyDaysInCycle(totalStudyDays) {
  // In a 3-day cycle (study, study, review), 2 out of 3 are study days
  return Math.ceil(totalStudyDays * (2 / 3));
}

function allocateHours(dayTopics, totalHours, difficulties) {
  // Hard topics get 1.5x weight, easy get 0.75x, medium 1x
  const weights = { hard: 1.5, medium: 1, easy: 0.75 };
  const topicWeights = dayTopics.map((t) => weights[difficulties[t] || "medium"] || 1);
  const totalWeight = topicWeights.reduce((sum, w) => sum + w, 0);

  const hours = {};
  dayTopics.forEach((t, i) => {
    hours[t] = Math.round((topicWeights[i] / totalWeight) * totalHours * 100) / 100;
  });
  return hours;
}

function buildRevisionOnly(topics, today, totalDays, dailyStudyHours) {
  const schedule = [];
  for (let d = 0; d < totalDays; d++) {
    schedule.push({
      day: d + 1,
      date: formatDate(addDays(today, d)),
      type: "revision",
      topics: [...topics],
      hours: dailyStudyHours,
    });
  }
  return schedule;
}
```

- [ ] **Step 2: Test it manually in Node**

Run:
```bash
cd server && node -e "
import { generateSchedule } from './src/services/planGenerator.js';
const s = generateSchedule({
  topics: ['Arrays','Linked Lists','Stacks','Queues','Trees','Graphs','Sorting','Hashing'],
  examDate: '2026-04-21',
  dailyStudyHours: 3,
  topicDifficulties: { Trees: 'hard', Graphs: 'hard', Arrays: 'easy' }
});
s.forEach(d => console.log('Day ' + d.day, d.date, d.type.padEnd(8), d.topics.join(', ')));
"
```

Expected: 12 days printed, mix of study/review/revision, hard topics (Trees, Graphs) appear earlier, last 2 days are revision with all 8 topics.

- [ ] **Step 3: Commit**

```bash
git add server/src/services/planGenerator.js
git commit -m "feat: add plan generator service with study-review-revision cycle"
```

---

### Task 2: Update StudyPlan Model

**Files:**
- Modify: `server/src/models/StudyPlan.js`

- [ ] **Step 1: Add schedule array and topicDifficulties to the schema**

Replace the entire file content with:

```js
// ===================================================================
// StudyPlan — a user's plan for preparing for a specific exam.
// ===================================================================

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
```

- [ ] **Step 2: Commit**

```bash
git add server/src/models/StudyPlan.js
git commit -m "feat: add schedule array and topicDifficulties to StudyPlan model"
```

---

### Task 3: Enhance Plans Routes

**Files:**
- Modify: `server/src/routes/plans.js`

- [ ] **Step 1: Replace the entire routes file**

The key changes:
- `POST /` now calls `generateSchedule()` and saves the schedule
- `GET /` and `GET /:id` now enrich response with flashcard stats
- `PATCH /:id` handles marking days as completed

```js
// ===================================================================
// StudyPlan CRUD — scoped to req.user.
// Mounted at /api/plans
// ===================================================================

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
```

- [ ] **Step 2: Start the server and test with Thunder Client or curl**

```bash
cd server && npm run dev
```

Test create:
```
POST http://localhost:5000/api/plans
Headers: Authorization: Bearer <your-token>
Body:
{
  "subject": "Data Structures",
  "examDate": "2026-04-21",
  "dailyStudyHours": 3,
  "topics": ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs", "Sorting", "Hashing"],
  "topicDifficulties": { "Trees": "hard", "Graphs": "hard", "Arrays": "easy" }
}
```

Expected: 201 response with a `schedule` array of ~12 days and a `stats` object.

- [ ] **Step 3: Commit**

```bash
git add server/src/routes/plans.js
git commit -m "feat: enhance plan routes with auto-generation and flashcard stats"
```

---

### Task 4: Rewrite Plans.jsx Frontend

**Files:**
- Rewrite: `client/src/pages/Plans.jsx`

This is the biggest task. The new page has 3 sections:
1. **Today's Study Card** (top, prominent — only if a plan has a today entry)
2. **Create Plan form** (improved with topic difficulty)
3. **Your Plans list** (expandable cards with full schedule)

- [ ] **Step 1: Replace Plans.jsx with the new implementation**

```jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useNavigate } from "react-router-dom";

const DIFF_COLORS = {
  easy: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
  medium: "bg-amber-900/50 text-amber-300 border-amber-800",
  hard: "bg-red-900/50 text-red-300 border-red-800",
};

const TYPE_LABELS = {
  study: { icon: "📖", label: "Study", color: "text-indigo-300" },
  review: { icon: "🔄", label: "Review", color: "text-amber-300" },
  revision: { icon: "📝", label: "Revision", color: "text-emerald-300" },
};

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    api.get("/api/plans").then(setPlans).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this plan?")) return;
    await api.del(`/api/plans/${id}`);
    load();
  };

  const handleCompleteDay = async (planId, dayNumber, completed) => {
    const body = completed
      ? { uncompleteDayNumber: dayNumber }
      : { completeDayNumber: dayNumber };
    await api.patch(`/api/plans/${planId}`, body);
    load();
  };

  // Find all plans that have a "today" entry
  const todayPlans = plans.filter((p) => p.today);

  const daysUntil = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Study Plans</h1>
          <p className="mt-1 text-slate-400">
            Smart schedules that tell you what to study each day.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-white font-medium hover:bg-indigo-400"
        >
          {showForm ? "Cancel" : "+ New Plan"}
        </button>
      </div>

      {/* --- Create form --- */}
      {showForm && <CreateForm onCreated={() => { setShowForm(false); load(); }} />}

      {/* --- Today's cards --- */}
      {todayPlans.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Today's Study</h2>
          <div className="space-y-4">
            {todayPlans.map((p) => (
              <TodayCard
                key={p._id}
                plan={p}
                onComplete={(dayNum, completed) => handleCompleteDay(p._id, dayNum, completed)}
                onStudyNow={() => navigate("/flashcards")}
                onViewNotes={() => navigate("/materials")}
              />
            ))}
          </div>
        </div>
      )}

      {/* --- All plans --- */}
      <h2 className="mt-10 text-lg font-semibold text-white">Your Plans</h2>
      {loading ? (
        <p className="mt-4 text-slate-400">Loading...</p>
      ) : plans.length === 0 ? (
        <p className="mt-4 text-slate-400">No plans yet. Create one to get started!</p>
      ) : (
        <div className="mt-4 space-y-4">
          {plans.map((p) => (
            <PlanCard
              key={p._id}
              plan={p}
              expanded={expandedPlan === p._id}
              onToggle={() => setExpandedPlan(expandedPlan === p._id ? null : p._id)}
              onDelete={() => handleDelete(p._id)}
              onComplete={(dayNum, completed) => handleCompleteDay(p._id, dayNum, completed)}
              daysUntil={daysUntil(p.examDate)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ===================== TODAY CARD =====================

function TodayCard({ plan, onComplete, onStudyNow, onViewNotes }) {
  const { today, stats, subject, schedule } = plan;
  if (!today) return null;

  const typeInfo = TYPE_LABELS[today.type];
  const daysLeft = schedule.length - schedule.findIndex((d) => d.date === today.date);

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950/30 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-400">
            TODAY — Day {today.day} of {schedule.length}
          </div>
          <div className="mt-1 text-xl font-bold text-white">{subject}</div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`text-sm font-medium ${typeInfo.color}`}>
              {typeInfo.icon} {typeInfo.label}
            </span>
            <span className="text-sm text-slate-500">· {today.hours}h planned</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{daysLeft}d</div>
          <div className="text-xs text-slate-400">remaining</div>
        </div>
      </div>

      {/* Topics for today */}
      <div className="mt-5 space-y-3">
        {today.topics.map((topic, i) => {
          const hours = today.topicHours?.[topic];
          return (
            <div
              key={topic}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg text-slate-500">{i + 1}.</span>
                <div>
                  <div className="text-white font-medium">{topic}</div>
                  <div className="text-xs text-slate-400">
                    {hours ? `${hours}h` : ""}{" "}
                    {stats.totalFlashcards > 0 && `· ${stats.totalFlashcards} flashcards`}
                    {stats.totalMaterials > 0 && ` · ${stats.totalMaterials} notes`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onViewNotes}
                  className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-slate-500"
                >
                  View Notes
                </button>
                <button
                  onClick={onStudyNow}
                  className="rounded bg-indigo-500 px-3 py-1 text-xs text-white hover:bg-indigo-400"
                >
                  Study Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Progress</span>
          <span className="text-white font-medium">{stats.progressPercent}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Mark day complete */}
      <button
        onClick={() => onComplete(today.day, today.completed)}
        className={`mt-4 w-full rounded-lg py-2 text-sm font-medium transition-all ${
          today.completed
            ? "bg-emerald-900/30 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/50"
            : "bg-indigo-500 text-white hover:bg-indigo-400"
        }`}
      >
        {today.completed ? "✓ Completed — click to undo" : "Mark today as done"}
      </button>
    </div>
  );
}

// ===================== PLAN CARD =====================

function PlanCard({ plan, expanded, onToggle, onDelete, onComplete, daysUntil }) {
  const { stats } = plan;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50">
      {/* Header — always visible */}
      <div
        className="flex items-start justify-between p-5 cursor-pointer"
        onClick={onToggle}
      >
        <div>
          <div className="text-lg font-semibold text-white">{plan.subject}</div>
          <div className="mt-1 text-sm text-slate-400">
            {plan.topics.length} topics · {plan.dailyStudyHours}h/day · {plan.schedule.length} days
          </div>
          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 w-32 rounded-full bg-slate-800">
              <div
                className="h-1.5 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${stats.progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-slate-400">{stats.progressPercent}%</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`text-sm font-medium ${
              daysUntil < 7 ? "text-red-300" : daysUntil < 30 ? "text-amber-300" : "text-emerald-300"
            }`}
          >
            {daysUntil > 0 ? `${daysUntil}d left` : "today or past"}
          </div>
          <span className="text-slate-500 text-sm">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded schedule */}
      {expanded && (
        <div className="border-t border-slate-800 px-5 pb-5">
          <div className="mt-4 space-y-2">
            {plan.schedule.map((day) => {
              const typeInfo = TYPE_LABELS[day.type];
              const isToday = day.date === new Date().toISOString().split("T")[0];
              const isPast = new Date(day.date) < new Date(new Date().toISOString().split("T")[0]);

              return (
                <div
                  key={day.day}
                  className={`flex items-center justify-between rounded-lg px-4 py-2.5 text-sm ${
                    isToday
                      ? "border border-indigo-500/40 bg-indigo-950/30"
                      : day.completed
                        ? "bg-slate-900/30 opacity-60"
                        : "bg-slate-900/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onComplete(day.day, day.completed);
                      }}
                      className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                        day.completed
                          ? "border-emerald-600 bg-emerald-900/50 text-emerald-300"
                          : "border-slate-600 hover:border-slate-400"
                      }`}
                    >
                      {day.completed && "✓"}
                    </button>
                    <span className="text-slate-500 w-16">Day {day.day}</span>
                    <span className="text-slate-400 w-20">{day.date.slice(5)}</span>
                    <span className={`font-medium ${typeInfo.color}`}>
                      {typeInfo.icon} {typeInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {day.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-slate-800 text-slate-300 text-xs px-2 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats footer */}
          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <div>
              {stats.totalFlashcards} flashcards · {stats.totalMaterials} materials
            </div>
            <button
              onClick={() => onDelete()}
              className="text-red-400 hover:text-red-300"
            >
              Delete plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== CREATE FORM =====================

function CreateForm({ onCreated }) {
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyStudyHours, setDailyStudyHours] = useState(2);
  const [topicsText, setTopicsText] = useState("");
  const [difficulties, setDifficulties] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const topicsList = topicsText
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const toggleDifficulty = (topic, diff) => {
    setDifficulties((prev) => ({
      ...prev,
      [topic]: prev[topic] === diff ? "medium" : diff,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/plans", {
        subject,
        examDate,
        dailyStudyHours: Number(dailyStudyHours),
        topics: topicsList,
        topicDifficulties: difficulties,
      });
      onCreated();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-5"
    >
      <div className="grid md:grid-cols-3 gap-4">
        <label className="block">
          <div className="text-sm text-slate-300">Subject</div>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="e.g. Data Structures"
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <div className="text-sm text-slate-300">Exam date</div>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <label className="block">
          <div className="text-sm text-slate-300">Hours/day</div>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="16"
            value={dailyStudyHours}
            onChange={(e) => setDailyStudyHours(e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </label>
      </div>

      <label className="block">
        <div className="text-sm text-slate-300">Topics (comma-separated)</div>
        <input
          type="text"
          value={topicsText}
          onChange={(e) => setTopicsText(e.target.value)}
          required
          placeholder="e.g. Arrays, Linked Lists, Trees, Graphs"
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
        />
      </label>

      {/* Topic difficulty selector */}
      {topicsList.length > 0 && (
        <div>
          <div className="text-sm text-slate-300 mb-2">
            Set difficulty per topic (optional — defaults to medium)
          </div>
          <div className="flex flex-wrap gap-2">
            {topicsList.map((topic) => (
              <div
                key={topic}
                className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5"
              >
                <span className="text-sm text-white mr-2">{topic}</span>
                {["easy", "medium", "hard"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDifficulty(topic, d)}
                    className={`rounded px-2 py-0.5 text-xs border ${
                      (difficulties[topic] || "medium") === d
                        ? DIFF_COLORS[d]
                        : "border-slate-700 text-slate-500"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-indigo-500 px-5 py-2 text-white font-medium hover:bg-indigo-400 disabled:opacity-50"
      >
        {submitting ? "Generating..." : "Generate Study Plan"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Start both servers and test in the browser**

```bash
cd C:/Users/harsh/OneDrive/Desktop/SRM/Full-stack/FLASHCARDS && npm run dev
```

Test:
1. Go to http://localhost:5173/plans
2. Click "+ New Plan"
3. Fill in: subject "Data Structures", exam date 12 days out, 3h/day, topics "Arrays, Linked Lists, Trees, Graphs"
4. Set Trees and Graphs to "hard"
5. Click "Generate Study Plan"
6. Verify: Today card appears with today's topics, plan card appears below with expandable schedule
7. Click a day's checkbox to mark complete
8. Verify progress bar updates

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/Plans.jsx
git commit -m "feat: rewrite Plans page with auto-generated schedule and today's card"
```

---

### Task 5: Final Integration Test & Cleanup

- [ ] **Step 1: Test the full flow end-to-end**

1. Sign up / log in
2. Upload a material with subject "Data Structures"
3. Verify flashcards were generated
4. Create a study plan for "Data Structures"
5. Verify today card shows flashcard count and material count
6. Click "Study Now" — should navigate to /flashcards
7. Click "View Notes" — should navigate to /materials
8. Mark today as done — progress should update
9. Expand the plan — full schedule visible with checkboxes
10. Delete the plan — should disappear

- [ ] **Step 2: Delete any old test plans from MongoDB (if needed)**

If old plans without schedules cause issues, clear them:
```bash
cd server && node -e "
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
await mongoose.connect(process.env.MONGODB_URI);
const result = await mongoose.connection.collection('studyplans').deleteMany({ schedule: { \$exists: false } });
console.log('Deleted', result.deletedCount, 'old plans');
await mongoose.disconnect();
"
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete study plan redesign with smart scheduling"
```

---

## Verification Checklist

- [ ] Server starts without errors
- [ ] Creating a plan generates a schedule with correct study/review/revision days
- [ ] Today card shows today's topics, hours, flashcard count, material count
- [ ] Checking off a day updates progress bar
- [ ] Expanding a plan shows the full day-by-day schedule
- [ ] Hard topics appear earlier in the schedule and get more hours
- [ ] Edge cases: exam tomorrow (all revision), exam today (single revision day)
- [ ] Delete plan works
- [ ] Old plans without schedules don't crash the page

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

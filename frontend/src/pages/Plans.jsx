import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useNavigate } from "react-router-dom";

// Tailwind classes for each difficulty.
const DIFF_COLORS = {
  easy: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
  medium: "bg-amber-900/50 text-amber-300 border-amber-800",
  hard: "bg-red-900/50 text-red-300 border-red-800",
};

// Labels + colors for each study day type.
const TYPE_LABELS = {
  study: { label: "Study", color: "text-indigo-300" },
  review: { label: "Review", color: "text-amber-300" },
  revision: { label: "Revision", color: "text-emerald-300" },
};

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const navigate = useNavigate();

  function load() {
    setLoading(true);
    api.get("/api/plans")
      .then(function (data) {
        setPlans(data);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(load, []);

  async function handleDelete(id) {
    if (!confirm("Delete this plan?")) return;
    await api.del("/api/plans/" + id);
    load();
  }

  async function handleCompleteDay(planId, dayNumber, currentlyCompleted) {
    let body;
    if (currentlyCompleted) {
      body = { uncompleteDayNumber: dayNumber };
    } else {
      body = { completeDayNumber: dayNumber };
    }
    await api.patch("/api/plans/" + planId, body);
    load();
  }

  // Find plans that have a "today" entry.
  const todayPlans = [];
  for (let i = 0; i < plans.length; i++) {
    if (plans[i].today) todayPlans.push(plans[i]);
  }

  function daysUntil(date) {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function toggleExpand(planId) {
    if (expandedPlanId === planId) {
      setExpandedPlanId(null);
    } else {
      setExpandedPlanId(planId);
    }
  }

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
          onClick={function () { setShowForm(!showForm); }}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-white font-medium hover:bg-indigo-400"
        >
          {showForm ? "Cancel" : "+ New Plan"}
        </button>
      </div>

      {showForm && (
        <CreateForm
          onCreated={function () {
            setShowForm(false);
            load();
          }}
        />
      )}

      {todayPlans.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Today's Study</h2>
          <div className="space-y-4">
            {todayPlans.map(function (p) {
              return (
                <TodayCard
                  key={p._id}
                  plan={p}
                  onComplete={function (dayNum, completed) { handleCompleteDay(p._id, dayNum, completed); }}
                  onStudyNow={function () { navigate("/flashcards"); }}
                  onViewNotes={function () { navigate("/materials"); }}
                />
              );
            })}
          </div>
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold text-white">Your Plans</h2>

      {loading && <p className="mt-4 text-slate-400">Loading...</p>}

      {!loading && plans.length === 0 && (
        <p className="mt-4 text-slate-400">No plans yet. Create one to get started!</p>
      )}

      {!loading && plans.length > 0 && (
        <div className="mt-4 space-y-4">
          {plans.map(function (p) {
            return (
              <PlanCard
                key={p._id}
                plan={p}
                expanded={expandedPlanId === p._id}
                onToggle={function () { toggleExpand(p._id); }}
                onDelete={function () { handleDelete(p._id); }}
                onComplete={function (dayNum, completed) { handleCompleteDay(p._id, dayNum, completed); }}
                daysUntil={daysUntil(p.examDate)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function TodayCard(props) {
  const plan = props.plan;
  const today = plan.today;
  if (!today) return null;

  const typeInfo = TYPE_LABELS[today.type];
  // How many days remain in the plan from today.
  let daysLeft = 0;
  for (let i = 0; i < plan.schedule.length; i++) {
    if (plan.schedule[i].date === today.date) {
      daysLeft = plan.schedule.length - i;
      break;
    }
  }

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950/30 p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-400">
            TODAY - Day {today.day} of {plan.schedule.length}
          </div>
          <div className="mt-1 text-xl font-bold text-white">{plan.subject}</div>
          <div className="mt-1 flex items-center gap-2">
            <span className={"text-sm font-medium " + typeInfo.color}>
              {typeInfo.label}
            </span>
            <span className="text-sm text-slate-500">- {today.hours}h planned</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{daysLeft}d</div>
          <div className="text-xs text-slate-400">remaining</div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {today.topics.map(function (topic, i) {
          let hoursLabel = "";
          if (today.topicHours && today.topicHours[topic]) {
            hoursLabel = today.topicHours[topic] + "h";
          }
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
                    {hoursLabel}
                    {plan.stats.totalFlashcards > 0 && " - " + plan.stats.totalFlashcards + " flashcards"}
                    {plan.stats.totalMaterials > 0 && " - " + plan.stats.totalMaterials + " notes"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={props.onViewNotes}
                  className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-slate-500"
                >
                  View Notes
                </button>
                <button
                  onClick={props.onStudyNow}
                  className="rounded bg-indigo-500 px-3 py-1 text-xs text-white hover:bg-indigo-400"
                >
                  Study Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Progress</span>
          <span className="text-white font-medium">{plan.stats.progressPercent}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all"
            style={{ width: plan.stats.progressPercent + "%" }}
          />
        </div>
      </div>

      <button
        onClick={function () { props.onComplete(today.day, today.completed); }}
        className={
          today.completed
            ? "mt-4 w-full rounded-lg py-2 text-sm font-medium bg-emerald-900/30 text-emerald-300 border border-emerald-800 hover:bg-emerald-900/50"
            : "mt-4 w-full rounded-lg py-2 text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-400"
        }
      >
        {today.completed ? "Completed - click to undo" : "Mark today as done"}
      </button>
    </div>
  );
}

function PlanCard(props) {
  const plan = props.plan;
  const stats = plan.stats;
  const daysUntil = props.daysUntil;

  let daysLabel;
  if (daysUntil > 0) daysLabel = daysUntil + "d left";
  else daysLabel = "today or past";

  let daysClass;
  if (daysUntil < 7) daysClass = "text-sm font-medium text-red-300";
  else if (daysUntil < 30) daysClass = "text-sm font-medium text-amber-300";
  else daysClass = "text-sm font-medium text-emerald-300";

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50">
      <div
        className="flex items-start justify-between p-5 cursor-pointer"
        onClick={props.onToggle}
      >
        <div>
          <div className="text-lg font-semibold text-white">{plan.subject}</div>
          <div className="mt-1 text-sm text-slate-400">
            {plan.topics.length} topics - {plan.dailyStudyHours}h/day - {plan.schedule.length} days
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 w-32 rounded-full bg-slate-800">
              <div
                className="h-1.5 rounded-full bg-indigo-500 transition-all"
                style={{ width: stats.progressPercent + "%" }}
              />
            </div>
            <span className="text-xs text-slate-400">{stats.progressPercent}%</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={daysClass}>{daysLabel}</div>
          <span className="text-slate-500 text-sm">{props.expanded ? "Hide" : "Show"}</span>
        </div>
      </div>

      {props.expanded && (
        <div className="border-t border-slate-800 px-5 pb-5">
          <div className="mt-4 space-y-2">
            {plan.schedule.map(function (day) {
              const typeInfo = TYPE_LABELS[day.type];
              const isToday = day.date === todayStr;

              let rowClass = "flex items-center justify-between rounded-lg px-4 py-2.5 text-sm ";
              if (isToday) rowClass += "border border-indigo-500/40 bg-indigo-950/30";
              else if (day.completed) rowClass += "bg-slate-900/30 opacity-60";
              else rowClass += "bg-slate-900/40";

              return (
                <div key={day.day} className={rowClass}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={function (e) {
                        e.stopPropagation();
                        props.onComplete(day.day, day.completed);
                      }}
                      className={
                        day.completed
                          ? "w-5 h-5 rounded border flex items-center justify-center text-xs border-emerald-600 bg-emerald-900/50 text-emerald-300"
                          : "w-5 h-5 rounded border flex items-center justify-center text-xs border-slate-600 hover:border-slate-400"
                      }
                    >
                      {day.completed ? "x" : ""}
                    </button>
                    <span className="text-slate-500 w-16">Day {day.day}</span>
                    <span className="text-slate-400 w-20">{day.date.slice(5)}</span>
                    <span className={"font-medium " + typeInfo.color}>
                      {typeInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {day.topics.map(function (t) {
                      return (
                        <span
                          key={t}
                          className="rounded-full bg-slate-800 text-slate-300 text-xs px-2 py-0.5"
                        >
                          {t}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
            <div>
              {stats.totalFlashcards} flashcards - {stats.totalMaterials} materials
            </div>
            <button
              onClick={props.onDelete}
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

function CreateForm(props) {
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyStudyHours, setDailyStudyHours] = useState(2);
  const [topicsText, setTopicsText] = useState("");
  const [difficulties, setDifficulties] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Build the array of topics by splitting the comma-separated text.
  const topicsList = [];
  const parts = topicsText.split(",");
  for (let i = 0; i < parts.length; i++) {
    const t = parts[i].trim();
    if (t.length > 0) topicsList.push(t);
  }

  function setTopicDifficulty(topic, level) {
    const next = {};
    // Copy current difficulties into `next`.
    const keys = Object.keys(difficulties);
    for (let i = 0; i < keys.length; i++) {
      next[keys[i]] = difficulties[keys[i]];
    }
    next[topic] = level;
    setDifficulties(next);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/plans", {
        subject: subject,
        examDate: examDate,
        dailyStudyHours: Number(dailyStudyHours),
        topics: topicsList,
        topicDifficulties: difficulties,
      });
      props.onCreated();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

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
            onChange={function (e) { setSubject(e.target.value); }}
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
            onChange={function (e) { setExamDate(e.target.value); }}
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
            onChange={function (e) { setDailyStudyHours(e.target.value); }}
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
          onChange={function (e) { setTopicsText(e.target.value); }}
          required
          placeholder="e.g. Arrays, Linked Lists, Trees, Graphs"
          className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
        />
      </label>

      {topicsList.length > 0 && (
        <div>
          <div className="text-sm text-slate-300 mb-2">
            Set difficulty per topic (defaults to medium)
          </div>
          <div className="flex flex-wrap gap-2">
            {topicsList.map(function (topic) {
              const selected = difficulties[topic] || "medium";
              return (
                <div
                  key={topic}
                  className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5"
                >
                  <span className="text-sm text-white mr-2">{topic}</span>
                  {["easy", "medium", "hard"].map(function (d) {
                    const active = selected === d;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={function () { setTopicDifficulty(topic, d); }}
                        className={
                          active
                            ? "rounded px-2 py-0.5 text-xs border " + DIFF_COLORS[d]
                            : "rounded px-2 py-0.5 text-xs border border-slate-700 text-slate-500"
                        }
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
              );
            })}
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

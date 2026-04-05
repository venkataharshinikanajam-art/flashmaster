import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    subject: "",
    examDate: "",
    dailyStudyHours: 2,
    topics: "",
  });

  const load = () => {
    setLoading(true);
    api.get("/api/plans").then(setPlans).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post("/api/plans", {
      subject: form.subject,
      examDate: form.examDate,
      dailyStudyHours: Number(form.dailyStudyHours),
      topics: form.topics.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setForm({ subject: "", examDate: "", dailyStudyHours: 2, topics: "" });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this plan?")) return;
    await api.del(`/api/plans/${id}`);
    load();
  };

  const daysUntil = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white">Study Plans</h1>
      <p className="mt-2 text-slate-400">Plan your exam prep week by week.</p>

      <form
        onSubmit={handleCreate}
        className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} />
          <Field label="Exam date" type="date" value={form.examDate} onChange={(v) => setForm({ ...form, examDate: v })} />
          <Field
            label="Hours/day"
            type="number"
            step="0.5"
            value={form.dailyStudyHours}
            onChange={(v) => setForm({ ...form, dailyStudyHours: v })}
          />
        </div>
        <Field
          label="Topics (comma-separated)"
          value={form.topics}
          onChange={(v) => setForm({ ...form, topics: v })}
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-500 px-4 py-2 text-white font-medium hover:bg-indigo-400"
        >
          Create plan
        </button>
      </form>

      <h2 className="mt-10 text-xl font-semibold text-white">Your plans</h2>
      {loading ? (
        <p className="mt-4 text-slate-400">Loading…</p>
      ) : plans.length === 0 ? (
        <p className="mt-4 text-slate-400">No plans yet.</p>
      ) : (
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {plans.map((p) => {
            const days = daysUntil(p.examDate);
            return (
              <div
                key={p._id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold text-white">{p.subject}</div>
                    <div className="text-sm text-slate-400">
                      {p.dailyStudyHours}h/day · {p.topics.length} topics
                    </div>
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      days < 7 ? "text-red-300" : days < 30 ? "text-amber-300" : "text-emerald-300"
                    }`}
                  >
                    {days > 0 ? `${days}d left` : "today or past"}
                  </div>
                </div>
                {p.topics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.topics.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => handleDelete(p._id)}
                  className="mt-4 text-xs text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({ label, type = "text", value, onChange, step }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-300">{label}</div>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
      />
    </label>
  );
}

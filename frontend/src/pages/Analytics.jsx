import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

export default function Analytics() {
  const [data, setData] = useState({ plans: [], flashcards: [], materials: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/plans"),
      api.get("/api/flashcards"),
      api.get("/api/materials"),
    ])
      .then(([plans, flashcards, materials]) =>
        setData({ plans, flashcards, materials })
      )
      .finally(() => setLoading(false));
  }, []);

  const { plans, flashcards, materials } = data;

  // --- Study time analytics ---
  const totalHoursPlanned = plans.reduce(
    (sum, p) => sum + (p.schedule?.length || 0) * (p.dailyStudyHours || 0),
    0
  );
  const totalHoursCompleted = plans.reduce(
    (sum, p) =>
      sum + (p.schedule?.filter((d) => d.completed).length || 0) * (p.dailyStudyHours || 0),
    0
  );

  // --- Flashcards by subject ---
  const cardsBySubject = {};
  flashcards.forEach((f) => {
    if (!cardsBySubject[f.subject]) {
      cardsBySubject[f.subject] = { easy: 0, medium: 0, hard: 0, total: 0 };
    }
    cardsBySubject[f.subject][f.difficulty] += 1;
    cardsBySubject[f.subject].total += 1;
  });
  const subjectBars = Object.entries(cardsBySubject)
    .map(([name, counts]) => ({ name, ...counts }))
    .sort((a, b) => b.total - a.total);

  // --- Top weak areas (subjects with most hard flashcards) ---
  const weakAreas = subjectBars
    .filter((s) => s.hard > 0)
    .sort((a, b) => b.hard - a.hard)
    .slice(0, 5);

  // --- Upcoming exams (sorted by urgency) ---
  const upcomingExams = plans
    .filter((p) => new Date(p.examDate) >= new Date())
    .map((p) => ({
      ...p,
      daysUntil: Math.ceil((new Date(p.examDate) - new Date()) / (1000 * 60 * 60 * 24)),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  // --- Most studied subject ---
  const subjectStudyDays = {};
  plans.forEach((p) => {
    subjectStudyDays[p.subject] =
      (subjectStudyDays[p.subject] || 0) + (p.schedule?.filter((d) => d.completed).length || 0);
  });
  const mostStudied = Object.entries(subjectStudyDays).sort((a, b) => b[1] - a[1])[0];

  // --- Total days completed (any plan) ---
  const totalDaysCompleted = plans.reduce(
    (sum, p) => sum + (p.schedule?.filter((d) => d.completed).length || 0),
    0
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-white">Performance Analytics</h1>
        <p className="mt-8 text-slate-400">Loading...</p>
      </div>
    );
  }

  const hasData = plans.length > 0 || flashcards.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white">Performance Analytics</h1>
      <p className="mt-2 text-slate-400">
        Insights into your study habits, weak areas, and upcoming exams.
      </p>

      {!hasData ? (
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
          <p className="text-slate-300">Not enough data to show analytics yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Create a plan and upload some materials to get started.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              to="/plans"
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-400"
            >
              Create a plan
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ========= Key Metrics Grid ========= */}
          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Hours completed"
              value={`${totalHoursCompleted}h`}
              sub={`of ${totalHoursPlanned}h planned`}
              color="indigo"
            />
            <MetricCard
              label="Days studied"
              value={totalDaysCompleted}
              sub="total across all plans"
              color="emerald"
            />
            <MetricCard
              label="Flashcards"
              value={flashcards.length}
              sub={`${materials.length} materials`}
              color="amber"
            />
            <MetricCard
              label="Most studied"
              value={mostStudied ? mostStudied[0] : "-"}
              sub={mostStudied ? `${mostStudied[1]} days` : "no progress yet"}
              color="rose"
            />
          </div>

          {/* ========= Upcoming Exams ========= */}
          {upcomingExams.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-white">Upcoming Exams</h2>
              <div className="mt-4 space-y-2">
                {upcomingExams.map((p) => {
                  const urgency =
                    p.daysUntil < 7
                      ? "red"
                      : p.daysUntil < 30
                        ? "amber"
                        : "emerald";
                  const urgencyStyles = {
                    red: "border-red-900 bg-red-950/30 text-red-300",
                    amber: "border-amber-900 bg-amber-950/30 text-amber-300",
                    emerald: "border-emerald-900 bg-emerald-950/30 text-emerald-300",
                  };
                  return (
                    <div
                      key={p._id}
                      className={`flex items-center justify-between rounded-lg border p-4 ${urgencyStyles[urgency]}`}
                    >
                      <div>
                        <div className="font-semibold text-white">{p.subject}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(p.examDate).toLocaleDateString()} - {p.topics?.length || 0} topics
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{p.daysUntil}</div>
                        <div className="text-xs opacity-80">days left</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ========= Flashcards by Subject ========= */}
          {subjectBars.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-white">Flashcards by Subject</h2>
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                {subjectBars.map((s) => {
                  const maxTotal = subjectBars[0].total;
                  const widthPercent = (s.total / maxTotal) * 100;
                  return (
                    <div key={s.name} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-white font-medium">{s.name}</span>
                        <span className="text-slate-400">{s.total} cards</span>
                      </div>
                      <div className="h-6 w-full rounded bg-slate-800 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${(s.easy / s.total) * widthPercent}%` }}
                          title={`${s.easy} easy`}
                        />
                        <div
                          className="bg-amber-500 h-full"
                          style={{ width: `${(s.medium / s.total) * widthPercent}%` }}
                          title={`${s.medium} medium`}
                        />
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${(s.hard / s.total) * widthPercent}%` }}
                          title={`${s.hard} hard`}
                        />
                      </div>
                      <div className="mt-1 flex gap-3 text-xs">
                        <span className="text-emerald-400">{s.easy} easy</span>
                        <span className="text-amber-400">{s.medium} medium</span>
                        <span className="text-red-400">{s.hard} hard</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ========= Top Weak Areas ========= */}
          {weakAreas.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-white">Top Weak Areas</h2>
              <p className="mt-1 text-sm text-slate-400">
                Subjects with the most hard-rated flashcards. These need more revision.
              </p>
              <div className="mt-4 space-y-2">
                {weakAreas.map((s, i) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-slate-600">#{i + 1}</div>
                      <div>
                        <div className="text-white font-medium">{s.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {s.hard} hard cards out of {s.total}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/flashcards"
                      className="rounded-lg bg-red-900/30 text-red-300 border border-red-800 px-3 py-1 text-xs hover:bg-red-900/50"
                    >
                      Revise
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub, color }) {
  const colorMap = {
    indigo: "border-indigo-500/30 from-indigo-950/20",
    emerald: "border-emerald-500/30 from-emerald-950/20",
    amber: "border-amber-500/30 from-amber-950/20",
    rose: "border-rose-500/30 from-rose-950/20",
  };
  return (
    <div
      className={`rounded-xl border ${colorMap[color]} bg-gradient-to-br to-slate-900 p-5`}
    >
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white truncate">{value}</div>
      <div className="mt-0.5 text-xs text-slate-500 truncate">{sub}</div>
    </div>
  );
}

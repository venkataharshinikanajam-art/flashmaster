import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

export default function Analytics() {
  const [plans, setPlans] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    async function loadAll() {
      try {
        const p = await api.get("/api/plans");
        setPlans(p);
        const f = await api.get("/api/flashcards");
        setFlashcards(f);
        const m = await api.get("/api/materials");
        setMaterials(m);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  // --- Study time totals ---
  let totalHoursPlanned = 0;
  let totalHoursCompleted = 0;
  for (let i = 0; i < plans.length; i++) {
    const p = plans[i];
    const scheduleLen = p.schedule ? p.schedule.length : 0;
    const hours = p.dailyStudyHours || 0;
    totalHoursPlanned += scheduleLen * hours;

    let completedLen = 0;
    if (p.schedule) {
      for (let j = 0; j < p.schedule.length; j++) {
        if (p.schedule[j].completed) completedLen++;
      }
    }
    totalHoursCompleted += completedLen * hours;
  }

  // --- Group flashcards by subject ---
  const cardsBySubject = {};
  for (let i = 0; i < flashcards.length; i++) {
    const f = flashcards[i];
    if (!cardsBySubject[f.subject]) {
      cardsBySubject[f.subject] = {
        name: f.subject,
        easy: 0,
        medium: 0,
        hard: 0,
        total: 0,
      };
    }
    cardsBySubject[f.subject][f.difficulty]++;
    cardsBySubject[f.subject].total++;
  }

  // Convert to a sorted array (most cards first).
  const subjectBars = [];
  const keys = Object.keys(cardsBySubject);
  for (let i = 0; i < keys.length; i++) {
    subjectBars.push(cardsBySubject[keys[i]]);
  }
  subjectBars.sort(function (a, b) { return b.total - a.total; });

  // --- Top weak areas: subjects with most hard cards ---
  const weakAreas = [];
  for (let i = 0; i < subjectBars.length; i++) {
    if (subjectBars[i].hard > 0) weakAreas.push(subjectBars[i]);
  }
  weakAreas.sort(function (a, b) { return b.hard - a.hard; });
  const topWeakAreas = weakAreas.slice(0, 5);

  // --- Upcoming exams, sorted by how soon they are ---
  const upcomingExams = [];
  const today = new Date();
  for (let i = 0; i < plans.length; i++) {
    const p = plans[i];
    if (new Date(p.examDate) < today) continue;
    const daysUntil = Math.ceil((new Date(p.examDate) - today) / (1000 * 60 * 60 * 24));
    upcomingExams.push({
      _id: p._id,
      subject: p.subject,
      examDate: p.examDate,
      topics: p.topics,
      daysUntil: daysUntil,
    });
  }
  upcomingExams.sort(function (a, b) { return a.daysUntil - b.daysUntil; });

  // --- Most studied subject by number of completed days ---
  const subjectDaysMap = {};
  for (let i = 0; i < plans.length; i++) {
    const p = plans[i];
    if (!subjectDaysMap[p.subject]) subjectDaysMap[p.subject] = 0;
    if (p.schedule) {
      for (let j = 0; j < p.schedule.length; j++) {
        if (p.schedule[j].completed) subjectDaysMap[p.subject]++;
      }
    }
  }
  let mostStudiedName = null;
  let mostStudiedDays = 0;
  const subjKeys = Object.keys(subjectDaysMap);
  for (let i = 0; i < subjKeys.length; i++) {
    if (subjectDaysMap[subjKeys[i]] > mostStudiedDays) {
      mostStudiedName = subjKeys[i];
      mostStudiedDays = subjectDaysMap[subjKeys[i]];
    }
  }

  // --- Total days completed across all plans ---
  let totalDaysCompleted = 0;
  for (let i = 0; i < plans.length; i++) {
    if (plans[i].schedule) {
      for (let j = 0; j < plans[i].schedule.length; j++) {
        if (plans[i].schedule[j].completed) totalDaysCompleted++;
      }
    }
  }

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

      {!hasData && (
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
      )}

      {hasData && (
        <>
          <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Hours completed"
              value={totalHoursCompleted + "h"}
              sub={"of " + totalHoursPlanned + "h planned"}
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
              sub={materials.length + " materials"}
              color="amber"
            />
            <MetricCard
              label="Most studied"
              value={mostStudiedName || "-"}
              sub={mostStudiedName ? mostStudiedDays + " days" : "no progress yet"}
              color="rose"
            />
          </div>

          {upcomingExams.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-white">Upcoming Exams</h2>
              <div className="mt-4 space-y-2">
                {upcomingExams.map(function (p) {
                  let urgencyClass;
                  if (p.daysUntil < 7) urgencyClass = "border-red-900 bg-red-950/30 text-red-300";
                  else if (p.daysUntil < 30) urgencyClass = "border-amber-900 bg-amber-950/30 text-amber-300";
                  else urgencyClass = "border-emerald-900 bg-emerald-950/30 text-emerald-300";

                  const topicCount = p.topics ? p.topics.length : 0;

                  return (
                    <div
                      key={p._id}
                      className={"flex items-center justify-between rounded-lg border p-4 " + urgencyClass}
                    >
                      <div>
                        <div className="font-semibold text-white">{p.subject}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(p.examDate).toLocaleDateString()} - {topicCount} topics
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

          {subjectBars.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-white">Flashcards by Subject</h2>
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/50 p-6">
                {subjectBars.map(function (s) {
                  const maxTotal = subjectBars[0].total;
                  const widthPercent = (s.total / maxTotal) * 100;
                  const easyWidth = (s.easy / s.total) * widthPercent;
                  const mediumWidth = (s.medium / s.total) * widthPercent;
                  const hardWidth = (s.hard / s.total) * widthPercent;

                  return (
                    <div key={s.name} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-white font-medium">{s.name}</span>
                        <span className="text-slate-400">{s.total} cards</span>
                      </div>
                      <div className="h-6 w-full rounded bg-slate-800 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: easyWidth + "%" }}
                          title={s.easy + " easy"}
                        />
                        <div
                          className="bg-amber-500 h-full"
                          style={{ width: mediumWidth + "%" }}
                          title={s.medium + " medium"}
                        />
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: hardWidth + "%" }}
                          title={s.hard + " hard"}
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

          {topWeakAreas.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-white">Top Weak Areas</h2>
              <p className="mt-1 text-sm text-slate-400">
                Subjects with the most hard-rated flashcards. These need more revision.
              </p>
              <div className="mt-4 space-y-2">
                {topWeakAreas.map(function (s, i) {
                  return (
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
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard(props) {
  const colorMap = {
    indigo: "border-indigo-500/30 from-indigo-950/20",
    emerald: "border-emerald-500/30 from-emerald-950/20",
    amber: "border-amber-500/30 from-amber-950/20",
    rose: "border-rose-500/30 from-rose-950/20",
  };
  const cls = "rounded-xl border bg-gradient-to-br to-slate-900 p-5 " + colorMap[props.color];
  return (
    <div className={cls}>
      <div className="text-sm text-slate-400">{props.label}</div>
      <div className="mt-1 text-2xl font-bold text-white truncate">{props.value}</div>
      <div className="mt-0.5 text-xs text-slate-500 truncate">{props.sub}</div>
    </div>
  );
}

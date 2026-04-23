import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

export default function Progress() {
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

  // Group everything by subject
  const subjects = {};
  data.plans.forEach((p) => {
    if (!subjects[p.subject]) subjects[p.subject] = emptySubject(p.subject);
    subjects[p.subject].plans.push(p);
    subjects[p.subject].totalDays += p.schedule?.length || 0;
    subjects[p.subject].daysCompleted += p.schedule?.filter((d) => d.completed).length || 0;
    subjects[p.subject].totalTopics += p.topics?.length || 0;
  });
  data.flashcards.forEach((f) => {
    if (!subjects[f.subject]) subjects[f.subject] = emptySubject(f.subject);
    subjects[f.subject].flashcardsTotal += 1;
    if (f.difficulty === "hard") subjects[f.subject].hardCards += 1;
    if (f.difficulty === "easy") subjects[f.subject].easyCards += 1;
    if (f.difficulty === "medium") subjects[f.subject].mediumCards += 1;
    if (f.lastReviewedAt) subjects[f.subject].flashcardsReviewed += 1;
  });
  data.materials.forEach((m) => {
    if (!subjects[m.subject]) subjects[m.subject] = emptySubject(m.subject);
    subjects[m.subject].materialsCount += 1;
  });

  const subjectList = Object.values(subjects);

  // Overall totals
  const totals = {
    subjectsCount: subjectList.length,
    totalDays: subjectList.reduce((s, x) => s + x.totalDays, 0),
    daysCompleted: subjectList.reduce((s, x) => s + x.daysCompleted, 0),
    flashcardsTotal: data.flashcards.length,
    flashcardsReviewed: subjectList.reduce((s, x) => s + x.flashcardsReviewed, 0),
    materialsCount: data.materials.length,
  };
  const overallPercent = totals.totalDays > 0
    ? Math.round((totals.daysCompleted / totals.totalDays) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white">Progress Tracking</h1>
      <p className="mt-2 text-slate-400">
        See how far along you are in each subject and which areas need more work.
      </p>

      {loading ? (
        <p className="mt-8 text-slate-400">Loading...</p>
      ) : subjectList.length === 0 ? (
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
          <p className="text-slate-300">No progress yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Create a study plan or upload materials to start tracking.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              to="/plans"
              className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white hover:bg-indigo-400"
            >
              Create a plan
            </Link>
            <Link
              to="/materials"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
            >
              Upload material
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Overall summary */}
          <div className="mt-8 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Overall completion</div>
                <div className="mt-1 text-4xl font-bold text-white">{overallPercent}%</div>
                <div className="mt-1 text-sm text-slate-400">
                  {totals.daysCompleted} of {totals.totalDays} study days completed
                </div>
              </div>
              <div className="text-right text-sm text-slate-400">
                <div>{totals.subjectsCount} subjects</div>
                <div>{totals.flashcardsTotal} flashcards</div>
                <div>{totals.materialsCount} materials</div>
              </div>
            </div>
            <div className="mt-4 h-3 w-full rounded-full bg-slate-800">
              <div
                className="h-3 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
          </div>

          {/* Per-subject breakdown */}
          <h2 className="mt-10 text-lg font-semibold text-white">By Subject</h2>
          <div className="mt-4 space-y-4">
            {subjectList.map((s) => (
              <SubjectCard key={s.name} subject={s} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SubjectCard({ subject }) {
  const percent = subject.totalDays > 0
    ? Math.round((subject.daysCompleted / subject.totalDays) * 100)
    : 0;

  const hardPercent = subject.flashcardsTotal > 0
    ? Math.round((subject.hardCards / subject.flashcardsTotal) * 100)
    : 0;

  // Weak area signal: if >30% of cards are hard, flag it
  const isWeak = hardPercent > 30;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold text-white">{subject.name}</div>
          <div className="mt-1 text-sm text-slate-400">
            {subject.plans.length} plan{subject.plans.length !== 1 && "s"} ·{" "}
            {subject.totalTopics} topics · {subject.materialsCount} materials
          </div>
        </div>
        {isWeak && (
          <span className="rounded-full bg-red-900/50 text-red-300 border border-red-800 text-xs px-2.5 py-0.5">
            Needs attention
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Study progress</span>
          <span className="text-white font-medium">{percent}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {subject.daysCompleted} / {subject.totalDays} days
        </div>
      </div>

      {/* Flashcard breakdown */}
      {subject.flashcardsTotal > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="text-sm text-slate-400 mb-2">Flashcard difficulty</div>
          <div className="flex items-center gap-2">
            <DifficultyBar
              label="Easy"
              count={subject.easyCards}
              total={subject.flashcardsTotal}
              color="bg-emerald-500"
            />
            <DifficultyBar
              label="Medium"
              count={subject.mediumCards}
              total={subject.flashcardsTotal}
              color="bg-amber-500"
            />
            <DifficultyBar
              label="Hard"
              count={subject.hardCards}
              total={subject.flashcardsTotal}
              color="bg-red-500"
            />
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {subject.flashcardsTotal} total flashcards
            {subject.flashcardsReviewed > 0 && ` · ${subject.flashcardsReviewed} reviewed`}
          </div>
        </div>
      )}
    </div>
  );
}

function DifficultyBar({ label, count, total, color }) {
  const percent = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span>{count}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-800">
        <div
          className={`h-1.5 rounded-full ${color} transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function emptySubject(name) {
  return {
    name,
    plans: [],
    totalDays: 0,
    daysCompleted: 0,
    totalTopics: 0,
    flashcardsTotal: 0,
    flashcardsReviewed: 0,
    easyCards: 0,
    mediumCards: 0,
    hardCards: 0,
    materialsCount: 0,
  };
}

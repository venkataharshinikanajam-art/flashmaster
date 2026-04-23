import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

// Build an empty subject record.
function emptySubject(name) {
  return {
    name: name,
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

export default function Progress() {
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

  // Group the data by subject.
  const subjects = {};

  for (let i = 0; i < plans.length; i++) {
    const p = plans[i];
    if (!subjects[p.subject]) subjects[p.subject] = emptySubject(p.subject);
    subjects[p.subject].plans.push(p);

    let scheduleLen = 0;
    if (p.schedule) scheduleLen = p.schedule.length;
    subjects[p.subject].totalDays += scheduleLen;

    let completedLen = 0;
    if (p.schedule) {
      for (let j = 0; j < p.schedule.length; j++) {
        if (p.schedule[j].completed) completedLen++;
      }
    }
    subjects[p.subject].daysCompleted += completedLen;

    let topicsLen = 0;
    if (p.topics) topicsLen = p.topics.length;
    subjects[p.subject].totalTopics += topicsLen;
  }

  for (let i = 0; i < flashcards.length; i++) {
    const f = flashcards[i];
    if (!subjects[f.subject]) subjects[f.subject] = emptySubject(f.subject);
    subjects[f.subject].flashcardsTotal++;
    if (f.difficulty === "hard") subjects[f.subject].hardCards++;
    if (f.difficulty === "medium") subjects[f.subject].mediumCards++;
    if (f.difficulty === "easy") subjects[f.subject].easyCards++;
    if (f.lastReviewedAt) subjects[f.subject].flashcardsReviewed++;
  }

  for (let i = 0; i < materials.length; i++) {
    const m = materials[i];
    if (!subjects[m.subject]) subjects[m.subject] = emptySubject(m.subject);
    subjects[m.subject].materialsCount++;
  }

  // Convert the subjects object into an array for rendering.
  const subjectList = Object.values(subjects);

  // Compute overall totals by summing each subject.
  let totalDays = 0;
  let daysCompleted = 0;
  let flashcardsReviewed = 0;
  for (let i = 0; i < subjectList.length; i++) {
    totalDays += subjectList[i].totalDays;
    daysCompleted += subjectList[i].daysCompleted;
    flashcardsReviewed += subjectList[i].flashcardsReviewed;
  }

  let overallPercent = 0;
  if (totalDays > 0) {
    overallPercent = Math.round((daysCompleted / totalDays) * 100);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white">Progress Tracking</h1>
      <p className="mt-2 text-slate-400">
        See how far along you are in each subject and which areas need more work.
      </p>

      {loading && <p className="mt-8 text-slate-400">Loading...</p>}

      {!loading && subjectList.length === 0 && (
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
      )}

      {!loading && subjectList.length > 0 && (
        <>
          <div className="mt-8 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 to-indigo-950/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Overall completion</div>
                <div className="mt-1 text-4xl font-bold text-white">{overallPercent}%</div>
                <div className="mt-1 text-sm text-slate-400">
                  {daysCompleted} of {totalDays} study days completed
                </div>
              </div>
              <div className="text-right text-sm text-slate-400">
                <div>{subjectList.length} subjects</div>
                <div>{flashcards.length} flashcards</div>
                <div>{materials.length} materials</div>
              </div>
            </div>
            <div className="mt-4 h-3 w-full rounded-full bg-slate-800">
              <div
                className="h-3 rounded-full bg-indigo-500 transition-all"
                style={{ width: overallPercent + "%" }}
              />
            </div>
          </div>

          <h2 className="mt-10 text-lg font-semibold text-white">By Subject</h2>
          <div className="mt-4 space-y-4">
            {subjectList.map(function (s) {
              return <SubjectCard key={s.name} subject={s} />;
            })}
          </div>
        </>
      )}
    </div>
  );
}

function SubjectCard(props) {
  const s = props.subject;

  let percent = 0;
  if (s.totalDays > 0) percent = Math.round((s.daysCompleted / s.totalDays) * 100);

  let hardPercent = 0;
  if (s.flashcardsTotal > 0) hardPercent = Math.round((s.hardCards / s.flashcardsTotal) * 100);

  // If more than 30% of cards are hard, this subject needs attention.
  const isWeak = hardPercent > 30;

  let planLabel = "plan";
  if (s.plans.length !== 1) planLabel = "plans";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold text-white">{s.name}</div>
          <div className="mt-1 text-sm text-slate-400">
            {s.plans.length} {planLabel} - {s.totalTopics} topics - {s.materialsCount} materials
          </div>
        </div>
        {isWeak && (
          <span className="rounded-full bg-red-900/50 text-red-300 border border-red-800 text-xs px-2.5 py-0.5">
            Needs attention
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Study progress</span>
          <span className="text-white font-medium">{percent}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-800">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all"
            style={{ width: percent + "%" }}
          />
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {s.daysCompleted} / {s.totalDays} days
        </div>
      </div>

      {s.flashcardsTotal > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="text-sm text-slate-400 mb-2">Flashcard difficulty</div>
          <div className="flex items-center gap-2">
            <DifficultyBar
              label="Easy"
              count={s.easyCards}
              total={s.flashcardsTotal}
              color="bg-emerald-500"
            />
            <DifficultyBar
              label="Medium"
              count={s.mediumCards}
              total={s.flashcardsTotal}
              color="bg-amber-500"
            />
            <DifficultyBar
              label="Hard"
              count={s.hardCards}
              total={s.flashcardsTotal}
              color="bg-red-500"
            />
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {s.flashcardsTotal} total flashcards
            {s.flashcardsReviewed > 0 && " - " + s.flashcardsReviewed + " reviewed"}
          </div>
        </div>
      )}
    </div>
  );
}

function DifficultyBar(props) {
  let percent = 0;
  if (props.total > 0) percent = (props.count / props.total) * 100;

  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{props.label}</span>
        <span>{props.count}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-800">
        <div
          className={"h-1.5 rounded-full " + props.color + " transition-all"}
          style={{ width: percent + "%" }}
        />
      </div>
    </div>
  );
}

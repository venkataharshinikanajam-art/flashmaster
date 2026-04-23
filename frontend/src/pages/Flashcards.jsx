import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

const DIFFICULTY_COLORS = {
  easy: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
  medium: "bg-amber-900/50 text-amber-300 border-amber-800",
  hard: "bg-red-900/50 text-red-300 border-red-800",
};

export default function Flashcards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [studyMode, setStudyMode] = useState(false);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/api/flashcards").then(setCards).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const subjects = ["all", ...Array.from(new Set(cards.map((c) => c.subject).filter(Boolean)))];
  const topics = ["all", ...Array.from(new Set(cards.map((c) => c.topic).filter(Boolean)))];

  const filtered = cards.filter((c) => {
    if (filter !== "all" && c.difficulty !== filter) return false;
    if (subjectFilter !== "all" && c.subject !== subjectFilter) return false;
    if (topicFilter !== "all" && c.topic !== topicFilter) return false;
    return true;
  });

  const updateDifficulty = async (id, difficulty) => {
    await api.patch(`/api/flashcards/${id}`, { difficulty });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this flashcard?")) return;
    await api.del(`/api/flashcards/${id}`);
    load();
  };

  // ------ Study mode ------
  if (studyMode && filtered.length > 0) {
    const card = filtered[idx];
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Card {idx + 1} of {filtered.length}
          </span>
          <button onClick={() => setStudyMode(false)} className="hover:text-white">
            Exit study mode
          </button>
        </div>

        <div
          onClick={() => setFlipped(!flipped)}
          className="mt-6 min-h-[300px] rounded-2xl border border-slate-800 bg-slate-900/60 p-8 cursor-pointer flex flex-col items-center justify-center text-center transition-all hover:border-indigo-500"
        >
          <div className="text-xs uppercase tracking-wider text-slate-500">
            {flipped ? "Answer" : "Question"}
          </div>
          <div className="mt-4 text-2xl text-white font-medium">
            {flipped ? card.answer : card.question}
          </div>
          <div className="mt-6 text-xs text-slate-500">(click to flip)</div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => {
              setIdx(Math.max(0, idx - 1));
              setFlipped(false);
            }}
            disabled={idx === 0}
            className="rounded border border-slate-700 px-4 py-2 text-slate-200 hover:border-slate-500 disabled:opacity-50"
          >
            Prev
          </button>
          <div className="flex gap-2">
            {["easy", "medium", "hard"].map((d) => (
              <button
                key={d}
                onClick={() => updateDifficulty(card._id, d)}
                className={`rounded border px-3 py-1 text-xs ${
                  card.difficulty === d ? DIFFICULTY_COLORS[d] : "border-slate-700 text-slate-400"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setIdx(Math.min(filtered.length - 1, idx + 1));
              setFlipped(false);
            }}
            disabled={idx >= filtered.length - 1}
            className="rounded border border-slate-700 px-4 py-2 text-slate-200 hover:border-slate-500 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // ------ List mode ------
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Flashcards</h1>
          <p className="mt-2 text-slate-400">{cards.length} total - {filtered.length} shown</p>
        </div>
        {filtered.length > 0 && (
          <button
            onClick={() => {
              setStudyMode(true);
              setIdx(0);
              setFlipped(false);
            }}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-white font-medium hover:bg-indigo-400"
          >
            Start studying
          </button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <div className="text-xs uppercase text-slate-500 mb-1">Difficulty</div>
          <div className="flex flex-wrap gap-2">
            {["all", "easy", "medium", "hard"].map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`rounded-full px-4 py-1.5 text-sm border ${
                  filter === d
                    ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                    : "border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        {subjects.length > 1 && (
          <div>
            <div className="text-xs uppercase text-slate-500 mb-1">Subject</div>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubjectFilter(s)}
                  className={`rounded-full px-4 py-1.5 text-sm border ${
                    subjectFilter === s
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {topics.length > 1 && (
          <div>
            <div className="text-xs uppercase text-slate-500 mb-1">Topic</div>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopicFilter(t)}
                  className={`rounded-full px-4 py-1.5 text-sm border ${
                    topicFilter === t
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <p className="mt-8 text-slate-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-slate-400">
          No flashcards here. Upload a material to auto-generate some.
        </p>
      ) : (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="rounded-lg border border-slate-800 bg-slate-900/50 p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs text-slate-500">
                  {c.subject}
                  {c.topic && <> - <span className="text-indigo-300">{c.topic}</span></>}
                </div>
                <span
                  className={`text-xs border rounded-full px-2 py-0.5 ${DIFFICULTY_COLORS[c.difficulty]}`}
                >
                  {c.difficulty}
                </span>
              </div>
              <div className="mt-2 font-medium text-white">{c.question}</div>
              <div className="mt-2 text-sm text-slate-300">{c.answer}</div>
              <button
                onClick={() => handleDelete(c._id)}
                className="mt-3 text-xs text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

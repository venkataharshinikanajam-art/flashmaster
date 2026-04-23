import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

// Tailwind classes for each difficulty chip.
const DIFFICULTY_COLORS = {
  easy: "bg-emerald-900/50 text-emerald-300 border-emerald-800",
  medium: "bg-amber-900/50 text-amber-300 border-amber-800",
  hard: "bg-red-900/50 text-red-300 border-red-800",
};

export default function Flashcards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");

  // Study mode state.
  const [studyMode, setStudyMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  function load() {
    setLoading(true);
    api.get("/api/flashcards")
      .then(function (data) {
        setCards(data);
      })
      .finally(function () {
        setLoading(false);
      });
  }

  useEffect(load, []);

  // Build the unique subject list and topic list for the filter chips.
  const subjectList = ["all"];
  const topicList = ["all"];
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (c.subject && subjectList.indexOf(c.subject) === -1) {
      subjectList.push(c.subject);
    }
    if (c.topic && topicList.indexOf(c.topic) === -1) {
      topicList.push(c.topic);
    }
  }

  // Filter the cards based on the selected filters.
  const filteredCards = [];
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (difficultyFilter !== "all" && c.difficulty !== difficultyFilter) continue;
    if (subjectFilter !== "all" && c.subject !== subjectFilter) continue;
    if (topicFilter !== "all" && c.topic !== topicFilter) continue;
    filteredCards.push(c);
  }

  async function updateDifficulty(id, difficulty) {
    await api.patch("/api/flashcards/" + id, { difficulty: difficulty });
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this flashcard?")) return;
    await api.del("/api/flashcards/" + id);
    load();
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFlipped(false);
    }
  }

  function goNext() {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFlipped(false);
    }
  }

  function enterStudyMode() {
    setStudyMode(true);
    setCurrentIndex(0);
    setFlipped(false);
  }

  // STUDY MODE: show one card at a time, with Prev/Next and difficulty buttons.
  if (studyMode && filteredCards.length > 0) {
    const card = filteredCards[currentIndex];
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>Card {currentIndex + 1} of {filteredCards.length}</span>
          <button
            onClick={function () { setStudyMode(false); }}
            className="hover:text-white"
          >
            Exit study mode
          </button>
        </div>

        <div
          onClick={function () { setFlipped(!flipped); }}
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
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="rounded border border-slate-700 px-4 py-2 text-slate-200 hover:border-slate-500 disabled:opacity-50"
          >
            Prev
          </button>
          <div className="flex gap-2">
            {["easy", "medium", "hard"].map(function (d) {
              const active = card.difficulty === d;
              return (
                <button
                  key={d}
                  onClick={function () { updateDifficulty(card._id, d); }}
                  className={
                    active
                      ? "rounded border px-3 py-1 text-xs " + DIFFICULTY_COLORS[d]
                      : "rounded border px-3 py-1 text-xs border-slate-700 text-slate-400"
                  }
                >
                  {d}
                </button>
              );
            })}
          </div>
          <button
            onClick={goNext}
            disabled={currentIndex >= filteredCards.length - 1}
            className="rounded border border-slate-700 px-4 py-2 text-slate-200 hover:border-slate-500 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // LIST MODE: grid of all cards, with filters and a "start studying" button.
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Flashcards</h1>
          <p className="mt-2 text-slate-400">
            {cards.length} total - {filteredCards.length} shown
          </p>
        </div>
        {filteredCards.length > 0 && (
          <button
            onClick={enterStudyMode}
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
            {["all", "easy", "medium", "hard"].map(function (d) {
              const active = difficultyFilter === d;
              return (
                <button
                  key={d}
                  onClick={function () { setDifficultyFilter(d); }}
                  className={
                    active
                      ? "rounded-full px-4 py-1.5 text-sm border border-indigo-500 bg-indigo-500/20 text-indigo-200"
                      : "rounded-full px-4 py-1.5 text-sm border border-slate-700 text-slate-400 hover:border-slate-500"
                  }
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {subjectList.length > 1 && (
          <div>
            <div className="text-xs uppercase text-slate-500 mb-1">Subject</div>
            <div className="flex flex-wrap gap-2">
              {subjectList.map(function (s) {
                const active = subjectFilter === s;
                return (
                  <button
                    key={s}
                    onClick={function () { setSubjectFilter(s); }}
                    className={
                      active
                        ? "rounded-full px-4 py-1.5 text-sm border border-indigo-500 bg-indigo-500/20 text-indigo-200"
                        : "rounded-full px-4 py-1.5 text-sm border border-slate-700 text-slate-400 hover:border-slate-500"
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {topicList.length > 1 && (
          <div>
            <div className="text-xs uppercase text-slate-500 mb-1">Topic</div>
            <div className="flex flex-wrap gap-2">
              {topicList.map(function (t) {
                const active = topicFilter === t;
                return (
                  <button
                    key={t}
                    onClick={function () { setTopicFilter(t); }}
                    className={
                      active
                        ? "rounded-full px-4 py-1.5 text-sm border border-indigo-500 bg-indigo-500/20 text-indigo-200"
                        : "rounded-full px-4 py-1.5 text-sm border border-slate-700 text-slate-400 hover:border-slate-500"
                    }
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {loading && <p className="mt-8 text-slate-400">Loading...</p>}

      {!loading && filteredCards.length === 0 && (
        <p className="mt-8 text-slate-400">
          No flashcards here. Upload a material to auto-generate some.
        </p>
      )}

      {!loading && filteredCards.length > 0 && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {filteredCards.map(function (c) {
            return (
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
                    className={"text-xs border rounded-full px-2 py-0.5 " + DIFFICULTY_COLORS[c.difficulty]}
                  >
                    {c.difficulty}
                  </span>
                </div>
                <div className="mt-2 font-medium text-white">{c.question}</div>
                <div className="mt-2 text-sm text-slate-300">{c.answer}</div>
                <button
                  onClick={function () { handleDelete(c._id); }}
                  className="mt-3 text-xs text-red-400 hover:text-red-300"
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

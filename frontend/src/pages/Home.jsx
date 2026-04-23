import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function Home() {
  const { user } = useAuth();
  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
        Turn your notes into <span className="text-indigo-400">flashcards</span>, instantly.
      </h1>
      <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
        FLASHMASTER is your smart study assistant. Upload PDFs or notes, auto-generate
        flashcards, build study plans, and track your progress - all in one place.
      </p>
      <div className="mt-10 flex gap-4 justify-center">
        {user ? (
          <Link
            to="/dashboard"
            className="rounded-lg bg-indigo-500 px-6 py-3 text-white font-medium hover:bg-indigo-400"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/signup"
              className="rounded-lg bg-indigo-500 px-6 py-3 text-white font-medium hover:bg-indigo-400"
            >
              Get started
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-slate-700 px-6 py-3 text-slate-200 hover:border-slate-500"
            >
              Log in
            </Link>
          </>
        )}
      </div>

      <div className="mt-20 grid md:grid-cols-3 gap-6 text-left">
        <Feature title="Upload" text="Drop a PDF or paste text. We extract and organize." />
        <Feature title="Auto-generate" text="Heuristic + local AI turn content into Q&A cards." />
        <Feature title="Track" text="See what's mastered, what needs review, what's due." />
      </div>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="mt-2 text-slate-400">{text}</div>
    </div>
  );
}

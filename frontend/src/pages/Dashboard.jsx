import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ materials: 0, flashcards: 0, plans: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/api/materials"),
      api.get("/api/flashcards"),
      api.get("/api/plans"),
    ])
      .then(([materials, flashcards, plans]) =>
        setStats({
          materials: materials.length,
          flashcards: flashcards.length,
          plans: plans.length,
        })
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white">
        Welcome, {user?.name}
      </h1>
      <p className="mt-2 text-slate-400">Here's the state of your study universe.</p>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <StatCard label="Materials" value={stats.materials} loading={loading} to="/materials" />
        <StatCard label="Flashcards" value={stats.flashcards} loading={loading} to="/flashcards" />
        <StatCard label="Study plans" value={stats.plans} loading={loading} to="/plans" />
      </div>

      <div className="mt-10 grid sm:grid-cols-2 gap-4">
        <ActionCard
          to="/materials"
          title="Upload a PDF"
          text="Drop your notes and we'll generate flashcards automatically."
        />
        <ActionCard
          to="/flashcards"
          title="Start reviewing"
          text="Flip through cards you've already created."
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, loading, to }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 hover:border-slate-700"
    >
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-bold text-white">
        {loading ? "..." : value}
      </div>
    </Link>
  );
}

function ActionCard({ to, title, text }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 hover:border-indigo-500 transition-colors"
    >
      <div className="text-lg font-semibold text-white">{title}</div>
      <div className="mt-1 text-slate-400">{text}</div>
    </Link>
  );
}

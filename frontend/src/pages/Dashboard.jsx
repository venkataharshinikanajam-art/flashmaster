import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

export default function Dashboard() {
  const auth = useAuth();
  const user = auth.user;

  const [materialsCount, setMaterialsCount] = useState(0);
  const [flashcardsCount, setFlashcardsCount] = useState(0);
  const [plansCount, setPlansCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    // Load each list one after another (simple and easy to follow).
    async function load() {
      try {
        const materials = await api.get("/api/materials");
        setMaterialsCount(materials.length);

        const flashcards = await api.get("/api/flashcards");
        setFlashcardsCount(flashcards.length);

        const plans = await api.get("/api/plans");
        setPlansCount(plans.length);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white">
        Welcome, {user ? user.name : ""}
      </h1>
      <p className="mt-2 text-slate-400">Here's the state of your study universe.</p>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <StatCard label="Materials" value={materialsCount} loading={loading} to="/materials" />
        <StatCard label="Flashcards" value={flashcardsCount} loading={loading} to="/flashcards" />
        <StatCard label="Study plans" value={plansCount} loading={loading} to="/plans" />
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

function StatCard(props) {
  return (
    <Link
      to={props.to}
      className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 hover:border-slate-700"
    >
      <div className="text-sm text-slate-400">{props.label}</div>
      <div className="mt-1 text-3xl font-bold text-white">
        {props.loading ? "..." : props.value}
      </div>
    </Link>
  );
}

function ActionCard(props) {
  return (
    <Link
      to={props.to}
      className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 hover:border-indigo-500 transition-colors"
    >
      <div className="text-lg font-semibold text-white">{props.title}</div>
      <div className="mt-1 text-slate-400">{props.text}</div>
    </Link>
  );
}

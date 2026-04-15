import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

const TABS = ["users", "materials", "reports"];

export default function Admin() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [u, m, s] = await Promise.all([
        api.get("/api/users"),
        api.get("/api/admin/materials"),
        api.get("/api/admin/stats"),
      ]);
      setUsers(u);
      setMaterials(m);
      setStats(s);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleDeleteMaterial = async (id) => {
    if (!confirm("Delete this material and all its flashcards? (Admin action)")) return;
    try {
      await api.del(`/api/admin/materials/${id}`);
      loadAll();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      <p className="mt-2 text-slate-400">
        Manage users and uploaded content. Review platform reports.
      </p>

      <div className="mt-6 flex gap-2 border-b border-slate-800">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm capitalize border-b-2 -mb-px ${
              tab === t
                ? "border-indigo-500 text-indigo-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-slate-400">Loading…</p>
      ) : error ? (
        <div className="mt-6 rounded-md bg-red-950/60 border border-red-900 text-red-300 px-3 py-2 text-sm">
          {error}
        </div>
      ) : (
        <div className="mt-6">
          {tab === "users" && <UsersTable users={users} />}
          {tab === "materials" && (
            <MaterialsTable materials={materials} onDelete={handleDeleteMaterial} />
          )}
          {tab === "reports" && <Reports stats={stats} />}
        </div>
      )}
    </div>
  );
}

function UsersTable({ users }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Joined</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {users.map((u) => (
            <tr key={u._id} className="bg-slate-900/40 hover:bg-slate-900/70">
              <td className="px-4 py-3 text-white">{u.name}</td>
              <td className="px-4 py-3 text-slate-300">{u.email}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs ${
                    u.role === "admin"
                      ? "border-amber-800 bg-amber-900/40 text-amber-300"
                      : "border-slate-700 bg-slate-800 text-slate-300"
                  }`}
                >
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-400">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MaterialsTable({ materials, onDelete }) {
  if (materials.length === 0) {
    return <p className="text-slate-400">No materials uploaded yet.</p>;
  }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Subject / Topic</th>
            <th className="px-4 py-3">Owner</th>
            <th className="px-4 py-3">Uploaded</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {materials.map((m) => (
            <tr key={m._id} className="bg-slate-900/40 hover:bg-slate-900/70">
              <td className="px-4 py-3 text-white">{m.title}</td>
              <td className="px-4 py-3 text-slate-300">
                {m.subject}
                {m.topic && <span className="text-indigo-300"> · {m.topic}</span>}
              </td>
              <td className="px-4 py-3 text-slate-400">
                {m.userId?.name || "—"}
                <div className="text-xs text-slate-500">{m.userId?.email}</div>
              </td>
              <td className="px-4 py-3 text-slate-400">
                {new Date(m.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onDelete(m._id)}
                  className="rounded border border-red-900 px-3 py-1 text-xs text-red-300 hover:border-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Reports({ stats }) {
  if (!stats) return null;
  const cards = [
    { label: "Total Users", value: stats.users.total, sub: `${stats.users.students} students · ${stats.users.admins} admins` },
    { label: "Materials Uploaded", value: stats.materials },
    { label: "Flashcards", value: stats.flashcards.total, sub: `${stats.flashcards.hard} marked hard` },
    { label: "Study Plans", value: stats.plans },
  ];
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
          >
            <div className="text-xs uppercase text-slate-500">{c.label}</div>
            <div className="mt-2 text-3xl font-bold text-white">{c.value}</div>
            {c.sub && <div className="mt-1 text-xs text-slate-400">{c.sub}</div>}
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">Recent uploads</h3>
        {stats.recentMaterials.length === 0 ? (
          <p className="mt-2 text-slate-400">None yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {stats.recentMaterials.map((m) => (
              <li
                key={m._id}
                className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm"
              >
                <div className="text-white">{m.title}</div>
                <div className="text-xs text-slate-400">
                  {m.subject}
                  {m.topic && <> · {m.topic}</>} · by {m.userId?.name || "unknown"} ·{" "}
                  {new Date(m.createdAt).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

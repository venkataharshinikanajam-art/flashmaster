import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

const TABS = ["users", "materials", "reports"];

export default function Admin() {
  const auth = useAuth();
  const currentUser = auth.user;

  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      // Load one thing at a time (simple and easy to read).
      const u = await api.get("/api/users");
      setUsers(u);
      const m = await api.get("/api/admin/materials");
      setMaterials(m);
      const s = await api.get("/api/admin/stats");
      setStats(s);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    loadAll();
  }, []);

  async function handleDeleteMaterial(id) {
    if (!confirm("Delete this material and all its flashcards? (Admin action)")) return;
    try {
      await api.del("/api/admin/materials/" + id);
      loadAll();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleRoleChange(id, nextRole) {
    let message;
    if (nextRole === "admin") {
      message = "Promote this user to admin?";
    } else {
      message = "Demote this admin back to student?";
    }
    if (!confirm(message)) return;
    try {
      await api.patch("/api/admin/users/" + id + "/role", { role: nextRole });
      loadAll();
    } catch (e) {
      alert(e.message);
    }
  }

  let currentUserId = null;
  if (currentUser) currentUserId = currentUser._id;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      <p className="mt-2 text-slate-400">
        Manage users and uploaded content. Review platform reports.
      </p>

      <div className="mt-6 flex gap-2 border-b border-slate-800">
        {TABS.map(function (t) {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={function () { setTab(t); }}
              className={
                active
                  ? "px-4 py-2 text-sm capitalize border-b-2 -mb-px border-indigo-500 text-indigo-300"
                  : "px-4 py-2 text-sm capitalize border-b-2 -mb-px border-transparent text-slate-400 hover:text-slate-200"
              }
            >
              {t}
            </button>
          );
        })}
      </div>

      {loading && <p className="mt-6 text-slate-400">Loading...</p>}

      {!loading && error && (
        <div className="mt-6 rounded-md bg-red-950/60 border border-red-900 text-red-300 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6">
          {tab === "users" && (
            <UsersTable
              users={users}
              currentUserId={currentUserId}
              onRoleChange={handleRoleChange}
            />
          )}
          {tab === "materials" && (
            <MaterialsTable
              materials={materials}
              onDelete={handleDeleteMaterial}
            />
          )}
          {tab === "reports" && <Reports stats={stats} />}
        </div>
      )}
    </div>
  );
}

function UsersTable(props) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/80 text-slate-400 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Joined</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {props.users.map(function (u) {
            const isSelf = u._id === props.currentUserId;
            let nextRole = "admin";
            if (u.role === "admin") nextRole = "student";

            let roleClass;
            if (u.role === "admin") {
              roleClass = "rounded-full border px-2 py-0.5 text-xs border-amber-800 bg-amber-900/40 text-amber-300";
            } else {
              roleClass = "rounded-full border px-2 py-0.5 text-xs border-slate-700 bg-slate-800 text-slate-300";
            }

            return (
              <tr key={u._id} className="bg-slate-900/40 hover:bg-slate-900/70">
                <td className="px-4 py-3 text-white">{u.name}</td>
                <td className="px-4 py-3 text-slate-300">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={roleClass}>{u.role}</span>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {isSelf ? (
                    <span className="text-xs text-slate-500">(you)</span>
                  ) : (
                    <button
                      onClick={function () { props.onRoleChange(u._id, nextRole); }}
                      className={
                        nextRole === "admin"
                          ? "rounded border px-3 py-1 text-xs border-amber-800 text-amber-300 hover:border-amber-600"
                          : "rounded border px-3 py-1 text-xs border-slate-700 text-slate-300 hover:border-slate-500"
                      }
                    >
                      {nextRole === "admin" ? "Promote to admin" : "Demote to student"}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MaterialsTable(props) {
  if (props.materials.length === 0) {
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
          {props.materials.map(function (m) {
            let ownerName = "-";
            let ownerEmail = "";
            if (m.userId) {
              ownerName = m.userId.name || "-";
              ownerEmail = m.userId.email || "";
            }
            return (
              <tr key={m._id} className="bg-slate-900/40 hover:bg-slate-900/70">
                <td className="px-4 py-3 text-white">{m.title}</td>
                <td className="px-4 py-3 text-slate-300">
                  {m.subject}
                  {m.topic && <span className="text-indigo-300"> - {m.topic}</span>}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {ownerName}
                  <div className="text-xs text-slate-500">{ownerEmail}</div>
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(m.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={function () { props.onDelete(m._id); }}
                    className="rounded border border-red-900 px-3 py-1 text-xs text-red-300 hover:border-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Reports(props) {
  const stats = props.stats;
  if (!stats) return null;

  const cards = [
    {
      label: "Total Users",
      value: stats.users.total,
      sub: stats.users.students + " students - " + stats.users.admins + " admins",
    },
    {
      label: "Materials Uploaded",
      value: stats.materials,
      sub: "",
    },
    {
      label: "Flashcards",
      value: stats.flashcards.total,
      sub: stats.flashcards.hard + " marked hard",
    },
    {
      label: "Study Plans",
      value: stats.plans,
      sub: "",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(function (c) {
          return (
            <div
              key={c.label}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <div className="text-xs uppercase text-slate-500">{c.label}</div>
              <div className="mt-2 text-3xl font-bold text-white">{c.value}</div>
              {c.sub && <div className="mt-1 text-xs text-slate-400">{c.sub}</div>}
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white">Recent uploads</h3>
        {stats.recentMaterials.length === 0 ? (
          <p className="mt-2 text-slate-400">None yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {stats.recentMaterials.map(function (m) {
              let ownerName = "unknown";
              if (m.userId && m.userId.name) ownerName = m.userId.name;
              return (
                <li
                  key={m._id}
                  className="rounded-lg border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm"
                >
                  <div className="text-white">{m.title}</div>
                  <div className="text-xs text-slate-400">
                    {m.subject}
                    {m.topic && <> - {m.topic}</>} - by {ownerName} -{" "}
                    {new Date(m.createdAt).toLocaleDateString()}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

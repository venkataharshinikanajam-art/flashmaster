import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/users")
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
      <p className="mt-2 text-slate-400">Manage users and review platform activity.</p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white">Users</h2>
        {loading ? (
          <p className="mt-4 text-slate-400">Loading…</p>
        ) : error ? (
          <div className="mt-4 rounded-md bg-red-950/60 border border-red-900 text-red-300 px-3 py-2 text-sm">
            {error}
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
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
        )}
      </div>
    </div>
  );
}

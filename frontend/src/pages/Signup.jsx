import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function Signup() {
  const auth = useAuth();
  const navigate = useNavigate();

  // Keep each field in its own state variable for clarity.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await auth.signup({
        name: name,
        email: email,
        password: password,
        role: role,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Create your account</h1>
      <p className="mt-2 text-slate-400">Start building your flashcard deck.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block">
          <div className="text-sm text-slate-300">Full name</div>
          <input
            type="text"
            value={name}
            onChange={function (e) { setName(e.target.value); }}
            required
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <div className="text-sm text-slate-300">Email</div>
          <input
            type="email"
            value={email}
            onChange={function (e) { setEmail(e.target.value); }}
            required
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </label>

        <label className="block">
          <div className="text-sm text-slate-300">Password (min 6 chars)</div>
          <input
            type="password"
            value={password}
            onChange={function (e) { setPassword(e.target.value); }}
            required
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          />
        </label>

        <div className="block">
          <div className="text-sm text-slate-300">Role</div>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={function () { setRole("student"); }}
              className={
                role === "student"
                  ? "flex-1 rounded-md border px-3 py-2 text-sm border-indigo-500 bg-indigo-500/10 text-indigo-200"
                  : "flex-1 rounded-md border px-3 py-2 text-sm border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600"
              }
            >
              Student
            </button>
            <button
              type="button"
              onClick={function () { setRole("admin"); }}
              className={
                role === "admin"
                  ? "flex-1 rounded-md border px-3 py-2 text-sm border-amber-500 bg-amber-500/10 text-amber-200"
                  : "flex-1 rounded-md border px-3 py-2 text-sm border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600"
              }
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-950/60 border border-red-900 text-red-300 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-white font-medium hover:bg-indigo-400 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Sign up"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
          Log in
        </Link>
      </p>
    </div>
  );
}

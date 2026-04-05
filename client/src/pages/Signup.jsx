import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-white">Create your account</h1>
      <p className="mt-2 text-slate-400">Start building your flashcard deck.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Field label="Full name" value={form.name} onChange={update("name")} />
        <Field label="Email" type="email" value={form.email} onChange={update("email")} />
        <Field label="Password (min 6 chars)" type="password" value={form.password} onChange={update("password")} />

        <label className="block">
          <div className="text-sm text-slate-300">Role</div>
          <select
            value={form.role}
            onChange={update("role")}
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </label>

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
          {loading ? "Creating…" : "Sign up"}
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

function Field({ label, type = "text", value, onChange }) {
  return (
    <label className="block">
      <div className="text-sm text-slate-300">{label}</div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
      />
    </label>
  );
}

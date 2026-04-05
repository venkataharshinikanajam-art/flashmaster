import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Materials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Upload form state
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/api/materials")
      .then(setMaterials)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title || !subject) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      fd.append("subject", subject);
      const result = await api.upload("/api/materials/upload", fd);
      setFile(null);
      setTitle("");
      setSubject("");
      // Reset file input visually
      document.getElementById("file-input").value = "";
      load();
      alert(`Uploaded! ${result.flashcardsCreated} flashcards auto-generated.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this material?")) return;
    await api.del(`/api/materials/${id}`);
    load();
  };

  const handleRegenerate = async (id) => {
    const result = await api.post(
      `/api/materials/${id}/generate-flashcards?replace=true`
    );
    alert(`Regenerated ${result.created} flashcards.`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white">Study Materials</h1>
      <p className="mt-2 text-slate-400">Upload notes as PDF or plain text.</p>

      <form
        onSubmit={handleUpload}
        className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <div className="text-sm text-slate-300">Title</div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <div className="text-sm text-slate-300">Subject</div>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="DSA, DBMS, OS…"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
          </label>
        </div>
        <label className="block">
          <div className="text-sm text-slate-300">File (PDF or .txt, max 5MB)</div>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            onChange={(e) => setFile(e.target.files[0])}
            required
            className="mt-1 w-full text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-500 file:text-white file:px-4 file:py-2 file:hover:bg-indigo-400"
          />
        </label>
        {error && (
          <div className="rounded-md bg-red-950/60 border border-red-900 text-red-300 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={uploading}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-white font-medium hover:bg-indigo-400 disabled:opacity-50"
        >
          {uploading ? "Uploading & generating cards…" : "Upload"}
        </button>
      </form>

      <h2 className="mt-10 text-xl font-semibold text-white">Your materials</h2>
      {loading ? (
        <p className="mt-4 text-slate-400">Loading…</p>
      ) : materials.length === 0 ? (
        <p className="mt-4 text-slate-400">No materials yet. Upload one above.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {materials.map((m) => (
            <div
              key={m._id}
              className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white">{m.title}</div>
                <div className="text-sm text-slate-400">
                  {m.subject} · {new Date(m.createdAt).toLocaleDateString()}
                  {m.sourceFile && <> · 📎 {m.sourceFile}</>}
                </div>
                <div className="mt-2 text-sm text-slate-300 line-clamp-2">{m.content}</div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => handleRegenerate(m._id)}
                  className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-slate-500"
                >
                  Regenerate cards
                </button>
                <button
                  onClick={() => handleDelete(m._id)}
                  className="rounded border border-red-900 px-3 py-1 text-xs text-red-300 hover:border-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

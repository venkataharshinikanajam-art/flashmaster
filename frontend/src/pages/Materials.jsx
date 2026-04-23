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
  const [topic, setTopic] = useState("");
  const [uploading, setUploading] = useState(false);

  // Filter state
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");

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
      if (topic) fd.append("topic", topic);
      const result = await api.upload("/api/materials/upload", fd);
      setFile(null);
      setTitle("");
      setSubject("");
      setTopic("");
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

  // Build the list of unique subjects and topics for the filter buttons.
  const subjectList = ["all"];
  const topicList = ["all"];
  for (const m of materials) {
    if (m.subject && !subjectList.includes(m.subject)) subjectList.push(m.subject);
    if (m.topic && !topicList.includes(m.topic)) topicList.push(m.topic);
  }

  // Filter materials by the currently selected subject and topic.
  const visibleMaterials = materials.filter((m) => {
    if (subjectFilter !== "all" && m.subject !== subjectFilter) return false;
    if (topicFilter !== "all" && m.topic !== topicFilter) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-white">Study Materials</h1>
      <p className="mt-2 text-slate-400">Upload notes as PDF or plain text.</p>

      <form
        onSubmit={handleUpload}
        className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-4"
      >
        <div className="grid md:grid-cols-3 gap-4">
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
              placeholder="DSA, DBMS, OS"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
          </label>
          <label className="block">
            <div className="text-sm text-slate-300">
              Topic <span className="text-slate-500">(optional)</span>
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Linked Lists, Joins"
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
          {uploading ? "Uploading and generating cards..." : "Upload"}
        </button>
      </form>

      <h2 className="mt-10 text-xl font-semibold text-white">Your materials</h2>

      {materials.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase text-slate-500 mb-1">Subject</div>
            <div className="flex flex-wrap gap-2">
              {subjectList.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubjectFilter(s)}
                  className={`rounded-full px-3 py-1 text-xs border ${
                    subjectFilter === s
                      ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          {topicList.length > 1 && (
            <div>
              <div className="text-xs uppercase text-slate-500 mb-1">Topic</div>
              <div className="flex flex-wrap gap-2">
                {topicList.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTopicFilter(t)}
                    className={`rounded-full px-3 py-1 text-xs border ${
                      topicFilter === t
                        ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                        : "border-slate-700 text-slate-400 hover:border-slate-500"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading && <p className="mt-4 text-slate-400">Loading...</p>}

      {!loading && materials.length === 0 && (
        <p className="mt-4 text-slate-400">No materials yet. Upload one above.</p>
      )}

      {!loading && materials.length > 0 && visibleMaterials.length === 0 && (
        <p className="mt-4 text-slate-400">No materials match those filters.</p>
      )}

      {!loading && visibleMaterials.length > 0 && (
        <div className="mt-4 space-y-3">
          {visibleMaterials.map((m) => (
            <div
              key={m._id}
              className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 flex items-start justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-white">{m.title}</div>
                <div className="text-sm text-slate-400">
                  {m.subject}
                  {m.topic && <> - <span className="text-indigo-300">{m.topic}</span></>}
                  {" - "}{new Date(m.createdAt).toLocaleDateString()}
                  {m.sourceFile && <> - File: {m.sourceFile}</>}
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

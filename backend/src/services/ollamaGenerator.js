// ollamaGenerator.js
// Optional: call a local AI (Ollama) to produce better flashcards.
// If Ollama is not running, the materials route falls back to the heuristic.

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";
const TIMEOUT_MS = 30000;

// Check if Ollama is reachable.
export async function isOllamaAvailable() {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(function () {
      ctrl.abort();
    }, 2000);

    const res = await fetch(OLLAMA_URL + "/api/tags", { signal: ctrl.signal });
    clearTimeout(timer);

    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data.models);
  } catch (err) {
    return false;
  }
}

const SYSTEM_PROMPT =
  "You are a study assistant. Given study notes, extract 10-15 high-quality flashcards as JSON.\n" +
  "\n" +
  "Rules:\n" +
  "- Output ONLY a JSON array, no prose, no markdown fences.\n" +
  "- Each item must have: \"question\" (string), \"answer\" (string), \"difficulty\" (\"easy\" | \"medium\" | \"hard\").\n" +
  "- Questions should test understanding, not just copy the text.\n" +
  "- Keep answers concise (1-3 sentences).\n" +
  "- Skip any sentences that aren't useful for revision (headers, page numbers, footers).\n" +
  "\n" +
  "Output format:\n" +
  "[\n" +
  "  {\"question\": \"...\", \"answer\": \"...\", \"difficulty\": \"easy\"},\n" +
  "  ...\n" +
  "]";

// Generate flashcards via Ollama. Returns an array or null on failure.
export async function generateFlashcardsWithOllama(text) {
  if (!text || typeof text !== "string") return null;

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(function () {
      ctrl.abort();
    }, TIMEOUT_MS);

    const res = await fetch(OLLAMA_URL + "/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        system: SYSTEM_PROMPT,
        prompt: "Study notes:\n\n" + text.slice(0, 4000) + "\n\nReturn the JSON array now.",
        stream: false,
        options: { temperature: 0.3 },
      }),
      signal: ctrl.signal,
    });

    clearTimeout(timer);
    if (!res.ok) return null;

    const data = await res.json();
    const raw = data.response || "";

    // The model sometimes wraps JSON in ```json ... ``` - strip those.
    let cleaned = raw;
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```\s*$/i, "");
    cleaned = cleaned.trim();

    // Find the first [ and last ] in case the model added stray text.
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1) return null;

    const arr = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(arr)) return null;

    // Keep only well-formed items and cap at 20.
    const validLevels = ["easy", "medium", "hard"];
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const c = arr[i];
      if (!c) continue;
      if (typeof c.question !== "string" || typeof c.answer !== "string") continue;
      if (c.question.trim().length === 0 || c.answer.trim().length === 0) continue;

      let difficulty = "medium";
      for (let j = 0; j < validLevels.length; j++) {
        if (c.difficulty === validLevels[j]) {
          difficulty = c.difficulty;
          break;
        }
      }

      out.push({
        question: c.question.trim(),
        answer: c.answer.trim(),
        difficulty: difficulty,
      });
      if (out.length >= 20) break;
    }
    return out;
  } catch (err) {
    console.warn("[ollama] generation failed:", err.message);
    return null;
  }
}

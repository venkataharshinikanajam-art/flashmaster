const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";
const TIMEOUT_MS = 30_000;

// Check if Ollama is reachable and the model is available.
export const isOllamaAvailable = async () => {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2000);
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return false;
    const data = await res.json();
    return Array.isArray(data.models);
  } catch {
    return false;
  }
};

const SYSTEM_PROMPT = `You are a study assistant. Given study notes, extract 10-15 high-quality flashcards as JSON.

Rules:
- Output ONLY a JSON array, no prose, no markdown fences.
- Each item must have: "question" (string), "answer" (string), "difficulty" ("easy" | "medium" | "hard").
- Questions should test understanding, not just copy the text.
- Keep answers concise (1-3 sentences).
- Skip any sentences that aren't useful for revision (headers, page numbers, footers).

Output format:
[
  {"question": "...", "answer": "...", "difficulty": "easy"},
  ...
]`;

// Generate flashcards via Ollama. Returns array of {question, answer, difficulty}
// or null if anything went wrong.
export const generateFlashcardsWithOllama = async (text) => {
  if (!text || typeof text !== "string") return null;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        system: SYSTEM_PROMPT,
        prompt: `Study notes:\n\n${text.slice(0, 4000)}\n\nReturn the JSON array now.`,
        stream: false,
        options: { temperature: 0.3 },
      }),
      signal: ctrl.signal,
    });

    clearTimeout(t);
    if (!res.ok) return null;

    const data = await res.json();
    const raw = data.response || "";

    // The model sometimes wraps JSON in ```json ... ``` — strip those.
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    // Find the first [ and last ] to be resilient to stray text.
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    if (start === -1 || end === -1) return null;

    const arr = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(arr)) return null;

    return arr
      .filter(
        (c) =>
          c &&
          typeof c.question === "string" &&
          typeof c.answer === "string" &&
          c.question.trim().length > 0 &&
          c.answer.trim().length > 0
      )
      .map((c) => ({
        question: c.question.trim(),
        answer: c.answer.trim(),
        difficulty: ["easy", "medium", "hard"].includes(c.difficulty) ? c.difficulty : "medium",
      }))
      .slice(0, 20);
  } catch (err) {
    console.warn("[ollama] generation failed:", err.message);
    return null;
  }
};

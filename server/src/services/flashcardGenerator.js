// ===================================================================
// flashcardGenerator — heuristic text → flashcards.
// Pure function. Takes a string, returns an array of { question, answer, difficulty }.
// ===================================================================
//
// Patterns it recognizes:
//   1. "X is Y"      → Q: What is X?        A: Y
//   2. "X are Y"     → Q: What are X?       A: Y
//   3. "X means Y"   → Q: What does X mean? A: Y
//   4. "X: Y"        → Q: What is X?        A: Y   (list item style)
//
// The generator is intentionally simple. AI-based generation (Ollama) lands in Phase 13.
// ===================================================================

const MIN_SUBJECT_LEN = 2;
const MAX_SUBJECT_LEN = 60;
const MIN_ANSWER_LEN = 4;
const MAX_ANSWER_LEN = 300;

const STOPWORDS = new Set([
  "the", "a", "an", "this", "that", "these", "those", "it", "they",
  "there", "here", "which", "who", "what", "when", "where", "why", "how",
  "i", "you", "we", "he", "she", "his", "her", "our", "their", "its",
  "and", "or", "but", "so", "because", "if", "then", "than",
]);

// Rough sentence splitter. Not perfect, but good enough for study notes.
const splitSentences = (text) =>
  text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9(])/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

const cleanSubject = (s) => s.replace(/^[^A-Za-z0-9]+/, "").replace(/[^A-Za-z0-9]+$/, "").trim();

const isGoodSubject = (s) => {
  if (!s) return false;
  const cleaned = cleanSubject(s);
  if (cleaned.length < MIN_SUBJECT_LEN || cleaned.length > MAX_SUBJECT_LEN) return false;
  const firstWord = cleaned.split(/\s+/)[0].toLowerCase();
  if (STOPWORDS.has(firstWord)) return false;
  return true;
};

const isGoodAnswer = (a) => {
  if (!a) return false;
  const trimmed = a.trim();
  return trimmed.length >= MIN_ANSWER_LEN && trimmed.length <= MAX_ANSWER_LEN;
};

const pickDifficulty = (answer) => {
  const len = answer.length;
  if (len < 60) return "easy";
  if (len < 150) return "medium";
  return "hard";
};

// Try each pattern against a sentence, return a {question, answer} or null.
const patterns = [
  {
    // "X is Y."
    regex: /^(.+?)\s+is\s+(.+?)[.!?]?$/i,
    build: ([, subject, rest]) => ({
      question: `What is ${cleanSubject(subject)}?`,
      answer: rest.trim(),
    }),
  },
  {
    // "X are Y."
    regex: /^(.+?)\s+are\s+(.+?)[.!?]?$/i,
    build: ([, subject, rest]) => ({
      question: `What are ${cleanSubject(subject)}?`,
      answer: rest.trim(),
    }),
  },
  {
    // "X means Y."
    regex: /^(.+?)\s+means\s+(.+?)[.!?]?$/i,
    build: ([, subject, rest]) => ({
      question: `What does ${cleanSubject(subject)} mean?`,
      answer: rest.trim(),
    }),
  },
  {
    // "X: Y"  (list-item / heading style)
    regex: /^([A-Z][^:]{1,50}):\s*(.+?)[.!?]?$/,
    build: ([, subject, rest]) => ({
      question: `What is ${cleanSubject(subject)}?`,
      answer: rest.trim(),
    }),
  },
];

export const generateFlashcards = (text, { max = 20 } = {}) => {
  if (!text || typeof text !== "string") return [];

  const sentences = splitSentences(text);
  const cards = [];
  const seen = new Set();

  for (const sentence of sentences) {
    if (cards.length >= max) break;
    for (const { regex, build } of patterns) {
      const m = sentence.match(regex);
      if (!m) continue;
      const { question, answer } = build(m);
      if (!isGoodSubject(question.replace(/^What (is|are|does)\s+|\s+mean\?$|\?$/gi, ""))) continue;
      if (!isGoodAnswer(answer)) continue;
      const key = question.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      cards.push({ question, answer, difficulty: pickDifficulty(answer) });
      break; // one card per sentence max
    }
  }

  return cards;
};

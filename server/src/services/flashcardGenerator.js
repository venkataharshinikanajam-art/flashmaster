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

const patterns = [
  {
    regex: /^(.+?)\s+is\s+(.+?)[.!?]?$/i,
    build: ([, subject, rest]) => ({
      question: `What is ${cleanSubject(subject)}?`,
      answer: rest.trim(),
    }),
  },
  {
    regex: /^(.+?)\s+are\s+(.+?)[.!?]?$/i,
    build: ([, subject, rest]) => ({
      question: `What are ${cleanSubject(subject)}?`,
      answer: rest.trim(),
    }),
  },
  {
    regex: /^(.+?)\s+means\s+(.+?)[.!?]?$/i,
    build: ([, subject, rest]) => ({
      question: `What does ${cleanSubject(subject)} mean?`,
      answer: rest.trim(),
    }),
  },
  {
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
      break;
    }
  }

  return cards;
};

// flashcardGenerator.js
// A simple heuristic generator. Reads text, finds "X is Y" style sentences,
// and turns each one into a question/answer flashcard. No AI needed.

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

// Break text into sentences by splitting on . ! or ?
function splitSentences(text) {
  const oneLine = text.replace(/\s+/g, " ");
  const parts = oneLine.split(/[.!?]+/);
  const sentences = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.length > 0) sentences.push(trimmed);
  }
  return sentences;
}

// Remove leading/trailing punctuation around a subject word
function cleanSubject(s) {
  let out = s.trim();
  while (out.length > 0 && !/[A-Za-z0-9]/.test(out[0])) {
    out = out.slice(1);
  }
  while (out.length > 0 && !/[A-Za-z0-9]/.test(out[out.length - 1])) {
    out = out.slice(0, -1);
  }
  return out;
}

function isGoodSubject(s) {
  if (!s) return false;
  const cleaned = cleanSubject(s);
  if (cleaned.length < MIN_SUBJECT_LEN) return false;
  if (cleaned.length > MAX_SUBJECT_LEN) return false;
  const firstWord = cleaned.split(/\s+/)[0].toLowerCase();
  if (STOPWORDS.has(firstWord)) return false;
  return true;
}

function isGoodAnswer(a) {
  if (!a) return false;
  const trimmed = a.trim();
  if (trimmed.length < MIN_ANSWER_LEN) return false;
  if (trimmed.length > MAX_ANSWER_LEN) return false;
  return true;
}

function pickDifficulty(answer) {
  const len = answer.length;
  if (len < 60) return "easy";
  if (len < 150) return "medium";
  return "hard";
}

// Patterns we try, in order. Each has a regex and a function that builds
// a question/answer from the match.
const patterns = [
  {
    regex: /^(.+?)\s+is\s+(.+)$/i,
    build: (m) => ({
      subject: m[1],
      question: `What is ${cleanSubject(m[1])}?`,
      answer: m[2].trim(),
    }),
  },
  {
    regex: /^(.+?)\s+are\s+(.+)$/i,
    build: (m) => ({
      subject: m[1],
      question: `What are ${cleanSubject(m[1])}?`,
      answer: m[2].trim(),
    }),
  },
  {
    regex: /^(.+?)\s+means\s+(.+)$/i,
    build: (m) => ({
      subject: m[1],
      question: `What does ${cleanSubject(m[1])} mean?`,
      answer: m[2].trim(),
    }),
  },
  {
    regex: /^([A-Z][^:]{1,50}):\s*(.+)$/,
    build: (m) => ({
      subject: m[1],
      question: `What is ${cleanSubject(m[1])}?`,
      answer: m[2].trim(),
    }),
  },
];

export function generateFlashcards(text, options) {
  const max = (options && options.max) || 20;
  if (!text || typeof text !== "string") return [];

  const sentences = splitSentences(text);
  const cards = [];
  const seen = new Set();

  for (const sentence of sentences) {
    if (cards.length >= max) break;

    for (const pattern of patterns) {
      const m = sentence.match(pattern.regex);
      if (!m) continue;

      const { subject, question, answer } = pattern.build(m);

      if (!isGoodSubject(subject)) continue;
      if (!isGoodAnswer(answer)) continue;

      const key = question.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);

      cards.push({
        question,
        answer,
        difficulty: pickDifficulty(answer),
      });
      break;
    }
  }

  return cards;
}

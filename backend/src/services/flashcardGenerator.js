// flashcardGenerator.js
// A simple rule-based generator. Reads text, finds "X is Y" style sentences,
// and turns each one into a question/answer flashcard. No AI needed.

const MIN_SUBJECT_LEN = 2;
const MAX_SUBJECT_LEN = 60;
const MIN_ANSWER_LEN = 4;
const MAX_ANSWER_LEN = 300;

// Words that should NOT be at the start of a subject (too generic).
const STOPWORDS = [
  "the", "a", "an", "this", "that", "these", "those", "it", "they",
  "there", "here", "which", "who", "what", "when", "where", "why", "how",
  "i", "you", "we", "he", "she", "his", "her", "our", "their", "its",
  "and", "or", "but", "so", "because", "if", "then", "than",
];

// Break text into sentences by splitting on . ! or ?
function splitSentences(text) {
  // Collapse all whitespace to single spaces first.
  const oneLine = text.replace(/\s+/g, " ");
  const parts = oneLine.split(/[.!?]+/);
  const sentences = [];
  for (let i = 0; i < parts.length; i++) {
    const trimmed = parts[i].trim();
    if (trimmed.length > 0) {
      sentences.push(trimmed);
    }
  }
  return sentences;
}

// Check if a character is a letter or digit.
function isAlphaNum(ch) {
  return /[A-Za-z0-9]/.test(ch);
}

// Remove non-letter/digit characters from the start and end of a string.
function cleanSubject(s) {
  let out = s.trim();
  while (out.length > 0 && !isAlphaNum(out[0])) {
    out = out.slice(1);
  }
  while (out.length > 0 && !isAlphaNum(out[out.length - 1])) {
    out = out.slice(0, -1);
  }
  return out;
}

// Check if the first word of a string is in the stopword list.
function startsWithStopword(s) {
  const words = s.split(/\s+/);
  if (words.length === 0) return false;
  const first = words[0].toLowerCase();
  for (let i = 0; i < STOPWORDS.length; i++) {
    if (STOPWORDS[i] === first) return true;
  }
  return false;
}

// Is this subject usable as a flashcard question topic?
function isGoodSubject(s) {
  if (!s) return false;
  const cleaned = cleanSubject(s);
  if (cleaned.length < MIN_SUBJECT_LEN) return false;
  if (cleaned.length > MAX_SUBJECT_LEN) return false;
  if (startsWithStopword(cleaned)) return false;
  return true;
}

// Is this answer usable? Too short or too long, skip it.
function isGoodAnswer(a) {
  if (!a) return false;
  const trimmed = a.trim();
  if (trimmed.length < MIN_ANSWER_LEN) return false;
  if (trimmed.length > MAX_ANSWER_LEN) return false;
  return true;
}

// Dumb but useful: longer answers are harder to remember.
function pickDifficulty(answer) {
  const len = answer.length;
  if (len < 60) return "easy";
  if (len < 150) return "medium";
  return "hard";
}

// Patterns we try on each sentence, in order.
const patterns = [
  {
    regex: /^(.+?)\s+is\s+(.+)$/i,
    build: function (m) {
      return {
        subject: m[1],
        question: "What is " + cleanSubject(m[1]) + "?",
        answer: m[2].trim(),
      };
    },
  },
  {
    regex: /^(.+?)\s+are\s+(.+)$/i,
    build: function (m) {
      return {
        subject: m[1],
        question: "What are " + cleanSubject(m[1]) + "?",
        answer: m[2].trim(),
      };
    },
  },
  {
    regex: /^(.+?)\s+means\s+(.+)$/i,
    build: function (m) {
      return {
        subject: m[1],
        question: "What does " + cleanSubject(m[1]) + " mean?",
        answer: m[2].trim(),
      };
    },
  },
  {
    regex: /^([A-Z][^:]{1,50}):\s*(.+)$/,
    build: function (m) {
      return {
        subject: m[1],
        question: "What is " + cleanSubject(m[1]) + "?",
        answer: m[2].trim(),
      };
    },
  },
];

export function generateFlashcards(text, options) {
  let max = 20;
  if (options && options.max) {
    max = options.max;
  }
  if (!text || typeof text !== "string") return [];

  const sentences = splitSentences(text);
  const cards = [];
  const seenQuestions = [];

  for (let s = 0; s < sentences.length; s++) {
    if (cards.length >= max) break;
    const sentence = sentences[s];

    for (let p = 0; p < patterns.length; p++) {
      const m = sentence.match(patterns[p].regex);
      if (!m) continue;

      const built = patterns[p].build(m);

      if (!isGoodSubject(built.subject)) continue;
      if (!isGoodAnswer(built.answer)) continue;

      // Skip duplicate questions.
      const key = built.question.toLowerCase();
      let alreadySeen = false;
      for (let i = 0; i < seenQuestions.length; i++) {
        if (seenQuestions[i] === key) {
          alreadySeen = true;
          break;
        }
      }
      if (alreadySeen) continue;
      seenQuestions.push(key);

      cards.push({
        question: built.question,
        answer: built.answer,
        difficulty: pickDifficulty(built.answer),
      });
      break; // one card per sentence
    }
  }

  return cards;
}

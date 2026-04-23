# FLASHMASTER — Full Project Code with Explanations

> **Important:** All this code is **already in your project**. You don't need to paste anything into VS Code — the files are already sitting at `server/src/...` and `client/src/...`. This doc is for **reference while recording the video** — print it, keep it on your phone, or on a second monitor.
>
> For each file: **full code** on top, **explanation to say out loud** below. Open the file in VS Code, read the explanation into your mic while the viewer sees the code on screen.

---

## FILE 1 — `server/src/index.js`

**Location in VS Code:** `server` → `src` → `index.js`

```js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import materialsRouter from "./routes/materials.js";
import flashcardsRouter from "./routes/flashcards.js";
import plansRouter from "./routes/plans.js";
import progressRouter from "./routes/progress.js";
import notificationsRouter from "./routes/notifications.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];
if (process.env.CLIENT_ORIGIN) {
  process.env.CLIENT_ORIGIN.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((origin) => allowedOrigins.push(origin));
}
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/flashcards", flashcardsRouter);
app.use("/api/plans", plansRouter);
app.use("/api/progress", progressRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/admin", adminRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.url });
});

app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  const status = err.status || 400;
  res.status(status).json({ error: err.message || "Internal server error" });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ FLASHMASTER server listening on http://localhost:${PORT}`);
  });
};

start();
```

**Say:**
> "This is the backend entry point. I import Express, CORS, my database connection, and all eight route files. The CORS middleware whitelists my local React dev server on port 5173 and any production URL set through an environment variable. Then I mount every router under `/api`, add a 404 handler and a JSON error handler, and the `start` function connects to MongoDB first, *then* starts listening. So the server never accepts a request before the database is ready."

---

## FILE 2 — `server/src/config/db.js`

**Location in VS Code:** `server` → `src` → `config` → `db.js`

```js
import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set in environment");
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
```

**Say:**
> "This is the database connection. It reads the Mongo connection string from the environment variables and calls `mongoose.connect`. I keep the URI in a `.env` file which is gitignored, so my production credentials never land on GitHub."

---

## FILE 3 — `server/src/models/User.js`

**Location in VS Code:** `server` → `src` → `models` → `User.js`

```js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Invalid email format"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User = mongoose.model("User", userSchema);
```

**Say:**
> "This is my User model defined with Mongoose. The name field is required and length-limited. Email is unique, automatically lowercased, and regex-validated. The passwordHash has `select: false` which means Mongoose won't load it in normal queries — I only pull it in when I explicitly need it during login. The role is an enum, so it can only be 'student' or 'admin'. The `toJSON` transform automatically strips the password hash from any response — an extra safety net so it can never leak to the client."

---

## FILE 4 — `server/src/middleware/auth.js`

**Location in VS Code:** `server` → `src` → `middleware` → `auth.js`

```js
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing or malformed Authorization header" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (req.user.role !== role) {
    return res.status(403).json({ error: `Requires '${role}' role` });
  }
  next();
};
```

**Say:**
> "This file has two middlewares. `requireAuth` reads the Authorization header, expects the format `Bearer <token>`, and uses `jwt.verify` to validate the token against my secret key. If invalid or expired, it returns 401. On success I fetch the user from the database so I always have the fresh role — important, because if an admin got demoted, the old token would otherwise still let them through.
>
> `requireRole` is a higher-order function. Calling `requireRole('admin')` returns a middleware that only lets admins through, otherwise returns 403. This is how my role-based access control is enforced on the backend."

---

## FILE 5 — `server/src/routes/auth.js`

**Location in VS Code:** `server` → `src` → `routes` → `auth.js`

```js
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const signToken = (user) =>
  jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ name, email, passwordHash, role: "student" });
    const token = signToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already in use" });
    }
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
```

**Say:**
> "This file has my signup, login, and `/me` endpoints. The `signToken` helper at the top signs a JWT with the user's ID and role, using my secret key, and sets a 7-day expiry.
>
> **Signup** validates the password is at least 6 characters, hashes it with bcrypt, and creates the user with role forced to 'student'. I never trust a role value from the request body — that prevents someone from POSTing `role: admin` to escalate themselves. If the email's a duplicate, Mongoose throws error code 11000 and I respond with 409 Conflict.
>
> **Login** looks up the user by lowercased email, explicitly selects the hidden password hash, and uses `bcrypt.compare` to verify it. I use the same 401 message whether the email or password is wrong — this prevents user-enumeration attacks where someone could probe which emails are registered.
>
> **`/me`** uses the `requireAuth` middleware and returns the currently logged-in user — the React frontend uses this to rehydrate the session when the app starts."

---

## FILE 6 — `server/src/middleware/upload.js`

**Location in VS Code:** `server` → `src` → `middleware` → `upload.js`

```js
import multer from "multer";

const ALLOWED_MIME = new Set([
  "application/pdf",
  "text/plain",
]);

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
  cb(null, true);
};

export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
```

**Say:**
> "This is my Multer configuration for file uploads. I use memory storage, so uploaded files live only in RAM — they never touch the disk. This keeps the server stateless and works fine on ephemeral hosting like Render. The file filter only allows PDFs and plain text. And I cap uploads at 5 megabytes so students can't dump huge files."

---

## FILE 7 — `server/src/routes/materials.js` (CRUD + Upload)

**Location in VS Code:** `server` → `src` → `routes` → `materials.js`

```js
import { Router } from "express";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { Flashcard } from "../models/Flashcard.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { generateFlashcards } from "../services/flashcardGenerator.js";
import { generateFlashcardsWithOllama } from "../services/ollamaGenerator.js";
import { PDFParse } from "pdf-parse";

const generateCards = async (text) => {
  const ai = await generateFlashcardsWithOllama(text);
  if (ai && ai.length > 0) return { cards: ai, source: "ollama" };
  return { cards: generateFlashcards(text, { max: 20 }), source: "heuristic" };
};

const router = Router();
router.use(requireAuth);

// CREATE (text-only)
router.post("/", async (req, res) => {
  try {
    const material = await StudyMaterial.create({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPLOAD
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file field is required" });
    const { title, subject, topic = "" } = req.body;
    if (!title || !subject) {
      return res.status(400).json({ error: "title and subject are required" });
    }

    const buffer = req.file.buffer;
    let content = "";
    if (req.file.mimetype === "application/pdf") {
      const parser = new PDFParse({ data: buffer });
      try {
        const parsed = await parser.getText();
        content = (parsed.text || "").trim();
      } finally {
        await parser.destroy();
      }
    } else if (req.file.mimetype === "text/plain") {
      content = buffer.toString("utf8").trim();
    }

    if (!content) content = "(no extractable text found in uploaded file)";

    const material = await StudyMaterial.create({
      userId: req.user._id,
      title, subject, topic, content,
      sourceFile: req.file.originalname,
    });

    const { cards: generated, source } = await generateCards(content);
    const cards = await Flashcard.insertMany(
      generated.map((c) => ({
        ...c,
        userId: req.user._id,
        materialId: material._id,
        subject, topic,
      }))
    );

    res.status(201).json({
      material,
      flashcardsCreated: cards.length,
      generator: source,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// LIST
router.get("/", async (req, res) => {
  const { subject, topic } = req.query;
  const filter = { userId: req.user._id };
  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;
  const materials = await StudyMaterial.find(filter).sort({ createdAt: -1 });
  res.json(materials);
});

// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const material = await StudyMaterial.findOne({ _id: req.params.id, userId: req.user._id });
    if (!material) return res.status(404).json({ error: "Not found" });
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// UPDATE
router.patch("/:id", async (req, res) => {
  try {
    const material = await StudyMaterial.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!material) return res.status(404).json({ error: "Not found" });
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const material = await StudyMaterial.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!material) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true, id: material._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

export default router;
```

**Say:**
> "This is my materials router — full CRUD plus the upload pipeline. At the top I do `router.use(requireAuth)`, so every route in this file needs a valid JWT.
>
> **Create** uses `StudyMaterial.create` with the current user's ID forcibly attached. **List** filters by userId plus optional subject and topic. **Read one**, **update**, and **delete** all use the same `{_id, userId}` filter pattern, so users can only touch their own materials.
>
> The **upload** endpoint is the most interesting. Multer middleware parses the multipart form, pdf-parse extracts the text from the PDF buffer, and `generateCards` tries Ollama first and falls back to my heuristic generator. Then `insertMany` bulk-inserts all the generated flashcards linked to the material."

---

## FILE 8 — `server/src/routes/admin.js` (Role-based routes)

**Location in VS Code:** `server` → `src` → `routes` → `admin.js`

```js
import { Router } from "express";
import { User } from "../models/User.js";
import { StudyMaterial } from "../models/StudyMaterial.js";
import { Flashcard } from "../models/Flashcard.js";
import { StudyPlan } from "../models/StudyPlan.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

router.get("/materials", async (req, res) => {
  const materials = await StudyMaterial.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name email");
  res.json(materials);
});

router.delete("/materials/:id", async (req, res) => {
  try {
    const material = await StudyMaterial.findByIdAndDelete(req.params.id);
    if (!material) return res.status(404).json({ error: "Not found" });
    await Flashcard.deleteMany({ materialId: material._id });
    res.json({ deleted: true, id: material._id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "student"].includes(role)) {
      return res.status(400).json({ error: "role must be 'admin' or 'student'" });
    }
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: "You cannot change your own role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/stats", async (req, res) => {
  const [users, students, admins, materials, flashcards, plans] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "admin" }),
    StudyMaterial.countDocuments(),
    Flashcard.countDocuments(),
    StudyPlan.countDocuments(),
  ]);

  const hardCards = await Flashcard.countDocuments({ difficulty: "hard" });
  const recentMaterials = await StudyMaterial.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("userId", "name email");

  res.json({
    users: { total: users, students, admins },
    materials,
    flashcards: { total: flashcards, hard: hardCards },
    plans,
    recentMaterials,
  });
});

export default router;
```

**Say:**
> "This is my admin router. Look at line 14 — `router.use(requireAuth, requireRole('admin'))`. That chains both middlewares to every route in this file, so to reach any admin endpoint you need a valid JWT **and** the admin role.
>
> `GET /materials` returns every user's uploads with the owner info joined in using Mongoose's `.populate()` — the equivalent of a SQL join. `DELETE /materials/:id` removes any upload and cascades the deletion to the associated flashcards. `PATCH /users/:id/role` promotes or demotes a user, with a guardrail that stops admins from demoting themselves — prevents accidental lockout. And `GET /stats` runs parallel `countDocuments` queries for the reports tab."

---

## FILE 9 — `server/src/services/flashcardGenerator.js`

**Location in VS Code:** `server` → `src` → `services` → `flashcardGenerator.js`

```js
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
  text.replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9(])/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

const cleanSubject = (s) =>
  s.replace(/^[^A-Za-z0-9]+/, "").replace(/[^A-Za-z0-9]+$/, "").trim();

const pickDifficulty = (answer) => {
  const len = answer.length;
  if (len < 60) return "easy";
  if (len < 150) return "medium";
  return "hard";
};

const patterns = [
  { regex: /^(.+?)\s+is\s+(.+?)[.!?]?$/i,
    build: ([, subject, rest]) => ({ question: `What is ${cleanSubject(subject)}?`, answer: rest.trim() }) },
  { regex: /^(.+?)\s+are\s+(.+?)[.!?]?$/i,
    build: ([, subject, rest]) => ({ question: `What are ${cleanSubject(subject)}?`, answer: rest.trim() }) },
  { regex: /^(.+?)\s+means\s+(.+?)[.!?]?$/i,
    build: ([, subject, rest]) => ({ question: `What does ${cleanSubject(subject)} mean?`, answer: rest.trim() }) },
  { regex: /^([A-Z][^:]{1,50}):\s*(.+?)[.!?]?$/,
    build: ([, subject, rest]) => ({ question: `What is ${cleanSubject(subject)}?`, answer: rest.trim() }) },
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
      if (answer.length < MIN_ANSWER_LEN || answer.length > MAX_ANSWER_LEN) continue;
      const key = question.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      cards.push({ question, answer, difficulty: pickDifficulty(answer) });
      break;
    }
  }
  return cards;
};
```

**Say:**
> "This is my heuristic flashcard generator. It's a pure function — no database, no HTTP — which is why it lives in `services/` separate from the routes. That makes it easy to test in isolation.
>
> It matches four sentence patterns: 'X is Y', 'X are Y', 'X means Y', and 'X colon Y' for heading-style lists. For each match, it builds a question like 'What is X?' with the rest of the sentence as the answer. The main function splits the text into sentences, tries each pattern, filters junk with length checks, deduplicates questions, and picks a difficulty based on answer length — shorter answers are easy, longer ones are hard. Capped at 20 cards per upload."

---

## FILE 10 — `client/src/lib/api.js`

**Location in VS Code:** `client` → `src` → `lib` → `api.js`

```js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getToken = () => localStorage.getItem("flashmaster_token");

export const setToken = (token) => {
  if (token) localStorage.setItem("flashmaster_token", token);
  else localStorage.removeItem("flashmaster_token");
};

async function request(path, { method = "GET", body, headers = {}, isFormData = false } = {}) {
  const token = getToken();
  const finalHeaders = { ...headers };
  if (!isFormData && body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: finalHeaders,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? safeParse(text) : null;

  if (!res.ok) {
    const message = data?.error || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function safeParse(text) {
  try { return JSON.parse(text); } catch { return text; }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
  upload: (path, formData) => request(path, { method: "POST", body: formData, isFormData: true }),
};
```

**Say:**
> "On the frontend, this is my fetch wrapper. The key line is right here — if there's a token in localStorage, it automatically attaches `Authorization: Bearer <token>` to every outgoing request. So my React components never have to think about the token. They just call `api.get('/api/materials')` and authentication Just Works."

---

## FILE 11 — `client/src/lib/auth.jsx`

**Location in VS Code:** `client` → `src` → `lib` → `auth.jsx`

```jsx
import { createContext, useContext, useEffect, useState } from "react";
import { api, setToken } from "./api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("flashmaster_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api.get("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { user, token } = await api.post("/api/auth/login", { email, password });
    setToken(token);
    setUser(user);
    return user;
  };

  const signup = async (payload) => {
    const { user, token } = await api.post("/api/auth/signup", payload);
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};
```

**Say:**
> "This is my React auth context. When the app first loads, it checks localStorage for a token, and if one exists, calls `/api/auth/me` to rehydrate the session — essentially asking the server 'I have this token, who am I?'. If it's invalid, we clear it and log out.
>
> The `login` and `signup` functions call the corresponding API, save the returned token, and set the user in context. Any component anywhere in the tree can call `useAuth()` to access the user and these functions. That's what keeps the navbar, the protected routes, and the role checks all in sync."

---

## FILE 12 — `client/src/components/ProtectedRoute.jsx`

**Location in VS Code:** `client` → `src` → `components` → `ProtectedRoute.jsx`

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-slate-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}
```

**Say:**
> "This is the route guard. If authentication is still loading, it shows a spinner. If there's no logged-in user, it redirects to the login page. And if a required role is specified but the user's role doesn't match, it sends them back to the dashboard. I wrap the admin page as `<ProtectedRoute role='admin'><Admin /></ProtectedRoute>` — so non-admins bounced away. This is the frontend half of my role-based access control. The backend enforces the same thing independently."

---

## Recap — 12 files covered

| # | File | Topic |
|---|---|---|
| 1 | `server/src/index.js` | Backend entry + CORS + router mounting |
| 2 | `server/src/config/db.js` | MongoDB connection |
| 3 | `server/src/models/User.js` | Mongoose schema + role enum + hiding hash |
| 4 | `server/src/middleware/auth.js` | JWT verification + `requireRole` |
| 5 | `server/src/routes/auth.js` | Signup (bcrypt) + Login (JWT issue) |
| 6 | `server/src/middleware/upload.js` | Multer memory storage + file-type filter |
| 7 | `server/src/routes/materials.js` | Full CRUD + PDF upload pipeline |
| 8 | `server/src/routes/admin.js` | Role-based routes + `populate` |
| 9 | `server/src/services/flashcardGenerator.js` | Service layer, pure function |
| 10 | `client/src/lib/api.js` | Fetch wrapper with JWT auto-attach |
| 11 | `client/src/lib/auth.jsx` | React auth context |
| 12 | `client/src/components/ProtectedRoute.jsx` | Frontend route guard |

## How to use this in your video

1. Open VS Code to `FLASHCARDS/`.
2. For each file in order: **open the file** in VS Code → **read the matching `Say:` block** into your mic.
3. That's it. You don't paste anything — the files are already there.

If you really want to retype a file for effect, copy the code block above and paste into VS Code. But it'll be identical to what's already sitting on disk.

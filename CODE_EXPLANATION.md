# FLASHMASTER — Code Explanation (Viva Voce Guide)

> This doc is your cheat sheet for when your sir says *"explain the code"* or *"show me how X works"*. Every section has three parts:
>
> - **Sir asks:** the likely question
> - **The code:** the actual file(s) to point at on screen
> - **In plain English:** line-by-line or chunk-by-chunk breakdown — what to say out loud
> - **If he asks more:** likely follow-up questions with short answers

Keep this open on a second monitor (or print it). Read the **"In plain English"** blocks naturally — they're written to be *spoken*, not recited robotically.

---

## TABLE OF CONTENTS

1. [Overall architecture (open with this)](#1-overall-architecture)
2. [Signup — how a new user is created](#2-signup--how-a-new-user-is-created)
3. [Login — how a user gets authenticated](#3-login--how-a-user-gets-authenticated)
4. [JWT verification — how protected routes stay safe](#4-jwt-verification--how-protected-routes-stay-safe)
5. [Role-based access control — how admin-only routes work](#5-role-based-access-control--how-admin-only-routes-work)
6. [Mongoose schema — the User model](#6-mongoose-schema--the-user-model)
7. [CRUD endpoints — using materials as the example](#7-crud-endpoints--using-materials-as-the-example)
8. [File upload pipeline — PDF → text → flashcards](#8-file-upload-pipeline--pdf--text--flashcards)
9. [Frontend auth — how the token flows through React](#9-frontend-auth--how-the-token-flows-through-react)
10. [MVC mapping — one-sentence summary sir can hold onto](#10-mvc-mapping)
11. [Gotcha questions sir might ask](#11-gotcha-questions-sir-might-ask)

---

## 1. Overall architecture

**Open with this** *before* he asks anything specific. Sets the frame.

**[SAY]**
> "The project is a classic three-tier MERN application. The **React frontend** talks to the **Express backend** over HTTP with JSON. Every protected request carries a JSON Web Token in the Authorization header. The backend uses **Mongoose** to talk to **MongoDB**. For uploaded PDFs, **Multer** keeps the file bytes in memory, **pdf-parse** extracts the text, and a **flashcard generator service** converts the text into question-answer cards. There's also an optional **Ollama** local LLM path for better AI-generated cards.
>
> The app follows the **MVC pattern**. Models are the Mongoose schemas. Controllers are the route files that handle requests and responses. The View layer is the React frontend. We also extract the heavier logic — flashcard generation, plan generation, the Ollama integration — into **services** so they can be tested and reused independently of Express."

Show the **architecture diagram** from the report here.

---

## 2. Signup — how a new user is created

**Sir asks:** *"Show me how a user signs up."*

**Open:** `server/src/routes/auth.js` — show the `POST /signup` handler (lines ~25–48).

**The code:**

```js
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Hash the password with the configured cost factor.
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
```

**In plain English:**
> "When the frontend hits POST `/api/auth/signup`, we pull `name`, `email`, and `password` out of the request body. First we validate that the password is at least 6 characters — anything weaker and we reject the request right there with a 400.
>
> Then we hash the password using **bcrypt**. I never store the raw password — bcrypt runs the password through a one-way hash with a random salt, so even if someone got the database they couldn't recover the original password. The cost factor comes from an environment variable, default 10 — that's how many rounds of hashing bcrypt performs.
>
> We create the User document with the hashed password and **force the role to 'student'** — I deliberately ignore any `role` field in the request body. If I took it from the user's input, someone could POST `role: admin` during signup and escalate themselves. Admins are only promoted by an existing admin.
>
> Finally we issue a **JSON Web Token** with `signToken` — it's signed with a secret key the server holds, and the payload contains the user's ID and role. We send back the user object and the token.
>
> If MongoDB throws error code **11000**, that's the duplicate-key error — it means someone already signed up with that email, and we respond with HTTP 409 Conflict."

**If he asks more:**
- *"Why bcrypt and not just SHA-256 or MD5?"* → "Because bcrypt is deliberately **slow** and **salted**. Fast hashes like MD5 or SHA-256 were designed for speed, which is bad for passwords — attackers can brute-force billions of guesses per second. Bcrypt tunes that slowness with the cost factor, and each password gets a unique salt so two users with the same password still get different hashes."
- *"What's a JWT?"* → "It's three base64-encoded parts — header, payload, signature — separated by dots. The payload holds user info. The signature is created with the server's secret key. If anyone tampers with the payload the signature won't match, so the server rejects it. It's stateless — I don't need to store sessions in the DB."
- *"What does signToken do?"* → Point at lines 14-19: "It calls `jwt.sign` with a payload containing `userId` and `role`, signs it with the secret from `.env`, and sets it to expire in 7 days."

---

## 3. Login — how a user gets authenticated

**Sir asks:** *"Show me the login flow."*

**Open:** Same file, `POST /login` handler (lines ~52–75).

**The code:**

```js
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
```

**In plain English:**
> "Login takes the email and password and looks up the user by email. Notice the `.select('+passwordHash')` — in my User schema, `passwordHash` is set to `select: false`, meaning it's hidden by default. I only pull it in when I explicitly need it, which is here.
>
> If no user is found, I respond with **401 Invalid credentials**. And I use the exact same 401 message whether the email is wrong or the password is wrong — this prevents user enumeration attacks, where an attacker could figure out which emails are registered by looking at different error messages.
>
> Then `bcrypt.compare` hashes the provided password with the same salt that was used originally and compares the result to the stored hash. If it matches, we sign a new token and return the user plus token. If not, same 401 response.
>
> The frontend stores the token in `localStorage` and attaches it to every future request."

**If he asks more:**
- *"Why the same error message for wrong email and wrong password?"* → "Security — prevents user enumeration. Attackers shouldn't be able to tell which emails exist by probing the login endpoint."
- *"Why do you store the hash, not encrypt the password?"* → "Passwords should be **one-way hashed**, never encrypted. Encryption implies a key that could be used to decrypt — which is a risk. Hashing is one-way, so even with full database access nobody can reverse it."
- *"What's inside the JWT?"* → Show the `signToken` helper: userId + role + exp.

---

## 4. JWT verification — how protected routes stay safe

**Sir asks:** *"Show me how you protect a route."*

**Open:** `server/src/middleware/auth.js`.

**The code:**

```js
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
```

**In plain English:**
> "This is **middleware** — it runs before the route handler. Every protected route uses it.
>
> It reads the `Authorization` header, expects the format `Bearer <token>`. If the header is missing or malformed, we reject with **401 Unauthorized**.
>
> Then `jwt.verify` checks the signature against our secret key. If someone modified the token, the signature won't match and `verify` throws, which we catch and also return 401.
>
> On success, the decoded payload gives us the `userId`. We then fetch the user from the database — this is important because the user's role might have changed since the token was issued. For example, if an admin got demoted, we catch that right here.
>
> We attach the user to `req.user` so downstream route handlers can use it. Then we call `next()` to pass control to the actual route handler."

**If he asks more:**
- *"Why look up the user every request — why not just trust the JWT?"* → "Because the JWT is immutable once issued. If I only trusted the token, a demoted admin would still have admin access until the token expired. Re-loading the user keeps the role fresh."
- *"Where does the JWT secret come from?"* → "From the `.env` file, which is gitignored. In production it's set as an environment variable on the hosting platform."
- *"What's the difference between 401 and 403?"* → "401 means 'you're not authenticated' (no valid token). 403 means 'you're authenticated but not allowed' (wrong role)."

---

## 5. Role-based access control — how admin-only routes work

**Sir asks:** *"How does the admin-only access work?"*

**Open:** `server/src/middleware/auth.js` (bottom) **and** `server/src/routes/admin.js` (top).

**Middleware code:**

```js
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

**Admin router code:**

```js
const router = Router();
router.use(requireAuth, requireRole("admin"));
```

**In plain English:**
> "`requireRole` is a higher-order function — it takes a role name and returns a middleware function. So `requireRole('admin')` gives me a middleware that only lets admins through.
>
> In the admin router, I call `router.use(requireAuth, requireRole('admin'))`. That applies **both** middlewares to every single route inside this file. So to reach any admin endpoint, you first need a valid JWT (401 if not), and then the user's role must be 'admin' (403 if not).
>
> This is the backend half. On the frontend, the Admin link in the navbar is hidden for non-admin users, and the `/admin` route is wrapped in a `<ProtectedRoute role='admin'>` component that redirects non-admins to the dashboard. **Defence in depth** — even if someone bypassed the frontend check, the backend would still reject them."

**If he asks more:**
- *"Why is the role check on the backend if the frontend already hides it?"* → "The frontend can be bypassed. Anyone can open DevTools and edit the React state, or craft a direct HTTP request to `/api/admin/stats`. The frontend check is only for user experience. The backend check is the real security."
- *"Can a student promote themselves to admin?"* → "No — the signup route forces `role: 'student'` regardless of what's in the body. Role changes only happen through `PATCH /api/admin/users/:id/role`, which itself requires admin. And an admin can't demote themselves — I added a guardrail for that."

---

## 6. Mongoose schema — the User model

**Sir asks:** *"Show me your schemas."*

**Open:** `server/src/models/User.js`.

**The code:**

```js
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Invalid email format"],
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
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
```

**In plain English:**
> "Mongoose schemas define the shape and validation rules for a MongoDB collection.
>
> `name` is required, trimmed, and length-limited.
>
> `email` is **unique** — MongoDB enforces this with an index — and it's automatically lowercased, so the same email in different cases can't create duplicates. The `match` regex rejects obviously malformed emails.
>
> `passwordHash` is required and has `select: false` — so if I do `User.find()` it doesn't come back in the result. I have to explicitly ask for it with `.select('+passwordHash')`, like we saw in the login handler. This prevents accidentally leaking it in an API response.
>
> `role` is an enum — it can only be `'student'` or `'admin'`. Default is `'student'`.
>
> `timestamps: true` gives me `createdAt` and `updatedAt` for free.
>
> The `toJSON` transform runs automatically whenever Mongoose serialises a user to JSON, stripping out `passwordHash` and the internal `__v` version key. Belt-and-braces protection — even if I accidentally forgot to filter it out, this transform makes sure the password hash never leaves the server."

**If he asks more:**
- *"What's the difference between `select: false` and the `toJSON` transform?"* → "`select: false` stops Mongoose from *loading* the field from MongoDB. The `toJSON` transform stops it from being *output* even if it did get loaded. Two independent safety nets."
- *"How would you do this in SQL?"* → "In SQL you'd write a CREATE TABLE statement with NOT NULL constraints, a UNIQUE constraint on email, an ENUM or CHECK constraint on role, and a trigger for the timestamps. Mongoose does all of that declaratively in JavaScript."

---

## 7. CRUD endpoints — using materials as the example

**Sir asks:** *"Show me your CRUD operations."* (or *"show me create, read, update, delete"*)

**Open:** `server/src/routes/materials.js`.

**The code** (pick the 4 handlers and skip the upload/generate ones for this walk):

```js
// CREATE
router.post("/", async (req, res) => {
  const material = await StudyMaterial.create({ ...req.body, userId: req.user._id });
  res.status(201).json(material);
});

// READ (list) — only the current user's, with optional filters
router.get("/", async (req, res) => {
  const { subject, topic } = req.query;
  const filter = { userId: req.user._id };
  if (subject) filter.subject = subject;
  if (topic) filter.topic = topic;
  const materials = await StudyMaterial.find(filter).sort({ createdAt: -1 });
  res.json(materials);
});

// READ (one) — ownership enforced via filter
router.get("/:id", async (req, res) => {
  const material = await StudyMaterial.findOne({ _id: req.params.id, userId: req.user._id });
  if (!material) return res.status(404).json({ error: "Not found" });
  res.json(material);
});

// UPDATE
router.patch("/:id", async (req, res) => {
  const material = await StudyMaterial.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!material) return res.status(404).json({ error: "Not found" });
  res.json(material);
});

// DELETE
router.delete("/:id", async (req, res) => {
  const material = await StudyMaterial.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!material) return res.status(404).json({ error: "Not found" });
  res.json({ deleted: true, id: material._id });
});
```

**In plain English:**
> "Every one of these routes is protected — at the top of the file I have `router.use(requireAuth)` so every route needs a valid JWT before it even reaches these handlers.
>
> **CREATE** uses `StudyMaterial.create`. I spread the request body and **forcibly override** `userId` with `req.user._id` — so even if someone posts a different userId in the body, it gets overwritten. The material always belongs to the logged-in user.
>
> **READ list** — `StudyMaterial.find` with a filter. I always include `userId: req.user._id` so users can only see their own materials. Optional query parameters `?subject=` and `?topic=` add extra filters.
>
> **READ one** — `findOne` with both the ID and the userId. If the material doesn't exist **or** it doesn't belong to the current user, we return 404. Note I don't return 403 — returning 404 here is actually better security, because 403 would confirm the material exists; 404 keeps that private.
>
> **UPDATE** — `findOneAndUpdate` with the same `{_id, userId}` filter. `{ new: true }` tells Mongoose to return the updated document. `{ runValidators: true }` re-runs the schema validation on the update payload.
>
> **DELETE** — `findOneAndDelete` with the same scoping. Returns 404 if not found.
>
> Flashcards and StudyPlans follow the exact same pattern — every resource is scoped to the owner."

**If he asks more:**
- *"What if two users tried to update the same record?"* → "Can't happen in our model, because ownership is in the filter. But if it could, the last write wins. For true concurrent safety you'd add an `updatedAt` version check (optimistic concurrency)."
- *"Why PATCH and not PUT?"* → "PATCH is for partial updates — I only need to send the fields I want to change. PUT semantically replaces the entire resource. PATCH matches the UI better."

---

## 8. File upload pipeline — PDF → text → flashcards

**Sir asks:** *"Show me how file upload works."*

**Open:** `server/src/middleware/upload.js` **and** `server/src/routes/materials.js` — the `/upload` handler.

**Multer config:**

```js
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});
```

**The upload route:**

```js
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "file field is required" });
  const { title, subject, topic = "" } = req.body;

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

  const material = await StudyMaterial.create({
    userId: req.user._id,
    title, subject, topic, content,
    sourceFile: req.file.originalname,
  });

  const { cards: generated, source } = await generateCards(content);
  const cards = await Flashcard.insertMany(
    generated.map((c) => ({
      ...c, userId: req.user._id, materialId: material._id, subject, topic,
    }))
  );

  res.status(201).json({
    material, flashcardsCreated: cards.length, generator: source,
  });
});
```

**In plain English:**
> "This is the most complex endpoint in the app. Let me walk through it step by step.
>
> First, **Multer**. I configured it with `memoryStorage` — so uploaded files live in RAM only, never touching disk. This keeps it stateless and works on ephemeral hosting like Render where the filesystem is read-only between requests. I limit file size to **5 megabytes** and the file filter only allows PDF and plain text MIME types. Anything else gets rejected before it ever hits my route handler.
>
> In the route, `upload.single('file')` is Multer middleware that parses the multipart form data and puts the file on `req.file`.
>
> Then I check the MIME type. If it's a **PDF**, I pass the buffer to `pdf-parse` — that's a library that extracts text from PDF files without any external dependencies. I call `getText()`, grab the extracted string, and properly destroy the parser in a `finally` block to release memory.
>
> If it's **plain text**, I just decode the buffer as UTF-8.
>
> Then I create a **StudyMaterial** document with the extracted content.
>
> Next, I call `generateCards(content)` — that's my wrapper that tries the Ollama local LLM first, and falls back to the heuristic pattern-matching generator if Ollama isn't running. The heuristic looks for patterns like 'X is Y' and turns them into 'What is X? → Y' cards.
>
> Finally, I bulk-insert all the generated flashcards using `insertMany`, attaching the userId and materialId to each one, and return a response with the material, how many cards were generated, and which generator was used."

**If he asks more:**
- *"Why memory storage and not disk?"* → "Stateless — no files to manage, no cleanup to do, no worries about ephemeral filesystems on hosting platforms. The text is what matters, and once we've extracted it the bytes can go."
- *"What if the PDF has no text (scanned image)?"* → "`pdf-parse` would return an empty string. I fall back to a placeholder text so the material still gets created. Real OCR would need a library like Tesseract, which is in my TODO for a future phase."
- *"What's Ollama?"* → "A local LLM runtime — runs models like Llama or Mistral on my own machine, no paid API. If it's running I get better quality cards; if not, my heuristic fallback still works."

---

## 9. Frontend auth — how the token flows through React

**Sir asks:** *"How does the frontend know you're logged in?"*

**Open:** `client/src/lib/auth.jsx`, `client/src/lib/api.js`, `client/src/components/ProtectedRoute.jsx`.

**AuthProvider (auth.jsx):**

```jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("flashmaster_token");
    if (!token) { setLoading(false); return; }
    api.get("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => { setToken(null); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { user, token } = await api.post("/api/auth/login", { email, password });
    setToken(token);
    setUser(user);
    return user;
  };
  // signup and logout work the same way
  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**api.js (the fetch wrapper):**

```js
async function request(path, { method = "GET", body, headers = {}, isFormData = false } = {}) {
  const token = getToken();
  const finalHeaders = { ...headers };
  if (!isFormData && body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  // ... fetch, parse, throw on error
}
```

**ProtectedRoute.jsx:**

```jsx
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />;
  return children;
}
```

**In plain English:**
> "There are three pieces working together.
>
> **AuthProvider** is a React Context that holds the current user. When the app first loads, it checks localStorage for a saved token. If there is one, it calls `/api/auth/me` to rehydrate the session — essentially saying 'I have this token, who am I?'. If the token is invalid or expired, the server returns 401, we clear the token, and the user is considered logged out.
>
> `login()` calls the login API, saves the returned token to localStorage via `setToken`, and sets the user in context. `logout()` clears both.
>
> **api.js** is a tiny fetch wrapper. The key line is this one — if there's a token in localStorage, it attaches `Authorization: Bearer <token>` to every outgoing request automatically. So my page components never have to think about the token. They just call `api.get('/api/materials')` and authentication Just Works.
>
> **ProtectedRoute** is a component that wraps protected pages. It reads the context and redirects to `/login` if there's no user, or to `/dashboard` if the user doesn't have the required role. For example, the Admin page is wrapped as `<ProtectedRoute role='admin'><Admin /></ProtectedRoute>`."

**If he asks more:**
- *"Why localStorage and not cookies?"* → "Simpler for a single-page app. Cookies would give me CSRF protection for free but need more backend config. For a class project, localStorage + JWT in Authorization header is the standard approach and is easier to reason about."
- *"What's the downside of localStorage?"* → "Any JavaScript running on the page can read it — so if I had an XSS vulnerability, the token could be stolen. Cookies with `httpOnly` would be safer against XSS but vulnerable to CSRF instead. Different tradeoffs."
- *"What's useContext doing?"* → "It lets any component anywhere in the component tree access the user without passing it down through props. Think of it as a shared state bucket."

---

## 10. MVC mapping

**Sir asks:** *"Explain the MVC pattern in your project."*

**[SAY]** (one breath, don't overcomplicate):
> "**Model** is Mongoose — the schemas in `server/src/models/`: User, StudyMaterial, Flashcard, StudyPlan, Progress. They define the data and validation.
>
> **Controller** is the routes plus services — the files in `server/src/routes/` handle HTTP requests, validate input, and coordinate the response. The heavier logic — flashcard generation, plan generation, Ollama integration — lives in `server/src/services/` so it's testable in isolation.
>
> **View** in a REST API context is the route definitions themselves, because they describe what the API exposes. On the user-facing side, the view is the **React frontend** in `client/src/` — the pages, components, and styling that render what the user sees."

Show the **MVC diagram** from the report here.

---

## 11. Gotcha questions sir might ask

Quick answers, ready to fire:

- **"Why MongoDB, not MySQL?"** → "MongoDB is schemaless and stores JSON-like documents. My data is hierarchical — a material has flashcards, a user has plans. That fits documents better than rigid tables. Plus it's a fast fit with JavaScript on both sides."
- **"What does `populate()` do?"** → "It's Mongoose's way of doing a join. When I `populate('userId', 'name email')`, Mongoose looks up the referenced user and replaces the ObjectId with the user's name and email in the response."
- **"What's CORS?"** → "Cross-Origin Resource Sharing. Browsers block JavaScript on one origin from making requests to another unless the target explicitly allows it. My backend uses the `cors` middleware to whitelist `localhost:5173` (the Vite dev server) and my production Vercel origin."
- **"Why `async/await` everywhere?"** → "Because MongoDB operations are asynchronous — they return Promises. `async/await` lets me write that flow as if it were synchronous, which is way more readable than chained `.then()` calls."
- **"What's `req.body`?"** → "The parsed JSON body of the incoming request. The `express.json()` middleware reads the raw bytes and parses them into a JavaScript object."
- **"What's middleware?"** → "A function that runs between the incoming request and the route handler. Think of it like an airport security checkpoint — every request passes through it. `requireAuth`, `requireRole`, Multer, and `express.json()` are all middleware."
- **"Why Vite and not Create React App?"** → "CRA is deprecated. Vite is the current standard — it's faster, uses native ES modules in dev, and is what the React docs now recommend."
- **"What's Tailwind?"** → "A utility-first CSS framework. Instead of writing custom CSS files, I compose styles directly in JSX using utility classes like `p-4` or `text-slate-700`. Faster iteration, consistent design system."
- **"Where does the `.env` file go?"** → "In `server/.env` for the backend — contains `MONGO_URI`, `JWT_SECRET`, `PORT`, etc. It's in `.gitignore` so secrets never hit GitHub. There's a committed `.env.example` template that lists the variables without their values."
- **"How would you deploy this?"** → "Backend to Render (free tier), frontend to Vercel. MongoDB to Atlas. Set the env vars on each platform. Add the production frontend URL to the CORS allow-list. I've already deployed a version — the screenshots in `ss/` show Atlas, Render, and Vercel dashboards."
- **"What's the difference between authentication and authorization?"** → "**Authentication** is 'who are you?' — the JWT answers that. **Authorization** is 'what are you allowed to do?' — my `requireRole` middleware answers that."

---

*End of guide. Good luck with the viva!*

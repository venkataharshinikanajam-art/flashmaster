# FLASHMASTER — Code Walkthrough Video Script

> A ~6-minute screencast where you share your screen showing **VS Code**, open each file below in order, and narrate the `[SAY]` block while the camera is on that file. Your project is already at `FLASHCARDS/`. No copy-pasting needed — just open files and read.

---

## Before you record

1. Open VS Code to the `FLASHCARDS/` folder.
2. Switch theme to **Dark+ (default dark)** (Ctrl+K Ctrl+T → Dark+).
3. Close every open file. Only the Explorer (file tree) should be visible.
4. Hide the integrated terminal (Ctrl+`` ` ``) and any other panels.
5. Font-size it up one notch (Ctrl +) so the code is legible on video.
6. Start your screen recorder.

---

## PART 1 — Project structure (0:00 – 0:30)

**[DO]** In VS Code, expand these folders in the Explorer so the tree looks like this:
```
FLASHCARDS/
├── client/
│   └── src/
│       ├── components/
│       ├── lib/
│       └── pages/
└── server/
    └── src/
        ├── config/
        ├── middleware/
        ├── models/
        ├── routes/
        └── services/
```

**[SAY]**
> "Here's the project structure in VS Code. It's split into two folders — `client/` is the React 19 frontend built with Vite, and `server/` is the Node.js and Express backend. Inside `server/src/` you can see the classic MVC layout — **models** for Mongoose schemas, **routes** for controllers, **middleware** for things like authentication, **services** for business logic like flashcard generation, and **config** for the database connection."

---

## PART 2 — Entry point: `server/src/index.js` (0:30 – 1:10)

**[DO]** Open `server/src/index.js`. Scroll to the top so the imports are visible.

**[SAY]**
> "This is the backend entry point. At the top, I import Express, CORS, my database connection, and all eight route files."

**[DO]** Scroll to the CORS block.

**[SAY]**
> "I configure CORS to allow my local React dev server on port 5173, plus any production URL I set through an environment variable — this lets the deployed Vercel frontend talk to the deployed Render backend."

**[DO]** Scroll to the `// Mount routers` section.

**[SAY]**
> "Here I mount every router under `/api` — auth, users, materials, flashcards, plans, progress, notifications, and admin. Below that is the 404 catch-all and a JSON error handler. And at the bottom, the `start` function connects to MongoDB first, *then* starts listening on the port — so the server never accepts requests before the database is ready."

---

## PART 3 — Model: `server/src/models/User.js` (1:10 – 1:45)

**[DO]** Open `server/src/models/User.js`.

**[SAY]**
> "This is my User model, defined with **Mongoose**. The `name` field is required and length-limited. The `email` is unique — MongoDB enforces that with an index — and automatically lowercased so duplicates can't sneak in through casing.
>
> The `passwordHash` field has `select: false`, which means Mongoose won't load it in normal queries. I have to explicitly ask for it only during login. And the `role` is an enum — it can only be `student` or `admin`, and defaults to `student`.
>
> Down in the options, `timestamps: true` gives me `createdAt` and `updatedAt` for free. And this `toJSON` transform automatically strips `passwordHash` out of any response — so even if I forgot to filter it, the password hash can never leak to the client."

---

## PART 4 — Authentication middleware: `server/src/middleware/auth.js` (1:45 – 2:30)

**[DO]** Open `server/src/middleware/auth.js`.

**[SAY]**
> "This file has two middlewares — `requireAuth` and `requireRole`.
>
> `requireAuth` reads the `Authorization` header, expects the format `Bearer <token>`, and uses `jwt.verify` to validate the signature against my secret key. If the token is missing, malformed, or expired, I respond with **401 Unauthorized**.
>
> On success, I fetch the user from the database — this is important, because if an admin got demoted, the old token would otherwise still give them admin access. By re-loading the user, I always have the fresh role.
>
> Then I attach the user to `req.user` and call `next()` to pass control to the actual route handler.
>
> `requireRole` is a higher-order function — it takes a role name and returns middleware. So `requireRole('admin')` gives me a middleware that only lets admins through. If the role doesn't match, it returns **403 Forbidden**. This is how my role-based access control works."

---

## PART 5 — Auth routes: `server/src/routes/auth.js` (2:30 – 3:30)

**[DO]** Open `server/src/routes/auth.js`. Scroll to the top.

**[SAY]**
> "This file has my signup, login, and `/me` endpoints. The `signToken` helper at the top signs a JWT with the user's ID and role, using the secret from my environment variables, and sets it to expire in 7 days."

**[DO]** Scroll to `POST /signup`.

**[SAY]**
> "For signup, I validate the password is at least 6 characters, then hash it using **bcrypt** with a configurable cost factor — I never store plain-text passwords. Notice I also **force the role to 'student'** regardless of what the user sent in the body — this prevents role-escalation attacks where someone might POST `role: admin` during signup.
>
> If the email already exists, Mongoose throws error code 11000, and I respond with **409 Conflict**."

**[DO]** Scroll to `POST /login`.

**[SAY]**
> "For login, I look up the user by lowercased email, explicitly selecting the password hash. If no user is found, I respond with **401 Invalid credentials** — and importantly I use the exact same message whether the email or the password is wrong. This prevents user-enumeration attacks, where someone could figure out which emails are registered by looking at different error messages.
>
> Then `bcrypt.compare` verifies the password against the stored hash. On success, I sign a new JWT and return it. The frontend stores that token and attaches it to every future request."

---

## PART 6 — CRUD + Upload: `server/src/routes/materials.js` (3:30 – 4:30)

**[DO]** Open `server/src/routes/materials.js`. Scroll to the top — show `router.use(requireAuth)`.

**[SAY]**
> "This is the materials router. Right at the top I do `router.use(requireAuth)` — so every single route in this file needs a valid JWT before it reaches any handler."

**[DO]** Scroll to the CRUD handlers.

**[SAY]**
> "Here's full CRUD. Create uses `StudyMaterial.create` with the current user's ID forcibly attached — so materials always belong to the logged-in user. The list endpoint filters by `userId: req.user._id` plus optional subject and topic filters. Read-one, update, and delete all use the same `{_id, userId}` filter pattern, so users can only touch their own materials. If the material doesn't exist or doesn't belong to them, I return 404."

**[DO]** Scroll to the `POST /upload` handler.

**[SAY]**
> "The upload endpoint is the most interesting one. It uses **Multer** middleware to parse the multipart form data. My Multer config uses memory storage, so uploaded files never touch disk — they live in RAM just long enough to extract the text.
>
> If the MIME type is PDF, I pass the buffer to **pdf-parse** and call `getText()` to extract the text content. If it's plain text, I decode the UTF-8 buffer directly.
>
> Then I create the StudyMaterial document with the extracted text, and call `generateCards` — which tries my local **Ollama** LLM first for higher-quality cards, and falls back to a heuristic pattern-matching generator if Ollama isn't running. I bulk-insert the generated flashcards and return the response with a count and the generator source."

---

## PART 7 — Role-gated admin: `server/src/routes/admin.js` (4:30 – 5:00)

**[DO]** Open `server/src/routes/admin.js`. Scroll to the top.

**[SAY]**
> "Here's the admin router. Notice line 14 — `router.use(requireAuth, requireRole('admin'))`. That applies both middlewares to every single route in this file. So to reach any admin endpoint, you first need a valid JWT, **and** your role must be 'admin'. Otherwise you get 401 or 403 respectively.
>
> Below that I have `GET /materials` which returns every user's uploads with the owner info populated using Mongoose's `.populate()` — that's the equivalent of a SQL join. `DELETE /materials/:id` lets an admin remove any upload and cascades the deletion to the associated flashcards. And `GET /stats` runs parallel `countDocuments` queries to return platform-wide statistics for the reports tab."

---

## PART 8 — Service layer: `server/src/services/flashcardGenerator.js` (5:00 – 5:40)

**[DO]** Open `server/src/services/flashcardGenerator.js`. Scroll to the patterns array.

**[SAY]**
> "This is my heuristic flashcard generator. It's a **pure function** — no database, no HTTP — so it's easy to test in isolation. That's why it's in `services/` and not in the routes.
>
> Look at the patterns array. It matches four sentence shapes: 'X is Y', 'X are Y', 'X means Y', and 'X colon Y' for heading-style lists. For each match, it builds a question like 'What is X?' with the answer being the rest of the sentence."

**[DO]** Scroll to `generateFlashcards` function.

**[SAY]**
> "The main `generateFlashcards` function splits the text into sentences, tries each pattern against each sentence, filters out junk answers with stopword and length checks, deduplicates questions, and assigns a difficulty based on answer length. Shorter answers are 'easy', longer ones are 'hard'. And there's a cap of 20 cards per document so a big upload doesn't flood the user."

---

## PART 9 — Frontend auth: `client/src/lib/api.js` + `auth.jsx` (5:40 – 6:10)

**[DO]** Open `client/src/lib/api.js`.

**[SAY]**
> "On the frontend, this is my tiny fetch wrapper. The key line is right here — if there's a token in `localStorage`, it automatically attaches `Authorization: Bearer <token>` to every outgoing request. So my page components never have to think about the token. They just call `api.get('/api/materials')` and authentication Just Works."

**[DO]** Open `client/src/lib/auth.jsx`.

**[SAY]**
> "And this is my React Context provider. When the app first loads, it checks localStorage for a token, and if one exists, calls `/api/auth/me` to rehydrate the session — essentially saying 'I have this token, who am I?'. If the token is invalid, it clears it and logs the user out. The `login` and `signup` functions save the returned token and set the user in context, so the whole app instantly re-renders with the authenticated UI."

---

## PART 10 — Wrap (6:10 – 6:30)

**[DO]** Close all files. Show the Explorer tree one more time.

**[SAY]**
> "So to summarise — the backend follows **MVC** with Mongoose models, Express routes as controllers, and React as the view layer. Authentication is done with **JWTs** plus **bcrypt** password hashing, and role-based access control is enforced with a `requireRole` middleware on protected routes. Every resource supports full **CRUD**, and uploads run through a Multer + pdf-parse + flashcard-generator pipeline. Thank you for watching the code walkthrough."

**[DO]** Stop recording.

---

## Tips

- **Don't read every line.** Point the cursor at the section you're talking about, say one sentence about it, move on. Viewers don't need to see you read the whole file.
- **Use VS Code's minimap** on the right — scrolling through it looks smooth on video.
- **Zoom in before the video** (Ctrl + several times). Font should be ~18-20pt for legibility.
- **If you stumble**, pause 2 seconds and restart the sentence. Cut the flub in Clipchamp later.
- **Your folder tree** at the start and end bookends the video — always close each file when you're done so you return to a clean tree.
- **Total length target: 6-7 minutes.** If you go much longer, your sir will zone out. If you go much shorter, it looks like you skipped things.

---

## The 9 files you'll open, in order

| # | File | What it demonstrates |
|---|---|---|
| 1 | Folder tree | MVC layout |
| 2 | `server/src/index.js` | Entry point, CORS, router mounting |
| 3 | `server/src/models/User.js` | Mongoose schema, role enum, password-hash hiding |
| 4 | `server/src/middleware/auth.js` | JWT verification + `requireRole` |
| 5 | `server/src/routes/auth.js` | Signup (bcrypt), Login (constant-msg 401) |
| 6 | `server/src/routes/materials.js` | Full CRUD + upload pipeline |
| 7 | `server/src/routes/admin.js` | Role-gated routes + `populate` |
| 8 | `server/src/services/flashcardGenerator.js` | Service layer, pure functions |
| 9 | `client/src/lib/api.js` + `auth.jsx` | Frontend auth flow |

You already have all of this code in the project — literally nothing to paste, just open and explain.

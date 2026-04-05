# Progress

Track the journey. One line per milestone. The past and present of the project.

> **Rule of thumb:** Update this file at the end of every task and every phase. Even if the update is boring ("wrote signup route, it works"), writing it helps you see how far you've come.

---

## Current status

**Current phase:** ALL PHASES COMPLETE 🎉
**Next phase:** — (project shippable; optional: install Ollama for AI cards, deploy)
**Overall:** 14 / 14 phases complete

---

## Phase checklist

- [x] **Phase 0 — Foundations** (setup, terminal, git, full-stack concepts) ✅
- [x] **Phase 1 — JavaScript crash course** (condensed — variables, functions, objects, arrays, destructuring, spread, map/filter/reduce, async/await) ✅
- [x] **Phase 2 — Backend Hello World** (Express 5, routes, middleware, req/res, JSON, URL params, 404 catch-all) ✅
- [x] **Phase 3 — Database basics** (MongoDB + Mongoose, User model with validation, full CRUD routes, env vars with dotenv, folder structure: config/models/routes) ✅
- [x] **Phase 4 — Authentication** (manual JWT + bcrypt signup/login/me, requireAuth + requireRole middleware, role-based access, passwordHash hiding via select:false + toJSON transform, 401 vs 403 status codes) ✅
- [x] **Phase 5 — Core models** (StudyMaterial/Flashcard/StudyPlan/Progress schemas with refs, full CRUD routes scoped to req.user, `.populate()` for joins, ownership filtering pattern, query filters, Progress upsert by unique (user,subject) index) ✅
- [x] **Phase 6 — File uploads** (Multer disk storage with size + mimetype limits, pdf-parse v2 class API for text extraction, POST /api/materials/upload, sourceFile field, Express 4-arg JSON error handler, pdfkit for test PDF generation) ✅
- [x] **Phase 7 — Flashcard generation** (pure-function service, pattern matching for "X is Y" / "X are Y" / "X means Y" / "X: Y", auto-gen on upload + manual regenerate endpoint with ?replace, difficulty inferred from answer length, stopword filter) ✅
- [x] **Phase 8 — Frontend Hello World** (Vite 8 + React 19 + Tailwind 4, CORS config on backend) ✅
- [x] **Phase 9 — Frontend auth + routing** (React Router 7, AuthContext, ProtectedRoute, token in localStorage, api.js fetch wrapper) ✅
- [x] **Phase 10 — Frontend features** (Home landing, Dashboard with stats, Materials upload/list/delete, Flashcards with study mode and difficulty, Plans with days-until countdown) ✅
- [x] **Phase 11 — Admin dashboard** (role-gated route, user table) ✅
- [x] **Phase 12 — Polish** (root package.json with `npm run dev` via concurrently, full README rewrite with quickstart and endpoint docs) ✅
- [x] **Phase 13 — Advanced** (Ollama local LLM integration with graceful fallback to heuristic, generator source reported in API response) ✅

---

## Phase 0 — Foundations (ACTIVE)

**Goal:** Install tools, learn terminal basics, understand what full-stack is.

### Done
- [x] Plan written and approved
- [x] CLAUDE.md scaffolded with teach-first instructions
- [x] `.claude/agents/` created with 4 subagents (teacher, debugger, code-reviewer, researcher)
- [x] `docs/` scaffolded: 00-start-here, 01-tools-setup, 02-how-we-work, commands-cheatsheet, ai-prompting-guide, glossary, learning/what-is-fullstack
- [x] Phase 0 playbook written
- [x] Tracking files created (PROGRESS.md, TASKS.md, TODO.md)

### Done
- [x] Install MongoDB Community Edition + Compass ✅
- [x] Add MongoDB to Windows User PATH (via PowerShell) ✅
- [x] Confirm MongoDB service is running (state: RUNNING) ✅
- [x] Connect MongoDB Compass to localhost:27017 (saw admin/config/local dbs) ✅
- [x] Verify all 5 tools with version commands ✅
- [x] Learn basic terminal navigation (`pwd`, `ls`, `ls -la`, `cd`, `cd ..`) ✅
- [x] Configure git globally (user.name, user.email, init.defaultBranch=main) ✅
- [x] `git init` inside FLASHCARDS (isolated from rogue home repo) ✅
- [x] **First commit:** `868b54e chore: scaffold FLASHMASTER project structure` — 21 files, 2134 lines ✅

### Deferred (optional)
- [ ] Create a GitHub account and push this repo (can do anytime)
- [ ] Update git email from placeholder `harsh@localhost` to real email when creating GitHub

### Reflection (Phase 0)
Harsh's first-ever set of dev tools are now working: Node, npm, git, VS Code, MongoDB. Learned what full-stack means (restaurant analogy), what PATH is, basic bash navigation, and the git init → add → commit → log workflow. The first commit is a personal milestone — 21 files safely in version control. Main takeaway: the toolchain is ready, now we start writing actual JavaScript.

---

## Phase 1 — JavaScript Crash Course ✅ COMPLETE

Playbook: [`docs/phases/phase-01-js-crash-course.md`](./docs/phases/phase-01-js-crash-course.md)
Demo scripts: `sandbox/js-basics/01-hello.js`, `sandbox/js-basics/02-everything.js`

Covered in a condensed, read-and-watch format (per Harsh's pacing preference):
- Running JS with Node, `console.log`
- `let` vs `const` (never `var`), the 6 main types, template literals, `===` vs `==`
- Functions: regular + arrow, functions as values
- Objects, arrays, destructuring, spread
- `.map()`, `.filter()`, `.reduce()` chaining
- Promises and `async`/`await`

**Reflection:** JS isn't scary coming from C/Python — mostly it's new syntax for familiar concepts, with a few genuinely new things (arrow functions, destructuring, async/await) that will come up constantly in the rest of the project. The modules topic (`import`/`export`) was deferred to Phase 2 where we'll meet it naturally.

---

*(Future phases will be appended here as we reach them.)*

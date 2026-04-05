# CLAUDE.md — FLASHMASTER Project Instructions

> **Read this file every session.** It describes how Claude should behave in this project. These rules override defaults.

---

## 1. What this project is

**FLASHMASTER – Exam Helper App** is a full-stack MERN web app for Harsh's university Full-Stack course at SRM. The original project brief lives in `FLASHMASTER – Exam Helper App.docx` (same folder). The goal is a study assistant that lets students upload notes (PDF/text/image), auto-generates flashcards from them, organizes material by subject/topic, builds study plans, tracks progress, and has an admin dashboard.

## 2. Who you are working with

Harsh is a **complete beginner** to full-stack development.

- Knows: basic C, basic Python.
- New to: JavaScript, Node.js, React, MongoDB, npm, terminals, git, HTTP, APIs, auth.
- Environment: Windows 11, bash shell (via Git Bash / Claude Code).
- Wants to **learn while building**, not just ship code.

**Treat every new concept as new.** Never assume prior knowledge of web or JS terms.

## 3. The "teach-first" rule (most important)

Before writing code that uses a new concept, you MUST:

1. **Name the concept** (e.g., "middleware", "async/await", "JWT").
2. **Explain it in plain English** with a **real-life analogy**. Examples:
   - *Middleware* = airport security checkpoint that every passenger passes through before boarding.
   - *JWT* = a signed wristband at a concert that proves you paid to get in.
   - *Database schema* = a form template; every filled form must have the same fields.
3. **Show where it shows up in FLASHMASTER.**
4. **Ask 1–2 checkpoint questions** to verify understanding before moving on.
5. **Add the term to `docs/glossary.md`** if it's not already there.
6. If the concept is big enough to deserve its own file, add `docs/learning/<concept>.md`.

Only after this do you write the code.

**If Harsh says "just code it" or "skip the explanation", respect that for that one task, but still add the term to the glossary.**

## 4. How to run commands

- **Run commands yourself via the Bash tool** and show Harsh the output. Don't just tell him what to type — he's learning to read output, not type blindly.
- **Exception:** interactive installers (MongoDB setup wizard, VS Code extensions) — guide him through the clicks.
- **Shell is bash on Windows.** Use Unix syntax: `ls`, `pwd`, `cat`, forward slashes, `/dev/null`. NOT `dir`, `type`, `NUL`, backslashes.
- **Working directory**: always run project commands from `C:/Users/harsh/OneDrive/Desktop/SRM/Full-stack/FLASHCARDS`. Server commands from `server/`, client commands from `client/`.
- **Explain every command the first time you use it.** Add it to `docs/commands-cheatsheet.md`.

## 5. Project structure

```
FLASHCARDS/
├── CLAUDE.md               # This file
├── README.md               # Public project overview
├── PROGRESS.md             # Phase-by-phase progress (past & present)
├── TASKS.md                # Current phase active tasks (now)
├── TODO.md                 # Backlog / deferred ideas (future)
├── .gitignore
├── .env.example
├── .claude/
│   ├── settings.json
│   └── agents/             # Specialized sub-agents (teacher, debugger, etc.)
├── docs/                   # All learning material & phase playbooks
│   ├── 00-start-here.md
│   ├── 01-tools-setup.md
│   ├── 02-how-we-work.md
│   ├── commands-cheatsheet.md
│   ├── ai-prompting-guide.md
│   ├── glossary.md
│   ├── learning/           # One file per big concept
│   └── phases/             # One file per phase (0–13)
├── server/                 # Express backend (Phase 2+)
└── client/                 # React frontend via Vite (Phase 8+)
```

## 6. Tech stack (locked in)

| Layer | Tool | One-line reason |
|---|---|---|
| Runtime | Node.js v20+ LTS | Required by spec |
| Package manager | npm | Ships with Node |
| Backend | Express.js | Required by spec |
| ORM | Mongoose | Required by spec |
| Database | MongoDB Community Edition (local) + MongoDB Compass | Required by spec, fully local |
| Auth | `jsonwebtoken` + `bcrypt` (hand-rolled) | Matches uni spec word-for-word; first-principles learning |
| Frontend | React 18 via Vite | Vite is current standard |
| Styling | Tailwind CSS | Beginner-friendly, huge docs |
| Routing | React Router v6 | Standard |
| File upload | Multer (local disk) | Required by spec |
| PDF extraction | `pdf-parse` | Pure JS, no cloud |
| Flashcard gen | Heuristic first, Ollama (local LLM) in Phase 13 | No paid APIs |
| Dev | nodemon, concurrently | Auto-restart + run both servers |
| API testing | Thunder Client (VS Code extension) | No extra install |
| Language | JavaScript (TS optional later) | Lower cognitive load |
| Git | Local → GitHub | Required by spec |

## 7. Coding conventions

- **JavaScript, not TypeScript.** ES modules (`import/export`), not CommonJS (`require`), unless a library forces it.
- **Prettier defaults** for formatting; **ESLint** for linting (install in Phase 2).
- **Small files**: one route, one controller, one model per file.
- **Comment the WHY, not the WHAT.** Use comments only where the logic isn't self-evident.
- **Explain in chat, comment lightly in code.** Teaching happens in docs and conversation, not as wall-of-text comments in source files.
- **Environment variables in `.env`**, template in `.env.example`, `.env` is gitignored.
- **Follow the server structure**: `config/`, `models/`, `routes/`, `controllers/`, `middleware/`, `services/`.

## 8. Tracking workflow (every session, every task)

1. **Start of session**: read `TASKS.md` to see what's active. Read `PROGRESS.md` to see where we are.
2. **Before starting a task**: mark it in-progress with the `TaskUpdate` tool AND update `TASKS.md` if appropriate.
3. **After completing a task**: mark it completed AND update `PROGRESS.md` with a one-line summary AND move follow-ups into `TODO.md` if they surface.
4. **End of phase**: run the `code-reviewer` subagent, update `PROGRESS.md` with reflections, close out `TASKS.md`, open the next phase's playbook.

## 9. Git & commits

- **No AI attribution footers** in commits ("Co-Authored-By: Claude..." is NOT wanted — matches user memory).
- **Natural commit messages**, small and frequent.
- **Commit message style**: `type: short summary` (e.g., `feat: add user signup route`, `docs: write phase 0 playbook`, `chore: scaffold project`).
- **Never force-push or rewrite history** without asking.
- The git repo for this project is **only inside the FLASHCARDS folder**. There's an unrelated rogue repo at `C:/Users/harsh/.git` — don't touch it.

## 10. Phases (we build in order, no skipping)

0. Foundations — install, terminal, git, what is full-stack
1. JavaScript crash course
2. Backend Hello World (Express)
3. Database basics (MongoDB + Mongoose + User CRUD)
4. Authentication (manual JWT + bcrypt)
5. Core models (Material, Flashcard, StudyPlan, Progress)
6. File uploads (Multer + pdf-parse)
7. Flashcard generation (heuristic)
8. Frontend Hello World (Vite + React + Tailwind)
9. Frontend auth + routing
10. Frontend features (dashboard, upload, study, plan)
11. Admin dashboard
12. Polish (errors, loading, responsive, notifications)
13. Advanced (Ollama local AI, OCR, dark mode) — in scope, semester-long pace

Each phase has a detailed playbook at `docs/phases/phase-NN-*.md`, **written just before we start that phase** so it reflects current code reality.

## 11. Subagents available in this repo

Invoke with the `Agent` tool using these types:

- **`teacher`** — explain a new concept with analogy, example, checkpoint questions.
- **`debugger`** — walk through an error step-by-step, explain cause, fix, and lesson.
- **`code-reviewer`** — end-of-phase code review with a learning lens; updates PROGRESS.md.
- **`researcher`** — find current best practices, docs, versions.

When in doubt which to use: if it's a new concept → teacher; if something is broken → debugger; if finishing a phase → code-reviewer; if picking a library or approach → researcher.

## 12. Red flags (stop and ask)

- About to install something with side effects outside the project folder (global npm packages, system services).
- About to `rm -rf` or delete files Harsh may not have seen.
- Harsh's understanding feels shaky on a fundamental concept — back up and re-teach.
- A solution requires bypassing the teach-first rule for more than 1–2 tasks in a row — that's a signal to slow down.

## 13. Key references

- Project brief: `FLASHMASTER – Exam Helper App.docx` (same folder)
- Plan file: `C:/Users/harsh/.claude/plans/inherited-wibbling-hammock.md`
- Entry point for Harsh: `docs/00-start-here.md`
- Glossary: `docs/glossary.md`
- Commands cheatsheet: `docs/commands-cheatsheet.md`
- AI prompting guide: `docs/ai-prompting-guide.md`

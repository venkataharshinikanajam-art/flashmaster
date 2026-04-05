# FLASHMASTER — Exam Helper App

A full-stack MERN web app that helps students prepare for exams by turning their study materials into flashcards, organizing them by subject, and tracking revision progress.

Built by **Venkata Harshini Kanajam** as a university project for **SRM Full-Stack Development** — from scratch and by hand, with every piece designed as a learning exercise.

## Features

- **Auth** — JWT-based signup/login with bcrypt password hashing and role-based access (student / admin)
- **Materials** — upload PDFs or text notes, extract text automatically with pdf-parse
- **Auto-generated flashcards** — heuristic pattern matching by default, upgrades to local AI if Ollama is installed
- **Study mode** — flip cards, mark difficulty (easy / medium / hard), filter by subject
- **Study plans** — set exam date, daily hours, list topics, see days remaining
- **Admin dashboard** — list all users, role-gated route
- **Dark themed UI** — Tailwind CSS v4
- **100% local** — no paid APIs, no cloud services. Your data stays on your machine.

## Tech Stack

**Backend:** Node.js · Express 5 · MongoDB · Mongoose · JWT · bcrypt · Multer · pdf-parse · CORS
**Frontend:** React 19 · Vite 8 · Tailwind CSS 4 · React Router 7
**Optional:** Ollama (local LLM for AI flashcard generation)

## Quickstart

### Prerequisites
- Node.js v20+ (`node -v`)
- MongoDB Community Edition running locally on `mongodb://localhost:27017`
- Git

### Install and run

```bash
# from the project root (FLASHCARDS folder)
npm run install:all     # installs root + server + client dependencies
npm run dev             # starts backend (port 5000) + frontend (port 5173) with one command
```

Open `http://localhost:5173` in your browser.

### First-time setup

1. Click **Sign up**, create an account (pick "admin" if you want to see the admin dashboard)
2. Go to **Materials**, upload a PDF or .txt file of study notes
3. Flashcards auto-generate; visit **Flashcards** and click "Start studying →"
4. Create a **Study Plan** with your exam date

### Optional: enable local AI flashcard generation

Install [Ollama](https://ollama.com/download), then:
```bash
ollama pull llama3.2:3b
```

Ollama runs automatically after install (port 11434). Next time you upload a material, flashcard generation uses the LLM instead of the heuristic. If Ollama isn't running, the app falls back seamlessly.

## Environment Variables

Copy `server/.env.example` → `server/.env` and fill in values. Defaults work out of the box for local dev.

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Backend port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/flashmaster` |
| `JWT_SECRET` | JWT signing key (CHANGE in production!) | `dev_secret_...` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `BCRYPT_SALT_ROUNDS` | bcrypt work factor | `10` |
| `CLIENT_ORIGIN` | CORS allowed origin | `http://localhost:5173` |
| `OLLAMA_URL` | Ollama host | `http://localhost:11434` |
| `OLLAMA_MODEL` | Model to use | `llama3.2:3b` |

## Project structure

```
FLASHCARDS/
├── CLAUDE.md              # Teach-first instructions for Claude Code
├── PROGRESS.md            # Phase-by-phase journey
├── docs/                  # Learning material + phase playbooks
├── server/                # Express backend
│   └── src/
│       ├── config/        # DB connection
│       ├── models/        # Mongoose schemas (User, StudyMaterial, Flashcard, StudyPlan, Progress)
│       ├── routes/        # Express routers (auth, users, materials, flashcards, plans, progress)
│       ├── middleware/    # auth, file upload
│       ├── services/      # flashcardGenerator, ollamaGenerator
│       └── index.js       # Entry point
└── client/                # React frontend (Vite + Tailwind)
    └── src/
        ├── pages/         # Home, Login, Signup, Dashboard, Materials, Flashcards, Plans, Admin
        ├── components/    # Navbar, ProtectedRoute
        ├── lib/           # api client, AuthContext
        └── App.jsx        # Router
```

## API endpoints

All `/api/*` endpoints (except `/api/auth/signup` and `/api/auth/login`) require `Authorization: Bearer <JWT>` header.

**Auth:**
- `POST /api/auth/signup` — create account, returns `{user, token}`
- `POST /api/auth/login` — returns `{user, token}`
- `GET /api/auth/me` — current user

**Materials:**
- `POST /api/materials` — create from pasted text
- `POST /api/materials/upload` — multipart upload (PDF/TXT), auto-generates flashcards
- `POST /api/materials/:id/generate-flashcards?replace=true` — regenerate cards for a material
- `GET /api/materials`, `GET /api/materials/:id`, `PATCH /api/materials/:id`, `DELETE /api/materials/:id`

**Flashcards:**
- `GET /api/flashcards` — supports `?materialId=`, `?difficulty=`, `?populate=material`
- Full CRUD

**Plans, Progress, Users:** Full CRUD, user-scoped.

## License

MIT — see [LICENSE](./LICENSE).

## Author

Built by **Venkata Harshini Kanajam** · SRM University AP · Full-Stack Development course

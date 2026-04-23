# FLASHMASTER - Exam Helper App

A full-stack MERN web application that helps students prepare for exams by uploading study notes, automatically generating flashcards, organising material by subject, building exam study plans, and tracking revision progress.

Built by **Venkata Harshini Kanajam** as a university project for **SRM - Full-Stack Web Development**.

---

## Submission Links

- **Live App:** [flashmaster-three.vercel.app](https://flashmaster-three.vercel.app) (use this from any laptop - sign up as Student or Admin)
- **Project Documentation:** [`FLASHMASTER_REPORT_v7.docx`](./FLASHMASTER_REPORT_v7.docx)
- **Project Overview Video:** [Watch on Google Drive](https://drive.google.com/file/d/13laCkmfLTP5Do-R4tMpo0vT3qxWe7One/view?usp=sharing)
- **Code Explanation Video:** [Watch on Google Drive](https://drive.google.com/file/d/193JGzvS2ED0ILRLsKOAN6gDrgnrdhGzX/view?usp=drive_link)
- **GitHub Repository:** [github.com/venkataharshinikanajam-art/flashmaster](https://github.com/venkataharshinikanajam-art/flashmaster)

---

## Features

- **Authentication** - JWT-based signup and login with bcrypt password hashing
- **Role-based access control** - `student` and `admin` roles enforced on the backend
- **Material upload** - PDF or pasted text, parsed automatically with `pdf-parse`
- **Auto-generated flashcards** - heuristic pattern matching by default, upgrades to a local LLM (Ollama) when available
- **Subject and topic organisation** - every material and flashcard is tagged and filterable
- **Study mode** - reveal answers one card at a time, tag difficulty as Easy / Medium / Hard
- **Study plans** - create exam plans with daily targets and a live "days until exam" countdown
- **Progress tracking** - per-subject revision stats with hard-card counts
- **Analytics dashboard** - distribution of difficulty and subject coverage
- **Admin dashboard** - three tabs (Users, Materials, Reports) for platform-wide management
- **Notifications** - in-app bell-icon notifications

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| Backend | Node.js 20, Express 5 |
| Database | MongoDB Community Edition + Mongoose 9 |
| Auth | JSON Web Tokens (`jsonwebtoken`) + `bcrypt` |
| File handling | Multer (memory storage) + pdf-parse |
| AI (optional) | Ollama local LLM |
| Dev tools | nodemon, concurrently |

## Architecture

The project follows the **Model-View-Controller (MVC)** pattern.

- **Models** - Mongoose schemas in `backend/src/models/` (User, StudyMaterial, Flashcard, StudyPlan, Progress)
- **Controllers** - Express route handlers in `backend/src/routes/` and pure-function services in `backend/src/services/`
- **View** - REST API endpoints + the React frontend in `frontend/src/`

For diagrams and detailed walkthroughs, see [`FLASHMASTER_REPORT_v7.docx`](./FLASHMASTER_REPORT_v7.docx).

## Quickstart

### Prerequisites

- Node.js v20 or above
- MongoDB Community Edition running locally on `mongodb://localhost:27017`
- Git

### Install and run

```bash
# from the project root (FLASHCARDS folder)
npm run install:all     # installs root + backend + frontend dependencies
npm run dev             # starts backend (port 5000) + frontend (port 5173) together
```

Open `http://localhost:5173` in your browser.

### First-time setup

1. Click **Sign Up**, create a student account.
2. Optional - promote yourself to admin: `cd backend && node scripts/make-admin.js <your-email>`, then log out and log back in.
3. Go to **Materials** and upload a PDF or text file of study notes.
4. Flashcards generate automatically. Visit **Flashcards** to start studying.
5. Create a **Study Plan** with your exam date.
6. Review the **Analytics** tab to see your progress.

### Optional - enable local AI flashcard generation

Install [Ollama](https://ollama.com/download), then:

```bash
ollama pull llama3.2:3b
```

Ollama runs on port 11434 by default. Future uploads will use the LLM; if Ollama is offline, the app falls back to the heuristic generator automatically.

## Environment Variables

Copy `.env.example` to `backend/.env` and adjust values. Defaults work for local development.

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | Backend port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/flashmaster` |
| `JWT_SECRET` | JWT signing key (change for production) | `dev_secret_...` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost factor | `10` |
| `CLIENT_ORIGIN` | CORS allowed origin | `http://localhost:5173` |
| `OLLAMA_URL` | Ollama host | `http://localhost:11434` |
| `OLLAMA_MODEL` | LLM model | `llama3.2:3b` |

## Project Structure

```
FLASHCARDS/
├── README.md                       # This file
├── FLASHMASTER_REPORT_v7.docx      # Project documentation (submission)
├── package.json                    # Root scripts (dev, install:all)
├── backend/                        # Express backend
│   ├── package.json
│   ├── scripts/
│   │   ├── make-admin.js           # Promote a user to admin role
│   │   └── make-test-pdf.js        # Generate a sample PDF for testing
│   └── src/
│       ├── index.js                # Entry point
│       ├── config/db.js            # MongoDB connection
│       ├── middleware/
│       │   ├── auth.js             # JWT verify + role check
│       │   └── upload.js           # Multer config
│       ├── models/                 # Mongoose schemas
│       ├── routes/                 # Express routers
│       └── services/               # Business logic (flashcard, plan, Ollama)
└── frontend/                       # React frontend (Vite + Tailwind)
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── components/             # Navbar, ProtectedRoute, NotificationBell
        ├── lib/                    # api.js, auth.jsx (AuthContext)
        └── pages/                  # Home, Login, Signup, Dashboard, Materials,
                                    # Flashcards, Plans, Progress, Analytics, Admin
```

## API Endpoints

All `/api/*` endpoints (except `/api/auth/signup` and `/api/auth/login`) require an
`Authorization: Bearer <JWT>` header.

**Auth**
- `POST /api/auth/signup` - create account, returns `{user, token}`
- `POST /api/auth/login` - returns `{user, token}`
- `GET  /api/auth/me` - current user

**Materials** *(full CRUD, scoped to the logged-in user)*
- `POST   /api/materials` - create from pasted text
- `POST   /api/materials/upload` - multipart upload (PDF/TXT), auto-generates flashcards
- `POST   /api/materials/:id/generate-flashcards?replace=true` - regenerate cards
- `GET    /api/materials` - list (supports `?subject=` and `?topic=`)
- `GET    /api/materials/:id`
- `PATCH  /api/materials/:id`
- `DELETE /api/materials/:id`

**Flashcards** *(full CRUD)*
- `GET /api/flashcards` - supports `?materialId=`, `?difficulty=`, `?populate=material`
- `POST /api/flashcards`, `PATCH /api/flashcards/:id`, `DELETE /api/flashcards/:id`
- `POST /api/flashcards/:id/review` - record a difficulty tap, updates Progress

**Plans, Progress, Users** - full CRUD, all scoped to the logged-in user.

**Admin** *(role-gated - `admin` only)*
- `GET    /api/admin/materials` - every user's uploads
- `DELETE /api/admin/materials/:id` - admin-side delete (cascades flashcards)
- `PATCH  /api/admin/users/:id/role` - promote / demote
- `GET    /api/admin/stats` - platform-wide statistics

## License

MIT - see [LICENSE](./LICENSE).

## Author

**Venkata Harshini Kanajam** - SRM University - Full-Stack Web Development

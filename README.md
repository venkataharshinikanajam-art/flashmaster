# FLASHMASTER — Exam Helper App

A full-stack web application that helps students prepare for exams by turning their study materials into flashcards, organizing them by subject, and tracking revision progress.

Built as a university project for **SRM Full-Stack Development**. The goal is not just to ship the app, but to **learn full-stack development from scratch** by building every piece by hand, concept by concept.

## What it does

- Upload study materials (PDFs, text files, images)
- Auto-generate flashcards from the uploaded content
- Organize flashcards by subject and topic
- Create personalized study plans with exam dates
- Track progress and revision status
- Mark flashcards easy / medium / hard for smart review
- Admin dashboard for user and content management

## Tech stack

**Backend:** Node.js · Express · MongoDB · Mongoose · JWT · bcrypt · Multer · pdf-parse
**Frontend:** React 18 · Vite · Tailwind CSS · React Router
**Dev tools:** nodemon · concurrently · Thunder Client · MongoDB Compass
**Everything runs locally. No paid services. 100% open-source.**

## Project status

See [`PROGRESS.md`](./PROGRESS.md) for the phase-by-phase journey.

## Getting started (for the author: Harsh)

New to the project? Open [`docs/00-start-here.md`](./docs/00-start-here.md) first.

## Project structure

```
FLASHCARDS/
├── docs/         # Learning material + phase playbooks
├── server/       # Express backend
├── client/       # React frontend
├── CLAUDE.md     # Instructions for Claude Code (teach-first AI assistant)
├── PROGRESS.md   # What's done
├── TASKS.md      # What's active
└── TODO.md       # What's deferred
```

## License

MIT (TBD)

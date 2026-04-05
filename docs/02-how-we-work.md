# 02 — How We Work

This is the **daily rhythm** of working on FLASHMASTER with Claude as your teacher. Read it once before Phase 1, then come back if you ever feel lost about what to do next.

---

## The big idea

You and Claude are **pair-programming**. Claude is not a magic code generator. Claude is a patient senior who:
- Explains things before writing them
- Writes code with you, not for you
- Answers every "why?" you throw at it
- Doesn't judge you for not knowing something

Your job is to **stay curious and honest**. Honest = say "I don't understand" when you don't. Curious = ask "why is this better than that?" when something feels arbitrary.

---

## Starting a session

When you sit down to work, open Claude Code in this project folder and do these **four things, in order**:

### 1. Greet Claude with where you left off
Example prompts:
- *"I'm back. Let's continue Phase 2. Can you read TASKS.md and tell me what's next?"*
- *"Continuing FLASHMASTER. What were we doing last session?"*

Claude will read `PROGRESS.md` and `TASKS.md` to remind itself (and you) of the state.

### 2. Read the current phase file
If you're mid-phase, open `docs/phases/phase-NN-*.md`. If you're between phases, ask Claude to write the next phase's playbook. **Don't skip to building before the playbook exists.**

### 3. Pick one small task
Not "build auth". Something like "write the signup route that validates the request body". Small = you can finish it in one sitting and see it working.

### 4. Say what you want from Claude
Examples:
- *"Teach me what middleware is before we write any."*
- *"Skip the explanation, just show me the code and walk me through it."*
- *"I'll try to write this myself. You review after."*

The more specific you are about the kind of help you want, the better Claude's response will be.

---

## During the work

### The "teach-first" rule
When Claude introduces a new concept (middleware, async/await, JWT, schema...), it will **explain before coding**. Don't skip this. If it feels slow, that's fine — the time spent understanding pays off tenfold later.

If Claude starts coding without explaining a term you don't know, **interrupt**: *"Wait — what is [term]?"* Claude will hand it off to the `teacher` agent.

### Typing vs reading
When Claude shows you a command, **type it yourself** instead of copy-pasting. It's slower. It's how your fingers and brain memorize it. After the 20th `git status`, you won't have to think.

When Claude writes a file, you don't have to retype it — but **read every line**. Ask about anything confusing.

### When something breaks
1. **Read the error.** All of it. Not just the first line.
2. **Copy-paste it into chat verbatim.**
3. **Say what you were doing when it broke.**
4. Claude (or the `debugger` agent) will walk you through it.

Do not try to silently fix errors by googling random Stack Overflow answers. Errors are the best teachers — work through them with Claude.

### When you don't understand the code Claude wrote
Ask:
- *"What does line 23 do?"*
- *"Why did you use `.map()` instead of a `for` loop?"*
- *"What happens if the user sends an empty body?"*

Never let unknown code sit in your project. You should be able to explain every line in your own words.

---

## Finishing a task

When you complete a task (a feature, a route, a component):

1. **Run it and see it work.** Use Thunder Client for API endpoints, the browser for frontend. Screenshot or just mentally confirm: yes, this does what I wanted.
2. **Commit.** Small, focused commits. Ask Claude to suggest a message if stuck.
   ```bash
   git add .
   git commit -m "feat: add user signup route"
   ```
3. **Update `PROGRESS.md`** with a one-line note.
4. **Update `TASKS.md`** — remove the task you finished, add any follow-ups you spotted.
5. **Reflect for 30 seconds.** What did I learn? What confused me? Write it in `PROGRESS.md` if it's worth remembering.

---

## Finishing a phase

At the end of each phase:

1. Ask Claude to invoke the `code-reviewer` agent.
2. Address the must-fix items from the review.
3. Check off the phase in `PROGRESS.md`.
4. Write a short "what I learned this phase" paragraph.
5. Ask Claude to create the next phase's playbook.
6. Take a break. You earned it.

---

## What NOT to do

- ❌ **Don't copy code you don't understand.** Ask first.
- ❌ **Don't skip phases.** Each one unlocks the next.
- ❌ **Don't install random packages from blog posts.** Ask the `researcher` agent if the package is trustworthy and current.
- ❌ **Don't commit secrets.** Never commit `.env`, API keys, passwords. `.gitignore` protects you, but stay vigilant.
- ❌ **Don't force-push or rewrite git history** without asking Claude first.
- ❌ **Don't delete files you didn't create** without understanding what they do.
- ❌ **Don't say "it doesn't work" and leave.** Always paste the actual error and what you tried.

---

## The four subagents

Claude has specialized modes it can switch into. Ask for them by name:

| Agent | Say this when | What you get |
|---|---|---|
| **teacher** | "Teach me X" or "explain X before we code" | Concept + analogy + example + checkpoint questions |
| **debugger** | "This error won't go away" or "something's broken" | Root cause analysis + fix + lesson |
| **code-reviewer** | "Review what we just built" (end of phase) | Wins + bugs + suggestions + progress update |
| **researcher** | "Which library should we use?" or "is this still current?" | Options compared + recommendation + links |

You can also just describe your situation and Claude will pick the right one.

---

## The three tracking files

| File | What goes here | Example |
|---|---|---|
| `PROGRESS.md` | **Past & present.** Phase checkboxes, session summaries. | "Phase 2 complete ✅ — learned Express routing" |
| `TASKS.md` | **Right now.** Current phase's active to-dos. | "[ ] Write POST /api/auth/signup route" |
| `TODO.md` | **Future.** Ideas, nice-to-haves, deferred bugs. | "Consider rate-limiting login endpoint later" |

Keep them updated. They're how you'll remember where you were after a week-long break.

---

## A typical session looks like this

```
09:00  Open Claude Code in FLASHCARDS folder
09:01  "Continue from yesterday. Read TASKS.md."
09:02  Claude summarizes state. You pick task #3: "Add login route."
09:03  "Teach me what JWT is before we code this."
09:10  Teacher agent explains JWT with the concert wristband analogy.
09:15  You answer both checkpoint questions. ✅
09:16  Claude walks you through writing the login route.
09:45  Route works. You test it with Thunder Client. ✅
09:50  Commit. Update PROGRESS.md with "Login route done — learned JWT".
09:55  Move to next task or stop here.
```

That's it. Repeat 13 phases and you'll be a full-stack developer.

---

**Next:** Open [`ai-prompting-guide.md`](./ai-prompting-guide.md) to learn how to ask Claude for things effectively.

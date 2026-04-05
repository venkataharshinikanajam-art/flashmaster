# Phase 0 — Foundations

**Goal:** Get your computer ready and build a mental model of what full-stack development is — before writing a single line of code.

**Duration:** 1–2 sessions (take your time).

**You'll know you're done when:**
- Node, npm, git, VS Code, and MongoDB all print versions when you ask
- You can navigate the project folder from the terminal
- You can make a git commit
- You can explain what front-end, back-end, and database each do
- `PROGRESS.md` has Phase 0 checked off

---

## 1. Concept brief — What are we even doing?

**Read this first:** [`../learning/what-is-fullstack.md`](../learning/what-is-fullstack.md)

That doc explains the three worlds (front-end, back-end, database) and gives you the restaurant analogy. It's the single most important mental model for the entire project.

After reading it, you should be able to answer these **without looking**:

1. What does the front-end do?
2. What does the back-end do?
3. What does the database do?
4. In the restaurant analogy, what is the "waiter"?

If any answer is fuzzy, re-read the doc or ask Claude to re-explain.

---

## 2. New vocabulary (added to glossary)

You'll encounter these words in this phase. They're already in [`../glossary.md`](../glossary.md) — skim it now.

- **Full-stack**
- **Front-end / Back-end / Database**
- **Stack (MERN)**
- **Terminal / Bash**
- **Git / Commit / Repo**
- **Node.js / npm**
- **Package / Dependency**

You don't have to memorize definitions. Just know where to find them when you forget.

---

## 3. Example prompts for this phase

If you get stuck, copy-paste one of these into Claude:

- *"Explain what a terminal is and why it's useful, using the teacher agent."*
- *"I ran `node -v` and it said 'command not found'. What do I do?"*
- *"Walk me through making my first git commit from scratch."*
- *"I don't understand the difference between git and GitHub. Teach me."*
- *"What does `package.json` actually store? I see it mentioned everywhere."*

---

## 4. Hands-on — step by step

### Step 1: Open the project in VS Code
```bash
cd "/c/Users/harsh/OneDrive/Desktop/SRM/Full-stack/FLASHCARDS"
code .
```

The `.` means "the current folder". This opens VS Code with FLASHCARDS as your workspace.

In VS Code's left sidebar you should see: `CLAUDE.md`, `README.md`, `docs/`, `.claude/`, etc.

### Step 2: Verify your tools (and install MongoDB)

Follow [`../01-tools-setup.md`](../01-tools-setup.md) carefully. Run every check command in Section 0. For any tool that's missing, follow its install section. **MongoDB will be the one you need to install** — Node, npm, git, and VS Code are already done.

When all five commands print a version, move on.

### Step 3: Learn to navigate

Open a bash terminal (in VS Code: `Ctrl+``  — that's the backtick key, top-left of your keyboard). Try these:

```bash
pwd          # where am I?
ls           # what's in here?
ls -la       # show hidden files too (like .gitignore)
cd docs      # go into docs folder
ls           # see what's there
cd ..        # come back up
cd .claude   # go into .claude
ls
cd ..        # back to project root
```

Spend 5 minutes just moving around. **Get comfortable before proceeding.**

### Step 4: Read what's already in this project

Open these files in VS Code and skim them:

1. `README.md` — what the project is
2. `docs/00-start-here.md` — your roadmap (you already read this)
3. `docs/02-how-we-work.md` — the session rhythm
4. `docs/ai-prompting-guide.md` — how to ask Claude for help
5. `CLAUDE.md` — (optional) what Claude knows about this project

You don't have to memorize any of it. Know where things live.

### Step 5: Initialize git for this project

There may be a rogue git repo in your home directory — ignore it. We want git **only** for the FLASHCARDS folder.

```bash
cd "/c/Users/harsh/OneDrive/Desktop/SRM/Full-stack/FLASHCARDS"
git init
git status
```

`git init` creates a hidden `.git/` folder that tracks your project. `git status` shows what's changed (everything is "untracked" right now).

**One-time identity setup** (if you haven't already):
```bash
git config --global user.name "Harsh"
git config --global user.email "your-email@example.com"
```

### Step 6: Your first commit

```bash
git add .
git status         # now all files are green (staged)
git commit -m "chore: scaffold FLASHMASTER project structure"
git log --oneline  # you should see your commit!
```

🎉 **You just made your first commit.** That's a real accomplishment.

### Step 7: (Optional) Push to GitHub

If you have a GitHub account and want to back up your work online:

1. Go to <https://github.com/> and create a new empty repo called `flashmaster` (or whatever you like). **Don't** initialize it with a README — our folder already has one.
2. Follow GitHub's instructions for "push an existing repository from the command line":
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/flashmaster.git
   git branch -M main
   git push -u origin main
   ```
3. Refresh your GitHub page. You should see all the files.

If you skip this step for now, that's fine. You can do it later.

---

## 5. Checkpoint questions

Answer these out loud or in your head. If you can't, re-read the relevant doc.

1. What's the difference between front-end, back-end, and database? Give one example of something each does.
2. What does `pwd` tell you?
3. What's the difference between `git` and `GitHub`?
4. When you run `git add .`, what does the `.` mean?
5. Why is it important to have a `.gitignore` file?
6. Where does npm install the packages you download?
7. What's the connection string that MongoDB Compass uses by default to connect to your local database?

You don't need to be 100% confident. Just engage with the questions.

---

## 6. Reflection — update PROGRESS.md

Open `PROGRESS.md` at the project root. Under "Phase 0 — Foundations", check off:

- [x] Tools installed and verified
- [x] Project opened in VS Code
- [x] Made first git commit
- [x] Read concept primer (`what-is-fullstack.md`)
- [x] Answered checkpoint questions

Then add one line below it describing **what you learned** and **what confused you** (if anything). Examples:

> "Phase 0 done. Learned what a git commit is and how the terminal works. Still a bit fuzzy on the difference between Node and npm — going to ask Claude to re-explain in Phase 1."

This reflection is for future-you and for Claude, so Claude can adjust what to emphasize next phase.

---

## 7. Tasks (copy into TASKS.md if not already there)

```markdown
## Phase 0 — Foundations (ACTIVE)

- [ ] Read docs/learning/what-is-fullstack.md and answer the 4 questions
- [ ] Read docs/00-start-here.md, 02-how-we-work.md, ai-prompting-guide.md
- [ ] Install MongoDB Community Edition + Compass (see docs/01-tools-setup.md §4)
- [ ] Verify all 5 tools with version commands
- [ ] Navigate the project in bash (pwd, ls, cd)
- [ ] git init inside FLASHCARDS folder
- [ ] Set git user.name and user.email
- [ ] Make first commit: "chore: scaffold FLASHMASTER project structure"
- [ ] (Optional) Create GitHub repo and push
- [ ] Answer all Phase 0 checkpoint questions
- [ ] Update PROGRESS.md with reflection
```

---

## 8. When Phase 0 is done

Once everything above is checked off, ask Claude:

> *"Phase 0 is complete. Please write the Phase 1 playbook and update TASKS.md for the new phase."*

Phase 1 is **JavaScript Crash Course for C/Python Devs** — where we'll start actually writing code.

---

## 9. If something goes wrong

- **MongoDB install stuck?** → Tell Claude: "MongoDB install is failing at step X. Here's the error: [paste]". Use the `debugger` agent.
- **`command not found` after install?** → Close and reopen your terminal. PATH doesn't update in open windows.
- **Something else?** → Paste the error verbatim into chat. Claude will help.
- **Bored or overwhelmed?** → Take a break. This is supposed to be fun. Come back fresh.

You got this. 💪

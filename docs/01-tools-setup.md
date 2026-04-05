# 01 — Tools Setup (Windows 11)

This guide installs everything you need for FLASHMASTER. It assumes zero prior setup. Work through it top to bottom. **Don't skip.**

At the end you will have:
- Node.js + npm (to run JavaScript outside the browser)
- Git (to save versions of your code)
- VS Code + the right extensions (your editor)
- MongoDB Community Edition + MongoDB Compass (your database)
- A working terminal (Git Bash / Claude Code bash)

> **Tip:** Before installing anything, check if you already have it. The commands in Section 0 will tell you.

---

## 0. Check what's already installed

Open a bash terminal (Git Bash, Windows Terminal with bash, or the terminal inside Claude Code). Run these one by one and share the output with Claude:

```bash
node -v      # expected: v20.x.x or higher
npm -v       # expected: 10.x.x or higher
git --version  # expected: git version 2.x.x
code --version # expected: 1.x.x (VS Code)
mongod --version # expected: db version v7.x or v8.x
```

If any of these say "command not found", that tool isn't installed — follow the section for it below. If a version is printed, you're good for that tool.

### What's already done for you
✅ Node.js v24.14.0 — installed
✅ npm 11.9.0 — installed
✅ Git 2.53.0 — installed
✅ VS Code 1.112.0 — installed
❌ MongoDB — **needs install** (see Section 4 below)

---

## 1. Node.js (already installed — skip unless reinstalling)

**What it is:** A program that runs JavaScript code on your computer (not in a browser).
**Why we need it:** Our entire backend (server) is written in JavaScript and runs on Node.
**Analogy:** Java needs the JVM to run. Python needs the Python interpreter. JavaScript outside the browser needs Node.

### Install steps (if needed)
1. Go to <https://nodejs.org/> and download the **LTS** (Long-Term Support) version.
2. Run the installer. Accept defaults. Check "Automatically install the necessary tools" if asked.
3. **Close and reopen your terminal** so it picks up the new PATH.
4. Verify: `node -v` and `npm -v`.

### What is npm?
npm = **Node Package Manager**. It installs JavaScript libraries (like `express`, `react`, `bcrypt`). Think of it like `pip` for Python. It comes bundled with Node.

---

## 2. Git (already installed — skip unless reinstalling)

**What it is:** A program that tracks every change you make to your code so you can go back in time or share it with others.
**Why we need it:** Required by the university spec. Also essential for any real dev work.
**Analogy:** Microsoft Word's "track changes", but for a whole folder of files, and with an unlimited undo history.

### Install steps (if needed)
1. Download from <https://git-scm.com/download/win>.
2. Run the installer. Accept defaults **except**:
   - When asked about the default editor, choose **VS Code**.
   - When asked about the default branch, choose **main**.
   - When asked about line endings, choose **Checkout as-is, commit Unix-style**.
3. Verify: `git --version`.

### First-time configuration
Tell git who you are (one-time setup):
```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Use the same email you'll use for GitHub later.

---

## 3. VS Code + extensions

**What it is:** Your code editor. Free, from Microsoft.
**Why we need it:** Writing code in Notepad is painful. VS Code has syntax highlighting, auto-complete, terminal, git integration, and a huge extension ecosystem.

### Install (if needed)
Download from <https://code.visualstudio.com/> and run the installer. Check **"Add 'Open with Code' action to Windows Explorer"**.

### Required extensions for this project

Open VS Code, click the Extensions icon in the left sidebar (or press `Ctrl+Shift+X`), and install these:

| Extension | Why |
|---|---|
| **ESLint** (by Microsoft) | Catches JavaScript mistakes as you type |
| **Prettier - Code formatter** | Auto-formats your code on save |
| **Thunder Client** | Test API endpoints from inside VS Code (replaces Postman) |
| **MongoDB for VS Code** | Browse your database without leaving the editor |
| **Tailwind CSS IntelliSense** | Autocomplete for Tailwind classes (Phase 8+) |
| **ES7+ React/Redux/React-Native snippets** | Helpful React code snippets |
| **GitLens** (optional) | Nicer git history view |

After installing Prettier, go to **Settings (Ctrl+,)** → search `format on save` → enable it.

---

## 4. MongoDB Community Edition (needs install!)

**What it is:** A database. Stores your users, flashcards, study plans, etc.
**Why we need it:** Required by the spec. Also, our app needs a place to persist data.
**Analogy:** A giant smart filing cabinet. You tell it "save this" and later "find me the ones where X is Y", and it returns them fast.

### Install steps

1. **Download the MSI installer:**
   - Go to <https://www.mongodb.com/try/download/community>.
   - Select: Version = latest (8.x), Platform = **Windows x64**, Package = **msi**.
   - Click **Download**.

2. **Run the installer:**
   - Click Next through the first screens.
   - On "Choose Setup Type" pick **Complete**.
   - On "Service Configuration":
     - Check **"Install MongoDB as a Service"** (this makes it start automatically on boot).
     - Leave "Run service as Network Service user" selected.
     - Leave the default Service Name, Data Directory, and Log Directory.
   - On "Install MongoDB Compass" — **keep it checked**. Compass is the visual GUI for browsing data.
   - Click Install. It will take a few minutes.

3. **Add `mongod` to your PATH** (so terminal commands work):
   - Find where MongoDB was installed. Default is `C:\Program Files\MongoDB\Server\8.0\bin`.
   - Open Windows **Edit the system environment variables** (search in Start menu).
   - Click **Environment Variables** → under "System variables" find `Path` → **Edit** → **New** → paste the path above → OK everything.
   - **Close and reopen your terminal.**
   - Verify: `mongod --version` should now print a version.

4. **Verify MongoDB is running as a service:**
   - Press `Win+R`, type `services.msc`, Enter.
   - Scroll to find **MongoDB Server**. Status should be **Running**.
   - If not, right-click it → **Start**.

5. **Open MongoDB Compass:**
   - It should be in your Start menu.
   - On the connection screen, the default URI `mongodb://localhost:27017` is already filled in.
   - Click **Connect**.
   - You should see three default databases: `admin`, `config`, `local`. This confirms MongoDB is working.

### What if it doesn't work?
Tell Claude: "MongoDB install failed at step X — here's what I see: [paste error]". The `debugger` agent will help.

---

## 5. The terminal (bash on Windows)

**What it is:** A text interface to your computer. Instead of clicking, you type commands.
**Why we need it:** Every dev tool (Node, git, npm) is controlled through the terminal.
**Analogy:** A chat window where you talk to your computer — it's less pretty than clicking buttons, but a thousand times more powerful.

### Which terminal to use
You want **bash**, not PowerShell or CMD. You have a few options:

1. **Claude Code's built-in bash** (easiest — use this when working with Claude).
2. **Git Bash** — installed with Git. Search "Git Bash" in Start menu.
3. **Windows Terminal** with the Git Bash profile added.

### Verify you're in bash
Run `echo $SHELL`. It should say something with `bash` in it. If it says nothing or complains, you're in PowerShell — switch.

### First commands to learn
See [`commands-cheatsheet.md`](./commands-cheatsheet.md) for a full list. The essentials:
- `pwd` — print working directory (where am I?)
- `ls` — list files in the current directory
- `cd folder` — change directory into `folder`
- `cd ..` — go up one level
- `clear` — clear the screen

### Navigate to the project
```bash
cd "/c/Users/harsh/OneDrive/Desktop/SRM/Full-stack/FLASHCARDS"
pwd
ls
```

You should see the project files. This is your working directory for every command in this project.

---

## 6. Verification — all systems go

Run these commands from inside the FLASHCARDS folder. All should succeed:

```bash
node -v
npm -v
git --version
code --version
mongod --version
pwd     # should print .../FLASHCARDS
ls      # should list CLAUDE.md, README.md, docs/, etc.
```

If all five version checks print a version and you can see the project files, **you're done with Phase 0 setup.** Move on to `docs/phases/phase-00-foundations.md` to continue learning the concepts of what you just installed.

---

## Common problems

### `command not found` after installing
You need to **close and reopen the terminal** after installing something. Installers add to your PATH, but open terminals don't see the update until restart.

### `mongod` works but Compass can't connect
Check that the MongoDB service is running (`services.msc` → MongoDB Server → Start).

### VS Code `code` command doesn't work in terminal
In VS Code, press `Ctrl+Shift+P`, type `Shell Command: Install 'code' command in PATH`, select it.

### Git uses the wrong editor
Run: `git config --global core.editor "code --wait"`

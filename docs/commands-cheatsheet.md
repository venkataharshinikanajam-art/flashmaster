# Commands Cheatsheet

Every terminal command you'll use in this project, grouped by purpose, with a one-line plain-English explanation. If Claude uses a command you don't recognize, look here first.

> **Shell:** bash (Git Bash on Windows). Use forward slashes `/`, not backslashes. Quote paths with spaces.

---

## Navigation (where am I, where am I going)

| Command | What it does |
|---|---|
| `pwd` | Print Working Directory. Shows your current location. |
| `ls` | List files in the current folder. |
| `ls -la` | List files including hidden ones (like `.env`), with details. |
| `cd folder` | Change Directory into `folder`. |
| `cd ..` | Go up one level (parent folder). |
| `cd ~` | Go to your home directory (`C:/Users/harsh`). |
| `cd -` | Go back to the previous folder you were in. |
| `clear` | Clear the terminal screen. `Ctrl+L` does the same. |

**Example — navigate to the project:**
```bash
cd "/c/Users/harsh/OneDrive/Desktop/SRM/Full-stack/FLASHCARDS"
pwd
ls
```

---

## Files and folders

| Command | What it does |
|---|---|
| `mkdir name` | Make a new folder called `name`. |
| `mkdir -p a/b/c` | Make nested folders (`a`, then `b` inside it, then `c`). |
| `touch file.txt` | Create an empty file. |
| `cp src dst` | Copy file `src` to `dst`. |
| `mv old new` | Move or rename a file. |
| `rm file` | Delete a file. **No undo!** |
| `rm -rf folder` | Delete a folder and everything inside. **Dangerous — double-check before running.** |
| `cat file` | Print the contents of a file to the screen. |
| `echo "hi" > file` | Write "hi" into `file` (overwrites). |
| `echo "hi" >> file` | Append "hi" to the end of `file`. |

---

## Git (version control)

| Command | What it does |
|---|---|
| `git init` | Turn the current folder into a git repo. |
| `git status` | What's changed since the last commit? |
| `git add file` | Stage `file` for the next commit. |
| `git add .` | Stage all changed files. |
| `git commit -m "message"` | Save a snapshot with a description. |
| `git log` | See the history of commits. |
| `git log --oneline` | Same, compact view. |
| `git diff` | Show unstaged changes line by line. |
| `git diff --staged` | Show staged but not yet committed changes. |
| `git branch` | List branches. |
| `git switch -c name` | Create and switch to a new branch. |
| `git switch main` | Switch to the `main` branch. |
| `git merge branch` | Merge `branch` into the current branch. |
| `git restore file` | Discard unstaged changes to `file`. |
| `git restore --staged file` | Unstage `file` (but keep the changes). |
| `git remote add origin URL` | Connect your local repo to a GitHub repo. |
| `git push` | Upload commits to GitHub. |
| `git pull` | Download commits from GitHub. |

**Example — daily git flow:**
```bash
git status                    # see what changed
git add .                     # stage everything
git commit -m "feat: add signup route"
git log --oneline             # confirm the commit
```

---

## Node.js

| Command | What it does |
|---|---|
| `node -v` | Check installed Node version. |
| `node file.js` | Run a JavaScript file with Node. |
| `node` | Open an interactive JS shell (REPL). Type `.exit` to leave. |
| `node -e "console.log(1+1)"` | Run a one-liner. |

---

## npm (Node Package Manager)

| Command | What it does |
|---|---|
| `npm -v` | Check npm version. |
| `npm init -y` | Create a `package.json` with default values. |
| `npm install pkg` | Install `pkg` and add it as a dependency. Short: `npm i pkg`. |
| `npm install -D pkg` | Install `pkg` as a **dev** dependency (only needed while developing). |
| `npm install` | Install all dependencies listed in `package.json`. Short: `npm i`. |
| `npm uninstall pkg` | Remove `pkg`. |
| `npm update` | Update installed packages to the latest allowed by `package.json`. |
| `npm list` | Show what's installed. |
| `npm list -g --depth=0` | Show globally installed packages. |
| `npm run script-name` | Run a script defined in `package.json`'s `scripts` section. |
| `npm run dev` | Common script name for "start dev server" (we'll set this up). |
| `npm start` | Common script name for "start the app". |

**Example — install Express and start a server:**
```bash
cd server
npm init -y
npm install express
npm install -D nodemon
npm run dev
```

---

## MongoDB

| Command | What it does |
|---|---|
| `mongod --version` | Check MongoDB version. |
| `mongosh` | Open the MongoDB shell (connects to local server by default). |
| (inside `mongosh`) `show dbs` | List all databases. |
| (inside `mongosh`) `use flashmaster` | Switch to the `flashmaster` database (creates it on first write). |
| (inside `mongosh`) `show collections` | List collections in the current db. |
| (inside `mongosh`) `db.users.find()` | Find all documents in the `users` collection. |
| (inside `mongosh`) `exit` | Leave the shell. |

*(We'll mostly use MongoDB Compass — the GUI — instead of `mongosh`, but knowing `mongosh` helps.)*

---

## Useful bash tricks

| Command | What it does |
|---|---|
| `Ctrl+C` | Cancel the currently running command. |
| `Ctrl+L` | Clear the screen (same as `clear`). |
| `Ctrl+R` | Search command history (start typing to find a previous command). |
| `↑` / `↓` | Cycle through previous commands. |
| `Tab` | Auto-complete file/folder names. Press twice to see all options. |
| `command --help` | Show help for most commands (e.g., `git --help`). |
| `cmd1 && cmd2` | Run `cmd2` only if `cmd1` succeeded. |
| `cmd1 ; cmd2` | Run `cmd1` then `cmd2`, regardless of success. |
| `cmd > file` | Redirect the output of `cmd` into `file` (overwriting). |
| `cmd >> file` | Redirect and append. |

---

## Project-specific shortcuts (we'll add these as we go)

Once we set up `package.json` scripts, you'll have these in each folder:

**In `server/`:**
```bash
npm run dev       # start backend with auto-reload (nodemon)
npm start         # start backend normally
```

**In `client/`:**
```bash
npm run dev       # start the Vite dev server (frontend)
npm run build     # build the production frontend
```

**At the project root (after Phase 2):**
```bash
npm run dev       # start both backend and frontend at once (via concurrently)
```

---

## The dangerous ones (be careful)

These commands are powerful and irreversible. **Never run one blindly.**

| Command | Why to be careful |
|---|---|
| `rm -rf folder` | Deletes a folder and everything in it. No trash bin. No undo. |
| `git push --force` | Can overwrite work on GitHub. Never on `main`. |
| `git reset --hard` | Discards all uncommitted changes permanently. |
| `git clean -fd` | Deletes untracked files. Bye-bye new files you forgot to add. |

**Rule of thumb:** If you didn't type the command yourself or aren't 100% sure what it does, ask Claude before hitting Enter.

---

## Adding to this file

Whenever you learn a new command, add it here with a one-line explanation. Future-you will thank present-you.

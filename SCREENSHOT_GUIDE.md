# FLASHMASTER Screenshot Guide — Spoon-Fed Edition

You need **12 screenshots** for the report. This guide tells you exactly what to click, what should be on screen, and what to name the file.

---

## STEP 0 — Get the app running (one time)

Open Git Bash. Run these two commands one at a time:

```bash
cd /c/Users/harsh/OneDrive/Desktop/SRM/Full-stack/FLASHCARDS
npm run dev
```

Wait until you see two coloured logs:
- **blue** = `✅ FLASHMASTER server listening on http://localhost:5000`
- **magenta** = `Local: http://localhost:5173`

Open **http://localhost:5173** in Chrome. **Leave the terminal open** the whole time you're taking screenshots.

### Make sure you have data to show

If your DB is empty (you'll know — the screenshots will look sad), do this **before** you start screenshotting:

1. Sign up as a normal student (e.g., `priya@test.com` / `password123`).
2. Upload one PDF — there's a sample at `server/uploads/` or generate one with: `cd server && node scripts/make-test-pdf.js` then upload that.
3. Add a study plan (subject = "DBMS", exam date = 2 weeks from today).
4. Open the Flashcards page, tag 3-4 cards with difficulty.
5. Sign out, sign up a **second** student account (e.g., `arjun@test.com`) and upload one more PDF. (This makes the admin Materials tab look populated.)
6. Promote your main account to admin: in a new terminal, `cd server && node scripts/make-admin.js priya@test.com`. Log out, log back in.

Now you're ready.

---

## How to take a screenshot on Windows 11

- **Windows + Shift + S** → drag a rectangle around the area → it copies to clipboard → click the popup → "Save As" → save to `C:/Users/harsh/OneDrive/Desktop/SRM/Full-stack/FLASHCARDS/ss/`.
- Crop to **just the browser window**, not the whole screen. No taskbar, no other apps.
- Use the file names listed below — that way they line up 1:1 with the report.

---

## The 12 screenshots

### 1. `01-landing.png` — Landing Page
- **Where:** Make sure you're **logged out** (click your name → Sign out, or open an Incognito window).
- **URL:** `http://localhost:5173/`
- **What should be on screen:** The public Home page with the app name, tagline, and "Sign In" / "Sign Up" buttons.
- **Capture:** Full browser viewport, no DevTools.

### 2. `02-signup.png` — Signup Page (Student)
- **Where:** Click "Sign Up" in the navbar.
- **URL:** `http://localhost:5173/signup`
- **Pre-fill** the form with realistic values (Name: `Priya Sharma`, Email: `priya@test.com`, Password: any) — **don't submit**, just show the filled form.
- **Capture:** The signup form filled in.

### 3. `03-login.png` — Login Page
- **Where:** Click "Sign In" in the navbar.
- **URL:** `http://localhost:5173/login`
- **Pre-fill** with the same email; mask or leave the password as dots.
- **Capture:** The login form filled in.

### 4. `04-dashboard.png` — Student Dashboard
- **Where:** Sign in as the student account.
- **URL:** `http://localhost:5173/dashboard`
- **What should be on screen:** Welcome message, stats cards (materials count, flashcards count), upcoming exam countdowns.
- **Tip:** If stats show 0, go upload a material first (Step 0).

### 5. `05-materials.png` — Materials Page
- **Where:** Click "Materials" in the navbar.
- **URL:** `http://localhost:5173/materials`
- **What should be on screen:** The upload form at the top + list of uploaded materials below, ideally with 2-3 different subjects so the filter chips look meaningful.
- **Tip:** If you only have one material, upload one more before screenshotting.

### 6. `06-flashcards.png` — Flashcards Page (with study mode)
- **Where:** Click "Flashcards" in the navbar.
- **URL:** `http://localhost:5173/flashcards`
- **What should be on screen:** The filter chips at top (subject + topic), the list of cards, and ideally one card with the answer revealed and the Easy/Medium/Hard buttons visible.
- **Tip:** Click a card's "Show Answer" before snapping.

### 7. `07-plans.png` — Study Plans Page
- **Where:** Click "Plans" in the navbar.
- **URL:** `http://localhost:5173/plans`
- **What should be on screen:** At least one study plan card with the "X days until exam" countdown badge clearly visible.
- **Tip:** Create a plan with an exam date 14 days out — the countdown will show "14 days".

### 8. `08-progress.png` — Progress Page
- **Where:** Click "Progress" in the navbar.
- **URL:** `http://localhost:5173/progress`
- **What should be on screen:** Per-subject rows showing cards reviewed and hard-card counts.
- **Tip:** Make sure you've reviewed (tagged difficulty on) some cards in Step 0, otherwise this will be empty.

### 9. `09-analytics.png` — Analytics Page
- **Where:** Click "Analytics" in the navbar.
- **URL:** `http://localhost:5173/analytics`
- **What should be on screen:** Charts/stats showing distribution of difficulty and subject coverage.

### 10. `10-admin-users.png` — Admin Dashboard – Users Tab
- **Where:** With your admin account (after running `make-admin.js`), click "Admin" in the navbar. The Users tab is the default.
- **URL:** `http://localhost:5173/admin`
- **What should be on screen:** Table of registered users with their role badges (student / admin).

### 11. `11-admin-materials.png` — Admin Dashboard – Materials Tab
- **Where:** Click the "Materials" tab inside the Admin page.
- **URL:** `http://localhost:5173/admin` (Materials tab)
- **What should be on screen:** Table of every uploaded file across the platform, with the owner's name visible. Include rows from both your test users.

### 12. `12-admin-reports.png` — Admin Dashboard – Reports Tab
- **Where:** Click the "Reports" tab inside the Admin page.
- **URL:** `http://localhost:5173/admin` (Reports tab)
- **What should be on screen:** Platform-wide stat cards: total users, students, admins, materials, flashcards, hard cards, plans, recent uploads.

---

## After you've taken all 12

1. Open `FLASHMASTER_REPORT.md` in VS Code (or Word).
2. Find the "Output Screenshots" section.
3. Replace each `*[Insert screenshot from ss/]*` placeholder with the matching image. In Markdown:
   ```
   ![Landing Page](ss/01-landing.png)
   ```
   In Word: Insert → Pictures → pick the file from `ss/`.

4. **Demo video**: Use Windows Game Bar (Win+G) or OBS to record a 3-5 minute walkthrough hitting roughly the same screens in order. Upload to Google Drive, set sharing to "Anyone with the link", paste the link in the "Demo Video Link" section.

5. **Code repo link**: Push to GitHub (`gh repo create flashmaster --public --source=. --push`) or zip the `FLASHCARDS/` folder (excluding `node_modules` and `.env`) and upload to Drive. Paste the link in the "Code Drive / Repository Link" section.

---

## Common gotchas

- **Black screenshots**: you captured from the wrong monitor. Use the Snipping Tool from the Start Menu instead of Win+Shift+S.
- **Dashboard stats are 0**: you forgot Step 0. Upload some material and tag some flashcards first.
- **Admin page redirects to dashboard**: your account isn't admin yet. Run `cd server && node scripts/make-admin.js <your-email>`, then sign out and sign back in.
- **Page won't load / blank screen**: backend or frontend probably crashed. Check the terminal output. If MongoDB isn't running: `net start MongoDB` from an Admin PowerShell.
- **Filter chips look empty**: upload materials with **different subjects** (e.g., one tagged "DBMS", one tagged "OS") so the chips have something to filter on.

You got this. Take all 12 in one sitting — should take 15-20 minutes if your DB has data.

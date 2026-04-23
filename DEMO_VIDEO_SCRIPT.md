# FLASHMASTER Demo Video — Complete Script

> ~4-5 minute walkthrough. Record with Xbox Game Bar (Win+G) or OBS. Read the narration out loud at a natural pace. Do **not** rush — pause a beat between sections.

---

## Before you hit record

### 1. Tools (use one)

- **Easiest — Xbox Game Bar (built into Windows 11):**
  - Press **Win + G** → click the circle "Record" button (or Win + Alt + R).
  - Recordings save to `Videos/Captures/`.
  - Downside: records one window at a time. Open Chrome first, so Chrome is what it captures.
- **Better quality — OBS Studio** (free, 2-min install from obsproject.com):
  - Add a "Display Capture" source, click **Start Recording**.
  - Records the whole screen including mouse.

### 2. Mic setup
- Plug in your earphones (built-in phone earphones work fine).
- Record in a quiet room. Close the window if there's traffic outside.
- Do a 10-second test recording, play it back, make sure you can hear yourself clearly.

### 3. Prepare the browser
- Close every tab except FLASHMASTER.
- Zoom Chrome to **100%** (Ctrl + 0).
- Enable **Incognito mode** — no bookmarks bar, no extensions, clean UI. (Or just hide the bookmarks bar: Ctrl + Shift + B.)
- Resize Chrome to roughly 1600 × 900 so everything is legible.

### 4. Prepare the app
- Open a terminal in `FLASHCARDS/` and run: `npm run dev`
- Wait till you see both green logs (server + client).
- Keep a **sample PDF** ready on your Desktop. Generate one if needed: `cd server && node scripts/make-test-pdf.js`.
- Seed a second student account (`arjun@test.com`) with one upload, so your admin demo has data.
- Have an admin account ready (run `node scripts/make-admin.js <your-email>` once).
- Open Chrome to `http://localhost:5173` — **logged out** — ready to record.

### 5. Before clicking Record
- Close Slack/Discord/WhatsApp so no notification pops mid-video.
- Turn off Windows notifications: Windows key → type "Focus" → turn on Focus mode.
- Take a breath. Smile. Let's go.

---

## The Script

> Each section has (1) **[SAY]** — what you narrate into the mic, and (2) **[DO]** — what you click or show on screen. Target time for each section is in `(00:15)` format.

---

### SECTION 1 — Intro (0:00 – 0:20)

**[DO]** Screen on the FLASHMASTER **landing page** (`http://localhost:5173/`).

**[SAY]**
> "Hi, I'm Venkata Harshini. This is a demonstration of my full-stack project, **FLASHMASTER** — an exam helper web application built on the MERN stack. FLASHMASTER lets students upload their study notes as PDFs, automatically generates flashcards from those notes, organises them by subject and topic, and tracks their revision progress over time. Let me walk you through it."

---

### SECTION 2 — Tech Stack (0:20 – 0:40)

**[DO]** Stay on the landing page. Let the camera rest on it while you narrate.

**[SAY]**
> "The project uses **MongoDB** for data storage, **Express.js version 5** and **Node.js** for the REST API, **React 19** with Vite for the frontend, and **Tailwind CSS** for styling. Authentication is implemented manually using **JSON Web Tokens** and **bcrypt** for password hashing. The app follows the **MVC architectural pattern**, with Mongoose models, Express route controllers, and React as the view layer."

---

### SECTION 3 — User Registration (0:40 – 1:10)

**[DO]** Click "**Sign Up**" in the navbar. Fill the form slowly — Name: `Priya Sharma`, Email: `priya@test.com`, Password: `password123`. Submit.

**[SAY]** (while filling)
> "Let's start by creating a student account. I'll click Sign Up, enter my name, my email, and a password. The password is hashed using bcrypt on the server before it's stored — it is never saved as plain text in the database. When I submit the form, the server issues a JSON Web Token, which my browser stores and sends with every future request to prove I'm logged in."

**[DO]** After redirect lands on Dashboard, pause for 2 seconds.

---

### SECTION 4 — Dashboard (1:10 – 1:30)

**[DO]** Hover over the stats cards on the Dashboard. Let the numbers breathe on screen.

**[SAY]**
> "After login, I land on the **Dashboard**. It shows a quick summary — how many materials I've uploaded, how many flashcards the system has generated for me, and the countdown to any upcoming exams I've set up."

---

### SECTION 5 — Uploading Material (1:30 – 2:10)

**[DO]** Click "**Materials**" in the navbar. Click the upload button. Select your pre-prepared sample PDF. Enter a subject like `Database Management Systems` and topic like `Normalization`. Submit.

**[SAY]**
> "Now let me upload some study material. I'll click Materials, pick a PDF of my DBMS lecture notes from my computer, tag it with a subject — Database Management Systems — and a topic — Normalization. When I click Upload, the file is sent to the backend using **Multer**, saved to local disk storage, and the text is extracted using the **pdf-parse** library. The extracted text is then passed to the flashcard generator, which automatically creates question-answer pairs from patterns like 'X is Y' and 'X means Y'."

**[DO]** After the material appears in the list, pause 2 seconds so it's clearly visible.

---

### SECTION 6 — Flashcards & Study Mode (2:10 – 3:00)

**[DO]** Click "**Flashcards**" in the navbar. Point at the filter chips at the top.

**[SAY]**
> "Here are the flashcards the system generated from my upload. I can filter them by subject or topic using these chips at the top. Let me enter **Study Mode** on one of them."

**[DO]** Click on a card. Click "Show Answer" or flip it. Tag it as **Hard**.

**[SAY]**
> "In Study Mode, I see the question first. Once I've thought about it, I click to reveal the answer. I can then rate the card as Easy, Medium, or Hard. This feedback flows into my **Progress** record — cards I tag as Hard show up later when I'm focusing on weak spots."

**[DO]** Tag 2 more cards with different difficulties (Easy, Medium) for variety.

---

### SECTION 7 — Study Plans (3:00 – 3:30)

**[DO]** Click "**Plans**" in the navbar. Click "Add new plan" (or whatever the button is). Enter subject `DBMS`, exam date **14 days from today**, daily target 30 minutes. Submit.

**[SAY]**
> "Let me create a study plan. My DBMS exam is two weeks away, so I'll enter the exam date, set a daily target of 30 minutes, and save. The dashboard and this page will now show a live countdown — **14 days until the DBMS exam**. As the date gets closer, I'll get notifications through the bell icon up top."

**[DO]** Point at the "14 days" countdown badge.

---

### SECTION 8 — Progress & Analytics (3:30 – 3:50)

**[DO]** Click "**Progress**" then "**Analytics**" in the navbar.

**[SAY]**
> "The Progress page shows my per-subject revision stats — how many cards I've reviewed for each subject, and how many were tagged Hard. And on the Analytics page, I can see the overall distribution — which subjects need more focus based on my difficulty ratings."

---

### SECTION 9 — Admin Dashboard (3:50 – 4:30)

**[DO]** Top right → click your name → **Sign Out**. Then sign in with your **admin** account. Click "**Admin**" in the navbar.

**[SAY]**
> "FLASHMASTER also has **role-based access control**. Let me sign out of the student account and sign back in as an admin. Regular students don't see the Admin link in the navbar — only users with the **admin role** can reach this page. That's enforced both on the frontend, by hiding the link, and on the backend, by the `requireRole('admin')` middleware on every admin API route."

**[DO]** Show the Users tab — point at the role badges. Click Materials tab — point at uploads from both users. Click Reports tab — point at the platform-wide stat cards.

**[SAY]** (while clicking each tab)
> "The admin dashboard has three tabs. **Users** lists every registered user with their role. **Materials** shows every uploaded file across the platform — I can delete anything that shouldn't be there, and the deletion cascades to the associated flashcards. **Reports** gives me platform-wide statistics: total users, materials, flashcards, the hard-card count across everyone's reviews, and recent uploads."

---

### SECTION 10 — CRUD Summary (4:30 – 4:50)

**[DO]** Go back to Materials or Flashcards page as a student. Hover over an item's edit / delete buttons.

**[SAY]**
> "Every resource in the system supports full **CRUD operations** — I can create, read, update, and delete materials, flashcards, and study plans. All mutating operations go through authentication middleware that validates the JWT and confirms the user owns the resource they're modifying."

---

### SECTION 11 — Outro (4:50 – 5:00)

**[DO]** Return to the Dashboard.

**[SAY]**
> "That's FLASHMASTER — a complete MERN-stack exam helper with JWT authentication, role-based access, automatic flashcard generation, and full CRUD. Thank you for watching."

**[DO]** Stop recording.

---

## After recording

1. Find the file in `Videos/Captures/` (Game Bar) or wherever OBS saved it.
2. If it's too long or you flubbed a line, trim with the free **Clipchamp** app (comes with Windows 11).
3. Upload to Google Drive: **Drive → New → File upload** → pick the video.
4. Right-click the uploaded file → **Share** → "Anyone with the link — Viewer" → **Copy link**.
5. Open `FLASHMASTER_REPORT.md`, find the "Demo Video Link" section, paste the link.
6. Re-run `python _build_docx.py` to refresh the .docx.

---

## Tips if something goes wrong

- **Voice sounds muffled/echoey:** move closer to the mic, record in a smaller room, add a blanket behind the laptop to kill echo.
- **Mouse feels jittery:** move slower, no flicking. Demo videos look more professional with slow, deliberate movement.
- **Stumble on a word:** pause for 2 full seconds, then restart the sentence. You can cut the flub in Clipchamp later.
- **Can't record all in one take:** record each section separately, then stitch them together in Clipchamp. Common approach.
- **Video file is huge (> 500 MB):** in Clipchamp, export at **720p** instead of 1080p — quality stays fine, file gets 3× smaller.
- **No time to narrate live:** record silent video first, then record voiceover separately and line them up in Clipchamp. Less stressful.

---

## Checklist before submitting

- [ ] Video is 4-5 minutes (sweet spot)
- [ ] Audio is audible throughout
- [ ] No other apps / notifications visible
- [ ] Mouse cursor is always visible on the recording
- [ ] Every page listed in the script actually appears
- [ ] Admin section shows a different account than the student section (so role-based auth is obvious)
- [ ] Drive link is set to "Anyone with the link can view"
- [ ] Link is pasted into `FLASHMASTER_REPORT.md`
- [ ] `.docx` rebuilt with the link visible

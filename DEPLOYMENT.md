# FLASHMASTER Deployment Guide

This guide walks through deploying FLASHMASTER to the free tiers of three services:

- **MongoDB Atlas** — free cloud database (512 MB)
- **Render.com** — free backend hosting for the Express server
- **Vercel** — free frontend hosting for the React app

Everything is free. No credit card required.

---

## Prerequisites

- GitHub account with this repo pushed up
- Email address
- ~20 minutes

---

## Step 1 — MongoDB Atlas (the database)

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free, no card)
2. Create a new project called `flashmaster`
3. Click **Build a Database** → pick the **M0 FREE** tier
4. Choose a region close to you (e.g. Mumbai for India)
5. Click **Create Deployment**
6. Atlas asks you to create a database user:
   - Username: `flashmaster`
   - Password: generate a strong one and **save it somewhere**
7. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) for development. You can tighten this later.
8. Click **Connect** on your cluster → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://flashmaster:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
9. Replace `<password>` with your actual password and add the database name at the end:
   ```
   mongodb+srv://flashmaster:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/flashmaster?retryWrites=true&w=majority
   ```

**Keep this string safe — you'll paste it into Render in the next step.**

---

## Step 2 — Render (the backend)

1. Go to https://render.com and sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your GitHub and pick the `FLASHCARDS` (or FLASHMASTER) repo
4. Fill in:
   - **Name**: `flashmaster-server`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**
5. Under **Environment Variables**, click **Add Environment Variable** and add:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | (paste the Atlas connection string from Step 1) |
   | `JWT_SECRET` | a long random string (generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
   | `JWT_EXPIRES_IN` | `7d` |
   | `BCRYPT_SALT_ROUNDS` | `10` |
   | `CLIENT_ORIGIN` | (leave empty for now — you'll update this after deploying the frontend) |
6. Click **Create Web Service**
7. Wait ~3 minutes for the first deploy. You'll see logs streaming.
8. Once deployed, Render gives you a URL like `https://flashmaster-server.onrender.com`
9. Visit the URL in your browser — you should see: `FLASHMASTER backend is alive.`

**Copy your Render URL — you'll paste it into Vercel in the next step.**

> **Note:** Render's free tier spins down after 15 minutes of inactivity. The first request after a spin-down takes ~30 seconds while the server wakes up. This is normal.

---

## Step 3 — Vercel (the frontend)

1. Go to https://vercel.com and sign up with GitHub
2. Click **Add New** → **Project** → import the `FLASHCARDS` repo
3. Fill in:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite (should auto-detect)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
4. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | the Render URL from Step 2, e.g. `https://flashmaster-server.onrender.com` |
5. Click **Deploy**
6. Wait ~1 minute. Vercel gives you a URL like `https://flashmaster-xxxx.vercel.app`
7. Visit the URL — you should see the FLASHMASTER home page.

---

## Step 4 — Point the backend at the frontend (CORS)

The backend needs to know the Vercel URL so it can accept requests from it.

1. Go back to Render → your `flashmaster-server` service → **Environment**
2. Edit the `CLIENT_ORIGIN` variable and set it to your Vercel URL, e.g.:
   ```
   CLIENT_ORIGIN=https://flashmaster-xxxx.vercel.app
   ```
3. Save — Render will auto-redeploy
4. Wait ~1 minute, then go back to your Vercel URL and try signing up. It should work.

---

## Step 5 — Test the live app

1. Sign up as a new user
2. Upload a PDF (small, < 5 MB)
3. Check that flashcards are auto-generated
4. Create a study plan
5. Check the dashboard, progress, and analytics pages
6. Verify notifications show up in the bell icon

If anything fails, check the logs:
- Render → Logs tab
- Vercel → Deployments → click the latest → View Function Logs

---

## Known limitations of the free tier

1. **Backend sleeps after 15 min idle** (Render free) — first request takes ~30s to wake up
2. **Uploaded files are not persisted** — only the extracted text is saved in MongoDB. That's fine for generating flashcards, but the original PDF file is dropped after processing.
3. **Ollama (local AI) is not available in production** — the Render server can't run Ollama, so flashcard generation falls back to the built-in heuristic parser. All flashcard features still work, just without LLM-quality questions.
4. **MongoDB Atlas M0 is 512 MB** — plenty for personal use, may fill up if many users upload lots of text.

---

## Updating after deployment

Any time you push to the `main` branch on GitHub:
- Render auto-redeploys the backend (~2 min)
- Vercel auto-redeploys the frontend (~1 min)

No manual steps needed. Just push and it's live.

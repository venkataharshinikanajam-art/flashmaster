// ===================================================================
// FLASHMASTER backend — entry point
// ===================================================================

import "dotenv/config"; // load .env BEFORE anything else
import express from "express";
import { connectDB } from "./config/db.js";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(express.json());

app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.url}`);
  next();
});

// ---------- Routes ----------
app.get("/", (req, res) => {
  res.send("FLASHMASTER backend is alive.");
});

app.get("/api/hello", (req, res) => {
  res.json({
    message: "Hello from FLASHMASTER!",
    timestamp: new Date().toISOString(),
  });
});

// Mount routers
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.url });
});

// ---------- Startup: connect to DB, then listen ----------
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✅ FLASHMASTER server listening on http://localhost:${PORT}`);
  });
};

start();

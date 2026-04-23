import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import usersRouter from "./routes/users.js";
import authRouter from "./routes/auth.js";
import materialsRouter from "./routes/materials.js";
import flashcardsRouter from "./routes/flashcards.js";
import plansRouter from "./routes/plans.js";
import progressRouter from "./routes/progress.js";
import notificationsRouter from "./routes/notifications.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];
if (process.env.CLIENT_ORIGIN) {
  process.env.CLIENT_ORIGIN.split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((origin) => allowedOrigins.push(origin));
}
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("FLASHMASTER backend is alive.");
});

app.get("/api/hello", (req, res) => {
  res.json({
    message: "Hello from FLASHMASTER!",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/flashcards", flashcardsRouter);
app.use("/api/plans", plansRouter);
app.use("/api/progress", progressRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/admin", adminRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.url });
});

app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  const status = err.status || 400;
  res.status(status).json({ error: err.message || "Internal server error" });
});

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`FLASHMASTER backend listening on http://localhost:${PORT}`);
  });
};

start();

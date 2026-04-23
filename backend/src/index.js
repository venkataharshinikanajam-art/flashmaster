import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import materialsRouter from "./routes/materials.js";
import flashcardsRouter from "./routes/flashcards.js";
import plansRouter from "./routes/plans.js";
import progressRouter from "./routes/progress.js";
import notificationsRouter from "./routes/notifications.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use(function (req, res, next) {
  console.log(req.method + " " + req.url);
  next();
});

app.get("/", function (req, res) {
  res.send("FLASHMASTER backend is alive.");
});

app.get("/api/hello", function (req, res) {
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

app.use(function (req, res) {
  res.status(404).json({ error: "Not Found", path: req.url });
});

app.use(function (err, req, res, next) {
  console.error("ERROR:", err.message);
  const status = err.status || 400;
  res.status(status).json({ error: err.message || "Internal server error" });
});

async function start() {
  await connectDB();
  app.listen(PORT, function () {
    console.log("FLASHMASTER backend listening on http://localhost:" + PORT);
  });
}

start();

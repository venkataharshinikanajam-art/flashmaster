// ===================================================================
// FLASHMASTER backend — Phase 2: Hello World
// ===================================================================
// This file is the entry point for the Express server.
// Run it with:  npm run dev  (from the server/ folder)
// ===================================================================

import express from "express";

// 1. Create an Express application instance.
const app = express();

// 2. Pick a port. 5000 is a common convention for backends.
const PORT = 5000;

// ------------------------------------------------------------------
// MIDDLEWARE — runs on every incoming request, in order.
// ------------------------------------------------------------------

// Parses incoming JSON request bodies. Without this, req.body is undefined.
app.use(express.json());

// A tiny custom logger middleware — demonstrates the concept.
// Prints "METHOD /path" for every request, then passes control to
// the next middleware/route with next().
app.use((req, res, next) => {
  console.log(`→ ${req.method} ${req.url}`);
  next();
});

// ------------------------------------------------------------------
// ROUTES — (method + url) → handler function
// ------------------------------------------------------------------

// GET /  — a plain text response
app.get("/", (req, res) => {
  res.send("FLASHMASTER backend is alive.");
});

// GET /api/hello  — a JSON response
app.get("/api/hello", (req, res) => {
  res.json({
    message: "Hello from FLASHMASTER!",
    timestamp: new Date().toISOString(),
  });
});

// GET /api/users/:id  — demonstrates URL parameters.
// The :id part is a placeholder — whatever the client sends
// ends up in req.params.id.
app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  res.json({
    id,
    name: `Fake user #${id}`,
    note: "In Phase 3, this will come from MongoDB instead of being hardcoded.",
  });
});

// POST /api/echo  — demonstrates reading a JSON request body.
// Client sends  { foo: "bar" }  and gets back
//               { youSent: { foo: "bar" }, gotItAt: "..." }
app.post("/api/echo", (req, res) => {
  res.json({
    youSent: req.body,
    gotItAt: new Date().toISOString(),
  });
});

// 404 catch-all — runs if no route above matched.
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.url });
});

// ------------------------------------------------------------------
// START THE SERVER
// ------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ FLASHMASTER server listening on http://localhost:${PORT}`);
});

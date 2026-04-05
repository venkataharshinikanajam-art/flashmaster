# Glossary

Plain-English definitions of terms used in this project. Every new word Claude introduces should end up here.

> **How to use:** Hit `Ctrl+F` in VS Code to find a term. If you hear Claude or a tutorial use a word that isn't here, stop and ask Claude to add it.

---

## A

**API (Application Programming Interface)** — A way for one program to talk to another. In web dev, usually means "the set of URLs your backend exposes so the frontend can request data."

**Async / asynchronous** — Code that doesn't finish immediately but starts a task and lets other code run while waiting. Opposite of "synchronous" (blocking).

**Async/await** — JavaScript syntax that makes async code look synchronous. `await` pauses *within this function* until the Promise resolves, without blocking the rest of the program.

**Auth / authentication** — Proving *who you are* (e.g., logging in with a password). Different from **authorization**.

**Authorization** — Deciding *what you're allowed to do* once authenticated (e.g., only admins can delete users).

---

## B

**Backend** — The part of the app that runs on a server. Handles data, business logic, databases, auth. Users never see it directly.

**bcrypt** — A library that securely hashes passwords. Hashes are one-way, so even if your database is stolen, the passwords aren't readable.

**Bash** — A text-based shell where you type commands. On Windows, we use Git Bash or Claude Code's built-in bash.

---

## C

**Client** — Whatever connects to the server. Usually the browser running your React code, but could also be a mobile app or curl.

**Collection (MongoDB)** — A group of related documents. Roughly equivalent to a "table" in SQL.

**Commit (git)** — A saved snapshot of your code at a moment in time, with a message describing the change.

**Component (React)** — A reusable piece of UI defined as a function that returns JSX. Buttons, forms, pages — everything in React is a component.

**CORS (Cross-Origin Resource Sharing)** — A browser security rule that blocks requests between different origins (e.g., frontend at `localhost:5173` to backend at `localhost:5000`) unless the server explicitly allows it.

**CRUD** — Create, Read, Update, Delete. The four operations every data-handling app needs.

---

## D

**Database** — A program specialized for storing, finding, and updating data efficiently. MongoDB is ours.

**Dependency** — A library your code needs to work. Listed in `package.json` and installed in `node_modules/`.

**Document (MongoDB)** — A single record in a collection. Shaped like a JSON object.

**Dev dependency** — A library you only need during development (e.g., `nodemon`). Not shipped to production.

---

## E

**Endpoint** — A specific URL on the backend that does one thing. E.g., `POST /api/auth/login` is the login endpoint.

**Environment variable** — A named value set outside the code, usually in a `.env` file. Used for secrets (like JWT keys) and config (like database URLs).

**ES modules (ESM)** — The modern JavaScript module syntax: `import` and `export`. The other style is CommonJS (`require`).

**Express.js** — The most popular Node.js web framework. Makes it easy to define routes and middleware.

---

## F

**Frontend** — The part of the app running in the user's browser. What they see and click. Built with React in this project.

**Full-stack** — Working on both frontend and backend. Full-stack developer = handles both ends.

---

## G

**Git** — Version control tool. Tracks every change to your code so you can go back or share with others.

**GitHub** — A website that hosts git repositories online so you can share them and collaborate.

---

## H

**Hash** — A one-way scrambling of data. Same input always produces same hash, but you can't go backwards from hash to input. Used for storing passwords safely.

**HTTP** — HyperText Transfer Protocol. The language browsers and servers use to talk. Every web request is an HTTP request.

**HTTP methods / verbs** — `GET` (read), `POST` (create), `PUT` (replace), `PATCH` (partial update), `DELETE` (delete). The verbs of REST APIs.

**HTTP status code** — A 3-digit number the server sends back. 2xx = success, 3xx = redirect, 4xx = client error (you messed up), 5xx = server error (we messed up).

---

## J

**JavaScript (JS)** — The language of the web. Originally for browsers, now also runs on servers via Node.js.

**JSON (JavaScript Object Notation)** — A text format for data. Looks like a JS object. Everyone uses it for APIs.

**JSX** — JavaScript syntax extension that lets you write HTML-like markup inside React components.

**JWT (JSON Web Token)** — A signed string the server gives a logged-in user. The user sends it back on every request to prove who they are. Analogy: a signed wristband at a concert.

---

## M

**Middleware (Express)** — A function that runs between receiving a request and sending a response. Can modify the request, reject it, or pass it along. Analogy: airport security checkpoints.

**MongoDB** — Our database. Stores data as JSON-like documents in collections.

**Mongoose** — A library that makes working with MongoDB in Node easier. Adds schemas, validation, and nicer query syntax. An "ODM" (Object Document Mapper).

**Monorepo** — One git repo containing multiple related projects. Ours has `server/` and `client/` in one repo.

---

## N

**Node.js** — A program that lets you run JavaScript outside the browser. Required for our backend.

**npm (Node Package Manager)** — Installs and manages JavaScript libraries. Comes with Node.

**`node_modules/`** — The folder where npm installs dependencies. Huge. Never committed to git.

**nodemon** — A dev tool that automatically restarts your Node server when files change. Saves you from stopping and restarting manually.

---

## O

**ODM (Object Document Mapper)** — A library that maps database documents to objects in your code. Mongoose is an ODM.

**ORM (Object Relational Mapper)** — Same idea as ODM, but for SQL databases.

---

## P

**Package.json** — A JSON file at the root of a Node project that lists dependencies, scripts, and metadata.

**Payload** — The data in the body of a request (usually JSON for POST/PUT).

**Port** — A number identifying a specific program listening on your computer. `localhost:5000` means "whatever is listening on port 5000". Common: 3000, 5000, 5173, 8080, 27017 (MongoDB default).

**Promise** — A JavaScript object representing "a value that will be available later". You wait for it with `.then()` or `await`.

---

## R

**React** — A JavaScript library for building UIs from components. Made by Facebook/Meta.

**Repo (repository)** — A project tracked by git.

**REST / RESTful** — A style of API design where URLs represent resources (`/users/42`) and HTTP verbs represent actions (`GET`, `POST`, etc.).

**Route** — A specific URL + method combo your server handles. `POST /api/auth/login` is a route.

**Router (Express / React)** — The piece that matches incoming URLs to the right handler.

---

## S

**Schema (Mongoose)** — The shape definition for documents in a collection. Says what fields exist and their types.

**Script (npm)** — A command defined in `package.json` under `"scripts"`. Run with `npm run <name>`.

**Server** — A program that waits for incoming requests and responds to them. Our Express app is a server.

**State (React)** — Data that can change over time within a component and triggers re-renders when it does.

---

## T

**Terminal** — A text interface for typing commands. Bash is one kind of terminal.

**Thunder Client** — A VS Code extension for testing HTTP APIs. Replaces Postman for us.

---

## U

**URL (Uniform Resource Locator)** — An address for a resource on the web. Has a protocol (`http://`), host (`localhost`), port (`:5000`), path (`/api/users`), and optional query (`?id=42`).

---

## V

**Vite** — A modern frontend build tool and dev server. Super fast. We use it instead of the deprecated Create React App.

---

*(This glossary grows as we go. When you hit a new word, ask Claude to add it.)*

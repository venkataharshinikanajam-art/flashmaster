# What is Full-Stack Development?

Read this before you write any code. It's the mental model for the entire project.

---

## The problem

You open Instagram. You see your feed. You double-tap a photo. A heart appears. The photo's like count goes up.

Between "your finger taps the screen" and "the like is saved forever so your friend can see you liked it from their phone tomorrow" — **a lot happens**. That "a lot" is what full-stack development covers.

---

## The three worlds

Every modern web/mobile app has **three separate worlds** that have to cooperate:

### 🎨 Front-end (the face)
What the user sees and clicks. Buttons, colors, forms, animations. Runs in the user's browser (or phone).

For us: **React** components rendered in Chrome/Firefox.

### 🧠 Back-end (the brain)
Where decisions are made. Checks passwords, runs business logic, talks to the database. Runs on a server — a computer somewhere that's always on.

For us: **Node.js + Express** running on your laptop (later it could run on a cloud server, but for learning everything is local).

### 🗄️ Database (the memory)
Where all the data lives. Users, their flashcards, study plans, upload history. Optimized to store a lot and find specific things fast.

For us: **MongoDB** running as a service on your laptop.

---

## The restaurant analogy

This is the one that clicks for most people.

| Restaurant | Web App |
|---|---|
| **Customer** | User |
| **Menu + tables + decor** | Front-end (React) — what the customer sees and interacts with |
| **Waiter** | The **request/response** cycle — carries orders back and forth |
| **Kitchen** | Back-end (Express) — where the actual work happens |
| **Pantry / storeroom** | Database (MongoDB) — where ingredients (data) are stored |

**What happens when a customer orders biryani:**

1. Customer reads the **menu** (front-end renders).
2. Customer tells the **waiter** what they want (front-end sends an HTTP request).
3. Waiter takes the order to the **kitchen** (request arrives at back-end).
4. Kitchen checks the **pantry** for rice and chicken (back-end queries database).
5. Kitchen cooks the biryani (back-end processes).
6. Waiter brings the biryani out (back-end sends response).
7. Customer eats (front-end shows the result).

Every "click a button and see something happen" in a web app is exactly this flow.

---

## Where FLASHMASTER fits

Let's trace what happens when Sneha (our example user) uploads a PDF of her notes:

1. **Front-end (React):** Sneha clicks "Upload". Her browser sends the PDF file to our server. → *Front-end does this*
2. **Back-end (Express):** Our server receives the file, saves it to a folder, and extracts the text from the PDF. → *Back-end does this*
3. **Database (MongoDB):** The server stores a record: *"User Sneha uploaded a file called notes.pdf on this date, path is uploads/xyz.pdf"*. → *Database does this*
4. **Back-end:** The server generates flashcards from the extracted text and stores them in the database. → *Back-end + database*
5. **Back-end → Front-end:** The server tells the browser "upload succeeded, here are the new flashcards."
6. **Front-end:** The browser shows Sneha her new flashcards.

Every phase of this project is building one piece of this loop.

---

## Why keep them separate?

Why not just one big program? Because:

- **Browsers can't access the database directly.** For security. Imagine if anyone could type a URL and dump your passwords.
- **The same back-end can serve many clients.** A web app, a mobile app, and a CLI can all talk to the same Express server.
- **Each world has its own strengths.** Browsers are great at rendering. Servers are great at logic. Databases are great at storage. Specialization wins.
- **Separation of concerns.** If your login logic is broken, you don't want to redeploy your entire front-end to fix it.

---

## The stack we're building

Our **stack** (pile of tools) is called **MERN**:

- **M** ongoDB — the database
- **E** xpress — the back-end framework
- **R** eact — the front-end framework
- **N** ode.js — runs the Express server

A "stack" is just the collection of technologies you're using. People also talk about LAMP stacks, MEAN stacks, T3 stacks, etc. MERN is one of the most popular.

---

## What you'll build in this project

By the end of Phase 13, you'll have built every layer of MERN from scratch and connected them. You'll be able to say:

> "Yeah, I built a full-stack web app. React on the front-end, Node and Express on the back-end, MongoDB for data. Auth with JWT. File uploads with Multer. Deployed locally."

That sentence is the basic resume line for a junior full-stack developer.

---

## Checkpoint questions

Answer these in your own words before moving on. Don't look back at the doc.

1. In the restaurant analogy, what does the "waiter" correspond to in a web app, and what does it do?
2. Why can't the browser talk directly to the database?
3. In the MERN stack, which letter is the database, and which is the back-end framework?

If you can answer those, you've got the mental model. Let's go build it.

# Phase 1 — JavaScript Crash Course (for C/Python devs)

**Goal:** Learn the parts of JavaScript that are *different* from C and Python and will trip you up if you don't know them. We skip the things you already understand (loops, if/else, basic math) and focus on the JS-specific stuff.

**Duration:** 6 mini-sessions (take them in order, one per sitting).

**You'll know you're done when:**
- You can run a `.js` file with `node file.js`
- You understand `let` vs `const` and why `var` is dead
- You can write regular functions AND arrow functions
- You can work with objects (`{key: value}`) and arrays
- You know `.map()`, `.filter()`, `.reduce()` and what they do
- You understand promises and `async/await` at a basic level
- You can use `import` / `export` to split code into files
- All 6 session scripts run without errors
- `PROGRESS.md` has Phase 1 checked off

---

## Why JS is different

You already know loops, conditions, variables, functions from C/Python. Good. JavaScript has all of those, but with its own flavor and some booby-traps. The things that commonly bite beginners:

1. **There are THREE ways to declare a variable** (`let`, `const`, `var`) and they behave differently. Only two of them are ok to use.
2. **`==` doesn't mean what you think it means.** Use `===`.
3. **Functions are values** you can store in variables — more flexible than C.
4. **There's no "dict" or "struct"** — JS objects are both.
5. **Strings use backticks `` ` ``** for fancy formatting.
6. **Async is baked into the language** via promises and `async/await`.
7. **Modules use `import`/`export`**, not `#include` or Python's `import`.

We'll cover all of these, one at a time.

---

## Session 1.1 — Running JavaScript + variables + strings

**What you'll learn:** How to run a `.js` file, `let` vs `const`, `console.log`, template strings (backticks), the 6 main types.

See `sandbox/js-basics/01-hello.js` for the practice script. Claude will walk you through it live.

**Checkpoint questions:**
1. What's the difference between `let` and `const`?
2. Why do we use backticks `` ` `` instead of quotes sometimes?
3. If you try to do `const x = 5; x = 10;`, what happens?

---

## Session 1.2 — Functions (regular vs arrow) + scope

**What you'll learn:** `function` keyword, arrow functions `=>`, implicit return, functions as values, basic scope.

Script: `sandbox/js-basics/02-functions.js`

**Checkpoint questions:**
1. Write an arrow function that takes two numbers and returns their sum.
2. What does "functions are values" mean?
3. What's the difference between `function greet() {}` and `const greet = () => {}`?

---

## Session 1.3 — Objects + arrays + destructuring

**What you'll learn:** Object literal syntax, accessing fields with `.` and `[]`, array basics, destructuring (`const {a, b} = obj`), spread operator (`...`).

Script: `sandbox/js-basics/03-objects-arrays.js`

**Checkpoint questions:**
1. Given `const user = { name: 'Harsh', age: 20 }`, destructure `name` into its own variable.
2. What does `[...arr1, ...arr2]` do?
3. How is a JS object different from a Python dict? (They're similar but not identical.)

---

## Session 1.4 — Array methods: `.map()`, `.filter()`, `.reduce()`

**What you'll learn:** The three methods you'll use ~1,000 times. How they replace `for` loops in 90% of cases.

Script: `sandbox/js-basics/04-array-methods.js`

**Checkpoint questions:**
1. What does `.map()` return? (Trick: what shape and how many items?)
2. Write a one-liner that doubles every number in an array using `.map()`.
3. Write a one-liner that keeps only even numbers using `.filter()`.

---

## Session 1.5 — Modules: `import` / `export`

**What you'll learn:** How to split code into multiple files, named exports vs default exports, `import` syntax.

Scripts: `sandbox/js-basics/05-modules/` (multiple files)

**Checkpoint questions:**
1. What's the difference between named and default exports?
2. Why do we need modules — what problem do they solve?
3. In a `package.json`, what does `"type": "module"` do?

---

## Session 1.6 — Promises and `async` / `await`

**What you'll learn:** What a promise is, why it exists, `.then()` / `.catch()`, the `async`/`await` syntax that makes async code look normal.

Script: `sandbox/js-basics/06-async.js`

**Checkpoint questions:**
1. What problem do promises solve?
2. What does `await` do?
3. Can you use `await` outside of an `async` function? (Mostly no. Know when yes.)

---

## After Phase 1

Once all 6 sessions are done, you know enough JavaScript to build real things. Phase 2 starts the actual backend — we'll install Express and build your first server.

Say: **"phase 1 done — start phase 2"** when ready.

---

## If you get lost

- **Forgot what a term means?** → `docs/glossary.md`
- **Forgot a command?** → `docs/commands-cheatsheet.md`
- **A script errors out?** → paste the error in chat, ask for the `debugger` agent
- **A concept isn't clicking?** → ask: *"teach me [concept] again with a different analogy"*

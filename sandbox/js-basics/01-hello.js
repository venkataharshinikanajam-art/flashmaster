// ===================================================================
// Session 1.1 — Running JS + variables + strings
// Run this file with:  node sandbox/js-basics/01-hello.js
// ===================================================================

// --- 1. console.log: JavaScript's print statement ---
// (Like printf in C, or print() in Python)
console.log("Hello, FLASHMASTER!");

// --- 2. Variables: let and const ---
// `let`   → a box whose contents you can change later
// `const` → a box whose contents CANNOT change (locked)
// Rule of thumb: use `const` by default. Use `let` only when you
// actually need to reassign.

const name = "Harsh";        // I'm NOT going to change this -> const
let age = 20;                // I MIGHT change this later     -> let

console.log("My name is:", name);
console.log("My age is:", age);

// Changing a `let` variable: allowed
age = 21;
console.log("After birthday, age is:", age);

// Try uncommenting this line to see what happens:
// name = "Someone else";     // ❌ TypeError: Assignment to constant variable.

// --- 3. The 6 main types ---
// JavaScript has these core types you'll use every day:
const aNumber   = 42;              // numbers (integers AND decimals, same type)
const aDecimal  = 3.14;
const aString   = "text in quotes";
const aBoolean  = true;            // or false
const nothing   = null;            // "intentionally empty"
let   notSetYet;                   // undefined — "no value assigned yet"

console.log("");
console.log("--- types ---");
console.log("aNumber:", aNumber, "| typeof:", typeof aNumber);
console.log("aDecimal:", aDecimal, "| typeof:", typeof aDecimal);
console.log("aString:", aString, "| typeof:", typeof aString);
console.log("aBoolean:", aBoolean, "| typeof:", typeof aBoolean);
console.log("nothing:", nothing, "| typeof:", typeof nothing);
console.log("notSetYet:", notSetYet, "| typeof:", typeof notSetYet);

// Notice: JavaScript has ONE number type, not int/float/double like C.
// Also notice: typeof null is "object" — a famous JS bug from 1995
// that can never be fixed (would break too much existing code). Ignore it.

// --- 4. Strings: three kinds of quotes ---
const single = 'single quotes';
const double = "double quotes";
const backtick = `backticks (template literals)`;
// Single and double quotes do the same thing — use whichever you like.
// Backticks are SPECIAL: they let you insert variables inside the string.

console.log("");
console.log("--- strings ---");
console.log(single);
console.log(double);
console.log(backtick);

// The superpower of backticks: ${expression} inside the string
// gets replaced with the value of that expression.
const greeting = `Hi, my name is ${name} and I am ${age} years old.`;
console.log(greeting);

// Compare with the old way (painful):
const oldWay = "Hi, my name is " + name + " and I am " + age + " years old.";
console.log(oldWay);
// Template literals (backticks) are WAY nicer. Use them for anything
// more than a plain static string.

// --- 5. A quick gotcha: == vs === ---
// JavaScript has TWO equality operators:
//   ==  → "loose equality" — tries to convert types before comparing (EVIL)
//   === → "strict equality" — checks type AND value (SANE)
// Always use === unless you have a very specific reason not to.

console.log("");
console.log("--- == vs === ---");
console.log("5 == '5'  →", 5 == "5");    // true  😱 (converts string to number)
console.log("5 === '5' →", 5 === "5");   // false ✅ (different types)
console.log("5 === 5   →", 5 === 5);     // true  ✅

// Rule: ALWAYS use ===. Forget == exists.

// --- 6. Your first real output ---
console.log("");
console.log("=================================");
console.log(`  🚀 ${name} is learning JavaScript!`);
console.log("=================================");

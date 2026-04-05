// ===================================================================
// The rest of JavaScript in one file.
// Run with:  node sandbox/js-basics/02-everything.js
// ===================================================================

// -------------------------------------------------------------------
// 1. FUNCTIONS — two flavors
// -------------------------------------------------------------------
console.log("--- 1. Functions ---");

// Old-school function declaration
function addOld(a, b) {
  return a + b;
}

// Arrow function (modern, shorter, used everywhere in real code)
const addNew = (a, b) => a + b;
//                    ^-- implicit return: no curly braces, no `return` keyword

console.log("addOld(2, 3):", addOld(2, 3));
console.log("addNew(2, 3):", addNew(2, 3));

// Functions are VALUES. You can pass them around like any other variable.
const greet = (name) => `Hello, ${name}!`;
const sayIt = greet;           // copy the function into another variable
console.log(sayIt("Harsh"));

// -------------------------------------------------------------------
// 2. OBJECTS — JS's version of a Python dict / C struct
// -------------------------------------------------------------------
console.log("\n--- 2. Objects ---");

const user = {
  name: "Harsh",
  age: 20,
  city: "Chennai",
  isStudent: true,
};

console.log("user.name:", user.name);          // dot access
console.log("user['age']:", user["age"]);      // bracket access (same thing)

// Add or change fields on the fly
user.college = "SRM";
user.age = 21;
console.log("updated user:", user);

// -------------------------------------------------------------------
// 3. ARRAYS — ordered lists
// -------------------------------------------------------------------
console.log("\n--- 3. Arrays ---");

const subjects = ["DBMS", "OS", "DSA"];
console.log("subjects[0]:", subjects[0]);
console.log("length:", subjects.length);

subjects.push("Networks");             // add to the end
console.log("after push:", subjects);

// -------------------------------------------------------------------
// 4. DESTRUCTURING — unpack objects/arrays in one line
// -------------------------------------------------------------------
console.log("\n--- 4. Destructuring ---");

// Old way
const nameOld = user.name;
const cityOld = user.city;

// New way: pull fields out by name
const { name, city, age } = user;
console.log(`${name} lives in ${city}, age ${age}`);

// Works for arrays too (by position)
const [first, second] = subjects;
console.log("first subject:", first, "| second:", second);

// -------------------------------------------------------------------
// 5. SPREAD — expand an array/object into another
// -------------------------------------------------------------------
console.log("\n--- 5. Spread ---");

const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];   // [1,2,3,4,5,6]
console.log("combined:", combined);

const base = { name: "Harsh", age: 21 };
const extended = { ...base, college: "SRM" };   // copy + add
console.log("extended:", extended);

// -------------------------------------------------------------------
// 6. ARRAY METHODS — the holy trinity: map, filter, reduce
// -------------------------------------------------------------------
console.log("\n--- 6. Array methods ---");

const nums = [1, 2, 3, 4, 5];

// .map() — transform each item, returns a NEW array of the same length
const doubled = nums.map((n) => n * 2);
console.log("doubled:", doubled);      // [2, 4, 6, 8, 10]

// .filter() — keep only items that pass a test, returns a SHORTER array
const evens = nums.filter((n) => n % 2 === 0);
console.log("evens:", evens);          // [2, 4]

// .reduce() — squish the array down to a single value
const sum = nums.reduce((total, n) => total + n, 0);
console.log("sum:", sum);              // 15

// Real FLASHMASTER example: get all difficult flashcards' questions
const flashcards = [
  { q: "What is DFS?", difficulty: "hard" },
  { q: "What is a primary key?", difficulty: "easy" },
  { q: "What is a B-tree?", difficulty: "hard" },
];
const hardQuestions = flashcards
  .filter((c) => c.difficulty === "hard")
  .map((c) => c.q);
console.log("hard questions:", hardQuestions);

// -------------------------------------------------------------------
// 7. ASYNC / AWAIT — handling things that take time
// -------------------------------------------------------------------
console.log("\n--- 7. Async / await ---");

// A function that pretends to fetch data from a database.
// It returns a PROMISE: "I'll give you the value eventually."
const fetchUser = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id, name: "Sneha" }), 500);
    //                                         ^-- 500ms delay
  });
};

// The modern way to wait for a promise: `await`.
// `await` can only be used inside an `async` function.
const main = async () => {
  console.log("fetching user...");
  const user = await fetchUser(42);
  console.log("got user:", user);
  console.log("done.");
};

main();

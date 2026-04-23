// Creates a small test PDF for upload testing.
// Run from the backend/ folder with:  node scripts/make-test-pdf.js

import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "test-notes.pdf");

const doc = new PDFDocument({ size: "A4", margin: 50 });
doc.pipe(fs.createWriteStream(out));

doc.fontSize(18).text("Data Structures — Linked Lists (study notes)", { underline: true });
doc.moveDown();
doc.fontSize(12).text(
  "A linked list is a linear data structure in which elements are not stored at contiguous memory locations. " +
  "Instead, each element (called a node) contains a value and a pointer to the next node in the sequence. " +
  "Linked lists are useful when the size of the data is unknown in advance and insertions/deletions are frequent."
);
doc.moveDown();
doc.text(
  "There are three main types of linked lists: singly linked, doubly linked, and circular linked. " +
  "In a singly linked list, each node points only to the next node. In a doubly linked list, each node " +
  "points to both the previous and next nodes. In a circular linked list, the last node points back to the first."
);
doc.moveDown();
doc.text(
  "Common operations include: insertion at head, insertion at tail, deletion by value, traversal, and search. " +
  "The time complexity of search is O(n) because you must walk the list from the head."
);

doc.end();
console.log(`wrote ${out}`);

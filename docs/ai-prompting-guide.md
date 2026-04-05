# AI Prompting Guide

How to ask Claude (and other AI tools) for help so you actually learn and the code actually works. This is a skill — it gets better with practice.

---

## The golden rules

1. **Be specific.** "Help me with my code" is useless. "The POST /api/auth/signup route returns 500 when the password is empty — here's the error and the file" is useful.
2. **Paste errors verbatim.** Don't describe errors in your own words. Copy-paste the exact text.
3. **Say what you already tried.** Saves time and shows you're engaged.
4. **Say what kind of help you want.** Explanation? Code? Debugging? Research? Code review?
5. **Stop if you don't understand.** Say so. Ask Claude to slow down or re-explain.

---

## The "three-part prompt" template

For any non-trivial request, structure it like this:

```
[CONTEXT] I'm working on Phase 3 of FLASHMASTER. I'm trying to...

[PROBLEM] The issue is... Here's the relevant code/error:
<paste code or error>

[ASK] Can you explain what's happening and teach me the concept before we fix it?
```

### Example — good prompt

```
I'm in Phase 4 trying to add a login route. I wrote this:

  app.post('/api/auth/login', async (req, res) => {
    const user = User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ token: 'TODO' });
  });

When I send a login request in Thunder Client, it responds 200 but
`user` in the logs is a Promise, not a user document. Why?

Please teach me what's wrong before fixing it. I think it has
something to do with async but I'm not sure.
```

Why this is great:
- Clear context (Phase 4, login route)
- Shows the actual code
- Describes what happened vs expected
- Asks for the teaching, not just the fix
- Admits the current mental model ("I think...")

### Example — bad prompt

```
login not working pls fix
```

Why this is bad:
- No code
- No error
- No context
- Claude has to guess at everything

---

## Specific prompt recipes

### "Teach me before we code"
> *"Before we write the [feature], teach me what [concept] is. Use the teacher agent. Real-life analogy, a tiny example, and two checkpoint questions."*

Use when: you're about to touch a concept you don't fully understand.

### "Review what I just built"
> *"I finished Phase N. Use the code-reviewer agent to go through the new code, flag any bugs, and suggest improvements. Update PROGRESS.md."*

Use when: you wrap up a chunk of work.

### "Walk me through this error"
> *"I got this error when I ran X: [paste error]. I was trying to [what]. I already tried [what you tried]. Use the debugger agent to walk me through it."*

Use when: something breaks.

### "Is this library current?"
> *"I saw a tutorial suggesting we use [package-name]. Use the researcher agent to check if it's still maintained, works with Node 20, and fits FLASHMASTER's needs. Compare to alternatives."*

Use when: you're about to install something you're not sure about.

### "Explain this code line by line"
> *"I don't understand this code you wrote. Explain every line in plain English, and tell me which concepts I'd need to google to deepen my understanding:
> [paste code]"*

Use when: Claude-generated code is working but feels magical.

### "Let me try first, then review"
> *"I want to try writing the [thing] myself. Just give me the file name and signature. I'll show you what I wrote after."*

Use when: you want to practice.

### "Slow down"
> *"Wait. I don't understand [term / step]. Can you back up and explain it before we continue?"*

Use anytime. Never be embarrassed to interrupt.

---

## Things that sabotage your prompts

### "I'm dumb" / "I'm probably wrong but..."
Don't apologize. Just ask. Self-deprecation wastes tokens and makes Claude hedge its answers.

### Asking yes/no questions when you want an explanation
"Should I use let or const?" → You get a one-word answer.
"When should I use let vs const, and why? Give an example of each." → You get a lesson.

### Multi-question mega-prompts
Asking 5 unrelated things at once fragments the response. Ask one focused thing at a time.

### Not reading the previous response
If Claude answered and you reply without referring to what it said, you'll go in circles. Read, then respond.

### "Just give me the code"
Sometimes this is valid (you're in a hurry). But if you say it every time, you won't learn. Use it sparingly.

---

## Using the subagents effectively

Each subagent is specialized. Pick the right one, or say "pick the right agent for this".

| You need... | Say... |
|---|---|
| A concept explained | "Use the teacher agent to explain [concept]" |
| An error fixed with understanding | "Use the debugger agent on this: [error]" |
| End-of-phase sanity check | "Use the code-reviewer agent on Phase N" |
| Library comparison or API verification | "Use the researcher agent to compare [X] vs [Y]" |

Or simply describe your situation and let Claude pick.

---

## Researching beyond Claude

When Claude says "check the docs" or you want to go deeper, here are the good sources:

### Authoritative sources (trust high)
- **MDN Web Docs** (<https://developer.mozilla.org/>) — the gold standard for JavaScript, HTML, CSS
- **Official project websites** — `nodejs.org`, `expressjs.com`, `react.dev`, `mongoosejs.com`, `tailwindcss.com`, `vite.dev`
- **npm package pages** (<https://www.npmjs.com/>) — for install and version info
- **GitHub repo READMEs** — for library-specific docs

### Decent sources (trust medium — verify)
- **Stack Overflow** — answers older than 3 years may be outdated
- **Well-known dev blogs** — LogRocket, Kent C. Dodds, Josh Comeau

### Sources to be careful with
- **Random Medium articles** — quality varies wildly, often outdated
- **YouTube tutorials older than 2 years** — JS ecosystem moves fast
- **LLMs without verification** — including Claude. Cross-check important facts against official docs.

### The 3-source rule
Before trusting a non-obvious fact (especially about library APIs or best practices), check **three independent sources**. If they agree, confidence is high. If they disagree, keep digging.

---

## How to google like a developer

1. **Include the tool version.** `express v4 middleware` > `express middleware`.
2. **Include the exact error.** Copy-paste the full message.
3. **Use quotes for exact phrases.** `"TypeError: Cannot read properties"`.
4. **Add `site:stackoverflow.com`** to limit to SO.
5. **Add a year** to push for recent results: `mongoose tutorial 2025`.
6. **Search for the concept, not the code.** "how does jwt refresh work" > "jwt code".

---

## Learning habits that compound

- **Write in your own words.** After Claude explains something, paraphrase it back. If you can't, you didn't understand.
- **Build a personal cheat sheet.** Every time you learn a command or pattern, add it to `commands-cheatsheet.md` or `glossary.md`.
- **Explain it to a rubber duck.** Or a friend. Or an imaginary student. Teaching forces clarity.
- **Don't race.** Semester pace. Depth beats speed.
- **Come back to old code.** Re-read what you wrote 3 phases ago. Notice how much clearer it is now.

---

**Next:** Open [`glossary.md`](./glossary.md) to see how new terms will be tracked as we go. Or jump to [`phases/phase-00-foundations.md`](./phases/phase-00-foundations.md) to begin.

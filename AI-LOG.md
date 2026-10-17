# AI Log — Session 7 (Shelf)

**Tool used:** Claude (Anthropic), in a chat conversation.

**How I used it:** as a step-by-step guide while rebuilding the course's *Screen Time* architecture for a new domain. Claude proposed the code for each module and explained it line by line. I typed every file myself in VS Code, ran the checks it suggested in the browser console and DevTools, and answered its comprehension questions. Some of my first answers were wrong, and I note those below because correcting them is where I learned the most.

(The prompts below are translated from Persian.)

---

## Entry 1 — Mapping Screen Time onto Shelf

**What I asked:**
> Here is my teacher's assignment and his Screen Time project. Walk me through rebuilding it for the Shelf assignment step by step, because I don't know this well yet.

**What it returned:**
> A file-by-file map from Screen Time to Shelf, a warning list of places where the reference code cannot be copied as-is, and a build order (setup, emitter and debounce, store, api, views, main, detail, docs).

**What I changed and why:**
> I set up Vite and Tailwind v4 myself and removed the template files. I kept ids as strings because Open Library work keys look like `/works/OL27448W`, while the reference project used `Number()` on numeric TVMaze ids, which would turn every key into `NaN`. I also did not carry over three issues found in the reference: `view.innerHTML` used instead of `viewEl.innerHTML`, `errorState("state.error")` passing a literal string instead of the variable, and a Retry button that had no click handler.

---

## Entry 2 — Understanding the emitter and debounce

**What I asked:**
> Explain `emitter.js` and `debounce.js` line by line: what each one does and why it exists.

**What it returned:**
> An explanation of publish/subscribe (listeners stored per event name, `on` returning an unsubscribe function through a closure) and of debounce (a shared `timerId` that is cleared and restarted on every call).

**What I changed and why:**
> I renamed `creatEmitter` to `createEmitter`, as the assignment specifies. I tested it in the console: after `off()` a second `emit` no longer reached the handler, and when I removed `off()` both events were received, which confirmed that the unsubscribe closure really removes the handler.

---

## Entry 3 — The shelf store

**What I asked:**
> Explain how `store.js` should work and why it is built that way (private array, immutable updates, localStorage, change event).

**What it returned:**
> A store with a private `items` array, a single `set()` function that swaps the array, saves it and emits `change`, defensive copies from `getItems()`, and a guarded `loadInitial()`.

**What I changed and why:**
> I tested persistence by reloading, the no-duplicate rule by adding the same book twice, and immutability by calling `push` on the array returned from `getItems()`. The store's own count stayed the same, so the copy protects the real data. After a review I added `year` to the stored fields, because shelf cards display the publish year and without it saved books would always show a dash. I kept the `Array.isArray` check in `loadInitial()` because valid JSON that is not an array (for example `{}`) would otherwise break `items.some`.

---

## Entry 4 — Talking to Open Library

**What I asked:**
> Write `api.js` for Open Library and explain every part.

**What it returned:**
> `searchBooks` and `getWork`, each checking `res.ok`, using `encodeURIComponent`, sending `fields` and `limit`, and converting raw responses into clean objects (including normalising the three shapes of `description`).

**What I changed and why:**
> I replaced the TVMaze code in `api.js` completely. I left `edition_count` out of the requested fields because nothing in the app uses it. I checked the results in the console: real data contained a book with no author and no cover, and it came out as `Unknown author` and `null` without breaking the other 23 books. A deliberately wrong work key returned a clear 404 error, which proved the `res.ok` check works. My first explanation of why `description` is normalised in `api.js` was only partly right: the real reason is that it is done once at the boundary, so no view has to know about the three shapes.

---

## Entry 5 — Pure view templates

**What I asked:**
> Write `views.js` with the card, grid, shelf view and states, in the warm Emerald/Amber theme, and explain it.

**What it returned:**
> Pure template functions with an `esc()` helper, a `cover()` function with a placeholder, `data-` attributes instead of inline handlers, and `resultsGrid` taking an `isSaved` function instead of the store.

**What I changed and why:**
> Vite showed "Failed to resolve import ./views.js". I read the error overlay, found that I had not created the file, and added it. I tested `esc` with a fake book titled `Weird <b>"Book"</b>`: it displayed as plain text and was not rendered as bold, which shows why escaping is needed. Books without covers showed the gradient placeholder instead of a broken image.

---

## Entry 6 — Wiring everything in `main.js`

**What I asked:**
> Write `main.js` (state, `render()`, actions, one click listener, `store.onChange`) and explain how the pieces connect.

**What it returned:**
> A state object, a `render()` that is the only place writing `innerHTML`, `doSearch` with `AbortController`, a `retry` action, one delegated click listener, and `store.onChange(() => render())`. It also gave an updated `index.html` with the header, badge and `#view` container.

**What I changed and why:**
> I replaced the earlier test code in `main.js` and rewrote `index.html`. I tested search, adding and removing from both views, the badge, persistence after reload, the empty state and the error state with Retry (using the Offline option in DevTools). I can trace the removal path: click, delegated listener, `store.toggle`, `set()`, `emit("change")`, `render()`. `main.js` never calls `render()` after a toggle on its own.

---

## Entry 7 — Detail view and what I got wrong

**What I asked:**
> Add the book detail view, and then check my answers to the comprehension questions.

**What it returned:**
> `detailView` and a Back button in `views.js`, plus `openDetail`, separate `detailStatus` and `detailError` fields, a `from` field so Back returns to where I came from, and an id check against stale responses. It then reviewed my answers to three questions.

**What I changed and why:**
> My first answers were partly wrong, and the corrections are now clear to me. A separate `detailStatus` exists because search and detail are independent async operations; with one shared status, leaving a loading detail page would leave the search view stuck on "Searching". The line that hides the three shapes of `description` is the `typeof work.description === "string"` expression in `getWork`; I had pointed at the cache lookup, which actually supplies the author and year. Without the `state.detailId !== id` check, a slow response for book A could arrive after book B is open and mix A's description with B's author.

---

## Entry 8 — README and diagrams

**What I asked:**
> I want this project in my portfolio. Write a comprehensive README with DFD, UML, flowcharts and a description of every file and how the code works.

**What it returned:**
> A README containing Mermaid DFD (level 0 and 1), a module/class diagram, sequence and state diagrams, flowcharts for `render()`, `doSearch` and `openDetail`, a per-file reference, a data model, a table of guarded data cases, design decisions and known limitations.

**What I changed and why:**
> The README credits Open Library as the assignment requires and lists only the limitations that really exist (no pagination, no keyboard support, no automated tests). [Add here: anything you corrected after checking each diagram against your own code.]

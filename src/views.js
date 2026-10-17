function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
}

function cover(coverId, title, size, classes) {
  return coverId
    ? `<img src="https://covers.openlibrary.org/b/id/${esc(coverId)}-${size}.jpg" alt="${esc(title)}" class="${classes}" loading="lazy" />`
    : `<div class="${classes} flex items-center justify-center bg-gradient-to-br from-emerald-100 to-amber-100 p-3 text-center font-serif text-stone-600">${esc(title)}</div>`;
}

function shelfButton(id, saved) {
  return saved
    ? `<button data-shelf="${esc(id)}" class="rounded-lg bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">✓ Saved</button>`
    : `<button data-shelf="${esc(id)}" class="rounded-lg bg-emerald-700 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-800">＋ Shelf</button>`;
}

export function bookCard(book, saved) {
  return `
    <article data-book-key="${esc(book.id)}" class="cursor-pointer overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md">
      ${cover(book.coverId, book.title, "M", "h-64 w-full object-cover")}
      <div class="p-3">
        <h3 class="line-clamp-2 font-serif font-semibold text-stone-900">${esc(book.title)}</h3>
        <p class="mt-0.5 truncate text-xs italic text-stone-500">${esc(book.author)}</p>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-xs uppercase tracking-wide text-stone-400">${book.year ? esc(book.year) : "—"}</span>
          ${shelfButton(book.id, saved)}
        </div>
      </div>
    </article>
  `;
}

export function resultsGrid(books, isSaved) {
  return `
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      ${books.map((book) => bookCard(book, isSaved(book.id))).join("")}
    </div>
  `;
}

export function shelfView(items) {
  if (!items.length) {
    return `
      <h2 class="mb-4 font-serif text-2xl font-bold text-stone-900">Your reading list</h2>
      ${emptyState("Your shelf is empty — search for a book and hit “＋ Shelf”.")}
    `;
  }
  return `
    <h2 class="mb-4 font-serif text-2xl font-bold text-stone-900">Your reading list (${items.length})</h2>
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      ${items.map((book) => bookCard(book, true)).join("")}
    </div>
  `;
}
export const backButton = `<button data-back class="mb-4 text-sm font-medium text-emerald-700 hover:underline">← Back</button>`;

export function detailView(work, book, isSaved) {
  const coverId = work.coverId ?? book?.coverId ?? null;
  const subjects = work.subjects.slice(0, 12);

  return `
    ${backButton}
    <div class="flex flex-col gap-6 sm:flex-row">
      ${cover(coverId, work.title, "L", "w-full max-w-xs shrink-0 rounded-xl object-cover shadow-md aspect-[2/3]")}
      <div>
        <h2 class="font-serif text-3xl font-bold text-stone-900">${esc(work.title)}</h2>
        ${book?.author ? `<p class="mt-1 italic text-stone-500">${esc(book.author)}</p>` : ""}
        <div class="mt-2 flex items-center gap-3">
          <span class="text-xs uppercase tracking-wide text-stone-400">${book?.year ? esc(book.year) : "—"}</span>
          ${shelfButton(work.id, isSaved(work.id))}
        </div>
        <p class="mt-4 whitespace-pre-line leading-relaxed text-stone-700">${esc(work.description)}</p>
        ${
          subjects.length
            ? `<div class="mt-4 flex flex-wrap gap-2">
                ${subjects
                  .map(
                    (s) =>
                      `<span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800 ring-1 ring-emerald-100">${esc(s)}</span>`,
                  )
                  .join("")}
              </div>`
            : ""
        }
      </div>
    </div>
  `;
}
export function loadingState(message = "Loading…") {
  return `<p class="py-16 text-center text-stone-400">${esc(message)}</p>`;
}

export function errorState(message) {
  return `
    <div class="py-16 text-center">
      <p class="text-rose-700">${esc(message)}</p>
      <button data-retry class="mt-3 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 hover:bg-stone-50">
        Retry
      </button>
    </div>
  `;
}

export function emptyState(message) {
  return `<p class="py-16 text-center text-stone-400">${esc(message)}</p>`;
}

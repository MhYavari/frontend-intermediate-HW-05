import "./style.css";
import { debounce } from "./debounce.js";
import { searchBooks, getWork } from "./api.js";
import {
  backButton,
  detailView,
  emptyState,
  errorState,
  loadingState,
  resultsGrid,
  shelfView,
} from "./views.js";
import { createShelfStore } from "./store.js";

const state = {
  view: "search", // search, shelf, detail
  from: "search", // where Back returns to
  query: "",
  results: [],
  status: "idle", // idle, loading, error
  error: "",
  detail: null,
  detailBook: null,
  detailId: null,
  detailStatus: "idle", // idle, loading, error
  detailError: "",
};

const store = createShelfStore();
const booksById = new Map();
let controller = null;
let detailController = null;

const viewEl = document.querySelector("#view");
const searchInputEl = document.querySelector("#search");
const badgeEl = document.querySelector("#badge");

// Render

function render() {
  badgeEl.textContent = store.getCount();
  if (state.view === "detail") viewEl.innerHTML = renderDetail();
  else if (state.view === "shelf") viewEl.innerHTML = renderShelf();
  else viewEl.innerHTML = renderSearch();
}
function renderDetail() {
  if (state.detailStatus === "loading")
    return backButton + loadingState("Loading book…");
  if (state.detailStatus === "error")
    return backButton + errorState(state.detailError);
  if (!state.detail) return backButton;
  return detailView(state.detail, state.detailBook, store.has);
}
function renderShelf() {
  return shelfView(store.getItems());
}

function renderSearch() {
  if (state.status === "loading") return loadingState("Searching…");
  if (state.status === "error") return errorState(state.error);
  if (!state.query.trim())
    return emptyState("Search for a book or an author to get started.");
  if (!state.results.length)
    return emptyState(`No books found for “${state.query}”.`);
  return resultsGrid(state.results, store.has);
}

// Actions

async function doSearch(query) {
  state.view = "search";
  state.query = query;

  controller?.abort();

  if (!query.trim()) {
    state.results = [];
    state.status = "idle";
    render();
    return;
  }

  controller = new AbortController();
  const signal = controller.signal;

  state.status = "loading";
  render();

  try {
    const books = await searchBooks(query, signal);
    books.forEach((book) => booksById.set(book.id, book));
    state.results = books;
    state.status = "idle";
    render();
  } catch (err) {
    if (err.name === "AbortError") return;
    state.error = err.message;
    state.status = "error";
    render();
  }
}
async function openDetail(id) {
  if (state.view !== "detail") state.from = state.view;
  state.view = "detail";
  state.detailId = id;
  state.detailBook =
    booksById.get(id) ?? store.getItems().find((b) => b.id === id) ?? null;
  state.detail = null;
  state.detailStatus = "loading";
  render();

  detailController?.abort();
  detailController = new AbortController();

  try {
    const work = await getWork(id, detailController.signal);
    if (state.detailId !== id) return;
    state.detail = work;
    state.detailStatus = "idle";
    render();
  } catch (err) {
    if (err.name === "AbortError") return;
    if (state.detailId !== id) return;
    state.detailError = err.message;
    state.detailStatus = "error";
    render();
  }
}
function retry() {
  if (state.view === "detail") openDetail(state.detailId);
  else doSearch(state.query);
}

// Events

searchInputEl.addEventListener(
  "input",
  debounce((event) => doSearch(event.target.value), 300),
);

document.addEventListener("click", (event) => {
  const shelfBtn = event.target.closest("[data-shelf]");
  if (shelfBtn) {
    const id = shelfBtn.dataset.shelf;
    const book = booksById.get(id) ?? store.getItems().find((b) => b.id === id);
    if (book) store.toggle(book);
    return;
  }

  if (event.target.closest("[data-retry]")) return retry();

  if (event.target.closest("[data-back]")) {
    state.view = state.from;
    return render();
  }

  const card = event.target.closest("[data-book-key]");
  if (card) return openDetail(card.dataset.bookKey);

  if (event.target.closest("#shelf-btn")) {
    state.view = "shelf";
    return render();
  }

  if (event.target.closest("#home")) {
    state.view = "search";
    return render();
  }
});

// pub-sub

store.onChange(() => render());

render();

import { createEmitter } from "./emitter.js";

const STORAGE_KEY = "shelf.books";

function loadInitial() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function createShelfStore() {
  const emitter = createEmitter();
  let items = loadInitial();

  const persist = () =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  const getItems = () => items.map((book) => ({ ...book }));
  const has = (id) => items.some((book) => book.id === id);

  const set = (next) => {
    items = next;
    persist();
    emitter.emit("change", getItems());
  };

  function add(book) {
    if (has(book.id)) return;

    const lean = {
      id: book.id,
      title: book.title,
      author: book.author,
      coverId: book.coverId,
      year: book.year,
    };

    set([...items, lean]);
  }

  function remove(id) {
    set(items.filter((book) => book.id !== id));
  }

  function toggle(book) {
    if (has(book.id)) remove(book.id);
    else add(book);
  }

  return {
    getItems,
    getCount: () => items.length,
    has,
    add,
    remove,
    toggle,
    onChange: (handler) => emitter.on("change", handler),
  };
}

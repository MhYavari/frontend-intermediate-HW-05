const BASE = "https://openlibrary.org";
const SEARCH_FIELDS = "key,title,author_name,cover_i,first_publish_year";

export async function searchBooks(query, signal) {
  const res = await fetch(
    `${BASE}/search.json?q=${encodeURIComponent(query)}` +
      `&fields=${SEARCH_FIELDS}&limit=24`,
    { signal },
  );
  if (!res.ok) throw new Error(`Search failed (${res.status})`);

  const data = await res.json();

  return data.docs.map((doc) => ({
    id: doc.key,
    title: doc.title ?? "Untitled",
    author: doc.author_name?.join(", ") ?? "Unknown author",
    coverId: doc.cover_i ?? null,
    year: doc.first_publish_year ?? null,
  }));
}

export async function getWork(key, signal) {
  const res = await fetch(`${BASE}${key}.json`, { signal });
  if (!res.ok) throw new Error(`Couldn't load the book (${res.status})`);

  const work = await res.json();

  return {
    id: key,
    title: work.title ?? "Untitled",
    description:
      typeof work.description === "string"
        ? work.description
        : (work.description?.value ?? "No description available."),
    subjects: work.subjects ?? [],
    coverId: work.covers?.[0] ?? null,
  };
}

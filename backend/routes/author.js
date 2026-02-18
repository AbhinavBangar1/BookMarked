import express from "express";
import fetch from "node-fetch";

const router = express.Router();

/**
 * Find the best matching author from OpenLibrary search results.
 * OpenLibrary's search often returns irrelevant authors first
 * (e.g. "Arthur Conan Doyle" → "Nan Ke"), so we compare names.
 */
function findBestAuthorMatch(docs, searchName) {
  if (!docs || docs.length === 0) return null;

  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = normalize(searchName);

  // 1. Exact match (normalized)
  const exact = docs.find((d) => normalize(d.name) === target);
  if (exact) return exact;

  // 2. One name contains the other
  const containsMatch = docs.find((d) => {
    const n = normalize(d.name);
    return n.includes(target) || target.includes(n);
  });
  if (containsMatch) return containsMatch;

  // 3. Significant word overlap
  const targetWords = target.match(/[a-z]+/g) || [];
  let bestScore = 0;
  let bestDoc = docs[0];

  for (const doc of docs) {
    const docWords = normalize(doc.name).match(/[a-z]+/g) || [];
    const overlap = targetWords.filter((w) => docWords.includes(w)).length;
    const score = overlap / Math.max(targetWords.length, docWords.length);
    if (score > bestScore) {
      bestScore = score;
      bestDoc = doc;
    }
  }

  return bestDoc;
}

// GET author details from OpenLibrary
router.get("/", async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: "Author name required" });
  }

  try {
    // Step 1: Search author
    const searchRes = await fetch(
      `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(name)}`
    );
    const searchData = await searchRes.json();

    if (!searchData.docs.length) {
      return res.json(null);
    }

    const bestMatch = findBestAuthorMatch(searchData.docs, name);
    const authorKey = bestMatch.key;

    // Step 2: Get author details
    const authorRes = await fetch(
      `https://openlibrary.org/authors/${authorKey}.json`
    );
    const authorData = await authorRes.json();

    res.json({
      name: authorData.name,
      bio:
        typeof authorData.bio === "string"
          ? authorData.bio
          : authorData.bio?.value,
      birth_date: authorData.birth_date,
      death_date: authorData.death_date,
      photos: authorData.photos,
      key: authorKey.replace("/authors/", "")
    });

  } catch (err) {
    console.error("OpenLibrary author fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET author details by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const authorRes = await fetch(
      `https://openlibrary.org/authors/${id}.json`
    );

    if (!authorRes.ok) {
      return res.status(404).json({ error: "Author not found" });
    }

    const authorData = await authorRes.json();

    res.json({
      name: authorData.name,
      bio:
        typeof authorData.bio === "string"
          ? authorData.bio
          : authorData.bio?.value,
      birth_date: authorData.birth_date,
      death_date: authorData.death_date,
      photos: authorData.photos,
      key: id
    });

  } catch (err) {
    console.error("OpenLibrary author fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET author books by ID
router.get("/:id/books", async (req, res) => {
  const { id } = req.params;

  try {
    const worksRes = await fetch(
      `https://openlibrary.org/authors/${id}/works.json?limit=12`
    );

    if (!worksRes.ok) {
      return res.status(404).json({ error: "Works not found" });
    }

    const worksData = await worksRes.json();

    const books = worksData.entries.map(work => ({
      id: work.key.replace("/works/", ""),
      title: work.title,
      image: work.covers ? `https://covers.openlibrary.org/b/id/${work.covers[0]}-M.jpg` : null,
      genre: work.subjects ? work.subjects[0] : "Unknown"
    }));

    res.json(books);

  } catch (err) {
    console.error("OpenLibrary author books fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
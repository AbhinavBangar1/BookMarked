import express from "express";
import fetch from "node-fetch";

const router = express.Router();

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

    const authorKey = searchData.docs[0].key; // e.g. OL34184A

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

export default router;
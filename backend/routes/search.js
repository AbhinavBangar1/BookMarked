import express from "express";
import axios from "axios";
import redisClient from "../redisClient.js";

const router = express.Router();

/*
--------------------------------------------------
 MAIN SEARCH ROUTE
 Supports:
 - /api/search?q=inauthor:John
 - /api/search?genre=fiction
 - /api/search?title=harry
--------------------------------------------------
*/
router.get("/", async (req, res) => {
  try {
    const { q, genre, type, order, title } = req.query;

    let query = q || "";

    // If q not provided, build query from other params
    if (!query) {
      if (genre) query = `subject:${genre}`;
      else if (type) query = type;
      else if (title) query = title;
      else if (order) query = order;
    }

    if (!query) {
      return res.status(400).json({ error: "No search query provided" });
    }

    if (!process.env.GOOGLE_BOOKS_API_KEY) {
      return res.status(500).json({ error: "Google Books API key missing" });
    }

    const cacheKey = `search:${query}`;

    // Check Redis cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("✅ Returning cached search results");
      return res.json(JSON.parse(cachedData));
    }

    const URL = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&maxResults=12&orderBy=relevance&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

    console.log("🌐 Fetching from Google Books:", URL);

    const response = await axios.get(URL);

    const books = response.data.items?.slice(0, 12) || [];

    // Cache results for 20 minutes
    await redisClient.setEx(cacheKey, 1200, JSON.stringify(books));

    res.json(books);
  } catch (error) {
    console.error("Search error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to search books" });
  }
});

/*
--------------------------------------------------
 SEARCH BAR ROUTE
 Example:
 - /api/search/specific?author=rowling
 - /api/search/specific?title=harry
--------------------------------------------------
*/
router.get("/specific", async (req, res) => {
  try {
    const { author, title, isbn, publisher } = req.query;

    let query = "";

    if (author) query = `inauthor:${author}`;
    else if (title) query = `intitle:${title}`;
    else if (isbn) query = `isbn:${isbn}`;
    else if (publisher) query = `inpublisher:${publisher}`;

    if (!query) {
      return res.status(400).json({ error: "No search query provided" });
    }

    const URL = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&maxResults=30&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

    console.log("🌐 Google Books URL:", URL);

    const response = await axios.get(URL);

    res.json(response.data.items?.slice(0, 5) || []);
  } catch (error) {
    console.error("Specific search error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

/*
--------------------------------------------------
 AUTHOR IMAGE ROUTE
--------------------------------------------------
*/
router.get("/author-image", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Author name required" });
    }

    const url = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(
      name
    )}`;

    const response = await axios.get(url);

    const author = response.data.docs?.[0];

    if (!author) return res.json(null);

    res.json({
      name: author.name,
      image: `https://covers.openlibrary.org/a/olid/${author.key
        .split("/")
        .pop()}-M.jpg`,
    });
  } catch (error) {
    console.error("Author image error:", error.message);
    res.status(500).json({ error: "Failed to fetch author image" });
  }
});

export default router;
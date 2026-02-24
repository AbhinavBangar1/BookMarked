import express from "express";
import axios from "axios";
import redisClient from "../redisClient.js";

const router = express.Router();

// for search bar
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

    console.log("Google Books URL:", URL);

    const response = await axios.get(URL);

    res.json(response.data.items?.slice(0, 5) || []);
  } catch (error) {
    console.error("Specific search error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});


//Author image 
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

    const docs = response.data.docs;

    if (!docs || docs.length === 0) {
      return res.json(null);
    }

    
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
    const target = normalize(name);
    const author =
      docs.find((d) => normalize(d.name) === target) ||
      docs.find((d) => {
        const n = normalize(d.name);
        return n.includes(target) || target.includes(n);
      }) ||
      docs[0];

    const authorId = author.key.split("/").pop();

    res.json({
      name: author.name,
      id: authorId,
      image: `https://covers.openlibrary.org/a/olid/${authorId}-M.jpg`,
    });
  } catch (error) {
    console.error("Author image error:", error.message);
    res.status(500).json({ error: "Failed to fetch author image" });
  }
});

export default router;
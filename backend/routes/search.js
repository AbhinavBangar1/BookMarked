import express from "express";
import axios from "axios";
import redisClient from "../redisClient.js";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


// for search bar
router.get("/specific", async (req, res) => {
  try {
    const { author, title, isbn, publisher } = req.query;

    if (!author && !title && !isbn && !publisher) {
      return res.status(400).json({ error: "No search parameters provided" });
    }

    const selectString = author ? '*, author!inner(name)' : '*, author(name)';
    
    let query = supabase.from("books").select(selectString);

    if (title) {
      query = query.ilike("title", `%${title}%`);
    }
    if (author) {
      query = query.ilike("author.name", `%${author}%`);
    }
    if (publisher) {
      query = query.ilike("publisher", `%${publisher}%`);
    }
    if (isbn) {
      query = query.eq("isbn", isbn);
    }
    const { data, error } = await query.limit(5);

    if (error) {
      console.error("Database search error:", error);
      return res.status(500).json({ error: "Failed to fetch books from database" });
    }

    res.json(data || []);
  } catch (error) {
    console.error("Specific search error:", error.message);
    res.status(500).json({ error: "Internal server error" });
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


// Search users by username or email
router.get("/users", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) return res.status(400).json({ error: "Query required" });

    const searchQuery = q.trim().toLowerCase();

    // Supabase query
    const { data, error } = await supabase
      .from("users")
      .select("userid, username, email, created_at")
      .ilike("username", `%${searchQuery}%`)
      .or(`email.ilike.%${searchQuery}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Supabase user search error:", err.message);
    res.status(500).json({ error: "Failed to search users" });
  }
});

export default router;
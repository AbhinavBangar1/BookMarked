// for Explore page Sections

import express from "express";
import { createClient } from "@supabase/supabase-js";
import redisClient from "../redisClient.js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

router.get("/", async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ error: "No type provided" });
    }

    const cacheKey = `section:${type}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      console.log(`Cache hit for ${type}`);
      return res.json(JSON.parse(cached));
    }

    const { data, error } = await supabase
      .from("books")
      .select(`
        bookid,
        title,
        coverimage,
        publishedyear,
        author:authorid(name),
        genre:genreid(genrename)
      `)
      .eq("tags", type)
      .limit(15);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    const formatted = data.map(book => ({
      bookid: book.bookid,
      title: book.title,
      coverimage: book.coverimage,
      author: book.author?.name || null,
      genre: book.genre?.genrename || null
    }));

    const responseData = { books: formatted };

    await redisClient.setEx(
      cacheKey,
      1200,
      JSON.stringify(responseData)
    );

    console.log(`Cache set for ${type}`);

    res.json(responseData);

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

export default router;
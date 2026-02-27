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
    const { genre } = req.query;

    if (!genre) {
      return res.status(400).json({ error: "No genre provided" });
    }
    const cacheKey = `genre:${genre.toLowerCase()}`;
    const cached = await redisClient.get(cacheKey);
    // if (cached) {
    //   console.log("Cache hit for genre:", genre);
    //   return res.json(JSON.parse(cached));
    // }

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
          .eq("genreid", genre.toLowerCase())
          .limit(55);

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
    await redisClient.setEx(
      cacheKey,
      1200,
      JSON.stringify(formatted)
    );

    console.log("Cache set for genre:", genre);

    res.json(formatted);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to fetch genre" });
  }
});

export default router;
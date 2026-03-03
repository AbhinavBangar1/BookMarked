import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Get book with author + genre
    const { data: book, error } = await supabase
      .from("books")
      .select(`
        bookid,
        title,
        description,
        publisher,
        publishedyear,
        isbn,
        coverimage,
        author:authorid (
          authorid,
          name
        ),
        genre:genreid (
          genreid,
          genrename
        )
      `)
      .eq("bookid", id)
      .single();

    if (error || !book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Rating stats (simple version)
    const { data: ratings } = await supabase
      .from("ratings")
      .select("rating")
      .eq("bookid", id);

    let avgRating = 0;
    let totalRatings = 0;

    if (ratings?.length) {
      totalRatings = ratings.length;
      avgRating =
        ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
    }

    res.json({
      ...book,
      stats: {
        avgRating,
        totalRatings
      }
    });

  } catch (err) {
    console.error("BookProfile route error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
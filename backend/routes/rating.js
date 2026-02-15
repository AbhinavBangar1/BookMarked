import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET average rating and count for a book
router.get("/", async (req, res) => {
  const { bookId } = req.query;

  if (!bookId) {
    return res.status(400).json({ error: "bookId is required" });
  }

  try {
    const { data, error } = await supabase
      .from("rating")
      .select("rating")
      .eq("bookid", bookId);

    if (error) throw error;

    const avgRating =
      data.length > 0
        ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
        : 0;

    res.json({
      avgRating,
      count: data.length,
    });
  } catch (err) {
    console.error("Rating fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Save or update user rating
router.post("/", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { bookId, rating } = req.body;
  
  try {
    const { data, error } = await supabase
      .from("rating")
      .upsert({
        userid: userId,
        bookid: bookId,
        rating: rating
      }, {
        onConflict: "userid,bookid"
      })
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Rating save failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
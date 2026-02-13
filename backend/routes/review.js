import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET review count
router.get("/count", async (req, res) => {
  const { bookId } = req.query;
  
  try {
    const { count, error } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("bookid", bookId);
    
    if (error) throw error;
    res.json({ count: count || 0 });
  } catch (err) {
    console.error("Review count failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET all reviews for a book
router.get("/", async (req, res) => {
  const { bookId } = req.query;
  
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        reviewid,
        review,
        createdat,
        userid,
        users (
          username
        )
      `)
      .eq("bookid", bookId)
      .order("createdat", { ascending: false });
    
    if (error) throw error;

    const reviews = data.map(review => ({
      ReviewId: review.reviewid,
      Review: review.review,
      CreatedAt: review.createdat,
      UserId: review.userid,
      UserName: review.users?.username || "Anonymous"
    }));
    
    res.json(reviews);
  } catch (err) {
    console.error("Review fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Create new review
router.post("/", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { review, bookId, rating } = req.body;

  console.log('📝 Review POST request:', { userId, bookId, hasReview: !!review, rating });
  
  try {
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        review: review,
        userid: userId,
        bookid: bookId,
        createdat: new Date().toISOString()
      })
      .select(`
        reviewid,
        review,
        createdat,
        userid,
        users (
          username
        )
      `)
      .single();
    
    if (error) throw error;
    
    // Save rating if provided
    if (rating) {
      await supabase
        .from("rating")
        .upsert({
          userid: userId,
          bookid: bookId,
          rating: rating
        }, {
          onConflict: "userid,bookid"
        });
    }
    
    const reviewResponse = {
      ReviewId: data.reviewid,
      Review: data.review,
      CreatedAt: data.createdat,
      UserId: data.userid,
      UserName: data.users?.username || "Anonymous",
      Rating: rating
    };

    console.log('✅ Review created successfully');
    res.json(reviewResponse);
  } catch (err) {
    console.error("Review create failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
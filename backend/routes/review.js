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
        rating,
        createdat,
        userid
      `)
      .eq("bookid", bookId)
      .order("createdat", { ascending: false });
    
    if (error) throw error;

    // Fetch usernames for each review
    const reviewsWithUsers = await Promise.all(
      data.map(async (review) => {
        try {
          // Get user data from Supabase Auth
          const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(review.userid);
          
          let userName = "Anonymous";
          
          if (user) {
            // Try to get username in order of preference:
            userName = user.user_metadata?.full_name 
              || user.user_metadata?.name 
              || user.user_metadata?.username
              || user.email?.split('@')[0] 
              || "Anonymous";
          }
          
          return {
            ReviewId: review.reviewid,
            Review: review.review,
            Rating: review.rating,
            CreatedAt: review.createdat,
            UserId: review.userid,
            UserName: userName
          };
        } catch (err) {
          console.error(`Failed to fetch user ${review.userid}:`, err);
          return {
            ReviewId: review.reviewid,
            Review: review.review,
            Rating: review.rating,
            CreatedAt: review.createdat,
            UserId: review.userid,
            UserName: "Anonymous"
          };
        }
      })
    );
    
    res.json(reviewsWithUsers);
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
    // Insert review with rating (reviewid will be auto-generated)
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        review: review,
        userid: userId,
        bookid: bookId,
        rating: rating || null,
        createdat: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error("Review insert error:", error);
      throw error;
    }
    
    console.log('✅ Review inserted:', data);
    
    // ALSO save rating to the rating table (for average calculation)
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
    
    // Get user email for display
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    let userName = "Anonymous";
    if (user) {
      userName = user.user_metadata?.full_name 
        || user.user_metadata?.name 
        || user.user_metadata?.username
        || user.email?.split('@')[0] 
        || "Anonymous";
    }
    
    const reviewResponse = {
      ReviewId: data.reviewid,
      Review: data.review,
      Rating: data.rating,
      CreatedAt: data.createdat,
      UserId: data.userid,
      UserName: userName
    };

    console.log('✅ Review created successfully');
    res.json(reviewResponse);
  } catch (err) {
    console.error("Review create failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// PUT - Update existing review
router.put("/:reviewId", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { reviewId } = req.params;
  const { review, rating } = req.body;

  console.log('📝 Review UPDATE request:', { userId, reviewId, hasReview: !!review, rating });
  
  try {
    // Update review
    const { data, error } = await supabase
      .from("reviews")
      .update({
        review: review,
        rating: rating || null
      })
      .eq("reviewid", reviewId)
      .eq("userid", userId) // Ensure user can only update their own reviews
      .select()
      .single();
    
    if (error) {
      console.error("Review update error:", error);
      throw error;
    }
    
    if (!data) {
      return res.status(404).json({ error: "Review not found or you don't have permission to edit it" });
    }
    
    // Update rating table if rating was provided
    if (rating) {
      await supabase
        .from("rating")
        .upsert({
          userid: userId,
          bookid: data.bookid,
          rating: rating
        }, {
          onConflict: "userid,bookid"
        });
    }
    
    console.log('✅ Review updated successfully');
    res.json({ 
      message: "Review updated successfully",
      data: {
        ReviewId: data.reviewid,
        Review: data.review,
        Rating: data.rating
      }
    });
  } catch (err) {
    console.error("Review update failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Delete review
router.delete("/:reviewId", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { reviewId } = req.params;

  console.log('🗑️ Review DELETE request:', { userId, reviewId });
  
  try {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("reviewid", reviewId)
      .eq("userid", userId); // Ensure user can only delete their own reviews
    
    if (error) {
      console.error("Review delete error:", error);
      throw error;
    }
    
    console.log('✅ Review deleted successfully');
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Review delete failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
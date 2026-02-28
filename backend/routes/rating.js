// import express from "express";
// import { createClient } from "@supabase/supabase-js";
// import { requireAuth } from "../middleware/requireAuth.js";

// const router = express.Router();

// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_KEY
// );

// // GET the logged-in user's rating for a specific book
// router.get("/my", requireAuth, async (req, res) => {
//   const { bookId } = req.query;
//   const userId = req.user.id;

//   if (!bookId) {
//     return res.status(400).json({ error: "bookId is required" });
//   }

//   try {
//     const { data, error } = await supabase
//       .from("rating")
//       .select("rating")
//       .eq("bookid", bookId)
//       .eq("userid", userId)
//       .single(); // single because user can only have one rating per book

//     if (error && error.code !== "PGRST116") throw error; // ignore "no rows" error

//     res.json({
//       rating: data ? data.rating : null,
//     });
//   } catch (err) {
//     console.error("User rating fetch failed:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET average rating and count for a book
// router.get("/", async (req, res) => {
//   const { bookId } = req.query;

//   if (!bookId) {
//     return res.status(400).json({ error: "bookId is required" });
//   }

//   try {
//     const { data, error } = await supabase
//       .from("rating")
//       .select("rating")
//       .eq("bookid", bookId);

//     if (error) throw error;

//     const avgRating =
//       data.length > 0
//         ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
//         : 0;

//     res.json({
//       avgRating,
//       count: data.length,
//     });
//   } catch (err) {
//     console.error("Rating fetch failed:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // POST - Save or update user rating
// router.post("/", requireAuth, async (req, res) => {
//   const userId = req.user.id;
//   const { bookId, rating } = req.body;

//   console.log('Rating POST request:', { userId, bookId, rating });
  
//   try {
//     const { data, error } = await supabase
//       .from("rating")
//       .upsert({
//         userid: userId,
//         bookid: bookId,
//         rating: rating
//       }, {
//         onConflict: "userid,bookid"
//       })
//       .select()
//       .single();
    
//     if (error) throw error;
    
//     console.log('Rating saved successfully');
//     res.json(data);
//   } catch (err) {
//     console.error("Rating save failed:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // DELETE - Clear user rating
// router.delete("/", requireAuth, async (req, res) => {
//   const userId = req.user.id;
//   const { bookId } = req.query;

//   console.log('Rating DELETE request:', { userId, bookId });
  
//   try {
//     const { error } = await supabase
//       .from("rating")
//       .delete()
//       .eq("userid", userId)
//       .eq("bookid", bookId);
    
//     if (error) throw error;
    
//     console.log('Rating cleared successfully');
//     res.json({ message: "Rating cleared successfully" });
//   } catch (err) {
//     console.error("Rating delete failed:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;
























// routes/rating.js
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

// GET the logged-in user's rating for a specific book
router.get("/my", requireAuth, async (req, res) => {
  const { bookId } = req.query;
  const userId = req.user.id;

  if (!bookId) {
    return res.status(400).json({ error: "bookId is required" });
  }

  try {
    const { data, error } = await supabase
      .from("rating")
      .select("rating")
      .eq("bookid", bookId)
      .eq("userid", userId)
      .single(); // single because user can only have one rating per book

    // Ignore "no rows found" errors
    if (error && error.code !== "PGRST116") throw error;

    res.json({
      rating: data ? data.rating : null,
    });
  } catch (err) {
    console.error("User rating fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Save or update user rating
router.post("/", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { bookId, rating } = req.body;

  console.log('Rating POST request:', { userId, bookId, rating });
  
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
    
    console.log('Rating saved successfully');
    res.json(data);
  } catch (err) {
    console.error("Rating save failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Clear user rating
router.delete("/", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { bookId } = req.query;

  console.log('Rating DELETE request:', { userId, bookId });
  
  try {
    const { error } = await supabase
      .from("rating")
      .delete()
      .eq("userid", userId)
      .eq("bookid", bookId);
    
    if (error) throw error;
    
    console.log('Rating cleared successfully');
    res.json({ message: "Rating cleared successfully" });
  } catch (err) {
    console.error("Rating delete failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
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

// GET all reviews for a book (WITH USERNAME)
router.get("/", async (req, res) => {
  const { bookId } = req.query;

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
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

    const formatted = data.map((r) => ({
      UserId: r.userid,
      Review: r.review,
      CreatedAt: r.createdat,
      UserName: r.users?.username || "Anonymous"
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Review fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST - Create new review
router.post("/", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { review, bookId } = req.body;

  try {
    const { data, error } = await supabase
      .from("reviews")
      .upsert(
        {
          userid: userId,
          bookid: bookId,
          review,
          createdat: new Date().toISOString()
        },
        {
          onConflict: ["userid", "bookid"]
        }
      )
      .select(`
        review,
        createdat,
        userid,
        users (
          username
        )
      `)
      .single();

    if (error) throw error;

    res.json({
      Review: data.review,
      CreatedAt: data.createdat,
      UserId: data.userid,
      UserName: data.users?.username || "Anonymous"
    });

  } catch (err) {
    console.error("Review upsert failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// // PUT - Update existing review
// router.put("/:reviewId", requireAuth, async (req, res) => {
//   const userId = req.user.id;
//   const { reviewId } = req.params;
//   const { review } = req.body;

//   try {
//     const { data, error } = await supabase
//       .from("reviews")
//       .update({ review })
//       .eq("userid", userId)
//       .select()
//       .single();

//     if (error) throw error;

//     if (!data) {
//       return res.status(404).json({
//         error: "Review not found or you don't have permission to edit it"
//       });
//     }

//     res.json({
//       message: "Review updated successfully",
//       data: {
//         ReviewId: data.reviewid,
//         Review: data.review
//       }
//     });

//   } catch (err) {
//     console.error("Review update failed:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// DELETE - Delete review
router.delete("/", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { bookId } = req.query;

  try {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("userid", userId)
      .eq("bookid", bookId);

    if (error) throw error;

    res.json({ message: "Review deleted successfully" });

  } catch (err) {
    console.error("Review delete failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
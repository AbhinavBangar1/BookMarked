import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("bookmarked")
      .select(`
        bookid,
        books (
          title,
          coverimage,
          genreid
        )
      `)
      .eq("userid", userId);

    if (error) {
      console.error(error);
      return res.status(400).json({ error: error.message });
    }

    const formatted = data.map(item => ({
      bookid: item.bookid,
      title: item.books?.title,
      coverimage: item.books?.coverimage,
      genreid: item.books?.genreid,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("GET bookmark error:", err);
    res.status(500).json([]);
  }
});


router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: "bookId required" });
    }

    const { error } = await supabase
      .from("bookmarked")
      .insert([{ userid: userId, bookid: bookId }]);

    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ success: true });
  } catch (err) {
    console.error("POST bookmark error:", err);
    res.status(500).json({ error: "Failed to add bookmark" });
  }
});

router.delete("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.query;

    if (!bookId) {
      return res.status(400).json({ error: "bookId required" });
    }

    const { error } = await supabase
      .from("bookmarked")
      .delete()
      .eq("userid", userId)
      .eq("bookid", bookId);

    if (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE bookmark error:", err);
    res.status(500).json({ error: "Failed to delete bookmark" });
  }
});

export default router;
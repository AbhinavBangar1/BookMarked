import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

// Initialize Supabase client - FIXED to use correct env variable
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY  // Changed from SUPABASE_SERVICE_ROLE_KEY to match your .env
);

// GET all bookmarks for a user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const { data, error } = await supabase
      .from("bookmarked")
      .select("*")
      .eq("userid", userId)  // Changed to lowercase to match your table
      .order("createdat", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch bookmarks" });
    }

    res.json(data || []);
  } catch (err) {
    console.error("Bookmark fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

// CHECK if a book is bookmarked by user
router.get("/check", async (req, res) => {
  try {
    const { userId, bookId } = req.query;

    if (!userId || !bookId) {
      return res.status(400).json({ error: "userId and bookId are required" });
    }

    const { data, error } = await supabase
      .from("bookmarked")
      .select("*")
      .eq("userid", userId)
      .eq("bookid", bookId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to check bookmark" });
    }

    res.json({ isBookmarked: !!data });
  } catch (err) {
    console.error("Bookmark check failed:", err);
    res.status(500).json({ error: "Failed to check bookmark" });
  }
});

// POST add a bookmark
router.post("/", async (req, res) => {
  try {
    const { userId, bookId, title, coverImage, genre } = req.body;

    if (!userId || !bookId || !title) {
      return res.status(400).json({ 
        error: "userId, bookId, and title are required" 
      });
    }

    // Check if already bookmarked
    const { data: existing } = await supabase
      .from("bookmarked")
      .select("*")
      .eq("userid", userId)
      .eq("bookid", bookId)
      .single();

    if (existing) {
      return res.status(409).json({ 
        error: "Book already bookmarked",
        isBookmarked: true 
      });
    }

    // Add bookmark
    const { data, error } = await supabase
      .from("bookmarked")
      .insert([
        {
          userid: userId,
          bookid: bookId,
          title: title,
          coverimage: coverImage || null,
          genre: genre || null,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to add bookmark" });
    }

    res.status(201).json({ 
      message: "Bookmark added successfully", 
      data: data[0],
      isBookmarked: true 
    });
  } catch (err) {
    console.error("Bookmark add failed:", err);
    res.status(500).json({ error: "Failed to add bookmark" });
  }
});

// DELETE remove a bookmark
router.delete("/", async (req, res) => {
  try {
    const { userId, bookId } = req.query;

    if (!userId || !bookId) {
      return res.status(400).json({ 
        error: "userId and bookId are required" 
      });
    }

    const { error } = await supabase
      .from("bookmarked")
      .delete()
      .eq("userid", userId)
      .eq("bookid", bookId);

    if (error) {
      console.error("Supabase delete error:", error);
      return res.status(500).json({ error: "Failed to remove bookmark" });
    }

    res.json({ 
      message: "Bookmark removed successfully",
      isBookmarked: false 
    });
  } catch (err) {
    console.error("Bookmark delete failed:", err);
    res.status(500).json({ error: "Failed to remove bookmark" });
  }
});

export default router;
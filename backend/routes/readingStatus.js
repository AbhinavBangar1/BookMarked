import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET shelf status for a specific book and user
router.get("/check", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.query;

    if (!userId || !bookId) {
      return res.status(400).json({ error: "userId and bookId are required" });
    }

    const { data, error } = await supabase
      .from("shelf")
      .select("*")
      .eq("userid", userId)
      .eq("bookid", bookId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to check shelf status" });
    }

    res.json({ 
      status: data?.status || null,
      data: data 
    });
  } catch (err) {
    console.error("Shelf status check failed:", err);
    res.status(500).json({ error: "Failed to check shelf status" });
  }
});

// POST/UPDATE Add to Shelf
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, status } = req.body;

    if (!userId || !bookId || !status) {
      return res.status(400).json({ error: "userId, bookId, and status are required" });
    }

    // Must match the exact strings from your Postgres check constraint
    const validStatuses = ["want to read", "currently reading", "done reading"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status. Must be one of: 'want to read', 'currently reading', 'done reading'" 
      });
    }

    // Upsert (insert or update) shelf status
    const { data, error } = await supabase
      .from("shelf")
      .upsert({
        userid: userId,
        bookid: bookId,
        status: status
      }, {
        onConflict: "userid,bookid"
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
      return res.status(500).json({ error: "Failed to update shelf: " + error.message });
    }

    res.json({ message: "Added to shelf successfully", data: data });
  } catch (err) {
    console.error("Shelf update failed:", err);
    res.status(500).json({ error: "Failed to update shelf: " + err.message });
  }
});

// DELETE from shelf
router.delete("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.query;

    if (!userId || !bookId) {
      return res.status(400).json({ error: "userId and bookId are required" });
    }

    const { error } = await supabase
      .from("shelf")
      .delete()
      .eq("userid", userId)
      .eq("bookid", bookId);

    if (error) {
      console.error("Supabase delete error:", error);
      return res.status(500).json({ error: "Failed to remove from shelf" });
    }

    res.json({ message: "Book removed from shelf successfully" });
  } catch (err) {
    console.error("Shelf delete failed:", err);
    res.status(500).json({ error: "Failed to remove from shelf" });
  }
});

// GET all books on shelf for a user
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User Not Found" });
    }

    let query = supabase
      .from("shelf")
      .select("*")
      .eq("userid", userId);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch shelf" });
    }

    res.json(data || []);
  } catch (err) {
    console.error("Shelf fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch shelf" });
  }
});

export default router;
import express from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET reading status for a specific book and user
router.get("/check", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.query;

    if (!userId || !bookId) {
      return res.status(400).json({ 
        error: "userId and bookId are required" 
      });
    }

    const { data, error } = await supabase
      .from("reading_status")
      .select("*")
      .eq("userid", userId)
      .eq("bookid", bookId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to check reading status" });
    }

    res.json({ 
      status: data?.status || null,
      data: data 
    });
  } catch (err) {
    console.error("Reading status check failed:", err);
    res.status(500).json({ error: "Failed to check reading status" });
  }
});

// POST/UPDATE reading status
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, status, title, coverImage, genre } = req.body;

    console.log('📝 Reading status POST request:', { userId, bookId, status });

    if (!userId || !bookId || !status) {
      return res.status(400).json({ 
        error: "userId, bookId, and status are required" 
      });
    }

    // Valid statuses
    const validStatuses = ["Want to Read", "Currently Reading", "Read"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status. Must be one of: Want to Read, Currently Reading, Read" 
      });
    }

    // Upsert (insert or update) reading status
    const { data, error } = await supabase
      .from("reading_status")
      .upsert({
        userid: userId,
        bookid: bookId,
        status: status,
        title: title || null,
        coverimage: coverImage || null,
        genre: genre || null,
        updatedat: new Date().toISOString()
      }, {
        onConflict: "userid,bookid"
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase upsert error:", error);
      return res.status(500).json({ error: "Failed to update reading status: " + error.message });
    }

    console.log('✅ Reading status updated successfully');
    res.json({ 
      message: "Reading status updated successfully", 
      data: data
    });
  } catch (err) {
    console.error("Reading status update failed:", err);
    res.status(500).json({ error: "Failed to update reading status: " + err.message });
  }
});

// DELETE reading status
router.delete("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.query;

    if (!userId || !bookId) {
      return res.status(400).json({ 
        error: "userId and bookId are required" 
      });
    }

    const { error } = await supabase
      .from("reading_status")
      .delete()
      .eq("userid", userId)
      .eq("bookid", bookId);

    if (error) {
      console.error("Supabase delete error:", error);
      return res.status(500).json({ error: "Failed to remove reading status" });
    }

    res.json({ 
      message: "Reading status removed successfully"
    });
  } catch (err) {
    console.error("Reading status delete failed:", err);
    res.status(500).json({ error: "Failed to remove reading status" });
  }
});

// GET all books with specific reading status for a user
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query; // Optional: filter by status

    if (!userId) {
      return res.status(400).json({ error: "User Not Found" });
    }

    let query = supabase
      .from("reading_status")
      .select("*")
      .eq("userid", userId)
      .order("updatedat", { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch reading status" });
    }

    res.json(data || []);
  } catch (err) {
    console.error("Reading status fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch reading status" });
  }
});

export default router;
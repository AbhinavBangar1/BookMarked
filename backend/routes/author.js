import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// GET author by name
router.get("/", async (req, res) => {
  const { name } = req.query;
  
  try {
    const { data, error } = await supabase
      .from("author")
      .select("*")
      .ilike("name", name)
      .single();
    
    if (error) {
      return res.json(null);
    }
    
    res.json(data);
  } catch (err) {
    console.error("Author fetch failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
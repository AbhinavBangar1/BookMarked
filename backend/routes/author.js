import express from "express";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

router.get("/:authorId", async (req, res) => {
  const { authorId } = req.params;

  try {
    const { data, error } = await supabase
      .from("author")
      .select("*")
      .eq("authorid", authorId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Author not found" });
    }

    res.json(data);

  } catch (err) {
    console.error("Author route error:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/:authorId/books", async (req, res) => {
  const { authorId } = req.params;

  try {
    const { data, error } = await supabase
      .from("books")
      .select(`
        bookid,
        title,
        coverimage,
        publishedyear,
        genre:genreid (
          genrename
        )
      `)
      .eq("authorid", authorId)
      .order("publishedyear", { ascending: false });

    if (error) throw error;

    res.json(data || []);

  } catch (err) {
    console.error("Author books route error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
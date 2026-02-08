import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${id}?key=${process.env.GOOGLE_BOOKS_API_KEY}`
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Book fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

export default router;
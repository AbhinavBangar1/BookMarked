import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {

    if (id.startsWith("OL")) {
      const workRes = await fetch(
        `https://openlibrary.org/works/${id}.json`
      );
      console.log(`Fetching from : https://openlibrary.org/works/${id}.json`)
    
          if (!workRes.ok) {
            return res.status(404).json({ error: "OpenLibrary book not found" });
          }
        
          const workData = await workRes.json();
          let authors = [];
          if (workData.authors?.length) {
            for (const a of workData.authors) {
              const authorKey = a.author?.key?.replace("/authors/", "");
              if (authorKey) {
                const authorRes = await fetch(
                  `https://openlibrary.org/authors/${authorKey}.json`
                );
                if (authorRes.ok) {
                  const authorData = await authorRes.json();
                  authors.push({ name: authorData.name });
                }
              }
            }
          }
      const finalData = {...workData,authors};
      return res.json(finalData);
    }
    console.log(`fetching from url : https://www.googleapis.com/books/v1/volumes/${id}?key=${process.env.GOOGLE_BOOKS_API_KEY}`);
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${id}?key=${process.env.GOOGLE_BOOKS_API_KEY}`
    );

    if (!response.ok) {
      return res.status(404).json({ error: "Google book not found" });
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Book fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

export default router;
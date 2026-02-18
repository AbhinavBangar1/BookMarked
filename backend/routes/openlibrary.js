import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    let workId = id;

    // If it's an edition, resolve to work
    if (!id.endsWith("W")) {
      const editionRes = await fetch(
        `https://openlibrary.org/books/${id}.json`
      );

      if (!editionRes.ok) {
        return res.status(404).json({ error: "Edition not found" });
      }

      const editionData = await editionRes.json();

      if (!editionData.works || !editionData.works.length) {
        return res.status(404).json({ error: "No work found for edition" });
      }

      workId = editionData.works[0].key.replace("/works/", "");
    }

    const workRes = await fetch(
      `https://openlibrary.org/works/${workId}.json`
    );

    if (!workRes.ok) {
      return res.status(404).json({ error: "Work not found" });
    }

    const workData = await workRes.json();

    // OpenLibrary works return authors as key references, not names.
    // Resolve each author key to get the actual name.
    if (workData.authors && workData.authors.length > 0) {
      const resolvedAuthors = await Promise.all(
        workData.authors.map(async (entry) => {
          try {
            const authorKey = entry.author?.key;
            if (!authorKey) return entry;

            const authorRes = await fetch(
              `https://openlibrary.org${authorKey}.json`
            );
            if (!authorRes.ok) return entry;

            const authorData = await authorRes.json();
            return {
              ...entry,
              name: authorData.name,
              key: authorKey,
            };
          } catch {
            return entry;
          }
        })
      );
      workData.authors = resolvedAuthors;
    }

    res.json(workData);

  } catch (err) {
    console.error("OpenLibrary fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch Open Library book" });
  }
});

export default router;
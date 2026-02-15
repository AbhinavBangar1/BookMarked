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
    res.json(workData);

  } catch (err) {
    console.error("OpenLibrary fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch Open Library book" });
  }
});

export default router;
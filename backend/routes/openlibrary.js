import express from "express";
import fetch from "node-fetch";
import { storeBookIfNotExists } from "../utils/storeBookIfNotExists.js";
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

    // await storeBookIfNotExists({
    //   bookid: workData.key.replace("/works/", ""), // OLxxxxW
    //   title: workData.title,
    //   description:
    //     typeof workData.description === "string"
    //       ? workData.description
    //       : workData.description?.value ?? null,
    //   publishedyear: workData.first_publish_date
    //     ? parseInt(workData.first_publish_date)
    //     : null,
    //   coverimage: workData.covers?.length
    //     ? `https://covers.openlibrary.org/b/id/${workData.covers[0]}-L.jpg`
    //     : null,
    // });

    res.json(workData);

  } catch (err) {
    console.error("OpenLibrary fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch Open Library book" });
  }
});

export default router;
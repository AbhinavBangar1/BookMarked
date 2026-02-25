import express from "express";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
router.post("/", async (req, res) => {
  try {
    const { olId, coverImage, isbn } = req.body;

    console.log("=== save-book called, olId:", olId);

    if (!olId) {
      return res.status(400).json({ error: "olId is required" });
    }

    const { data: existing, error: existErr } = await supabase
      .from("books")
      .select("bookid")
      .eq("bookid", olId)
      .maybeSingle();

    console.log("existing:", existing, "| existErr:", existErr);

    if (existing) {
      return res.json({ bookid: existing.bookid, cached: true });
    }

    let workId = olId;

    if (!olId.endsWith("W")) {
      const edRes = await fetch(`https://openlibrary.org/books/${olId}.json`);
      if (!edRes.ok) return res.status(404).json({ error: "Edition not found" });
      const edData = await edRes.json();
      if (!edData.works?.length)
        return res.status(404).json({ error: "No work linked to edition" });
      workId = edData.works[0].key.replace("/works/", "");
    }

    const workRes = await fetch(`https://openlibrary.org/works/${workId}.json`);
    if (!workRes.ok) return res.status(404).json({ error: "Work not found" });
    const work = await workRes.json();

    console.log("work fetched:", work.title);

    let authorName = null;
    if (work.authors?.length) {
      const authorKey = work.authors[0].author?.key;
      if (authorKey) {
        const aRes = await fetch(`https://openlibrary.org${authorKey}.json`);
        if (aRes.ok) {
          const aData = await aRes.json();
          authorName = aData.name ?? null;
        }
      }
    }

    console.log("authorName:", authorName);

    let authorid = null;
    if (authorName) {
      const { data: existingAuthor } = await supabase
        .from("author")
        .select("authorid")
        .eq("name", authorName)
        .maybeSingle();

      if (existingAuthor) {
        authorid = existingAuthor.authorid;
      } else {
        const { data: newAuthor, error: authorErr } = await supabase
          .from("author")
          .insert({ name: authorName })
          .select("authorid")
          .single();
        console.log("author insert:", newAuthor, "| error:", authorErr);
        authorid = newAuthor?.authorid ?? null;
      }
    }

    console.log("authorid:", authorid);

    const rawSubject = work.subjects?.[0] ?? null;
    const genreName = rawSubject
      ? rawSubject.slice(0, 60).replace(/\b\w/g, (c) => c.toUpperCase())
      : "Uncategorized";

    let genreid = null;
    const { data: existingGenre } = await supabase
      .from("genre")
      .select("genreid")
      .eq("genrename", genreName)
      .maybeSingle();

    if (existingGenre) {
      genreid = existingGenre.genreid;
    } else {
      const { data: newGenre, error: genreErr } = await supabase
        .from("genre")
        .insert({ genrename: genreName })
        .select("genreid")
        .single();
      console.log("genre insert:", newGenre, "| error:", genreErr);
      genreid = newGenre?.genreid ?? null;
    }

    console.log("genreid:", genreid);

    const title = typeof work.title === "string" ? work.title : "Unknown Title";
    const description = typeof work.description === "string"
      ? work.description
      : work.description?.value ?? null;
    const publishedYear = work.first_publish_date
      ? parseInt(work.first_publish_date.slice(-4), 10) || null
      : null;

    console.log("inserting book:", { bookid: workId, title, genreid, authorid });

    const { data: bookRow, error: bookErr } = await supabase
      .from("books")
      .insert({
        bookid: workId,
        title,
        description,
        isbn: isbn ?? null,
        publisher: null,
        publishedyear: publishedYear,
        genreid,
        authorid,
      })
      .select("bookid")
      .single();

    console.log("book insert result:", bookRow, "| error:", bookErr);

    if (bookErr) {
      console.error("Book insert error:", bookErr);
      return res.status(500).json({ error: "Failed to save book", detail: bookErr.message });
    }

    return res.json({ bookid: bookRow.bookid, cached: false });

  } catch (err) {
    console.error("saveBook error:", err);
    res.status(500).json({ error: "Internal server error", detail: err.message });
  }
});
/**
 * POST /api/save-book
 * Body: { olId: "OL12345W", coverImage?: string, isbn?: string }
 *
 * bookid is varchar and stores the OpenLibrary work ID directly.
 * No separate ol_id column needed.
 */
router.post("/", async (req, res) => {
  try {
    const { olId, coverImage, isbn } = req.body;

    if (!olId) {
      return res.status(400).json({ error: "olId is required" });
    }

    // ── 1. Early-exit if book already exists ──────────────────────────────────
    const { data: existing } = await supabase
      .from("books")
      .select("bookid")
      .eq("bookid", olId)
      .maybeSingle();

    if (existing) {
      return res.json({ bookid: existing.bookid, cached: true });
    }

    // ── 2. Fetch from OpenLibrary ─────────────────────────────────────────────
    let workId = olId;

    // If edition ID passed instead of work ID, resolve to work first
    if (!olId.endsWith("W")) {
      const edRes = await fetch(`https://openlibrary.org/books/${olId}.json`);
      if (!edRes.ok) return res.status(404).json({ error: "Edition not found" });
      const edData = await edRes.json();
      if (!edData.works?.length)
        return res.status(404).json({ error: "No work linked to edition" });
      workId = edData.works[0].key.replace("/works/", "");
    }

    const workRes = await fetch(`https://openlibrary.org/works/${workId}.json`);
    if (!workRes.ok) return res.status(404).json({ error: "Work not found" });
    const work = await workRes.json();

    // ── 3. Resolve first author ───────────────────────────────────────────────
    let authorName = null;
    if (work.authors?.length) {
      const authorKey = work.authors[0].author?.key;
      if (authorKey) {
        const aRes = await fetch(`https://openlibrary.org${authorKey}.json`);
        if (aRes.ok) {
          const aData = await aRes.json();
          authorName = aData.name ?? null;
        }
      }
    }

    let authorid = null;
    if (authorName) {
      const { data: existingAuthor } = await supabase
        .from("author")
        .select("authorid")
        .eq("name", authorName)
        .maybeSingle();

      if (existingAuthor) {
        authorid = existingAuthor.authorid;
      } else {
        const { data: newAuthor } = await supabase
          .from("author")
          .insert({ name: authorName })
          .select("authorid")
          .single();
        authorid = newAuthor?.authorid ?? null;
      }
    }

    // ── 4. Resolve genre ──────────────────────────────────────────────────────
    const rawSubject = work.subjects?.[0] ?? null;
    const genreName = rawSubject
      ? rawSubject.slice(0, 60).replace(/\b\w/g, (c) => c.toUpperCase())
      : "Uncategorized";

    let genreid = null;
    const { data: existingGenre } = await supabase
      .from("genre")
      .select("genreid")
      .eq("genrename", genreName)
      .maybeSingle();

    if (existingGenre) {
      genreid = existingGenre.genreid;
    } else {
      const { data: newGenre } = await supabase
        .from("genre")
        .insert({ genrename: genreName })
        .select("genreid")
        .single();
      genreid = newGenre?.genreid ?? null;
    }

    // ── 5. Insert book ────────────────────────────────────────────────────────
    const title =
      typeof work.title === "string" ? work.title : "Unknown Title";

    const description =
      typeof work.description === "string"
        ? work.description
        : work.description?.value ?? null;

    const publishedYear = work.first_publish_date
      ? parseInt(work.first_publish_date.slice(-4), 10) || null
      : null;

    const { data: bookRow, error: bookErr } = await supabase
      .from("books")
      .insert({
        bookid: workId,        // varchar — stores "OL45804W" etc.
        title,
        description,
        isbn: isbn ?? null,
        publisher: null,       // not available on OL works, only editions
        publishedyear: publishedYear,
        genreid,
        authorid,
      })
      .select("bookid")
      .single();

    if (bookErr) {
      console.error("Book insert error:", bookErr);
      return res
        .status(500)
        .json({ error: "Failed to save book", detail: bookErr.message });
    }

    return res.json({ bookid: bookRow.bookid, cached: false });

  } catch (err) {
    console.error("saveBook error:", err);
    res.status(500).json({ error: "Internal server error", detail: err.message });
  }
});

export default router;
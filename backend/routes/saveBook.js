router.post("/", async (req, res) => {
  try {
    const { olId, coverImage, isbn } = req.body;

    if (!olId) {
      return res.status(400).json({ error: "olId is required" });
    }

    const { data: existingBook } = await supabase
      .from("books")
      .select("bookid")
      .eq("bookid", olId)
      .maybeSingle();

    if (existingBook) {
      return res.json({ bookid: existingBook.bookid, cached: true });
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
    if (!workRes.ok)
      return res.status(404).json({ error: "Work not found" });

    const work = await workRes.json();


    if (!work.authors?.length) {
      return res.status(400).json({ error: "Book has no authors in OpenLibrary" });
    }

    const authorKey = work.authors[0].author?.key;
    if (!authorKey) {
      return res.status(400).json({ error: "Invalid author key" });
    }

    const authorId = authorKey.replace("/authors/", "");

    let { data: existingAuthor } = await supabase
      .from("author")
      .select("authorid")
      .eq("authorid", authorId)
      .maybeSingle();

    if (!existingAuthor) {
      const aRes = await fetch(`https://openlibrary.org${authorKey}.json`);
      if (!aRes.ok)
        return res.status(400).json({ error: "Failed to fetch author data" });

      const aData = await aRes.json();

      const { error: authorInsertError } = await supabase
        .from("author")
        .insert({
          authorid: authorId,
          name: aData.name ?? "Unknown Author",
        });

      if (authorInsertError) {
        return res.status(500).json({
          error: "Failed to insert author",
          detail: authorInsertError.message,
        });
      }
    }


    const rawSubject = work.subjects?.[0];

    if (!rawSubject) {
      return res.status(400).json({ error: "Book has no subjects (genre)" });
    }

    const genreName = rawSubject
      .slice(0, 60)
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const genreId = genreName.toLowerCase().replace(/\s+/g, "_");

    let { data: existingGenre } = await supabase
      .from("genre")
      .select("genreid")
      .eq("genreid", genreId)
      .maybeSingle();

    if (!existingGenre) {
      const { error: genreInsertError } = await supabase
        .from("genre")
        .insert({
          genreid: genreId,
          genrename: genreName,
        });

      if (genreInsertError) {
        return res.status(500).json({
          error: "Failed to insert genre",
          detail: genreInsertError.message,
        });
      }
    }


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
        bookid: workId,
        title,
        description,
        isbn: isbn ?? null,
        publisher: null,
        publishedyear: publishedYear,
        genreid: genreId,
        authorid: authorId,
        coverimage: coverImage ?? null,
      })
      .select("bookid")
      .single();

    if (bookErr) {
      return res.status(500).json({
        error: "Failed to save book",
        detail: bookErr.message,
      });
    }

    return res.json({ bookid: bookRow.bookid, cached: false });

  } catch (err) {
    console.error("saveBook error:", err);
    return res.status(500).json({
      error: "Internal server error",
      detail: err.message,
    });
  }
});
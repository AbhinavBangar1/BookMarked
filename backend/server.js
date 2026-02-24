import express from "express";
import cors from "cors";
import "dotenv/config";
import searchRoutes from "./routes/search.js";
import sectionRoutes from "./routes/section.js";
import quoteRoutes from "./routes/quote.js";
import genreRoutes from "./routes/genre.js";
import bookRoutes from "./routes/book.js";
import openLibraryRoutes from "./routes/openlibrary.js";
import bigbookRoutes from "./routes/bigbook.js";
import newyorkRoutes from "./routes/nyt.js";
import bookmarkRoutes from "./routes/bookmark.js";
import ratingRoutes from "./routes/rating.js";
import reviewRoutes from "./routes/review.js";
import authorRoutes from "./routes/author.js";
import readingStatusRoutes from "./routes/readingStatus.js"; 
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

app.use("/api/search", searchRoutes);
app.use("/api/section", sectionRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/genre", genreRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/openlibrary/book", openLibraryRoutes);
app.use("/api/bigbook", bigbookRoutes);
app.use("/api/nyt", newyorkRoutes);
app.use("/api/bookmark", requireAuth, bookmarkRoutes);

app.use("/api/supabase/rating", ratingRoutes);
app.use("/api/supabase/reviews", reviewRoutes);
app.use("/api/author", authorRoutes);
app.use("/api/reading-status", readingStatusRoutes); 

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});

export default app;
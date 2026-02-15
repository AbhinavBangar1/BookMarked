import express from "express";
import cors from "cors";
import "dotenv/config";
import searchRoutes from "./routes/search.js";
import quoteRoutes from "./routes/quote.js";
import genreRoutes from "./routes/genre.js";
import bookRoutes from "./routes/book.js";
import openLibraryRoutes from "./routes/openlibrary.js";
import bookmarkRoutes from "./routes/bookmark.js";
import ratingRoutes from "./routes/rating.js";
import reviewRoutes from "./routes/review.js";
import authorRoutes from "./routes/author.js";
import readingStatusRoutes from "./routes/readingStatus.js"; // NEW
import { requireAuth } from "./middleware/requireAuth.js";

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Existing routes
app.use("/api/search", searchRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/genre", genreRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/openlibrary/book", openLibraryRoutes);
app.use("/api/bookmark", requireAuth, bookmarkRoutes); // For Wishlist

// New routes for reviews, ratings, and reading status
app.use("/api/supabase/rating", ratingRoutes);
app.use("/api/supabase/reviews", reviewRoutes);
app.use("/api/author", authorRoutes);
app.use("/api/reading-status", readingStatusRoutes); // NEW - For Want to Read, etc.

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});

export default app;
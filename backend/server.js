import express from "express";
import cors from "cors";
import "dotenv/config";
import searchRoutes from "./routes/search.js";
import sectionRoutes from "./routes/section.js";
import quoteRoutes from "./routes/quote.js";
import genreRoutes from "./routes/genre.js";
// import bookRoutes from "./routes/book.js";
import bookmarkRoutes from "./routes/bookmark.js";
import ratingRoutes from "./routes/rating.js";
import reviewRoutes from "./routes/review.js";
import booksRoutes from "./routes/author.js";
import readingStatusRoutes from "./routes/readingStatus.js"; 
import { requireAuth } from "./middleware/requireAuth.js";
import profileRoutes from "./routes/profile.js";
import bookProfileRoutes from "./routes/bookprofile.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/search", searchRoutes);
app.use("/api/section", sectionRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/genre", genreRoutes);
// app.use("/api/book", bookRoutes);
app.use("/profile", profileRoutes);
app.use("/api/bookmark", requireAuth, bookmarkRoutes);
app.use("/api/book", bookProfileRoutes);
app.use("/api/supabase/rating", ratingRoutes);
app.use("/api/supabase/reviews", reviewRoutes);
app.use("/api/author", booksRoutes);
app.use("/api/shelf", readingStatusRoutes); 

app.get("/", (req, res) => {
  res.send("Yepp Working fine :)");
});
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});

export default app;
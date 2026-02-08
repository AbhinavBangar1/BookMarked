import express from "express" ;
import cors from "cors";
import "dotenv/config";
import searchRoutes from "./routes/search.js";
import quoteRoutes from "./routes/quote.js";
import genreRoutes from "./routes/genre.js"
import bookRoutes from "./routes/book.js";
import openLibraryRoutes from "./routes/openlibrary.js";
const app =express();
const PORT = 5001;

app.use(cors())     // allow frontend to use backend 
app.use(express.json())

app.use("/api/search",searchRoutes)
app.use("/api/quote",quoteRoutes)
app.use("/api/genre",genreRoutes)
app.use("/api/book", bookRoutes);
app.use("/api/openlibrary/book", openLibraryRoutes);
app.listen(PORT ,()=>{
    console.log(`server running on https://localhost:${PORT}`);
});


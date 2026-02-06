import express from "express" ;
import cors from "cors";
import "dotenv/config";
import searchRoutes from "./routes/search.js";
import quoteRoutes from "./routes/quote.js";
import genreRoutes from "./routes/genre.js"

const app =express();
const PORT = 5000;

app.use(cors())     // allow frontend to use backend 
app.use(express.json())

app.use("/api/search",searchRoutes)
app.use("/api/quote",quoteRoutes)
app.use("/api/genre",genreRoutes)

app.listen(PORT ,()=>{
    console.log(`server running on https://localhost:${PORT}`);
});


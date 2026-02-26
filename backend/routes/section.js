import express from 'express';
import axios from 'axios';
import redisClient from '../redisClient.js';
import { storeBookIfNotExists } from "../utils/storeBookIfNotExists.js";

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({ error: "No type provided" });
    }

    const cacheKey = type;
    const cachedData = await redisClient.get(cacheKey);

    if (cachedData) {
      console.log(`Found ${type} in cache`);
      return res.json(JSON.parse(cachedData));
    }
    let url = "";

    if (type === "bestsellers") {
      url = `https://api.nytimes.com/svc/books/v3/lists/overview.json?api-key=${process.env.NEW_YORK_KEY}`;
    }

    else if (type === "featured") {

        url = `https://api.bigbookapi.com/search-books?genres=fiction&number=15&api-key=${process.env.BIG_BOOK_API}`;
        console.log(`Fetching ${type} from url:`, url);
        const bigResponse = await axios.get(url);
        const books = bigResponse.data.books.flat();

        const enrichedBooks = await Promise.all(
            books.map(async (book) => {
                if (book.image) return book;
                let coverFound = false;
                try {
                    const searchUrl1 = `https://openlibrary.org/search.json?title=${encodeURIComponent(
                        book.title
                    )}&author=${encodeURIComponent(
                        book.authors?.[0]?.name || ""
                    )}&limit=1`;
                    const res1 = await axios.get(searchUrl1);
                    const doc1 = res1.data.docs?.[0];
                    if (doc1?.cover_i) {
                        book.image = `https://covers.openlibrary.org/b/id/${doc1.cover_i}-L.jpg`;
                        coverFound = true;
                    }
                    if (!coverFound) {
                        const cleanTitle = book.title.split(":")[0];
                        const searchUrl2 = `https://openlibrary.org/search.json?title=${encodeURIComponent(cleanTitle)}&limit=1`;

                        const res2 = await axios.get(searchUrl2);
                        const doc2 = res2.data.docs?.[0];

                        if (doc2?.cover_i) {
                            book.image = `https://covers.openlibrary.org/b/id/${doc2.cover_i}-L.jpg`;
                            coverFound = true;
                        }
                    }

                } catch (err) {
                    console.log("Fallback failed:", book.title);
                }
                if (!coverFound) {
                    book.image = "https://via.placeholder.com/300x450?text=No+Cover";
                }
                return book;
            })
        );

        const finalData = { books: enrichedBooks };

        await redisClient.setEx(cacheKey, 1200, JSON.stringify(finalData));
        return res.json(finalData);
    }

    else if (type === "toprated") {
      url = `https://openlibrary.org/search.json?q=subject:fiction&sort=rating&limit=15`;
    }
    else {
      return res.status(400).json({ error: "Invalid section type" });
    }
    console.log(`Fetching ${type} from url:`, url);
    const response = await axios.get(url);
    await redisClient.setEx(cacheKey, 1200, JSON.stringify(response.data));
    res.json(response.data);
    } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to find section books" });
  }
});

export default router;
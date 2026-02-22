import axios from 'axios'
import express from 'express'
import redisClient from "../redisClient.js"

const router = express.Router()

router.get("/",async(req , res) => {
    try{
        const {genre} = req.query;
        const cacheKey = `books:${genre.toLowerCase()}`
        const cached = await redisClient.get(cacheKey);
        // if (cached){
        //     console.log("cache hit for:" , genre);
        //     return res.json(JSON.parse(cached));
        // }

        const url = `https://openlibrary.org/subjects/${encodeURIComponent(genre)}.json?limit=55`;
        // const url = `https://api.bigbookapi.com/search-books?genres=${encodeURIComponent(genre)}&number=55&api-key=${process.env.BIG_BOOK_API}`;
        console.log("No cache fetching from Openlibrary genre url :" , url);
        const response = await axios.get(url)
        const works = response.data.works || [];
        await redisClient.setEx(cacheKey,1200,JSON.stringify(works));
        res.json(works);
    }catch (error){
        console.error(error.message)
        res.status(500).json({error : "failed to fetch genre"})
    }
})

export default router ;

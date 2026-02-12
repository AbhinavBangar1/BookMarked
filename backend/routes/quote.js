import axios from "axios";
import express from "express" ;
import redisClient from "../redisClient.js";

const router = express.Router()

router.get("/",async(req,res) => {
    try{
        const URL = `https://recite-flax.vercel.app/api/v1/random`;
        const cacheKey = `Quote`;
        const cachedQuote = await redisClient.get(cacheKey);
        if(cachedQuote){
            console.log("Cached Quote found");
            return res.json(JSON.parse(cachedQuote))
        }
        const response = await axios.get(URL);
        console.log("No Cached Quote found , fetching Quote from :" , URL)
        await redisClient.setEx(cacheKey,1200,JSON.stringify(response.data))
        res.json(response.data || []);
    }catch(error){
        console.log(error.message);
        res.status(500).json({error : "failed to fetch quote"})
    }
});

export default router;
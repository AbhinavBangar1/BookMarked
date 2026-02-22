import express from 'express' ;
import axios from 'axios';
import redisClient from '../redisClient.js';

const router = express.Router();

router.get('/' , async(req , res)=>{
    try {
    const {type} = req.query ;

    const cacheKey = type ;
    const cachedData = await redisClient.get(cacheKey);
    // if (cachedData){
    //     console.log(`Found ${type} in cache`);
    //     return res.json(JSON.parse(cachedData));
    // }
    let url = "";
    if (type === "bestsellers"){
        url = `https://api.nytimes.com/svc/books/v3/lists/overview.json?published_date=2025-05-04&api-key=${process.env.NEW_YORK_KEY}`
    }
    else if (type === "featured") {
      url = `https://openlibrary.org/subjects/award_winners.json?&sort=rating&limit=15`;
    } 
    else if (type === "toprated") {
      url = `https://openlibrary.org/search.json?q=bestseller&sort=rating&limit=15`;
    } 

    if (!url){
        return res.status(400).json({ error: "No type provided" });
    }

    console.log(`Fetching ${type} from url : `, url );
    const response = await axios.get(url);
    await redisClient.setEx(cacheKey , 1200 , JSON.stringify(response.data));
    res.json(response.data)
    }catch(error){
        console.error("Error : ",error.message);
        res.status(500).json({error : "Failed to find section books"});
    }
});


export default router ;
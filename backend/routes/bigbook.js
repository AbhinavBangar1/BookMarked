import express from "express";
import axios from "axios";
import redisClient from "../redisClient.js";
import { storeBookIfNotExists } from "../utils/storeBookIfNotExists.js";
const router = express.Router();

router.get('/:id' , async(req , res)=> {
    try{
        const {id} = req.params;
        if(!id){
            return res.status(400).json({error : "No ID found from big book"});
        }

        const cacheKey = id;
        const cachedData = await redisClient.get(cacheKey);
    
        if (cachedData) {
          console.log(`Found ${type} in cache`);
          return res.json(JSON.parse(cachedData));
        }

        let url = `https://api.bigbookapi.com/${id}?api-key=${process.env.BIG_BOOK_API}`
        console.log(`Fetching isbn for big book from url : ` , url);
        const response = await axios.get(url);
        const olid = response.data.identifiers.open_library_id ;
        url = `https://openlibrary.org/works/${olid}.json`;
        console.log(`Fetching book details from open library using olid(big book) :`,url);
        const bookres = await axios.get(url);
        await redisClient.setEx(cacheKey,1200,JSON.stringify(bookres.data));

        // await storeBookIfNotExists({
        //     bookid: bookres.data.key.replace("/works/", ""),
        //     title: bookres.data.title,
        //     description:
        //         typeof bookres.data.description === "string"
        //             ? bookres.data.description
        //             : bookres.data.description?.value ?? null,
        //     coverimage: bookres.data.covers?.length
        //         ? `https://covers.openlibrary.org/b/id/${bookres.data.covers[0]}-L.jpg`
        //         : null,
        // });
        res.json(bookres.data);

    }catch(error){
        console.log("error :" , error.message);
        res.status(500).json({error : "Failed to fetch book using Big Book API"})
    }

});

export default router ;
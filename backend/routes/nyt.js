import express from "express";
import axios from "axios";
import redisClient from "../redisClient.js";
import { storeBookIfNotExists } from "../utils/storeBookIfNotExists.js";
const router = express.Router();

router.get('/:id' , async(req , res)=> {
    try{
        const {id} = req.params;
        if(!id){
            return res.status(400).json({error : "No ID found from new york times api"});
        }

        const cacheKey = id;
        const cachedData = await redisClient.get(cacheKey);
    
        if (cachedData) {
          console.log(`Found ${id} in cache`);
          return res.json(JSON.parse(cachedData));
        }

        let url = `https://openlibrary.org/api/books?bibkeys=ISBN:${id}&format=json&jscmd=data`
        console.log(`Fetching olid for new york book from url : ` , url);
        const response = await axios.get(url);
        const bookKey = `ISBN:${id}`;
        const bookData = response.data[bookKey];
        const editionKey = bookData.key;
        const editionId = editionKey.replace("/books/", "");
        const editionUrl = `https://openlibrary.org/books/${editionId}.json`;
        console.log("Fetching edition JSON:", editionUrl);
        const editionRes = await axios.get(editionUrl);
        const workId = editionRes.data.works[0].key.replace("/works/", "");
        const workUrl = `https://openlibrary.org/works/${workId}.json`;
        console.log("Fetching work JSON:", workUrl);
        const workRes = await axios.get(workUrl);
        const finalData = workRes.data;

        // await storeBookIfNotExists({
        //     bookid: finalData.key.replace("/works/", ""),
        //     title: finalData.title,
        //     description:
        //         typeof finalData.description === "string"
        //             ? finalData.description
        //             : finalData.description?.value ?? null,
        //     coverimage: finalData.covers?.length
        //         ? `https://covers.openlibrary.org/b/id/${finalData.covers[0]}-L.jpg`
        //         : null,
        // });
        await redisClient.setEx(cacheKey,1200,JSON.stringify(finalData));
        res.json(finalData);

    }catch(error){
        console.log("error :" , error.message);
        res.status(500).json({error : "Failed to fetch book using Big Book API"})
    }

});

export default router ;
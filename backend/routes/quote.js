import axios from "axios";
import express from "express" ;

const router = express.Router()

router.get("/",async(req,res) => {
    try{
        const URL = `https://recite-flax.vercel.app/api/v1/random`;
        const response = await axios.get(URL);
        res.json(response.data || []);
    }catch(error){
        console.log(error.message);
        res.status(500).json({error : "failed to fetch quote"})
    }
});

export default router;
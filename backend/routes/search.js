import express from "express";
import axios from "axios";

const router = express.Router();

//For section 
router.get("/",async(req,res)=>{
    try{
        const {genre , type ,order , title} = req.query;
        let query = "";
        if (genre) {
            query = `subject:${genre}`;
        } else if (type) {
            query = type;
        } else if (title) {
            query = title;
        } else if (order) {
            query = order;
        }
        if (!query) {
            return res.status(400).json({ error: "No search query provided" });
        }
        const URL = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            query
        )}&maxResults=12&key=${process.env.GOOGLE_BOOKS_API_KEY}`;

        const response = await axios.get(URL);
        res.json(response.data.items?.slice(0,12) || []);
    }catch (error) {
  console.error(error.message);
  res.status(500).json({ error: "failed to search" });
}});


//for search bar
router.get("/specific",async(req,res) => {
    try{
        const {author , title , isbn , publisher} = req.query ;
        let query = "";
        if(author){
            query = `inauthor:${author}`
        }
        else if(title){
            query = `intitle:${title}`
        }
        else if(isbn){
            query = `isbn:${isbn}`
        }
        else if (publisher){
            query= `inpublisher:${publisher}`
        }
        if (!query) {
            return res.status(400).json({ error: "No search query provided" });
        }
        const URL = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            query
        )}&maxResults=30&key=${process.env.GOOGLE_BOOKS_API_KEY}`;
        console.log("Google Books URL:", URL);
        const response = await axios.get(URL);
        res.json(response.data.items?.slice(0,50) || []);
    }catch(error){
        console.error(error.message)
        res.status(500).json({error:"Failed to fetch"});
    }
});

router.get("/author-image", async (req, res) => {
  const { name } = req.query;
  const url = `https://openlibrary.org/search/authors.json?q=${encodeURIComponent(name)}`;
  const response = await axios.get(url);

  const author = response.data.docs?.[0];
  if (!author) return res.json(null);

  res.json({
    name: author.name,
    image: `https://covers.openlibrary.org/a/olid/${author.key.split("/").pop()}-M.jpg`,
  });
});


export default router;

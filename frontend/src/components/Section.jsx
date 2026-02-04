import './Section.css'
import './BookCard.jsx'
import { useState , useEffect} from 'react';
import BookCard from './BookCard.jsx';

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

function Section({title ,section_title, type , genre , search }){
    
    const [books,setBooks] = useState([]);
    let query = "";    
    if (genre) {
        query = `subject:${genre}`;
    } else if (type) {
        query = type;
    }
    else if(title){
        query = title ;
    }
    if (!query) return null; 
    const URL = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${API_KEY}` ;
    useEffect(()=>{
        fetch(URL)
        .then (res => res.json())
        .then(data => {setBooks(data.items || [])});
    },[URL]);

    return(
        <>
            <div className='section-container'>
                <h3 className='section-title'>{section_title}</h3>
                <div className='card-container'>
                    {books.map(books=>(
                        <BookCard
                            key={books.id}
                            img={books.volumeInfo.imageLinks?.thumbnail}
                            title={books.volumeInfo.title}
                            genre={books.volumeInfo.categories?.[0] || "Unknown"}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

export default Section ;
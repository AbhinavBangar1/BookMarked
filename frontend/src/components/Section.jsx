import './Section.css'
import './BookCard.jsx'
import { useState , useEffect} from 'react';
import BookCard from './BookCard.jsx';

const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;

function Section({title ,section_title, type , genre , order }){
    
    const [books,setBooks] = useState([]);
    useEffect(()=>{
        const param = new URLSearchParams();
        if(genre) param.append("genre",genre);
        else if(title) param.append("title",title);
        else if (type) param.append("type",type);
        else if (order) param.append("order",order);

        if (![...param].length) return;
        fetch(`/api/search?${param.toString()}`)
        .then (res => res.json())
        .then(data => setBooks(data))
        .catch(err => console.error(err));
    },[genre, type, title, order]);

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
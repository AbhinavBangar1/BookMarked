import './BookCard.css'
import { BsBookmark } from "react-icons/bs";

function BookCard({img , title , genre}){
    return(
        <>
            <div className='book-card'>
                <div className='image-wrapper'>
                    <img src={img} alt={title} className='cover-image'/>
                    <BsBookmark className='bookmark'/>
                </div>
                <div className='text-section'>
                    <p className='book-title'>{title}</p>
                    <p className='book-genre'>{genre}</p>
                </div>
            </div>
        </>
    );
}

export default BookCard;
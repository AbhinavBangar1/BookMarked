import './BookCard.css'
import { CiHeart } from "react-icons/ci";

function BookCard({img , title , genre}){
    return(
        <>
            <div className='book-card'>
                <div className='image-wrapper'>
                    <img src={img} alt={title} className='cover-image'/>
                </div>
                <div className='text-section'>
                    <p className='book-title'>{title}</p>
                    <p className='book-genre'>{genre}</p>
                    <CiHeart className='wishlist'/>
                </div>
            </div>
        </>
    );
}

export default BookCard;
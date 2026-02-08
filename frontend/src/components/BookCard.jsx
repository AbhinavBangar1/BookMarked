import './BookCard.css';
import { BsBookmark } from "react-icons/bs";
import { Link } from 'react-router-dom';

function BookCard({ id, img, title, genre }) {
  return (
    <Link to={`/book/${id}`} className="book-card-link">
      <div className="book-card">
        <div className="cover-wrapper">
          <img src={img} alt={title} />
          <button
            className="bookmark-btn"
            onClick={(e) => e.preventDefault()}
          >
            <BsBookmark />
          </button>
        </div>

        <div className="book-info">
          <h3 className="book-title">{title}</h3>
          <span className="book-genre">{genre}</span>
        </div>
      </div>
    </Link>
  );
}

export default BookCard;
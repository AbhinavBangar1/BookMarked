import './BookCard.css';
import { BsBookmark } from "react-icons/bs";

function BookCard({ img, title, genre }) {
  return (
    <div className="book-card">
      <div className="cover-wrapper">
        <img src={img} alt={title} />
        <button className="bookmark-btn">
          <BsBookmark />
        </button>
      </div>

      <div className="book-info">
        <h3 className="book-title">{title}</h3>
        <span className="book-genre">{genre}</span>
      </div>
    </div>
  );
}

export default BookCard;

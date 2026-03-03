import './BookCard.css';
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function BookCard({ id, img, title, author, genre, isBookmarked = false, onBookmarkChange }) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [loading, setLoading] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    setBookmarked(isBookmarked);
  }, [isBookmarked]);

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    try {
      const token = session?.access_token;
      if (!token) {
        window.location.href = "/auth";
        return;
      }

      const isDeleting = bookmarked;
      
      const url = isDeleting 
        ? `https://bookmarked-527h.onrender.com/api/bookmark?bookId=${id}` 
        : "https://bookmarked-527h.onrender.com/api/bookmark";

      const response = await fetch(url, {
        method: isDeleting ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: isDeleting ? null : JSON.stringify({ bookId: id }),
      });

      if (response.ok) {
        setBookmarked(!bookmarked);
        if (onBookmarkChange) {
          onBookmarkChange(id);
        }
      } else {
        const errData = await response.json();
        console.error("Bookmark Error:", errData.error);
      }

    } catch (error) {
      console.error("Bookmark operation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/books/${id}`} className="book-card-link">
      <div className="book-card">
        <div className="cover-wrapper">
          <img 
            src={img || "https://placehold.co/300x450?text=No+Cover"} 
            alt={title} 
            loading="lazy" 
          />

          <button
            className={`bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmarkClick}
            disabled={loading}
            aria-label={bookmarked ? "Remove Bookmark" : "Add Bookmark"}
          >
            {bookmarked ? <BsBookmarkFill /> : <BsBookmark />}
          </button>

          <div className="cover-info">
            <h3 className="cover-title">{title}</h3>
            {author && <p className="cover-meta">{author}</p>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default BookCard;
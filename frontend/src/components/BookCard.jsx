import './BookCard.css';
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function BookCard({ id, img, title, genre, isBookmarked = false, onBookmarkChange }) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Check if book is bookmarked when component mounts
  useEffect(() => {
    if (user && id) {
      checkBookmarkStatus();
    }
  }, [user, id]);

  const checkBookmarkStatus = async () => {
    try {
      const response = await fetch(
        `/api/bookmark/check?userId=${user.id}&bookId=${id}`
      );
      const data = await response.json();
      setBookmarked(data.isBookmarked);
    } catch (error) {
      console.error("Failed to check bookmark status:", error);
    }
  };

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to auth if not logged in
      window.location.href = '/auth';
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      if (bookmarked) {
        // Remove bookmark
        const response = await fetch(
          `/api/bookmark?userId=${user.id}&bookId=${id}`,
          { method: 'DELETE' }
        );

        if (response.ok) {
          setBookmarked(false);
          if (onBookmarkChange) {
            onBookmarkChange(id);
          }
        }
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            bookId: id,
            title,
            coverImage: img,
            genre,
          }),
        });

        if (response.ok) {
          setBookmarked(true);
        }
      }
    } catch (error) {
      console.error("Bookmark operation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Link to={`/book/${id}`} className="book-card-link">
      <div className="book-card">
        <div className="cover-wrapper">
          <img src={img} alt={title} />
          <button
            className={`bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmarkClick}
            disabled={loading}
          >
            {bookmarked ? <BsBookmarkFill /> : <BsBookmark />}
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
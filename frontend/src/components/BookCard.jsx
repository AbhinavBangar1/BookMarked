import './BookCard.css';
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function BookCard({ id, img, title, isBookmarked = false, onBookmarkChange, source, bookData, genre }) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [loading, setLoading] = useState(false);
  const { session, user } = useAuth();

  const titleRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const el = titleRef.current;
      if (el) setIsOverflowing(el.scrollWidth > el.clientWidth);
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [title]);

  const handleCardClick = () => {
    if (!id) return;

    const olId = typeof id === "string" && id.startsWith("OL") ? id : null;
    if (!olId) return;

    fetch("http://localhost:5001/api/save-book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        olId,
        isbn: bookData?.isbn ?? null,
        coverImage: img ?? null,
      }),
    }).catch((err) => console.error("Failed to save book:", err));
  };

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

      if (bookmarked) {
        // DELETE bookmark
        const response = await fetch(
          `http://localhost:5001/api/bookmark?bookId=${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          setBookmarked(false);
          if (onBookmarkChange) onBookmarkChange(id);
        } else {
          console.error("Delete failed");
        }

      } else {
        // ADD bookmark
        const response = await fetch(
          "http://localhost:5001/api/bookmark",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              bookId: id,
            }),
          }
        );

        if (response.ok) {
          setBookmarked(true);
        } else {
          const err = await response.json();
          console.error("Insert failed:", err);
        }
      }

    } catch (error) {
      console.error("Bookmark operation failed:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Link
      to={source ? `/book/${id}?source=${source}` : `/book/${id}`}
      state={{ bookData }}
      className="book-card-link"
      onClick={handleCardClick}
    >
      <div className="book-card">
        <div className="cover-wrapper">
          <img src={img} alt={title} />

          <div className="cover-overlay" />

          <button
            className={`bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
            onClick={handleBookmarkClick}
            disabled={loading}
          >
            {bookmarked ? <BsBookmarkFill /> : <BsBookmark />}
          </button>

          <div className="cover-info">
            <h3 className="cover-title" ref={titleRef}>
              <div className={`marquee ${isOverflowing ? 'animate' : ''}`}>
                <span>{title}</span>
                {isOverflowing && <span>{title}</span>}
              </div>
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default BookCard;
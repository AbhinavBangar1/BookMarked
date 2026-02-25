import './BookCard.css';
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function BookCard({ id, img, title, isBookmarked = false, onBookmarkChange, source, bookData, genre }) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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

  // Called when the user clicks the card to open the book detail page.
  // Saves the book to the DB in the background — does NOT block navigation.
  const handleCardClick = () => {
    if (!id) return;

    // Only save books that come from OpenLibrary (OL prefix = work/edition ID)
    const olId = typeof id === "string" && id.startsWith("OL") ? id : null;
    if (!olId) return;

    // Fire-and-forget — we don't await this so navigation is instant
    fetch("/api/save-book", {
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

    if (!user) {
      window.location.href = '/auth';
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const token = user.accessToken;

      if (bookmarked) {
        const response = await fetch(
          `/api/bookmark?userId=${user.id}&bookId=${id}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (response.ok) {
          setBookmarked(false);
          if (onBookmarkChange) onBookmarkChange(id);
        }
      } else {
        const response = await fetch('/api/bookmark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            bookId: id,
            title,
            coverImage: img,
            genre,           // ✅ now comes from props, not undefined
          }),
        });
        if (response.ok) setBookmarked(true);
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
      onClick={handleCardClick}   // ← save book on card click
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
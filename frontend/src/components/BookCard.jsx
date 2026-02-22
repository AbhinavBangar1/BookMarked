import './BookCard.css';
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { Link } from 'react-router-dom';
import { useRef , useState , useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function BookCard({ id, img, title, genre, isBookmarked = false, onBookmarkChange }) {
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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

  const titleRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const el = titleRef.current;
      if (el) {
        setIsOverflowing(el.scrollWidth > el.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [title]);

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
        // Remove bookmark
        const response = await fetch(
          `/api/bookmark?userId=${user.id}&bookId=${id}`,
          { method: 'DELETE' ,
          headers : {
            Authorization : `Bearer ${token}` }
          },
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
            Authorization : `Bearer ${token}`

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
        <span className="cover-meta">{genre}</span>
      </div>
    </div>
  </div>
</Link>
  );
}

export default BookCard;
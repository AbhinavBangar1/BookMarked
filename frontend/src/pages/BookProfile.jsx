import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import "./BookProfile.css";
import toast from "react-hot-toast";

function BookProfile() {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const stateBook = location.state?.bookData;
  const source = queryParams.get("source") || null;
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  const [expanded, setExpanded] = useState(false);
  
  // Shelf status state initialized to null (book is not on shelf yet)
  const [status, setStatus] = useState(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const [moreBooks, setMoreBooks] = useState([]);

  // New states for reviews and author
  const [reviews, setReviews] = useState([]);
  const [authorInfo, setAuthorInfo] = useState(null);
  const [bookStats, setBookStats] = useState({
    avgRating: 0,
    totalRatings: 0,
    totalReviews: 0
  });

  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  const statusRef = useRef(null);

  // Helper map for UI display vs DB values
  const statusLabels = {
    'want to read': 'Want to Read',
    'currently reading': 'Currently Reading',
    'done reading': 'Done Reading'
  };

  // Check if user is logged in - SUPABASE AUTH
  useEffect(() => {
    const checkAuth = () => {
      try {
        const supabaseTokenKey = Object.keys(localStorage).find(
          key => key.startsWith('sb-') && key.endsWith('-auth-token')
        );

        if (!supabaseTokenKey) return;

        const tokenData = localStorage.getItem(supabaseTokenKey);

        if (tokenData) {
          try {
            const parsedData = JSON.parse(tokenData);
            let session = null;

            if (Array.isArray(parsedData)) {
              session = parsedData.find(item =>
                item && typeof item === 'object' && item.access_token
              );
            } else if (parsedData.access_token) {
              session = parsedData;
            }

            if (session && session.access_token) {
              setIsLoggedIn(true);
              setAuthToken(session.access_token);

              if (session.user && session.user.id) {
                setCurrentUserId(session.user.id);
              }
            }
          } catch (parseErr) {
            console.error('Failed to parse Supabase token:', parseErr);
          }
        }
      } catch (err) {
        console.error('Auth check failed', err);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    async function fetchBookFromDB() {
      try {
        setLoading(true);

        const res = await fetch(
          `https://bookmarked-527h.onrender.com/api/books/${id}`
        );

        if (!res.ok) throw new Error("Book not found");

        const data = await res.json();

        setBook(data);

      } catch (err) {
        console.error("Failed to fetch book", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBookFromDB();
  }, [id]);


  // Updated to fetch from /api/shelf
  useEffect(() => {
    if (!isLoggedIn || !id || !authToken) return;

    async function fetchShelfStatus() {
      try {
        const res = await fetch(
          `https://bookmarked-527h.onrender.com/api/shelf/check?bookId=${id}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        );
        const data = await res.json();

        if (data.status) {
          setStatus(data.status);
        }
      } catch (err) {
        console.error('Failed to fetch shelf status', err);
      }
    }

    fetchShelfStatus();
  }, [isLoggedIn, id, authToken]);


  const info = useMemo(() => {
    if (!book) return null;

    return {
      title: book.title,
      authors: [book.author?.name || "Unknown Author"],
      description: book.description,
      image: book.coverimage || "/placeholder-book.png",
      categories: [book.genre?.genrename || "Uncategorized"],
      publishedDate: book.publishedyear,
      pages: null,
      publisher: book.publisher,
      language: null,
      isbn: book.isbn,
      averageRating: null,
      ratingsCount: null,
    };
  }, [book]);


  useEffect(() => {
    if (!info) return;

    async function fetchBookStats() {
      try {
        const ratingRes = await fetch(`https://bookmarked-527h.onrender.com/api/supabase/rating?bookId=${id}`);
        const ratingData = await ratingRes.json();

        const reviewRes = await fetch(`https://bookmarked-527h.onrender.com/api/supabase/reviews/count?bookId=${id}`);
        const reviewData = await reviewRes.json();

        setBookStats({
          avgRating: ratingData.avgRating || info.averageRating || 0,
          totalRatings: ratingData.count || info.ratingsCount || 0,
          totalReviews: reviewData.count || 0
        });
      } catch (err) {
        console.error('Failed to fetch book stats', err);
      }
    }

    fetchBookStats();
  }, [info, id]);

  useEffect(() => {
    if (!info) return;

    async function fetchReviews() {
      try {
        const res = await fetch(`https://bookmarked-527h.onrender.com/api/supabase/reviews?bookId=${id}`);
        if (!res.ok) {
          setReviews([]);
          return;
        }

        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch reviews', err);
      }
    }

    fetchReviews();
  }, [info, id]);

  useEffect(() => {
    if (!book?.author?.authorid) return;

    async function fetchMoreBooks() {
      try {
        const res = await fetch(
          `https://bookmarked-527h.onrender.com/api/author/${book.author.authorid}/books`
        );

        if (!res.ok) {
          setMoreBooks([]);
          return;
        }

        const data = await res.json();

        // Remove current book from list
        const filtered = data
          .filter(b => b.bookid !== book.bookid)
          .slice(0, 6)
          .map(b => ({
            id: b.bookid,
            title: b.title,
            image: b.coverimage,
            genre: b.genre?.genrename || "Book"
          }));

        setMoreBooks(filtered);

      } catch (err) {
        console.error("Failed to fetch more books", err);
        setMoreBooks([]);
      }
    }

    fetchMoreBooks();
  }, [book]);

  // Updated to point to /api/shelf
  const handleStatusChange = (newStatus) => {
    requireLogin(async () => {
      try {
        const response = await fetch('https://bookmarked-527h.onrender.com/api/shelf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            bookId: id,
            status: newStatus
          })
        });

        if (!response.ok) throw new Error('Failed to update shelf');
        setStatus(newStatus);
        setShowStatusDialog(false);
        toast.success("Shelf updated!");
      } catch (err) {
        toast.error('Failed to update shelf: ' + err.message);
      }
    });
  };

  // New handler to delete from shelf
  const handleRemoveFromShelf = () => {
    requireLogin(async () => {
      try {
        const response = await fetch(`https://bookmarked-527h.onrender.com/api/shelf?bookId=${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!response.ok) throw new Error('Failed to remove from shelf');
        setStatus(null);
        setShowStatusDialog(false);
        toast.success("Removed from shelf");
      } catch (err) {
        toast.error('Failed to remove from shelf: ' + err.message);
      }
    });
  };

  const handleRatingClick = (rating) => {
    requireLogin(async () => {
      try {
        if (rating === 0) {
          const response = await fetch(`https://bookmarked-527h.onrender.com/api/supabase/rating?userId=${currentUserId}&bookId=${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          if (!response.ok) throw new Error('Failed to clear rating');
          setUserRating(0);
        } else {
          const response = await fetch('https://bookmarked-527h.onrender.com/api/supabase/rating', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ bookId: id, rating: rating })
          });

          if (!response.ok) throw new Error('Failed to save rating');
          setUserRating(rating);
        }

        const ratingRes = await fetch(`https://bookmarked-527h.onrender.com/api/supabase/rating?bookId=${id}`);
        const ratingData = await ratingRes.json();
        setBookStats(prev => ({
          ...prev,
          avgRating: ratingData.avgRating,
          totalRatings: ratingData.count
        }));
      } catch (err) {
        toast.error('Failed to save rating: ' + err.message);
      }
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    requireLogin(async () => {
      try {
        const res = await fetch(
          "https://bookmarked-527h.onrender.com/api/supabase/reviews",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({
              review: newReview,
              bookId: id
            })
          }
        );

        if (!res.ok) throw new Error("Failed to submit review");

        const data = await res.json();

        // Replace existing review by this user if exists
        setReviews(prev => {
          const filtered = prev.filter(r => r.UserId !== currentUserId);
          return [data, ...filtered];
        });

        setNewReview("");
        setShowReviewForm(false);

        // Refresh counts
        const reviewRes = await fetch(
          `https://bookmarked-527h.onrender.com/api/supabase/reviews/count?bookId=${id}`
        );
        const reviewData = await reviewRes.json();

        setBookStats(prev => ({
          ...prev,
          totalReviews: reviewData.count
        }));

      } catch (err) {
        toast.error("Failed to submit review: " + err.message);
      }
    });
  };


  const handleDeleteReview = async () => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      const res = await fetch(
        `https://bookmarked-527h.onrender.com/api/supabase/reviews?bookId=${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      if (!res.ok) throw new Error("Failed to delete review");

      setReviews(prev => prev.filter(r => r.UserId !== currentUserId));

      const reviewRes = await fetch(
        `https://bookmarked-527h.onrender.com/api/supabase/reviews/count?bookId=${id}`
      );
      const reviewData = await reviewRes.json();

      setBookStats(prev => ({
        ...prev,
        totalReviews: reviewData.count
      }));

    } catch (err) {
      toast.error("Failed to delete review: " + err.message);
    }
  };

  // --- PREMIUM SKELETON LOADER UI ---
  if (loading) return (
    <>
      <Header />
      <div className="book-profile skeleton-profile">
        <div className="book-hero">
          <div className="book-cover-section">
            <div className="skeleton skeleton-img"></div>
            <div className="skeleton skeleton-btn"></div>
            <div className="skeleton skeleton-btn"></div>
          </div>
          <div className="book-info-section">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-author"></div>
            <div className="skeleton skeleton-stats"></div>
            <div className="skeleton skeleton-text line-1"></div>
            <div className="skeleton skeleton-text line-2"></div>
            <div className="skeleton skeleton-text line-3"></div>
            <div className="skeleton skeleton-text line-4"></div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );

  if (!info) return <p className="loading">Book not found</p>;

  const showToggle = info.description && info.description.length > 350;

  return (
    <>
      <Header />

      <div className="book-profile">
        {/* HERO SECTION - Book Cover + Main Info */}
        <div className="book-hero">
          {/* LEFT - Book Cover & Actions */}
          <div className="book-cover-section">
            <div className="book-cover-wrapper">
              <img
                src={info.image || "/placeholder-book.png"}
                alt={info.title}
              />
            </div>

            <div className="book-actions" ref={statusRef}>
              <button
                className={`action-box ${status ? 'on-shelf' : ''}`}
                onClick={() => {
                  if (!isLoggedIn) {
                    requireLogin(() => { });
                  } else {
                    setShowStatusDialog(prev => !prev);
                  }
                }}
              >
                {status ? statusLabels[status] : "Add to Shelf"}
              </button>

              {showStatusDialog && (
                <div className="status-dropdown">
                  {[
                    { dbValue: 'want to read', label: 'Want to Read' },
                    { dbValue: 'currently reading', label: 'Currently Reading' },
                    { dbValue: 'done reading', label: 'Done Reading' }
                  ].map(s => (
                      <button
                        key={s.dbValue}
                        className={`status-item ${status === s.dbValue ? 'active' : ''}`}
                        onClick={() => handleStatusChange(s.dbValue)}
                      >
                        {s.label}
                      </button>
                    )
                  )}
                  {status && (
                    <>
                      <div className="dropdown-divider" style={{ borderTop: '1px solid #eee', margin: '4px 0' }}></div>
                      <button 
                        className="status-item text-danger" 
                        onClick={handleRemoveFromShelf}
                        style={{ color: 'red' }}
                      >
                        Remove from Shelf
                      </button>
                    </>
                  )}
                </div>
              )}

              {info?.isbn && (
                <a
                  href={`https://www.amazon.com/s?k=${info.isbn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-box kindle"
                >
                  Buy on Amazon
                </a>
              )}

              <div className="user-rating">
                <span className="rate-label">Rate this book</span>
                <div className="rate-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`rate-star ${i < userRating ? "active" : ""}`}
                      onClick={() => handleRatingClick(i + 1)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                {userRating > 0 && (
                  <button
                    className="clear-rating-btn"
                    onClick={() => handleRatingClick(0)}
                  >
                    Clear rating
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT - Book Info */}
          <div className="book-info-section">
            <h1 className="profile-title">{info.title}</h1>

            <p className="authorr">
              {book?.author ? (
                <Link to={`/author/${book.author.authorid}`} className="author-link">
                  {book.author.name}
                </Link>
              ) : (
                "Unknown Author"
              )}
            </p>

            {/* RATING STATISTICS */}
            <div className="rating-statistics">
              <div className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`star ${bookStats.avgRating && i < Math.round(bookStats.avgRating) ? "filled" : ""}`}
                  >
                    ★
                  </span>
                ))}
              </div>

              <span className="rating-number">
                {bookStats.avgRating > 0 ? bookStats.avgRating.toFixed(2) : "N/A"}
              </span>

              <span className="rating-meta">
                {bookStats.totalRatings.toLocaleString()} ratings
              </span>

              <span className="rating-separator">•</span>

              <span className="review-meta">
                {bookStats.totalReviews.toLocaleString()} reviews
              </span>
            </div>

            {/* DESCRIPTION */}
            <div
              className={`description ${expanded ? "expanded" : "collapsed"}`}
              dangerouslySetInnerHTML={{
                __html: info.description || "No description available.",
              }}
            />

            {showToggle && (
              <button
                className="show-more"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        </div>

        {/* BOOK DETAILS SECTION */}
        <div className="book-details-section">
          <h3 className="section-title">Book Details</h3>
          <div className="details-grid">
            {info.pages && (
              <div className="detail-item">
                <span className="detail-label">Pages</span>
                <span className="detail-value">{info.pages}</span>
              </div>
            )}

            {info.publisher && (
              <div className="detail-item">
                <span className="detail-label">Publisher</span>
                <span className="detail-value">{info.publisher}</span>
              </div>
            )}

            {info.publishedDate && (
              <div className="detail-item">
                <span className="detail-label">Publication Date</span>
                <span className="detail-value">{info.publishedDate}</span>
              </div>
            )}

            {info.isbn && (
              <div className="detail-item">
                <span className="detail-label">ISBN</span>
                <span className="detail-value">{info.isbn}</span>
              </div>
            )}

            {info.language && (
              <div className="detail-item">
                <span className="detail-label">Language</span>
                <span className="detail-value">{info.language.toUpperCase()}</span>
              </div>
            )}

            {info.categories.length > 0 && (
              <div className="detail-item full-width">
                <span className="detail-label">Genres</span>
                <div className="genres-list">
                  {info.categories.slice(0, 6).map((g, i) => (
                    <span key={i} className="genre-tag">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ABOUT THE AUTHOR */}
        {book?.author && (
          <div className="author-section">
            <h3 className="section-title">About the Author</h3>

            <div className="author-info">
              <div className="author-details">
                <h4 className="author-name">
                  {book.author.name}
                </h4>
              </div>
            </div>
          </div>
        )}

        {/* MORE FROM AUTHOR */}
        <div className="more-books">
          <h3 className="more-books-title">
            More books by {book?.author?.name}
          </h3>

          {moreBooks.length > 0 ? (
            <div className="more-books-row">
              {moreBooks.map(b => (
                <BookCard
                  key={b.id}
                  id={b.id}
                  img={b.image}
                  title={b.title}
                  genre={b.genre}
                />
              ))}
            </div>
          ) : (
            <p className="no-more-books-msg">
              We don’t have more books from this author right now
            </p>
          )}
        </div>

        {/* RATINGS AND REVIEWS - FULL WIDTH */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h3 className="section-title">Ratings & Reviews</h3>
            <button
              className="write-review-btn"
              onClick={() => {
                if (!isLoggedIn) {
                  requireLogin(() => { });
                } else {
                  setShowReviewForm(prev => !prev);
                }
              }}
            >
              {showReviewForm ? "Cancel" : "Write a Review"}
            </button>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <div className="review-rating-input">
                <label>Your Rating:</label>
                <div className="review-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`review-star ${i < reviewRating ? "active" : ""}`}
                      onClick={() => setReviewRating(i + 1)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                className="review-textarea"
                placeholder="Share your thoughts about this book..."
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                required
              />

              <button type="submit" className="submit-review-btn">
                {editingReviewId ? 'Update Review' : 'Submit Review'}
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.UserId} className="review-card">
                  <div className="review-header">
                    <span className="reviewer-name">
                      {review.UserName || "Anonymous User"}
                    </span>
                    <div className="review-rating">
                      {review.Rating && Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`mini-star ${i < review.Rating ? "filled" : ""}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="review-text">{review.Review}</p>

                  <div className="review-footer">
                    <span className="review-date">
                      {new Date(review.CreatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>

                    {currentUserId === review.UserId && (
                      <div className="review-actions">
                        <button
                          className="review-action-btn edit"
                          onClick={() => handleEditReview(review)}
                        >
                          Edit
                        </button>
                        <button
                          className="review-action-btn delete"
                          onClick={() => handleDeleteReview(review.ReviewId)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default BookProfile;
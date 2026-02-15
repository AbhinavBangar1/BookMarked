import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import "./BookProfile.css";

function BookProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("Want to Read");
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

  // Helper to get Supabase session token for API calls
  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  useEffect(() => {
    async function fetchBook() {
      try {
        const isOpenLibrary =
          id.startsWith("OL") || id.startsWith("works");

        const endpoint = isOpenLibrary
          ? `/api/openlibrary/book/${id}`
          : `/api/book/${id}`;

        const res = await fetch(endpoint);
        const data = await res.json();

        setBook({ data, isOpenLibrary });
      } catch (err) {
        console.error("Failed to fetch book", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);
  // Load user's current reading status for this book
  useEffect(() => {
    if (!user || !id) return;

    async function fetchReadingStatus() {
      try {
        const token = await getAuthToken();
        const res = await fetch(
          `http://localhost:5001/api/reading-status/check?bookId=${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        const data = await res.json();

        if (data.status) {
          setStatus(data.status);
        }
      } catch (err) {
        console.error('Failed to fetch reading status', err);
      }
    }

    fetchReadingStatus();
  }, [user, id]);

  const info = useMemo(() => {
    if (!book?.data) return null;

    const { data, isOpenLibrary } = book;

    return isOpenLibrary
      ? {
        title: data.title,
        authors: data.authors?.map(a => a.name) || [],
        description:
          typeof data.description === "string"
            ? data.description
            : data.description?.value,
        image: data.covers?.length
          ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`
          : null,
        categories: data.subjects || [],
        publishedDate: data.first_publish_date,
        pages: data.number_of_pages,
        publisher: data.publishers?.[0],
        language: data.languages?.[0]?.key?.replace("/languages/", ""),
        isbn: data.isbn_13?.[0] || data.isbn_10?.[0],
        averageRating: null,
        ratingsCount: null,
      }
      : {
        title: data.volumeInfo?.title,
        authors: data.volumeInfo?.authors || [],
        description: data.volumeInfo?.description,
        image: data.volumeInfo?.imageLinks?.thumbnail,
        categories: data.volumeInfo?.categories || [],
        publishedDate: data.volumeInfo?.publishedDate,
        pages: data.volumeInfo?.pageCount,
        publisher: data.volumeInfo?.publisher,
        language: data.volumeInfo?.language,
        isbn: data.volumeInfo?.industryIdentifiers?.[0]?.identifier,
        averageRating: data.volumeInfo?.averageRating,
        ratingsCount: data.volumeInfo?.ratingsCount,
      };
  }, [book]);

  // Fetch book statistics from Supabase
  useEffect(() => {
    if (!info) return;

    async function fetchBookStats() {
      try {
        // Fetch average rating and count from rating table
        const ratingRes = await fetch(`/api/supabase/rating?bookId=${id}`);
        const ratingData = await ratingRes.json();

        // Fetch review count from reviews table
        const reviewRes = await fetch(`/api/supabase/reviews/count?bookId=${id}`);
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

  // Fetch reviews from Supabase
  useEffect(() => {
    if (!info) return;

    async function fetchReviews() {
      try {
        const res = await fetch(`http://localhost:5001/api/supabase/reviews?bookId=${id}`);
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

  // Fetch author information
  useEffect(() => {
    if (!info || info.authors.length === 0) return;

    async function fetchAuthorInfo() {
      try {
        const authorName = info.authors[0];
        const res = await fetch(`/api/supabase/author?name=${encodeURIComponent(authorName)}`);
        const data = await res.json();
        setAuthorInfo(data);
      } catch (err) {
        console.error('Failed to fetch author info', err);
      }
    }

    fetchAuthorInfo();
  }, [info]);

  useEffect(() => {
    if (!info || info.authors.length === 0 || !book) return;

    const author = info.authors[0];
    const isOpenLibrary = book.isOpenLibrary;

    async function fetchMoreBooks() {
      try {
        let books = [];

        if (isOpenLibrary) {
          const res = await fetch(
            `https://openlibrary.org/search.json?author=${encodeURIComponent(
              author
            )}&limit=6`
          );
          const data = await res.json();

          books =
            data?.docs
              ?.filter(b => b.cover_i && b.title !== info.title)
              .slice(0, 6)
              .map(b => ({
                id: b.key.replace("/works/", ""),
                title: b.title,
                image: `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`,
                genre: b.subject?.[0] || "Book",
              })) || [];
        } else {
          const res = await fetch(
            `/api/search?q=inauthor:${encodeURIComponent(author)}`
          );
          const data = await res.json();

          books =
            data?.items
              ?.filter(b => b.volumeInfo?.imageLinks?.thumbnail)
              .slice(0, 6)
              .map(b => ({
                id: b.id,
                title: b.volumeInfo.title,
                image: b.volumeInfo.imageLinks.thumbnail,
                genre: b.volumeInfo.categories?.[0] || "Book",
              })) || [];
        }

        setMoreBooks(books);
      } catch (err) {
        console.error("Failed to fetch more books", err);
        setMoreBooks([]);
      }
    }

    fetchMoreBooks();
  }, [info, book]);

  // Handle login requirement
  const requireLogin = (callback) => {
    if (!user) {
      alert('Please sign in to continue');
      navigate('/auth');
      return false;
    }
    callback();
    return true;
  };

  // Handle status change with login check
  const handleStatusChange = (newStatus) => {
    requireLogin(async () => {
      try {
        const token = await getAuthToken();

        const response = await fetch('http://localhost:5001/api/reading-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            bookId: id,
            status: newStatus,
            title: info.title,
            coverImage: info.image,
            genre: info.categories?.[0]
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update status');
        }

        setStatus(newStatus);
        setShowStatusDialog(false);
      } catch (err) {
        console.error('Failed to update status', err);
        alert('Failed to update reading status');
      }
    });
  };

  // Handle rating with login check
  const handleRatingClick = (rating) => {
    requireLogin(async () => {
      try {
        // Save to Supabase rating table
        await fetch('/api/supabase/rating', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            UserId: user.id,
            BookId: id,
            Rating: rating
          })
        });

        setUserRating(rating);

        // Refresh stats
        const ratingRes = await fetch(`/api/supabase/ratings?bookId=${id}`);
        const ratingData = await ratingRes.json();
        setBookStats(prev => ({
          ...prev,
          avgRating: ratingData.avgRating,
          totalRatings: ratingData.count
        }));
      } catch (err) {
        console.error('Failed to save rating', err);
      }
    });
  };

  // Handle review submission with login check
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    requireLogin(async () => {
      try {
        // Save to Supabase reviews table
        const res = await fetch('/api/supabase/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Review: newReview,
            UserId: user.id,
            BookId: id,
            Rating: reviewRating
          })
        });

        const data = await res.json();

        // Add new review to list
        setReviews(prev => [data, ...prev]);

        // Reset form
        setNewReview("");
        setReviewRating(0);
        setShowReviewForm(false);

        // Refresh stats
        const reviewRes = await fetch(`/api/supabase/reviews/count?bookId=${id}`);
        const reviewData = await reviewRes.json();
        setBookStats(prev => ({
          ...prev,
          totalReviews: reviewData.count
        }));
      } catch (err) {
        console.error('Failed to submit review', err);
      }
    });
  };

  if (loading) return <p className="loading">Loading...</p>;
  if (!info) return <p className="loading">Book not found</p>;

  const showToggle = info.description && info.description.length > 350;

  return (
    <>
      <Header />

      <div className="book-profile">
        {/* LEFT */}
        <div className="book-profile-left">
          <img
            src={info.image || "/placeholder-book.png"}
            alt={info.title}
          />

          <div className="book-actions" ref={statusRef}>
            <button
              className="action-box"
              onClick={() => {
                if (!user) {
                  requireLogin(() => { });
                } else {
                  setShowStatusDialog(prev => !prev);
                }
              }}
            >
              {status}
            </button>

            {showStatusDialog && (
              <div className="status-dropdown">
                {["Want to Read", "Currently Reading", "Read"].map(
                  s => (
                    <button
                      key={s}
                      className="status-item"
                      onClick={() => handleStatusChange(s)}
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            )}

            <button className="action-box kindle">
              Read on Kindle
            </button>

            <div className="user-rating">
              <span className="rate-label">Rate this book</span>
              <div className="rate-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`rate-star ${i < userRating ? "active" : ""
                      }`}
                    onClick={() => handleRatingClick(i + 1)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="book-profile-right">
          <h1 className="profile-title">{info.title}</h1>

          <p className="author">
            {info.authors.join(", ") || "Unknown Author"}
          </p>

          {/* RATING STATISTICS */}
          <div className="rating-statistics">
            <div className="stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`star ${bookStats.avgRating && i < Math.round(bookStats.avgRating)
                      ? "filled"
                      : ""
                    }`}
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
            className={`description ${expanded ? "expanded" : "collapsed"
              }`}
            dangerouslySetInnerHTML={{
              __html:
                info.description || "No description available.",
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

          {/* BOOK DETAILS */}
          <div className="book-details-section">
            <h3 className="section-title">Book Details</h3>
            <div className="details-grid">
              {info.pages && (
                <div className="detail-item">
                  <span className="detail-label">Pages:</span>
                  <span className="detail-value">{info.pages}</span>
                </div>
              )}

              {info.publisher && (
                <div className="detail-item">
                  <span className="detail-label">Publisher:</span>
                  <span className="detail-value">{info.publisher}</span>
                </div>
              )}

              {info.publishedDate && (
                <div className="detail-item">
                  <span className="detail-label">Publication Date:</span>
                  <span className="detail-value">{info.publishedDate}</span>
                </div>
              )}

              {info.isbn && (
                <div className="detail-item">
                  <span className="detail-label">ISBN:</span>
                  <span className="detail-value">{info.isbn}</span>
                </div>
              )}

              {info.language && (
                <div className="detail-item">
                  <span className="detail-label">Language:</span>
                  <span className="detail-value">{info.language.toUpperCase()}</span>
                </div>
              )}

              {info.categories.length > 0 && (
                <div className="detail-item full-width">
                  <span className="detail-label">Genres:</span>
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
          {info.authors.length > 0 && (
            <div className="author-section">
              <h3 className="section-title">About the Author</h3>
              <div className="author-info">
                <h4 className="author-name">{info.authors[0]}</h4>
                {authorInfo?.Details ? (
                  <p className="author-bio">{authorInfo.Details}</p>
                ) : (
                  <p className="author-bio">
                    {info.authors[0]} is the author of {info.title}
                    {moreBooks.length > 0 && ` and ${moreBooks.length} other books`}.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* RATINGS AND REVIEWS */}
          <div className="reviews-section">
            <div className="reviews-header">
              <h3 className="section-title">Ratings & Reviews</h3>
              <button
                className="write-review-btn"
                onClick={() => {
                  if (!user) {
                    requireLogin(() => { });
                  } else {
                    setShowReviewForm(!showReviewForm);
                  }
                }}
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
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
                  Submit Review
                </button>
              </form>
            )}

            {/* Reviews List */}
            <div className="reviews-list">
              {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.ReviewId} className="review-card">
                    <div className="review-header">
                      <span className="reviewer-name">
                        {review.UserName || "Anonymous User"}
                      </span>
                      <div className="review-rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            className={`mini-star ${review.Rating && i < review.Rating ? "filled" : ""
                              }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="review-text">{review.Review}</p>

                    <span className="review-date">
                      {new Date(review.CreatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* MORE BOOKS */}
          {moreBooks.length > 0 && (
            <div className="more-books">
              <h3 className="more-books-title">
                More books by {info.authors[0]}
              </h3>
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
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}

export default BookProfile;
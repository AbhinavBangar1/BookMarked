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
  const [editingReviewId, setEditingReviewId] = useState(null);

  const statusRef = useRef(null);

  // Check if user is logged in - SUPABASE AUTH
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Find Supabase auth token key (starts with 'sb-' and ends with '-auth-token')
        const supabaseTokenKey = Object.keys(localStorage).find(
          key => key.startsWith('sb-') && key.endsWith('-auth-token')
        );

        if (!supabaseTokenKey) {
          console.log('No Supabase auth token found');
          return;
        }

        // Get the token data (it's stored as JSON array)
        const tokenData = localStorage.getItem(supabaseTokenKey);

        if (tokenData) {
          try {
            // Parse the JSON array
            const parsedData = JSON.parse(tokenData);

            // The actual session object is usually the first or second item
            let session = null;

            if (Array.isArray(parsedData)) {
              // Find the session object in the array
              session = parsedData.find(item =>
                item && typeof item === 'object' && item.access_token
              );
            } else if (parsedData.access_token) {
              session = parsedData;
            }

            if (session && session.access_token) {
              setIsLoggedIn(true);
              setAuthToken(session.access_token);

              // Get user ID from session
              if (session.user && session.user.id) {
                setCurrentUserId(session.user.id);
              }

              console.log('Supabase auth found:', {
                hasToken: true,
                userId: session.user?.id || 'unknown',
                tokenPreview: session.access_token.substring(0, 20) + '...'
              });
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
    async function fetchBook() {
      try {
        setLoading(true);

        let endpoint = "";
        let isOpenLibrary = false;
        let finalData = null;

        if (source === "openlibrary") {
          endpoint = `http://localhost:5001/api/openlibrary/book/${id}`;
          isOpenLibrary = true;
        }
        else if (source === "bigbook") {
          endpoint = `http://localhost:5001/api/bigbook/${id}`;
          isOpenLibrary = true;
        }
        else if (source === "nyt" && stateBook) {
          setBook({ data: stateBook, isOpenLibrary: false });
          
          // Save NYT book via ISBN → OL lookup (fire-and-forget)
          if (id) {
            fetch("http://localhost:5001/api/nyt/" + id)
              .then(r => r.json())
              .then(olData => {
                const olId = olData?.key?.replace("/works/", "");
                if (olId) {
                  return fetch("http://localhost:5001/api/save-book", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ olId }),
                  });
                }
              })
              .then(r => r?.json())
              .then(result => result && console.log("NYT Book saved to DB:", result.cached ? "already existed" : "newly inserted"))
              .catch(err => console.error("Failed to save NYT book:", err));
          }

          setLoading(false);
          return;
}
        else if (source === "nyt" && !stateBook) {
          // NYT book opened directly via URL — fetch from OL using ISBN
          endpoint = `http://localhost:5001/api/nyt/${id}`;
          isOpenLibrary = true;
        }
        else {
          if (id.startsWith("OL")) {
            endpoint = `http://localhost:5001/api/openlibrary/book/${id}`;
            isOpenLibrary = true;
          } else {
            endpoint = `http://localhost:5001/api/book/${id}`;
          }
        }

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to fetch book");

        const data = await res.json();
        finalData = data;
        setBook({ data: finalData, isOpenLibrary });

        // ── Save book to database (fire-and-forget) ────────────────────────
        // Works for openlibrary, bigbook, and nyt sources — they all return
        // OpenLibrary work JSON which has a `key` field like /works/OL45804W
        if (isOpenLibrary) {
          const olId = finalData?.key?.replace("/works/", "") || (id?.startsWith("OL") ? id : null);

          if (olId) {
            fetch("http://localhost:5001/api/save-book", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                olId: olId,
                isbn: finalData?.isbn_13?.[0] ?? finalData?.isbn_10?.[0] ?? null,
              }),
            })
              .then(r => r.json())
              .then(result => console.log("Book saved to DB:", result.cached ? "already existed" : "newly inserted"))
              .catch(err => console.error("Failed to save book to DB:", err));
          }
        }
        // ──────────────────────────────────────────────────────────────────

      } catch (err) {
        console.error("Failed to fetch book", err);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id, source]);

  // Load user's current reading status for this book
  useEffect(() => {
    if (!isLoggedIn || !id || !authToken) return;

    async function fetchReadingStatus() {
      try {
        const res = await fetch(
          `http://localhost:5001/api/reading-status/check?bookId=${id}`,
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
        console.error('Failed to fetch reading status', err);
      }
    }

    fetchReadingStatus();
  }, [isLoggedIn, id, authToken]);

const info = useMemo(() => {
  if (!book?.data) return null;

  const { data, isOpenLibrary } = book;

  if (source === "nyt") {
    return {
      title: data.title,
      authors: [data.author],
      description: data.description,
      image: data.book_image,
      categories: [],
      publishedDate: null,
      pages: null,
      publisher: data.publisher,
      language: null,
      isbn: data.primary_isbn13,
      averageRating: null,
      ratingsCount: null,
    };
  }

  if (isOpenLibrary) {
    return {
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
    };
  }

  return {
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

}, [book, source]);

  // Fetch book statistics from Supabase
  useEffect(() => {
    if (!info) return;

    async function fetchBookStats() {
      try {
        // Fetch average rating and count from rating table
        const ratingRes = await fetch(`http://localhost:5001/api/supabase/rating?bookId=${id}`);
        const ratingData = await ratingRes.json();

        // Fetch review count from reviews table
        const reviewRes = await fetch(`http://localhost:5001/api/supabase/reviews/count?bookId=${id}`);
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
    if (!info || !info.authors?.[0]) return;

    async function fetchAuthorInfo() {
      try {
        const authorName = info.authors[0];
        const res = await fetch(
          `http://localhost:5001/api/author?name=${encodeURIComponent(authorName)}`
        );
        const data = await res.json();
        setAuthorInfo(data);
      } catch (err) {
        console.error("Failed to fetch author info", err);
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
            )}&limit=10`
          );
          const data = await res.json();

          books =
            data?.docs
              ?.filter(b => b.cover_i && b.key && b.title !== info.title)
              .slice(0, 6)
              .map(b => ({
                id: b.key.replace("/works/", ""),
                title: b.title,
                image: `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`,
                genre: b.subject?.[0] || "Book",
              })) || [];
        } else {
          const res = await fetch(
            `http://localhost:5001/api/search?q=inauthor:${encodeURIComponent(author)}`
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
    console.log('requireLogin check:', { isLoggedIn, hasToken: !!authToken });

    if (!isLoggedIn || !authToken) {
      toast.error("Please sign in to continue");
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
        console.log('Updating status to:', newStatus);

        const response = await fetch('http://localhost:5001/api/reading-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
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
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update status');
        }

        setStatus(newStatus);
        setShowStatusDialog(false);
        console.log('Status updated successfully');
      } catch (err) {
        console.error('Failed to update status', err);
        toast.error('Failed to update reading status: ' + err.message);
      }
    });
  };

  // Handle rating with login check
  const handleRatingClick = (rating) => {
    requireLogin(async () => {
      try {
        console.log('Saving rating:', rating);

        if (rating === 0) {
          // Delete rating
          const response = await fetch(`http://localhost:5001/api/supabase/rating?userId=${currentUserId}&bookId=${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to clear rating');
          }

          setUserRating(0);
          console.log('Rating cleared successfully');
        } else {
          // Save rating
          const response = await fetch('http://localhost:5001/api/supabase/rating', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              bookId: id,
              rating: rating
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save rating');
          }

          setUserRating(rating);
          console.log('Rating saved successfully');
        }

        // Refresh stats
        const ratingRes = await fetch(`http://localhost:5001/api/supabase/rating?bookId=${id}`);
        const ratingData = await ratingRes.json();
        setBookStats(prev => ({
          ...prev,
          avgRating: ratingData.avgRating,
          totalRatings: ratingData.count
        }));
      } catch (err) {
        console.error('Failed to save rating', err);
        toast.error('Failed to save rating: ' + err.message);
      }
    });
  };

  // Handle review submission with login check
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    requireLogin(async () => {
      try {
        console.log('Submitting review...');

        const url = editingReviewId
          ? `http://localhost:5001/api/supabase/reviews/${editingReviewId}`
          : 'http://localhost:5001/api/supabase/reviews';

        const method = editingReviewId ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            review: newReview,
            bookId: id,
            rating: reviewRating
          })
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to submit review');
        }

        const data = await res.json();

        if (editingReviewId) {
          // Update existing review in list
          setReviews(prev => prev.map(r =>
            r.ReviewId === editingReviewId
              ? { ...r, Review: newReview, Rating: reviewRating }
              : r
          ));
        } else {
          // Add new review to list
          setReviews(prev => [data, ...prev]);
        }

        // Reset form
        setNewReview("");
        setReviewRating(0);
        setShowReviewForm(false);
        setEditingReviewId(null);

        // Refresh stats
        const reviewRes = await fetch(`http://localhost:5001/api/supabase/reviews/count?bookId=${id}`);
        const reviewData = await reviewRes.json();
        const ratingRes = await fetch(`http://localhost:5001/api/supabase/rating?bookId=${id}`);
        const ratingData = await ratingRes.json();

        setBookStats(prev => ({
          ...prev,
          totalReviews: reviewData.count,
          avgRating: ratingData.avgRating,
          totalRatings: ratingData.count
        }));

        console.log('Review submitted successfully');
      } catch (err) {
        console.error('Failed to submit review', err);
        toast.error('Failed to submit review: ' + err.message);
      }
    });
  };

  // Handle edit review
  const handleEditReview = (review) => {
    setNewReview(review.Review);
    setReviewRating(review.Rating || 0);
    setEditingReviewId(review.ReviewId);
    setShowReviewForm(true);
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const res = await fetch(`http://localhost:5001/api/supabase/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete review');
      }

      // Remove review from list
      setReviews(prev => prev.filter(r => r.ReviewId !== reviewId));

      // Refresh stats
      const reviewRes = await fetch(`http://localhost:5001/api/supabase/reviews/count?bookId=${id}`);
      const reviewData = await reviewRes.json();
      const ratingRes = await fetch(`http://localhost:5001/api/supabase/rating?bookId=${id}`);
      const ratingData = await ratingRes.json();

      setBookStats(prev => ({
        ...prev,
        totalReviews: reviewData.count,
        avgRating: ratingData.avgRating,
        totalRatings: ratingData.count
      }));

      console.log('Review deleted successfully');
    } catch (err) {
      console.error('Failed to delete review', err);
      toast.error('Failed to delete review: ' + err.message);
    }
  };

  if (loading) return <p className="loading">Loading...</p>;
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
                className="action-box"
                onClick={() => {
                  if (!isLoggedIn) {
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
                      className={`rate-star ${i < userRating ? "active" : ""
                        }`}
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
        {authorInfo && (
          <div className="author-section">
            <h3 className="section-title">About the Author</h3>

            <div className="author-info">
              {authorInfo.photos && (
                <img
                  className="author-image"
                  src={`https://covers.openlibrary.org/a/olid/${authorInfo.key}-L.jpg`}
                  alt={authorInfo.name}
                />
              )}

              <div className="author-details">
                <h4 className="author-name">
                  {authorInfo.name && authorInfo.key ? (
                    <Link to={`/author/${authorInfo.key}`} className="author-link">
                      {authorInfo.name}
                    </Link>
                  ) : (
                    <span>{authorInfo.name || "Unknown Author"}</span>
                  )}
                </h4>

                <p className="author-meta">
                  {authorInfo.birth_date}
                  {authorInfo.death_date && ` – ${authorInfo.death_date}`}
                </p>

                <p className="author-bio">
                  {authorInfo.bio || "No biography available."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MORE FROM AUTHOR */}
        {moreBooks.length > 0 && (
          <div className="more-books">
            <h3 className="more-books-title">
              More books by {info.authors[0]}
            </h3>
            <div className="more-books-row">
              {moreBooks
                .filter(b => b.id)
                .map(b => (
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
                  if (showReviewForm && editingReviewId) {
                    setNewReview("");
                    setReviewRating(0);
                    setEditingReviewId(null);
                  }
                  setShowReviewForm(!showReviewForm);
                }
              }}
            >
              {editingReviewId ? 'Cancel Edit' : (showReviewForm ? 'Cancel' : 'Write a Review')}
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
                <div key={review.ReviewId} className="review-card">
                  <div className="review-header">
                    <span className="reviewer-name">
                      {review.UserName || "Anonymous User"}
                    </span>
                    <div className="review-rating">
                      {review.Rating && Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`mini-star ${i < review.Rating ? "filled" : ""
                            }`}
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
import { useParams } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import "./BookProfile.css";

function BookProfile() {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("Want to Read");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const [moreBooks, setMoreBooks] = useState([]);

  const statusRef = useRef(null);

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
          isbn: data.isbn_13?.[0],
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


  if (loading) return <p className="loading">Loading...</p>;
  if (!info) return <p className="loading">Book not found</p>;

  const showToggle =
    info.description && info.description.length > 350;

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
              onClick={() =>
                setShowStatusDialog(prev => !prev)
              }
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
                      onClick={() => {
                        setStatus(s);
                        setShowStatusDialog(false);
                      }}
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
                    className={`rate-star ${
                      i < userRating ? "active" : ""
                    }`}
                    onClick={() => setUserRating(i + 1)}
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

          {/* ⭐ RATING ROW RESTORED */}
          <div className="rating-row">
            <div className="stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`star ${
                    info.averageRating &&
                    i < Math.round(info.averageRating)
                      ? "filled"
                      : ""
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            <span className="rating-number">
              {info.averageRating ?? "N/A"}
            </span>

            <span className="rating-meta">
              {info.ratingsCount
                ? `${info.ratingsCount.toLocaleString()} ratings`
                : "No ratings"}
            </span>
          </div>

          <div
            className={`description ${
              expanded ? "expanded" : "collapsed"
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

          {/* DETAILS RESTORED */}
          <div className="details">
            {info.categories.length > 0 && (
              <div className="genres">
                <span className="label">Genres</span>
                {info.categories.slice(0, 4).map((g, i) => (
                  <span key={i} className="genre">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {(info.pages || info.publisher) && (
              <p>
                {info.pages && `${info.pages} pages`}
                {info.pages && info.publisher && ", "}
                {info.publisher}
              </p>
            )}

            {info.publishedDate && (
              <p>First published {info.publishedDate}</p>
            )}

            {(info.isbn || info.language) && (
              <div className="edition">
                <h4>This edition</h4>
                {info.isbn && <p>ISBN: {info.isbn}</p>}
                {info.language && <p>Language: {info.language}</p>}
              </div>
            )}
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
import "./Genre.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import CategoryBar from "../components/CategoryBar";
import BookCardSkeleton from "../components/BookCardSkeleton";

function Genre() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const genreParam = params.get("genre");

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!genreParam) return;

    setLoading(true);

    fetch(`https://bookmarked-527h.onrender.com/api/genre?genre=${genreParam}`)
      .then(res => res.json())
      .then(data => {
        setBooks(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

  }, [genreParam]);

  return (
    <>
      <Header />
      <CategoryBar />

      <div className="genre-page">
        <h2 className="genre-title">{genreParam || "Genre"}</h2>

        {loading ? (
          <div className="book-container">
            {Array.from({ length: 12 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <p>No books found for this genre.</p>
        ) : (
          <div className="book-container">
            {books.map(book => (
              <BookCard
                key={book.bookid}
                id={book.bookid}
                img={book.coverimage}
                title={book.title}
                genre={book.genre}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

export default Genre;
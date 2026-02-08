import "./Genre.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import CategoryBar from "../components/CategoryBar";

function Genre() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const genreParam = params.get("genre");

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!genreParam) return;

    setLoading(true);

    fetch(`/api/genre?genre=${genreParam}`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(book => ({
          // 🔑 FIX 1: normalize Open Library ID
          id: book.key.replace("/works/", ""), 

          title: book.title,

          img: book.cover_id
            ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
            : null,

          genre:
            book.subject && book.subject.length > 0
              ? book.subject[0]
              : "Unknown",
        }));

        setBooks(mapped);
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
          <p>Loading books...</p>
        ) : books.length === 0 ? (
          <p>No books found for this genre.</p>
        ) : (
          <div className="book-container">
            {books.map(book => (
              <BookCard
                key={book.id}
                id={book.id}       
                img={book.img}
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
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import "./AuthorPage.css";

function AuthorPage() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Fetch Author Details
        const authorRes = await fetch(`https://bookmarked-527h.onrender.com/api/author/${id}`);
        if (authorRes.ok) {
          const authorData = await authorRes.json();
          setAuthor(authorData);
        }

        // 2. Fetch Author's Books
        const booksRes = await fetch(`https://bookmarked-527h.onrender.com/api/author/${id}/books`);
        if (booksRes.ok) {
          const booksData = await booksRes.json();
          setBooks(booksData);
        }
      } catch (error) {
        console.error("Failed to fetch author data", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="author-page">
      <Header />
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading author details...</p>
      </div>
      <Footer />
    </div>
  );

  if (!author) return (
    <div className="author-page">
      <Header />
      <div className="error-container">
        <h2>Author not found</h2>
        <p>We couldn't find the author you're looking for.</p>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="author-page">
      <Header />
      <div className="author-content">
        <div className="author-profile-header">
          <div className="author-image-container">
            <img
              src={`https://covers.openlibrary.org/a/olid/${id}-L.jpg`}
              alt={author.name}
              className="author-profile-image"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300x400?text=No+Author+Image";
              }}
            />
          </div>
          <div className="author-info-section">
            <h1 className="author-name">{author.name}</h1>
            <p className="author-life-span">
              {author.birth_date} {author.death_date && ` - ${author.death_date}`}
            </p>
            <div className="author-bio">
              {author.bio ? (
                typeof author.bio === 'string' ? author.bio : author.bio.value
              ) : "No biography available."}
            </div>
          </div>
        </div>

        <div className="author-books-section">
          <h2>Books by {author.name}</h2>
          <h3 className="books-subheading">From the Author</h3>
          {books.length > 0 ? (
            <div className="books-grid">
              {books.map(book => (
                <BookCard
                  key={book.id}
                  id={book.id}
                  img={book.image}
                  title={book.title}
                  genre={book.genre}
                />
              ))}
            </div>
          ) : (
            <p className="no-books-msg">No books found for this author.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AuthorPage;
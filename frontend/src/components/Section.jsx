import './Section.css';
import { useState, useEffect } from 'react';
import BookCard from './BookCard.jsx';
import BookCardSkeleton from './BookCardSkeleton.jsx';

function Section({ type, section_title, userBookmarkIds = [] }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type) return;

    setLoading(true);

    // Fetching the list of books based on section type (bestseller, popular, etc.)
    fetch(`https://bookmarked-527h.onrender.com/api/section?type=${type}`)
      .then(res => res.json())
      .then(data => {
        setBooks(data.books || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching section books:", err);
        setLoading(false);
      });

  }, [type]);

  return (
    <div className="section-container">
      <h3 className="section-title">{section_title}</h3>

      <div className="card-container">
        {loading
          ?Array.from({ length: 15 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))
          : books.map(book => (
              <BookCard
                key={book.bookid}
                id={book.bookid}
                img={book.coverimage}
                title={book.title}
                author={book.authors}
                genre={book.genres}
                isBookmarked={userBookmarkIds.includes(book.bookid)}
              />
            ))}
      </div>
    </div>
  );
}

export default Section;
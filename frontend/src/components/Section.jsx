import './Section.css';
import { useState, useEffect } from 'react';
import BookCard from './BookCard.jsx';

function Section({ title, section_title, type, genre, order }) {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const param = new URLSearchParams();
    if (genre) param.append("genre", genre);
    else if (title) param.append("title", title);
    else if (type) param.append("type", type);
    else if (order) param.append("order", order);

    if (![...param].length) return;

    fetch(`/api/search?${param.toString()}`)
      .then(res => res.json())
      .then(data => setBooks(data))
      .catch(err => console.error(err));
  }, [genre, type, title, order]);

  return (
    <div className="section-container">
      <h3 className="section-title">{section_title}</h3>

      <div className="card-container">
        {books.map(book => (
          <BookCard
            key={book.id}
            id={book.id}
            img={book.volumeInfo.imageLinks?.thumbnail}
            title={book.volumeInfo.title}
            genre={book.volumeInfo.categories?.[0]}
          />
        ))}
      </div>
    </div>
  );
}

export default Section;
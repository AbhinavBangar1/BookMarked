import './Section.css';
import { useState, useEffect } from 'react';
import BookCard from './BookCard.jsx';

function Section({ type, section_title }) {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    if (!type) return;

    fetch(`/api/section?type=${type}`)
      .then(res => res.json())
      .then(data => {
        let bookList = [];

        if (data.results?.lists?.length) {
          bookList = data.results.lists[0].books;
        }

        else if (data.items?.length) {
          bookList = data.items;
        }

        else if (data.docs?.length) {
          bookList = data.docs;
        }

        else if (data.works?.length) {
          bookList = data.works;
        }

        setBooks(bookList);
      })
      .catch(err => console.error(err));
  }, [type]);

  return (
    <div className="section-container">
      <h3 className="section-title">{section_title}</h3>

      <div className="card-container">
        {books.map(book => {

          let img = null;
          if (book.book_image) {
            img = book.book_image;
          }
          else if (book.volumeInfo?.imageLinks?.thumbnail) {
            img = book.volumeInfo.imageLinks.thumbnail;
          }
          else if (book.cover_i) {
            img = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
          }
          else if (book.cover_id) {
            img = `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`;
          }
          const title = book.title ||book.volumeInfo?.title ||"No Title";
          const genre = book.categories?.[0] ||book.volumeInfo?.categories?.[0] ||book.subject?.[0] ||"Unknown";
          const id = book.primary_isbn13 ||book.key ||book.id ||title;
          return (
            <BookCard
              key={id}
              id={id}
              img={img}
              title={title}
              genre={genre}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Section;
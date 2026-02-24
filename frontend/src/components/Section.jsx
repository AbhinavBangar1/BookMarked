import './Section.css';
import { useState, useEffect } from 'react';
import BookCard from './BookCard.jsx';
import BookCardSkeleton from './BookCardSkeleton.jsx';

function Section({ type, section_title }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!type) return;

  setLoading(true);

  fetch(`/api/section?type=${type}`)
    .then(res => res.json())
    .then(data => {
      let bookList = [];

      if (data.results?.lists?.length) {
        bookList = data.results.lists[0].books;
      } else if (data.items?.length) {
        bookList = data.items;
      } else if (data.docs?.length) {
        bookList = data.docs;
      } else if (data.works?.length) {
        bookList = data.works;
      } else if (data.books?.length) {
        bookList = data.books.flat();
      }

        if (bookList.length>0){
          setBooks(bookList);
          setLoading(false)}
    })
    .catch(err => console.error(err))
}, [type]);

  return (
    <div className="section-container">
      <h3 className="section-title">{section_title}</h3>

      <div className="card-container">
        {loading
          ? Array.from({ length: 15 }).map((_, i) => (
            <BookCardSkeleton key={i} />
          ))
          : books.map(book => {

          let img = null;
          if (book.book_image) {
            img = book.book_image;
          }
          else if (book.volumeInfo?.imageLinks?.thumbnail) {
            img = book.volumeInfo.imageLinks.thumbnail;
          }
          else if (book.image){
            img = book.image 
          }
          else if (book.cover_i) {
            img = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
          }
          else if (book.cover_id) {
            img = `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`;
          }
          else if (book.isbn || book.isbn13 || book.isbn_13) {
            const isbn = book.isbn || book.isbn13 || book.isbn_13;
            img = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
          }
          const title = book.title ||book.volumeInfo?.title ||"No Title";
          const genre = book.categories?.[0] ||book.volumeInfo?.categories?.[0] ||book.subject?.[0] ||"Unknown";
            let id = null;
            let source = null;

            if (book.primary_isbn13 && book.book_image) {
              id = book.primary_isbn13;
              source = "nyt";
            }
            else if (book.key) {
              id = book.key.replace("/works/", "");
              source = "openlibrary";
            }
            else if (book.id && book.authors) {
              id = book.id;
              source = "bigbook";
            }
          return (
            <BookCard
              key={id}
              id={id}
              img={img}
              title={title}
              source = {source}
              bookData={book}
              // genre={genre}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Section;
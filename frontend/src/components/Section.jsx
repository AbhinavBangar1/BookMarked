// import './Section.css';
// import { useState, useEffect } from 'react';
// import BookCard from './BookCard.jsx';
// import BookCardSkeleton from './BookCardSkeleton.jsx';

// function Section({ type, section_title }) {
//   const [books, setBooks] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!type) return;

//     setLoading(true);

//     fetch(`/api/section?type=${type}`)
//       .then(res => res.json())
//       .then(data => {
//         setBooks(data.books || []);
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error(err);
//         setLoading(false);
//       });

//   }, [type]);

//   return (
//     <div className="section-container">
//       <h3 className="section-title">{section_title}</h3>

//       <div className="card-container">
//         {loading
//           ? Array.from({ length: 15 }).map((_, i) => (
//               <BookCardSkeleton key={i} />
//             ))
//           : books.map(book => (
//               <BookCard
//                 key={book.bookid}
//                 id={book.bookid}
//                 img={book.coverimage}
//                 title={book.title}
//                 author={book.authors}
//                 genre={book.genres}
//               />
//             ))}
//       </div>
//     </div>
//   );
// }

// export default Section;

import './Section.css';
import { useState, useEffect } from 'react';
import BookCard from './BookCard.jsx';
import BookCardSkeleton from './BookCardSkeleton.jsx';

// 1. We accept userBookmarkIds as a prop from the Explore page
function Section({ type, section_title, userBookmarkIds = [] }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type) return;

    setLoading(true);

    // Fetching the list of books based on section type (bestseller, popular, etc.)
    fetch(`/api/section?type=${type}`)
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
          ? // Render Skeletons while loading
            Array.from({ length: 15 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))
          : // Render actual BookCards when data arrives
            books.map(book => (
              <BookCard
                key={book.bookid}
                id={book.bookid}
                img={book.coverimage}
                title={book.title}
                author={book.authors}
                genre={book.genres}
                // 2. We determine the bookmark status by checking if the ID 
                //    exists in the userBookmarkIds array we received.
                isBookmarked={userBookmarkIds.includes(book.bookid)}
              />
            ))}
      </div>
    </div>
  );
}

export default Section;
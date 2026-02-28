// import React, { useEffect, useState } from "react";
// import "./Wishlist.css";
// import Header from '../components/Header.jsx';
// import BookCard from "../components/BookCard.jsx";
// import Footer from "../components/Footer.jsx";
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from "../supabaseClient";

// function Wishlist() {
//   const [bookmarks, setBookmarks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!user) {
//       navigate('/auth');
//       return;
//     }

//     fetchBookmarks();
//   }, [user]);

//   const fetchBookmarks = async () => {
//     try {
//       const session = await supabase.auth.getSession();
//       const token = session.data.session?.access_token;

//       if (!token) {
//         throw new Error("No auth token");
//       }

//       const response = await fetch("/api/bookmark", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         console.error("Bookmark API error:", data);
//         setBookmarks([]);
//         return;
//       }

//       setBookmarks(Array.isArray(data) ? data : []);
//     } catch (error) {
//       console.error("Failed to fetch bookmarks:", error);
//       setBookmarks([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBookmarkRemoved = (bookId) => {
//     setBookmarks(prev => prev.filter(book => book.bookid !== bookId));
//   };

//   if (!user) return null;

//   if (loading) {
//     return (
//       <>
//         <Header />
//         <div className="wishlist-loading">
//           <div className="loading-spinner"></div>
//           <p>Loading your bookmarks...</p>
//         </div>
//         <Footer />
//       </>
//     );
//   }

//   return (
//     <>
//       <Header />
//       <div className="wishlist-container">
//         <div className="wishlist-header">
//           <h1 className="wishlist-title">My Wishlist</h1>
//           <p className="wishlist-subtitle">
//             {bookmarks.length === 0
//               ? "You haven't bookmarked any books yet"
//               : `${bookmarks.length} book${bookmarks.length === 1 ? '' : 's'} saved`}
//           </p>
//         </div>

//         {bookmarks.length === 0 ? (
//           <div className="empty-wishlist">
//             {/* <div className="empty-icon"></div> */}
//             <h2>Your wishlist is empty</h2>
//             <p>Start exploring and bookmark books you want to read!</p>
//             <button
//               className="explore-btn"
//               onClick={() => navigate('/')}
//             >
//               Explore Books
//             </button>
//           </div>
//         ) : (
//           <div className="wishlist-grid">
//             {bookmarks.map(book => (
//               <BookCard
//                 key={book.bookid}
//                 id={book.bookid}
//                 img={book.coverimage || "https://placehold.co/300x450?text=No+Cover"}
//                 title={book.title}
//                 genre={book.genrename || "Unknown"}
//                 isBookmarked={true}
//                 onBookmarkChange={handleBookmarkRemoved}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//       <Footer />
//     </>
//   );
// }

// export default Wishlist;

import React, { useEffect, useState } from "react";
import "./Wishlist.css";
import Header from '../components/Header.jsx';
import BookCard from "../components/BookCard.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../supabaseClient";

function Wishlist() {
  const [bookmarks, setBookmarks] = useState([]);
  const [fetchingBooks, setFetchingBooks] = useState(true);
  
  // 1. Destructure loading as 'authLoading' to keep it distinct
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 2. STOPS the fetch if the AuthProvider is still initializing the session
    if (authLoading) return;

    // 3. Once Auth is finished, if no user is found, redirect to login
    if (!user) {
      setFetchingBooks(false);
      navigate('/auth');
      return;
    }

    // 4. If we have a verified user, proceed to fetch the bookmarks
    fetchBookmarks();
  }, [user, authLoading, navigate]);

  const fetchBookmarks = async () => {
    try {
      setFetchingBooks(true);
      
      // Direct Supabase query joining bookmarked -> books -> genre
      const { data, error } = await supabase
        .from("bookmarked")
        .select(`
          bookid,
          books (
            title,
            coverimage,
            genre (
              genrename
            )
          )
        `)
        .eq("userid", user.id);

      if (error) throw error;

      // Flatten the nested database response for the BookCard component
      const formattedBookmarks = data ? data.map((item) => ({
        bookid: item.bookid,
        title: item.books?.title,
        coverimage: item.books?.coverimage,
        genrename: item.books?.genre?.genrename || "Unknown"
      })) : [];

      setBookmarks(formattedBookmarks);
    } catch (error) {
      console.error("Failed to fetch bookmarks:", error);
      setBookmarks([]);
    } finally {
      // 5. Turn off the fetching spinner regardless of success or failure
      setFetchingBooks(false);
    }
  };

  const handleBookmarkRemoved = (bookId) => {
    // UI-only removal to keep the wishlist feeling snappy
    setBookmarks(prev => prev.filter(book => book.bookid !== bookId));
  };

  // 6. Show the loading screen while EITHER auth or the specific book fetch is in progress
  if (authLoading || fetchingBooks) {
    return (
      <>
        <Header />
        <div className="wishlist-loading" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div className="loading-spinner"></div>
          <p>Authenticating and fetching your books...</p>
        </div>
        <Footer />
      </>
    );
  }

  // Final safety check
  if (!user) return null;

  return (
    <>
      <Header />
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1 className="wishlist-title">My Wishlist</h1>
          <p className="wishlist-subtitle">
            {bookmarks.length === 0
              ? "You haven't bookmarked any books yet"
              : `${bookmarks.length} book${bookmarks.length === 1 ? '' : 's'} saved`}
          </p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="empty-wishlist">
            <h2>Your wishlist is empty</h2>
            <p>Start exploring and bookmark books you want to read!</p>
            <button
              className="explore-btn"
              onClick={() => navigate('/')}
            >
              Explore Books
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {bookmarks.map(book => (
              <BookCard
                key={book.bookid}
                id={book.bookid}
                img={book.coverimage || "https://placehold.co/300x450?text=No+Cover"}
                title={book.title}
                genre={book.genrename}
                isBookmarked={true} // Books in the wishlist are always 'bookmarked'
                onBookmarkChange={handleBookmarkRemoved}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Wishlist;
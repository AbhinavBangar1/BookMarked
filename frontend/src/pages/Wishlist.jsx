import React, { useEffect, useState } from "react";
import "./Wishlist.css";
import Header from '../components/Header.jsx';
import BookCard from "../components/BookCard.jsx";
import Footer from "../components/Footer.jsx";
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Wishlist() {
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect to auth if not logged in
        if (!user) {
            navigate('/auth');
            return;
        }

        fetchBookmarks();
    }, [user, navigate]);

    const fetchBookmarks = async () => {
        try {
            const response = await fetch(`/api/bookmark?userId=${user.id}`);
            const data = await response.json();
            setBookmarks(data);
        } catch (error) {
            console.error("Failed to fetch bookmarks:", error);
        } finally {
            setLoading(false);
        }
    };

    // This function will be called when a bookmark is removed
    const handleBookmarkRemoved = (bookId) => {
        setBookmarks(prev => prev.filter(book => book.bookid !== bookId));
    };

    if (!user) {
        return null; // Will redirect in useEffect
    }

    if (loading) {
        return (
            <>
                <Header />
                <div className="wishlist-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading your bookmarks...</p>
                </div>
                <Footer />
            </>
        );
    }

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
                        <div className="empty-icon">📚</div>
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
                                img={book.coverimage}
                                title={book.title}
                                genre={book.genre}
                                isBookmarked={true}
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
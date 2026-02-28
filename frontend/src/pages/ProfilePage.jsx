import React, { useEffect, useState } from "react";
import "./ProfilePage.css";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import FriendCard from "../components/FriendCard";
import ReviewCard from "../components/ReviewCard";

const ProfilePage = () => {
  const { user, loading, signOut, session } = useAuth();
  const { userid } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("reviews");
  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [shelf, setShelf] = useState([]);
  const [shelfFilter, setShelfFilter] = useState("all");
  
  // State to hold ratings for the books in the reviews tab
  const [bookRatings, setBookRatings] = useState({});

  const isOwnProfile = !userid || userid === user?.id;

  // Check if the logged-in user is already in this profile's friends list
  const isAlreadyFriend = friends.some(friend => friend.userid === user?.id);

  const availableTabs = isOwnProfile 
    ? ["reviews", "friends", "requests", "shelf"] 
    : ["reviews", "friends", "shelf"];

  /* ============================
     FETCH PROFILE DATA
     ============================ */
  useEffect(() => {
    if (loading) return;

    const id = userid ?? user?.id;
    if (!id) return;

    if (!isOwnProfile && activeTab === "requests") {
      setActiveTab("reviews");
    }

    fetchProfile(id);
  }, [loading, userid, user, isOwnProfile, activeTab]);

  const fetchProfile = async (id) => {
    try {
      const res = await axios.get(`https://bookmarked-527h.onrender.com/profile/${id}`);

      setProfileData(res.data.user || null);
      setReviews(res.data.reviews || []);
      setFriends(res.data.friends || []);
      setRequests(res.data.requests || []);
      setShelf(res.data.shelf || []);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  /* ============================
     FETCH USER RATINGS FOR REVIEWS
     ============================ */
  useEffect(() => {
    const fetchRatingsForReviews = async () => {
      if (!reviews || !reviews.length || !session?.access_token) return;

      // Safely find the book ID, whether it's at the root (review.bookid) or inside the join (review.books.bookid)
      const bookIdsToFetch = [...new Set(
        reviews
          .map(r => r.bookid || r.books?.bookid)
          .filter(id => id && bookRatings[id] === undefined) // Only fetch ones we haven't fetched yet
      )];

      if (bookIdsToFetch.length === 0) return;

      // Fetch concurrently, using functional state updates to prevent overwriting!
      await Promise.all(bookIdsToFetch.map(async (bookId) => {
        try {
          const res = await axios.get(
            `https://bookmarked-527h.onrender.com/api/supabase/rating/my?bookId=${bookId}`,
            { headers: { Authorization: `Bearer ${session.access_token}` } }
          );
          
          // Using `prev` ensures concurrent updates don't wipe each other out
          setBookRatings(prev => ({
            ...prev,
            [bookId]: res.data.rating || null
          }));
        } catch (err) {
          console.error(`Failed to fetch rating for book ${bookId}:`, err);
          setBookRatings(prev => ({ ...prev, [bookId]: null }));
        }
      }));
    };

    fetchRatingsForReviews();
  }, [reviews, session]);

  /* ============================
     HANDLERS
     ============================ */
  const handleAccept = async (requesterId) => {
    try {
      await axios.put(`https://bookmarked-527h.onrender.com/profile/friends/accept`, {
        userId: user?.id,
        friendId: requesterId
      });

      const acceptedUser = requests.find((req) => req.userid === requesterId);
      setRequests((prevRequests) => prevRequests.filter((req) => req.userid !== requesterId));

      if (acceptedUser) {
        setFriends((prevFriends) => [...prevFriends, acceptedUser]);
      }
    } catch (err) {
      console.error("Failed to accept friend request:", err);
    }
  };

  const handleReject = async (requesterId) => {
    try {
      await axios.delete(`https://bookmarked-527h.onrender.com/profile/friends/reject`, {
        data: { userId: user?.id, friendId: requesterId }
      });

      setRequests((prevRequests) => prevRequests.filter((req) => req.userid !== requesterId));
    } catch (err) {
      console.error("Failed to reject friend request:", err);
    }
  };

  const handleAddFriend = async () => {
    try {
      await axios.post(`https://bookmarked-527h.onrender.com/profile/friends/request`, {
        userId: user?.id,
        friendId: profileData.userid
      });
      alert("Friend request sent!");
    } catch (err) {
      console.error("Failed to send friend request:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  // --- PREMIUM SKELETON LOADER UI ---
  if (loading) {
    return (
      <div className="profile-page">
        <Header />
        <div className="profile-hero skeleton-hero">
          <div className="profile-card">
            <div className="avatar-wrapper">
              <div className="skeleton-box skeleton-avatar">
                <div className="skeleton-shimmer"></div>
              </div>
            </div>
            <div className="profile-info">
              <div className="profile-identity">
                <div className="skeleton-box skeleton-title">
                  <div className="skeleton-shimmer"></div>
                </div>
                <div className="skeleton-box skeleton-subtitle">
                  <div className="skeleton-shimmer"></div>
                </div>
              </div>
              <div className="profile-stats">
                <div className="skeleton-box skeleton-stat">
                  <div className="skeleton-shimmer"></div>
                </div>
                <div className="skeleton-box skeleton-stat">
                  <div className="skeleton-shimmer"></div>
                </div>
                <div className="skeleton-box skeleton-stat">
                  <div className="skeleton-shimmer"></div>
                </div>
              </div>
              <div className="profile-actions">
                <div className="skeleton-box skeleton-btn">
                  <div className="skeleton-shimmer"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="profile-tabs" style={{ borderBottom: "none" }}>
          <div className="skeleton-box skeleton-tab"><div className="skeleton-shimmer"></div></div>
          <div className="skeleton-box skeleton-tab"><div className="skeleton-shimmer"></div></div>
          <div className="skeleton-box skeleton-tab"><div className="skeleton-shimmer"></div></div>
        </div>
        <div className="profile-content">
          <div className="skeleton-grid">
            <div className="skeleton-box skeleton-card"><div className="skeleton-shimmer"></div></div>
            <div className="skeleton-box skeleton-card"><div className="skeleton-shimmer"></div></div>
            <div className="skeleton-box skeleton-card"><div className="skeleton-shimmer"></div></div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================
     MAIN RENDER
     ============================ */
  return (
    <div className="profile-page">
      <Header />

      {profileData && (
        <div className="profile-hero">
          <div className="profile-card">
            
            <div className="avatar-wrapper">
              <div className="profile-avatar">
                {profileData.username?.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="profile-info">
              <div className="profile-identity">
                <h2>{profileData.username}</h2>
                <p className="email">{profileData.email}</p>
              </div>

              <div className="profile-stats">
                <div className="stat-box">
                  <strong>{reviews.length}</strong>
                  <span>Reviews</span>
                </div>
                <div className="stat-box">
                  <strong>{friends.length}</strong>
                  <span>Friends</span>
                </div>
                {isOwnProfile && (
                  <div className="stat-box">
                    <strong>{requests.length}</strong>
                    <span>Requests</span>
                  </div>
                )}
              </div>

              <div className="profile-actions">
                {!isOwnProfile ? (
                  isAlreadyFriend ? (
                    <button 
                      className="secondary-btn" 
                      style={{ 
                        backgroundColor: '#e6f4ea', 
                        color: '#1e8e3e', 
                        border: '1px solid #1e8e3e', 
                        padding: '8px 16px', 
                        borderRadius: '6px', 
                        cursor: 'default',
                        fontWeight: '600'
                      }}
                      disabled
                    >
                      ✓ Friends
                    </button>
                  ) : (
                    <button className="primary-btn add-friend-btn" onClick={handleAddFriend}>
                      Add Friend
                    </button>
                  )
                ) : (
                  <button 
                    className="secondary-btn signout-btn" 
                    onClick={handleSignOut}
                    style={{ 
                      backgroundColor: 'transparent', 
                      color: '#ff4d4f', 
                      border: '1px solid #ff4d4f', 
                      padding: '8px 16px', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      fontWeight: '600',
                      marginTop: '10px'
                    }}
                  >
                    Sign Out
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
      
      <div className="profile-tabs">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="profile-content">
   
        {activeTab === "reviews" && (
          <div className="reviews-container">
            {reviews.map((review) => {
              // Get the ID regardless of backend formatting
              const bId = review.bookid || review.books?.bookid;
              
              return (
                <ReviewCard 
                  key={review.reviewid} 
                  reviewData={review} 
                  userRating={bookRatings[bId]} 
                />
              )
            })}
            
            {reviews.length === 0 && (
              <div className="empty-state-wrapper">
                <p className="empty-text">You haven't shared any thoughts yet. Time to start reading! 📚</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "friends" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "32px" }}>
            {friends.map((friend) => (
              <FriendCard 
                key={friend.userid} 
                user={friend} 
                isRequest={false} 
                loggedInUserFriends={friends}
                currentUserId={user?.id}
              />
            ))}
            {friends.length === 0 && <p className="empty-text">No friends yet.</p>}
          </div>
        )}

        {activeTab === "requests" && isOwnProfile && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "32px" }}>
            {requests.map((req) => (
              <FriendCard 
                key={req.userid} 
                user={req} 
                isRequest={true} 
                onAccept={handleAccept} 
                onReject={handleReject} 
                loggedInUserFriends={friends}
                currentUserId={user?.id}
              />
            ))}
            {requests.length === 0 && <p className="empty-text">No pending requests.</p>}
          </div>
        )}

        {activeTab === "shelf" && (
          <>
            <div className="shelf-filters">
              {[
                "all",
                "currently reading",
                "want to read",
                "done reading",
              ].map((status) => (
                <button
                  key={status}
                  className={shelfFilter === status ? "active" : ""}
                  onClick={() => setShelfFilter(status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="shelf-grid">
              {shelf
                .filter(
                  (item) =>
                    shelfFilter === "all" || item.status === shelfFilter
                )
                .map((item) => (
                  <div
                    key={item.books.bookid}
                    className="shelf-book-wrapper"
                  >
                    <BookCard
                      id={item.books.bookid}
                      img={item.books.coverimage}
                      title={item.books.title}
                    />
                    <div className="shelf-status-tag">
                      {item.status}
                    </div>
                  </div>
                ))}
            </div>

            {shelf.length === 0 && (
              <p className="empty-text">No books in this shelf.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
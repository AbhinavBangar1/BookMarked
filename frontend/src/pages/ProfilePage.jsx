import React, { useEffect, useState } from "react";
import "./ProfilePage.css";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import BookCard from "../components/BookCard";

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const { userid } = useParams();

  const [activeTab, setActiveTab] = useState("reviews");
  const [profileData, setProfileData] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  const [shelf, setShelf] = useState([]);
  const [shelfFilter, setShelfFilter] = useState("all");

  /* ============================
     FETCH PROFILE (ONLY WHEN READY)
     ============================ */
  useEffect(() => {
    if (loading) return;

    const id = userid ?? user?.id;
    if (!id) return;

    fetchProfile(id);
  }, [loading, userid, user]);

  const fetchProfile = async (id) => {
    try {
      const res = await axios.get(`http://localhost:5001/profile/${id}`);

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
     LOADING STATE
     ============================ */
  if (loading) {
    return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading…</p>;
  }

  /* ============================
     UI
     ============================ */
  return (
    <div className="profile-page">
      <Header />

      {/* PROFILE HEADER */}
      {profileData && (
        <div className="profile-hero">
          <div className="profile-card">
            <div className="avatar-wrapper">
              <div className="profile-avatar">
                {profileData.username?.charAt(0).toUpperCase()}
              </div>
            </div>

            <div className="profile-info">
              <h2>{profileData.username}</h2>
              <p className="email">{profileData.email}</p>

              <div className="profile-actions">
                <button className="primary-btn">Follow</button>
                <button className="secondary-btn">Get in touch</button>
              </div>

              <div className="profile-stats">
                <div>
                  <strong>{reviews.length}</strong>
                  <span>Reviews</span>
                </div>
                <div>
                  <strong>{friends.length}</strong>
                  <span>Friends</span>
                </div>
                <div>
                  <strong>{requests.length}</strong>
                  <span>Requests</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="profile-tabs">
        {["reviews", "friends", "requests", "shelf"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="profile-content">
        {/* REVIEWS */}
        {activeTab === "reviews" &&
          reviews.map((review) => (
            <div key={review.reviewid} className="review-card">
              <img
                src={review.books?.coverimage || "/placeholder-book.png"}
                alt=""
                className="review-book-image"
              />
              <div className="review-content">
                <div className="review-text">{review.review}</div>
                <div className="review-rating">⭐ 4 / 5</div>
              </div>
            </div>
          ))}

        {/* FRIENDS */}
        {activeTab === "friends" &&
          friends.map((friend) => (
            <div key={friend.userid} className="user-card">
              <div className="user-avatar">
                {friend.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-name">{friend.username}</div>
            </div>
          ))}

        {/* REQUESTS */}
        {activeTab === "requests" &&
          requests.map((req) => (
            <div key={req.userid} className="user-card">
              <div className="user-avatar">
                {req.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-name">{req.username}</div>
            </div>
          ))}

        {/* SHELF */}
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
              <p className="empty-text">No books in your shelf</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
// import React, { useEffect, useState } from "react";
// import "./ProfilePage.css";
// import axios from "axios";
// import Header from "../components/Header";
// import { useAuth } from "../context/AuthContext";
// import { useParams } from "react-router-dom";
// import BookCard from "../components/BookCard";
// import FriendCard from "../components/FriendCard";

// const ProfilePage = () => {
//   const { user, loading } = useAuth();
//   const { userid } = useParams();

//   const [activeTab, setActiveTab] = useState("reviews");
//   const [profileData, setProfileData] = useState(null);

//   const [reviews, setReviews] = useState([]);
//   const [friends, setFriends] = useState([]);
//   const [requests, setRequests] = useState([]);

//   const [shelf, setShelf] = useState([]);
//   const [shelfFilter, setShelfFilter] = useState("all");

//   /* ============================
//      FETCH PROFILE (ONLY WHEN READY)
//      ============================ */
//   useEffect(() => {
//     if (loading) return;

//     const id = userid ?? user?.id;
//     if (!id) return;

//     fetchProfile(id);
//   }, [loading, userid, user]);

//   const fetchProfile = async (id) => {
//     try {
//       const res = await axios.get(`http://localhost:5001/profile/${id}`);

//       setProfileData(res.data.user || null);
//       setReviews(res.data.reviews || []);
//       setFriends(res.data.friends || []);
//       setRequests(res.data.requests || []);
//       setShelf(res.data.shelf || []);
//     } catch (err) {
//       console.error("Failed to fetch profile:", err);
//     }
//   };

//   /* ============================
//      LOADING STATE
//      ============================ */
//   if (loading) {
//     return <p style={{ textAlign: "center", marginTop: "40px" }}>Loading…</p>;
//   }

//   /* ============================
//      UI
//      ============================ */
//   return (
//     <div className="profile-page">
//       <Header />

//       {/* PROFILE HEADER */}
//       {profileData && (
//         <div className="profile-hero">
//           <div className="profile-card">
//             <div className="avatar-wrapper">
//               <div className="profile-avatar">
//                 {profileData.username?.charAt(0).toUpperCase()}
//               </div>
//             </div>

//             <div className="profile-info">
//               <h2>{profileData.username}</h2>
//               <p className="email">{profileData.email}</p>

//               <div className="profile-actions">
//                 <button className="primary-btn">Follow</button>
//                 <button className="secondary-btn">Get in touch</button>
//               </div>

//               <div className="profile-stats">
//                 <div>
//                   <strong>{reviews.length}</strong>
//                   <span>Reviews</span>
//                 </div>
//                 <div>
//                   <strong>{friends.length}</strong>
//                   <span>Friends</span>
//                 </div>
//                 <div>
//                   <strong>{requests.length}</strong>
//                   <span>Requests</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* TABS */}
//       <div className="profile-tabs">
//         {["reviews", "friends", "requests", "shelf"].map((tab) => (
//           <button
//             key={tab}
//             className={activeTab === tab ? "active" : ""}
//             onClick={() => setActiveTab(tab)}
//           >
//             {tab.charAt(0).toUpperCase() + tab.slice(1)}
//           </button>
//         ))}
//       </div>

//       {/* CONTENT */}
//       <div className="profile-content">
//         {/* REVIEWS */}
//         {activeTab === "reviews" &&
//           reviews.map((review) => (
//             <div key={review.reviewid} className="review-card">
//               <img
//                 src={review.books?.coverimage || "/placeholder-book.png"}
//                 alt=""
//                 className="review-book-image"
//               />
//               <div className="review-content">
//                 <div className="review-text">{review.review}</div>
//                 <div className="review-rating">⭐ 4 / 5</div>
//               </div>
//             </div>
//           ))}

// {/* FRIENDS */}
//         {activeTab === "friends" && (
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
//             {friends.map((friend) => (
//               <FriendCard 
//                 key={friend.userid} 
//                 user={friend} 
//                 isRequest={false} 
//                 loggedInUserFriends={friends} // Passing this to calculate mutuals!
//               />
//             ))}
//             {friends.length === 0 && <p className="empty-text">No friends yet.</p>}
//           </div>
//         )}

// {/* REQUESTS */}
//         {activeTab === "requests" && (
//           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
//             {requests.map((req) => (
//               <FriendCard 
//                 key={req.userid} 
//                 user={req} 
//                 isRequest={true} 
//                 onAccept={handleAccept} 
//                 onReject={handleReject} 
//               />
//             ))}
//             {requests.length === 0 && <p className="empty-text">No pending requests.</p>}
//           </div>
//         )}
//         {/* SHELF */}
//         {activeTab === "shelf" && (
//           <>
//             <div className="shelf-filters">
//               {[
//                 "all",
//                 "currently reading",
//                 "want to read",
//                 "done reading",
//               ].map((status) => (
//                 <button
//                   key={status}
//                   className={shelfFilter === status ? "active" : ""}
//                   onClick={() => setShelfFilter(status)}
//                 >
//                   {status}
//                 </button>
//               ))}
//             </div>

//             <div className="shelf-grid">
//               {shelf
//                 .filter(
//                   (item) =>
//                     shelfFilter === "all" || item.status === shelfFilter
//                 )
//                 .map((item) => (
//                   <div
//                     key={item.books.bookid}
//                     className="shelf-book-wrapper"
//                   >
//                     <BookCard
//                       id={item.books.bookid}
//                       img={item.books.coverimage}
//                       title={item.books.title}
//                     />
//                     <div className="shelf-status-tag">
//                       {item.status}
//                     </div>
//                   </div>
//                 ))}
//             </div>

//             {shelf.length === 0 && (
//               <p className="empty-text">No books in your shelf</p>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// /* ============================
//      FRIEND REQUEST HANDLERS
//      ============================ */
//   const handleAccept = async (requesterId) => {
//     try {
//       // NOTE: Adjust this URL to match your actual backend accept route!
//       await axios.put(`http://localhost:5001/friends/accept`, {
//         userId: user?.id, // The currently logged-in user
//         friendId: requesterId
//       });

//       // 1. Find the user we just accepted from the local requests array
//       const acceptedUser = requests.find((req) => req.userid === requesterId);

//       // 2. Remove them from the requests state instantly
//       setRequests((prevRequests) => prevRequests.filter((req) => req.userid !== requesterId));

//       // 3. Add them to the friends state so they appear in the friends tab without reloading
//       if (acceptedUser) {
//         setFriends((prevFriends) => [...prevFriends, acceptedUser]);
//       }
//     } catch (err) {
//       console.error("Failed to accept friend request:", err);
//     }
//   };

//   const handleReject = async (requesterId) => {
//     try {
//       // NOTE: Adjust this URL to match your actual backend reject/delete route!
//       await axios.delete(`http://localhost:5001/friends/reject`, {
//         data: { userId: user?.id, friendId: requesterId } 
//       });

//       // Remove them from the requests state instantly
//       setRequests((prevRequests) => prevRequests.filter((req) => req.userid !== requesterId));
//     } catch (err) {
//       console.error("Failed to reject friend request:", err);
//     }
//   };

// export default ProfilePage;
import React, { useEffect, useState } from "react";
import "./ProfilePage.css";
import axios from "axios";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import BookCard from "../components/BookCard";
import FriendCard from "../components/FriendCard";
import ReviewCard from "../components/ReviewCard";

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

  // Determine if the user is looking at their own profile
  const isOwnProfile = !userid || userid === user?.id;

  // Dynamically set available tabs based on ownership
  const availableTabs = isOwnProfile 
    ? ["reviews", "friends", "requests", "shelf"] 
    : ["reviews", "friends", "shelf"];

  /* ============================
     FETCH PROFILE (ONLY WHEN READY)
     ============================ */
  useEffect(() => {
    if (loading) return;

    const id = userid ?? user?.id;
    if (!id) return;

    // Safety check: if viewing someone else, kick them out of the private 'requests' tab
    if (!isOwnProfile && activeTab === "requests") {
      setActiveTab("reviews");
    }

    fetchProfile(id);
  }, [loading, userid, user, isOwnProfile, activeTab]);

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
     FRIEND REQUEST HANDLERS
     ============================ */
  const handleAccept = async (requesterId) => {
    try {
      await axios.put(`http://localhost:5001/profile/friends/accept`, {
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
      await axios.delete(`http://localhost:5001/profile/friends/reject`, {
        data: { userId: user?.id, friendId: requesterId }
      });

      setRequests((prevRequests) => prevRequests.filter((req) => req.userid !== requesterId));
    } catch (err) {
      console.error("Failed to reject friend request:", err);
    }
  };

  const handleAddFriend = async () => {
    try {
      await axios.post(`http://localhost:5001/profile/friends/request`, {
        userId: user?.id,
        friendId: profileData.userid
      });
      alert("Friend request sent!");
    } catch (err) {
      console.error("Failed to send friend request:", err);
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
            
            {/* LEFT PORTION: Massive Avatar */}
            <div className="avatar-wrapper">
              <div className="profile-avatar">
                {profileData.username?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* RIGHT PORTION: Information, Stats, and Actions */}
            <div className="profile-info">
              <div className="profile-identity">
                <h2>{profileData.username}</h2>
                <p className="email">{profileData.email}</p>
              </div>

              {/* DYNAMIC STATS: Moved up for better hierarchy */}
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

              {/* DYNAMIC ACTIONS: Only show Add Friend if viewing someone else */}
              <div className="profile-actions">
                {!isOwnProfile && (
                  <button className="primary-btn add-friend-btn" onClick={handleAddFriend}>
                    Add Friend
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DYNAMIC TABS */}
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

      {/* CONTENT */}
      <div className="profile-content">
        
        {/* REVIEWS SECTION */}
        {activeTab === "reviews" && (
          <div className="reviews-container">
            {reviews.map((review) => (
              <ReviewCard 
                key={review.reviewid} 
                reviewData={review} 
              />
            ))}
            
            {reviews.length === 0 && (
              <div className="empty-state-wrapper">
                <p className="empty-text">You haven't shared any thoughts yet. Time to start reading! 📚</p>
              </div>
            )}
          </div>
        )}

        {/* FRIENDS */}
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

        {/* REQUESTS (Only accessible if isOwnProfile) */}
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
              <p className="empty-text">No books in this shelf.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
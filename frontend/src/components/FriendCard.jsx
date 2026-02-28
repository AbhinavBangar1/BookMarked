import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./FriendCard.css";

const FriendCard = ({ 
  user, 
  isRequest, 
  onAccept, 
  onReject, 
  loggedInUserFriends = [],
  currentUserId 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [targetUserFriends, setTargetUserFriends] = useState([]);
  
  const [sentRequests, setSentRequests] = useState(new Set());
  
  const navigate = useNavigate();

  const fetchFriendsList = async () => {
    setIsModalOpen(true);
    setLoadingFriends(true);
    try {
      const res = await axios.get(`http://localhost:5001/profile/${user.userid}`);
      setTargetUserFriends(res.data.friends || []);
    } catch (err) {
      console.error("Failed to fetch friends", err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const calculateFriendsList = () => {
    // Ensure we don't crash if loggedInUserFriends is undefined
    const safeLoggedInFriends = loggedInUserFriends || [];
    const loggedInFriendIds = safeLoggedInFriends.map((f) => f.userid);
    
    // 1. The Logged-In User (You)
    const youList = targetUserFriends.filter((f) => f.userid === currentUserId);

    // 2. Mutual Friends (In your list, and NOT you)
    const mutuals = targetUserFriends.filter((f) => 
      loggedInFriendIds.includes(f.userid) && f.userid !== currentUserId
    );

    // 3. Other Friends (Not in your list, and NOT you)
    const others = targetUserFriends.filter((f) => 
      !loggedInFriendIds.includes(f.userid) && f.userid !== currentUserId
    );

    return { youList, mutuals, others };
  };

  const { youList, mutuals, others } = calculateFriendsList();

// Inside FriendCard.jsx
    const handleSendRequest = async (e, targetUserId) => {
        e.stopPropagation();

        if (sentRequests.has(targetUserId)) return;

        try {
            // This matches: Base URL + /profile + /friends/request
            await axios.post(`http://localhost:5001/profile/friends/request`, {
                userId: currentUserId,
                friendId: targetUserId
            });

            setSentRequests((prev) => new Set(prev).add(targetUserId));
        } catch (err) {
            console.error("Failed to send friend request:", err);
        }
    };
  return (
    <>
      <div className="friend-card">
        <div 
          className="friend-card-header clickable-header" 
          onClick={() => navigate(`/profile/${user.userid}`)}
        >
          <div className="friend-avatar">
            {user.username?.charAt(0).toUpperCase() || "?"}
          </div>
          {/* If the card itself is somehow the logged in user, show "You" */}
          <div className="friend-name">
            {user.userid === currentUserId ? "You" : user.username}
          </div>
        </div>

        <div className="friend-card-actions">
          {isRequest && (
            <div className="request-action-group">
              <button className="friend-action-btn btn-accept" onClick={() => onAccept(user.userid)}>
                Accept
              </button>
              <button className="friend-action-btn btn-reject" onClick={() => onReject(user.userid)}>
                Reject
              </button>
            </div>
          )}
          
          <button className="friend-action-btn btn-secondary" onClick={fetchFriendsList}>
            See Friends
          </button>
        </div>
      </div>

      {/* GLASSMORPHISM MODAL */}
      {isModalOpen && (
        <div className="friends-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="friends-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="friends-modal-header">
              <h3>{user.userid === currentUserId ? "Your Friends" : `${user.username}'s Friends`}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            
            <div className="friends-modal-body">
              {loadingFriends ? (
                <div className="loader-text">Loading friends...</div>
              ) : targetUserFriends.length === 0 ? (
                <div className="loader-text">No friends found.</div>
              ) : (
                <>
                  {/* 1. YOU (Rendered at the very top) */}
                  {youList.map((f) => (
                    <div key={f.userid} className="friend-list-item">
                      <div 
                        className="friend-list-info"
                        style={{ cursor: "pointer", flexGrow: 1 }}
                        onClick={() => {
                          setIsModalOpen(false);
                          navigate(`/profile/${f.userid}`);
                        }}
                      >
                        <div className="friend-avatar" style={{ backgroundColor: 'var(--text-dark)', color: 'white' }}>
                          {f.username.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>You</span>
                      </div>
                      
                      <div className="friend-list-actions">
                        <span className="mutual-tag" style={{ background: '#f1f5f9', color: '#64748b', borderColor: '#cbd5e1' }}>You</span>
                      </div>
                    </div>
                  ))}

                  {/* 2. MUTUAL FRIENDS */}
                  {mutuals.map((f) => (
                    <div key={f.userid} className="friend-list-item">
                      <div 
                        className="friend-list-info"
                        style={{ cursor: "pointer", flexGrow: 1 }}
                        onClick={() => {
                          setIsModalOpen(false);
                          navigate(`/profile/${f.userid}`);
                        }}
                      >
                        <div className="friend-avatar">
                          {f.username.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{f.username}</span>
                      </div>
                      
                      <div className="friend-list-actions">
                        <span className="mutual-tag">Mutual</span>
                      </div>
                    </div>
                  ))}

                  {/* 3. OTHER FRIENDS */}
                  {others.map((f) => {
                    const isSent = sentRequests.has(f.userid);
                    return (
                      <div key={f.userid} className="friend-list-item">
                        <div 
                          className="friend-list-info"
                          style={{ cursor: "pointer", flexGrow: 1 }}
                          onClick={() => {
                            setIsModalOpen(false);
                            navigate(`/profile/${f.userid}`);
                          }}
                        >
                          <div className="friend-avatar" style={{ backgroundColor: 'transparent', borderColor: '#cbd5e1', color: '#64748b' }}>
                            {f.username.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500, color: '#64748b' }}>{f.username}</span>
                        </div>
                        
                        <div className="friend-list-actions">
                          <button 
                            className={`add-friend-mini-btn ${isSent ? 'sent' : ''}`}
                            onClick={(e) => handleSendRequest(e, f.userid)}
                            title={isSent ? "Request Sent" : "Add Friend"}
                          >
                            {isSent ? (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FriendCard;
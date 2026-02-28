import React from "react";
import { useNavigate } from "react-router-dom";
import "./ReviewCard.css";

const ReviewCard = ({ reviewData }) => {
  const navigate = useNavigate();

  if (!reviewData || !reviewData.books) return null;

  const { review, books, createdat, rating } = reviewData;
  
  const dateFormatted = createdat 
    ? new Date(createdat).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) 
    : "Recently";

  return (
    <div className="aesthetic-card">
      {/* FLOATING BOOK COVER */}
      <div className="cover-anchor" onClick={() => navigate(`/book/${books.bookid}`)}>
        <img 
          src={books.coverimage || "https://placehold.co/300x450?text=No+Cover"} 
          alt={books.title} 
          className="floating-img"
        />
        <div className="glass-overlay">
          <span>Read</span>
        </div>
      </div>

      {/* REFINED CONTENT */}
      <div className="card-body">
        <div className="card-top">
          <div className="book-info">
            <h4 className="title-text">{books.title}</h4>
            <span className="date-text">{dateFormatted}</span>
          </div>
          <div className="rating-tag">
            <span className="star-mini">★</span>
            <span className="score-text">{rating || "4.8"}</span>
          </div>
        </div>

        <div className="review-snippet">
          <p>“{review || "A journey of a thousand pages begins with a single vibe."}”</p>
        </div>

        <div className="card-footer">
          <div className="author-badge">
            <div className="dot"></div>
            Reader Opinion
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
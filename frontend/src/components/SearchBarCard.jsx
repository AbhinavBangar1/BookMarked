import "./SearchbarCard.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SearchBarCard({ data, type, onSelect }) {
  const navigate = useNavigate();
  
  // NEW: Map variables based on Supabase database structure
  const bookId = data.bookid;
  const title = data.title;
  const coverImage = data.coverimage;
  // author is an inner join object from Supabase: { name: "Author Name" }
  const authorName = data.author?.name || "Unknown Author"; 
  const dbAuthorId = data.authorid; // Grab authorid directly from DB

  const [authorImg, setAuthorImg] = useState(null);
  const [fetchedAuthorId, setFetchedAuthorId] = useState(null);

  useEffect(() => {
    if (type !== "author" || !authorName || authorName === "Unknown Author") return;

    const fetchAuthorData = async () => {
      try {
        const res = await axios.get("/api/search/author-image", {
          params: { name: authorName },
        });
        if (res.data) {
          setAuthorImg(res.data.image);
          setFetchedAuthorId(res.data.id);
        }
      } catch {}
    };

    fetchAuthorData();
  }, [type, authorName]);

  const handleBookClick = () => {
    navigate(`/book/${bookId}`);
    onSelect?.();
  };

  const handleAuthorClick = () => {
    // Prefer database author ID, fallback to fetched ID
    const finalAuthorId = dbAuthorId || fetchedAuthorId;
    if (finalAuthorId) {
      navigate(`/author/${finalAuthorId}`);
      onSelect?.();
    }
  };

  const handleUserClick = () => {
    navigate(`/profile/${data.userid}`); // FIXED: Changed to match your App.jsx route (/profile)
    onSelect?.();
  };

  if (type === "books") {
    return (
      <div className="searchcard clickable" onClick={handleBookClick}>
        <div className="img-wrapper">
          <img
            className="img"
            src={coverImage || "/placeholder-book.png"}
            alt={title}
          />
        </div>
        <div className="text-wrapper">
          <p className="text">{title}</p>
          <p className="subtext">{authorName}</p>
        </div>
      </div>
    );
  }

  if (type === "author") {
    const finalAuthorId = dbAuthorId || fetchedAuthorId;
    return (
      <div
        className={`searchcard ${finalAuthorId ? "clickable" : ""}`}
        onClick={handleAuthorClick}
        title={finalAuthorId ? "View Author Page" : "Author page not available"}
      >
        <div className="img-wrapper">
          {authorImg ? (
            <img className="img" src={authorImg} alt={authorName} />
          ) : (
            <div className="author-placeholder">{authorName?.[0]}</div>
          )}
        </div>
        <div className="text-wrapper">
          <p className="text">{authorName}</p>
          <p className="subtext">Author</p>
        </div>
      </div>
    );
  }

  if (type === "users") {
    return (
      <div className="searchcard clickable" onClick={handleUserClick}>
        <div className="img-wrapper">
          <div className="author-placeholder">
            {data.username?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
        <div className="text-wrapper">
          <p className="text">{data.username || data.email}</p>
          <p className="subtext">{data.email || "No email"}</p>
        </div>
      </div>
    );
  }

  return null;
}

export default SearchBarCard;
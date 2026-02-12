import "./SearchBarCard.css";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SearchBarCard({ data, type, onSelect }) {
  const navigate = useNavigate();
  const info = data.volumeInfo || {};
  const authorName = info.authors?.[0];
  const [authorImg, setAuthorImg] = useState(null);

  useEffect(() => {
    if (type !== "author" || !authorName) return;

    const fetchAuthorImage = async () => {
      try {
        const res = await axios.get("/api/search/author-image", {
          params: { name: authorName },
        });
        setAuthorImg(res.data?.image || null);
      } catch {
        setAuthorImg(null);
      }
    };

    fetchAuthorImage();
  }, [type, authorName]);

  const handleBookClick = () => {
    navigate(`/book/${data.id}`);
    onSelect?.();
  };

  /* ---------- BOOK RESULTS ---------- */
  if (type === "books") {
    return (
      <div className="searchcard clickable" onClick={handleBookClick}>
        <div className="img-wrapper">
          <img
            className="img"
            src={info.imageLinks?.thumbnail || "/placeholder-book.png"}
            alt={info.title}
          />
        </div>
        <div className="text-wrapper">
          <p className="text">{info.title}</p>
          <p className="subtext">{info.authors?.join(", ") || "Unknown Author"}</p>
        </div>
      </div>
    );
  }

  /* ---------- AUTHOR RESULTS ---------- */
  if (type === "author") {
    return (
      <div className="searchcard">
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

  return null;
}

export default SearchBarCard;
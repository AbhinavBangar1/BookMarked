import "./SearchBarCard.css";
import { useEffect, useState } from "react";
import axios from "axios";

function SearchBarCard({ data, type }) {
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

  if (type === "books") {
    return (
      <div className="searchcard">
        <div className="img-wrapper">
          <img className="img" src={info.imageLinks?.thumbnail} alt={info.title} />
        </div>
        <div className="text-wrapper">
          <p className="text">{info.title}</p>
          <p className="subtext">{info.authors?.join(", ")}</p>
        </div>
      </div>
    );
  }

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

  if (type === "isbn") {
    const isbn = info.industryIdentifiers?.[0]?.identifier;
    return (
      <div className="searchcard">
        <div className="img-wrapper">
          <img className="img" src={info.imageLinks?.thumbnail} alt={info.title} />
        </div>
        <div className="text-wrapper">
          <p className="text">{info.title}</p>
          <p className="subtext">{isbn}</p>
        </div>
      </div>
    );
  }

  if (type === "publisher") {
    return (
      <div className="searchcard">
        <div className="text-wrapper">
          <p className="text">{info.publisher}</p>
        </div>
      </div>
    );
  }

  return null;
}

export default SearchBarCard;

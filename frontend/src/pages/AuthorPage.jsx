import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./AuthorPage.css";

function AuthorPage() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder for fetching author data
    // fetchAuthor(id).then(data => {
    //   setAuthor(data);
    //   setLoading(false);
    // });
    setLoading(false);
  }, [id]);

  return (
    <div className="author-page">
      <Header />
      <div className="author-content">
        <h1>Author Page</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="author-details">
            <p>Author ID: {id}</p>
            {/* Author details will go here */}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default AuthorPage;

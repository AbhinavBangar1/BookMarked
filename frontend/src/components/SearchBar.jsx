import "./SearchBar.css";
import { IoClose } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from "axios";
import SearchBarCard from "./SearchBarCard";

function SearchBar({ isOpen, onClose }) {
  if (!isOpen) return null;

  const tabs = [
    { id: "books", label: "Books" },
    { id: "author", label: "Author" },
    { id: "clubs", label: "Clubs" },
    { id: "users", label: "Users" },
  ];

  const [activeTab, setActiveTab] = useState("books");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);

        let params = {};
        if (activeTab === "books") params.title = query;
        if (activeTab === "author") params.author = query;

        const response = await axios.get("/api/search/specific", {
          params,
        });

        setResults(response.data);
      } catch (error) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query, activeTab]);

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-container" onClick={(e) => e.stopPropagation()}>
        <div className="search-top">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search books, authors, clubs..."
            className="search-input"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="close-btn" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className="search-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="search-results">
          {loading && <p>Loading...</p>}

          {!loading && query && results.length === 0 && (
            <p>No results found for "{query}"</p>
          )}

          {results.map((book, index) => (
            <SearchBarCard
                key = {book.id}
                type = {activeTab}
                data= {book}
            />
          ))}
        </div>

        {!query && (
          <div className="search-empty">
            <FiSearch className="empty-icon" />
            <p className="empty-title">No recent searches</p>
            <p className="empty-sub">Try searching for something new</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchBar;

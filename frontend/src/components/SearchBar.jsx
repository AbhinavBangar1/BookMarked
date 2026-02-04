//this is the popup when search icon clicked
import './SearchBar.css';
import { IoClose } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";

function SearchBar({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-container" onClick={(e) => e.stopPropagation()}>
        
        <div className="search-top">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for Books , Authors , Clubs ..."
            className="search-input"
            autoFocus
          />
          <button className="close-btn" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className="search-tabs">
          <span className="active">Books</span>
          <span>Authors</span>
          <span>Clubs</span>
          <span>Users</span>
        </div>

        <div className="search-empty">
          <div className="empty-icon">
            <FiSearch />
          </div>
          <p className="empty-title">No recent searches</p>
          <p className="empty-sub">Your search history will appear here</p>
        </div>

      </div>
    </div>
  );
}

export default SearchBar;

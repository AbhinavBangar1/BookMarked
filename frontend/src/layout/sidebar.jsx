import { useNavigate } from "react-router-dom";
import '../Profile.css';

export default function Sidebar({ user }) {

  const navigate = useNavigate();

  return (
    <div className="sidebar">

      <div className="sidebar-header">
        <h2>{user?.email || "User"}</h2>
      </div>

      <div className="sidebar-menu">
        <button onClick={() => navigate("/")}>
          Dashboard
        </button>

        <button onClick={() => navigate("/wishlist")}>
          My Books
        </button>

        <button onClick={() => navigate("/dashboard")}>
          Reviews
        </button>

        <button onClick={() => navigate("/settings")}>
          Settings
        </button>
        <button onClick={() => navigate("/Friends")}>
          Friends
        </button>
      </div>

    </div>
  );
}


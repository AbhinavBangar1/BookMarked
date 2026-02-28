export default function Sidebar({ user, toggleDark }) {

  return (
    <div className="sidebar">

      {/* Profile section */}
      <div style={{ marginBottom: "30px" }}>
        <h2>{user?.username || "User"}</h2>
        <p style={{ opacity: 0.8 }}>{user?.email}</p>
      </div>

      <hr />

      {/* Navigation */}
      <div style={{ marginTop: "20px" }}>
        <p className="nav-item">Dashboard</p>
        <p className="nav-item">My Books</p>
        <p className="nav-item">Reviews</p>
        <p className="nav-item">Settings</p>
      </div>

      {/* Dark mode toggle */}
      <div style={{ marginTop: "40px" }}>
        <button onClick={toggleDark} className="dark-toggle">
          🌙 Toggle Dark Mode
        </button>
      </div>

    </div>
  );
}


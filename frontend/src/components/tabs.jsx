export default function Tabs({ active, setActive }) {

  const tabs = ["views", "reviews", "comments", "feedbacks"];

  return (
    <div className="tabs">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`tab-btn ${active === tab ? "active" : ""}`}
          onClick={() => setActive(tab)}
        >
          {tab.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Tabs({ active, setActive }) {

  const tabs = ["views", "reviews", "comments", "feedbacks"];

  return (
    <div className="tabs">
      {tabs.map(t => (
        <div
          key={t}
          className={`tab ${active === t ? "active" : ""}`}
          onClick={() => setActive(t)}
        >
          {t.toUpperCase()}
        </div>
      ))}
    </div>
  );
}

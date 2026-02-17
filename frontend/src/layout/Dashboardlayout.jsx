import Sidebar from "./sidebar";

export default function DashboardLayout({ user, toggleDark, children }) {

  return (
    <div className="layout">

      {/* Sidebar */}
      <Sidebar user={user} toggleDark={toggleDark} />

      {/* Main Content */}
      <div className="main">
        {children}
      </div>

    </div>
  );
}


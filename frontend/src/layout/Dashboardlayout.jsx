import Sidebar from "./sidebar";
import { useEffect, useState } from "react";
import '../Profile.css';


export default function DashboardLayout({ user, children }) {

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  const toggleDark = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <div className="layout">
      <Sidebar user={user} toggleDark={toggleDark} />
      <div className="main">
        {children}
      </div>
    </div>
  );
}

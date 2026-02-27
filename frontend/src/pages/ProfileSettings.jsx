import { useState } from "react";
import { supabase } from "../services/supabase";
import DashboardLayout from "../layout/DashboardLayout";

export default function Settings({ user }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUsernameSave = async () => {
    alert("Username feature coming soon.");
  };

  const handlePasswordChange = async () => {
    if (!password) return;

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully.");
      setPassword("");
    }
  };

  return (
    <DashboardLayout user={user}>
      <div className="settings-container">
        <h2>Account Settings</h2>

        <div className="settings-card">
          <label>Email</label>
          <input
  type="text"
  value={user?.email ?? ""}
  disabled
/>

          <label>Change Password</label>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handlePasswordChange}>
            Update Password
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
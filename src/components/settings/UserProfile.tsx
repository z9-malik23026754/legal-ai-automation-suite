
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div className="glass-card p-6 border-white/10 rounded-lg shadow-glass">
      <h2 className="text-2xl font-semibold mb-6">User Profile</h2>
      <p className="text-muted-foreground">
        Email: {user?.email}
      </p>
    </div>
  );
};

export default UserProfile;

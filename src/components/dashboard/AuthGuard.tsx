
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AuthGuardProps {
  user: any;
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ user, children }) => {
  // If no user, redirect to sign in
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="mb-4">Please sign in to access your dashboard</p>
        <Link to="/signin">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;

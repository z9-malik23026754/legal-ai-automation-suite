
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import SignUpForm from "@/components/auth/SignUpForm";
import { removeForceAgentAccess } from "@/utils/forceAgentAccess";

const SignUp = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
    
    // Ensure no access flags are accidentally set during signup
    removeForceAgentAccess();
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import ForgotPassword from "@/components/auth/ForgotPassword";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const handleBackToSignIn = () => {
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-slate-200">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Lock className="h-7 w-7 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              We'll send you instructions to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ForgotPassword onBackToSignIn={handleBackToSignIn} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 
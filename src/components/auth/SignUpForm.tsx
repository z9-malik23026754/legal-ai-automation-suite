
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { KeyRound, Lock, Briefcase } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Strong email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    
    if (!EMAIL_REGEX.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    
    setEmailError("");
    return true;
  };

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email and password
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePasswords();
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: "Terms agreement required",
        description: "Please agree to the terms of service to create an account",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUp(email, password);
      
      if (result?.error) {
        throw result.error;
      }
      
      // Only show success message on successful account creation
      toast({
        title: "Account created successfully",
        description: "You can now sign in with your credentials",
      });
      
      // Redirect to signin page after successful signup
      navigate("/signin");
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Handle specific error cases
      if (error.message?.includes("email already in use")) {
        toast({
          title: "Email already registered",
          description: "Please sign in with your existing account",
          variant: "destructive",
        });
      } else if (error.message) {
        toast({
          title: "Error creating account",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="bg-primary/10 p-3 rounded-full">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) {
                    validateEmail(e.target.value);
                  }
                }}
                onBlur={() => validateEmail(email)}
                required
                className={`pl-10 ${emailError ? 'border-destructive' : ''}`}
                disabled={isSubmitting || isLoading}
              />
              <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            {emailError && (
              <p className="text-sm text-destructive">{emailError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10"
                disabled={isSubmitting || isLoading}
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pl-10"
                disabled={isSubmitting || isLoading}
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
              disabled={isSubmitting || isLoading}
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline">
                terms of service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                privacy policy
              </Link>
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? "Creating account..." : "Create account"}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SignUpForm;

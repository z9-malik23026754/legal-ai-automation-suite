
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

type DeveloperContextType = {
  isDeveloper: boolean;
  isLoading: boolean;
};

const DeveloperContext = createContext<DeveloperContextType | undefined>(undefined);

// List of developer email addresses that should have access to developer tools
const DEVELOPER_EMAILS = ["radianthd04@gmail.com"];

export function DeveloperProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [isDeveloper, setIsDeveloper] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (authLoading) return;

    // Check if the current user's email is in the list of developer emails
    const checkDeveloperStatus = () => {
      const userEmail = user?.email;
      const hasDeveloperAccess = userEmail ? DEVELOPER_EMAILS.includes(userEmail) : false;
      setIsDeveloper(hasDeveloperAccess);
      setIsLoading(false);
    };

    checkDeveloperStatus();
  }, [user, authLoading]);

  return (
    <DeveloperContext.Provider value={{ isDeveloper, isLoading }}>
      {children}
    </DeveloperContext.Provider>
  );
}

export function useDeveloper() {
  const context = useContext(DeveloperContext);
  if (context === undefined) {
    throw new Error("useDeveloper must be used within a DeveloperProvider");
  }
  return context;
}

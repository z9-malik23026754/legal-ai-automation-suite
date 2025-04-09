
// This file just re-exports the AuthProvider from the providers directory
// We're using this pattern to avoid circular dependencies
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
export { AuthProvider, useAuth };
export type { AuthContextType, Subscription } from "@/types/auth";

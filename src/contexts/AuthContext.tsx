"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { DJANGO_API_URL } from "@/lib/api";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * UserProfile represents the Django user object returned from /api/me/
 * This is what Django sends back after verifying the Clerk JWT token
 */
interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string; // Django role: "admin", "staff", "viewer", etc.
}

/**
 * AuthContextType defines what data and functions our Context provides
 * to components throughout the app
 */
interface AuthContextType {
  user: UserProfile | null;      // null if not authenticated or not yet loaded
  isLoading: boolean;             // true while fetching from Django
  error: string | null;           // error message if fetch fails
  refetchUser: () => Promise<void>; // function to manually refresh user data
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

/**
 * Create the Context container
 * Initially undefined - will be populated by AuthProvider
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

/**
 * AuthProvider wraps the app and manages user authentication state
 * 
 * Responsibilities:
 * 1. Checks if user is signed into Clerk
 * 2. If signed in, fetches their Django profile (with role)
 * 3. Provides user data to all child components via Context
 * 4. Re-fetches when Clerk sign-in status changes
 * 
 * Usage: Wrap your app in layout.tsx with <AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Get Clerk authentication state and token function
  const { getToken, isSignedIn } = useAuth();
  
  // State to store user profile from Django
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Loading state - true while fetching from Django
  const [isLoading, setIsLoading] = useState(true);
  
  // Error state - stores error message if fetch fails
  const [error, setError] = useState<string | null>(null);

  /**
   * fetchUserProfile - Fetches user profile from Django
   * 
   * Flow:
   * 1. Check if user is signed into Clerk - if not, clear user state
   * 2. Get JWT token from Clerk
   * 3. Send token to Django /api/me/ endpoint
   * 4. Django verifies token and returns user profile with role
   * 5. Store profile in state, making it available to all components
   */
  const fetchUserProfile = async () => {
    // If user isn't signed into Clerk, don't try to fetch from Django
    if (!isSignedIn) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get the JWT token from Clerk session
      // This token is what Django will verify
      const token = await getToken();
      
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Call Django API with the Clerk token
      // Django's ClerkAuthentication middleware will:
      // 1. Verify the token signature
      // 2. Fetch user info from Clerk
      // 3. Create/update Django user
      // 4. Return user profile with role
      const response = await fetch(`${DJANGO_API_URL}/api/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }

      const data = await response.json();
      
      // Store the user profile in state
      // Now any component can access this via useUser() hook
      setUser(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load user profile";
      setError(errorMessage);
      console.error("Error fetching user profile:", err);
      setUser(null); // Clear user on error
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Effect hook that runs when component mounts or Clerk sign-in status changes
   * 
   * Scenarios:
   * - App loads: Fetch user if signed in
   * - User signs in: Fetch their profile
   * - User signs out: Clear profile (isSignedIn becomes false)
   */
  useEffect(() => {
    fetchUserProfile();
  }, [isSignedIn]); // Re-run when sign-in status changes

  /**
   * The value object provided to all consuming components
   * Contains: user profile, loading state, error state, and refresh function
   */
  const value = {
    user,
    isLoading,
    error,
    refetchUser: fetchUserProfile, // Allow manual refresh if needed
  };

  // Provide the value to all children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// HOOKS - Use these in components to access auth data
// ============================================================================

/**
 * useUser - Basic hook to access user data
 * 
 * Returns: { user, isLoading, error, refetchUser }
 * 
 * Example:
 *   const { user, isLoading } = useUser();
 *   if (isLoading) return <Loading />;
 *   return <div>Welcome {user?.first_name}!</div>;
 */
export function useUser() {
  const context = useContext(AuthContext);
  
  // This error catches if you forget to wrap your app in <AuthProvider>
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  
  return context;
}

/**
 * useRequireAuth - Hook that returns true only if user is authenticated
 * 
 * Use this when a page/component requires authentication
 * Returns false while loading or if not authenticated
 * 
 * Example:
 *   const isAuthed = useRequireAuth();
 *   if (!isAuthed) return <div>Please sign in</div>;
 *   return <ProtectedContent />;
 */
export function useRequireAuth() {
  const { user, isLoading } = useUser();
  const { isSignedIn } = useAuth();

  // Still loading - don't show content yet
  if (isLoading) return false;
  
  // Not signed in or no user profile - not authenticated
  if (!isSignedIn || !user) return false;
  
  // Authenticated!
  return true;
}

/**
 * useRequireRole - Hook that checks if user has a specific role
 * 
 * Returns: { hasRole: boolean, isLoading: boolean }
 * 
 * Use this for role-based UI elements or pages
 * 
 * Example:
 *   const { hasRole, isLoading } = useRequireRole("admin");
 *   if (isLoading) return <Loading />;
 *   if (!hasRole) return <div>Admins only!</div>;
 *   return <AdminPanel />;
 */
export function useRequireRole(requiredRole: string) {
  const { user, isLoading } = useUser();

  // Still loading - don't know role yet
  if (isLoading) return { hasRole: false, isLoading: true };
  
  // No user - definitely doesn't have the role
  if (!user) return { hasRole: false, isLoading: false };
  
  // Check if user's role matches required role
  const hasRole = user.role === requiredRole;
  return { hasRole, isLoading: false };
}


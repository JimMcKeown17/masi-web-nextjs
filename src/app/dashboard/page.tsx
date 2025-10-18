"use client";

import { useUser } from "@/contexts/AuthContext";

/**
 * Dashboard Page
 * 
 * This page demonstrates how to use the AuthContext.
 * No need to fetch user data - it's already loaded by AuthProvider!
 * 
 * The AuthProvider (in layout.tsx) automatically:
 * 1. Checks if user is signed in via Clerk
 * 2. Fetches their profile from Django (with role)
 * 3. Makes it available via useUser() hook
 */
export default function Dashboard() {
  // Get user data from Context - no fetch needed!
  const { user, isLoading, error } = useUser();

  // Show loading state while AuthProvider fetches user data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Profile</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // Show message if not signed in (shouldn't happen due to middleware, but good to handle)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view your dashboard.</p>
          <a
            href="/auth/sign-in"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // User is loaded! Show their profile
  return (
    <div className="max-w-4xl mx-auto p-10">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          Welcome, {user.first_name || user.username}! 👋
        </h1>
        
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-medium text-gray-900">{user.username}</p>
              </div>
              
              {user.first_name && (
                <div>
                  <p className="text-sm text-gray-600">First Name</p>
                  <p className="font-medium text-gray-900">{user.first_name}</p>
                </div>
              )}
              
              {user.last_name && (
                <div>
                  <p className="text-sm text-gray-600">Last Name</p>
                  <p className="font-medium text-gray-900">{user.last_name}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase mb-2">
              Access Level
            </h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {user.role}
              </span>
            </div>
          </div>

          {/* Debug info - remove this in production */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Debug: Raw User Data
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}

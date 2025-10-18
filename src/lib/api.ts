/**
 * API Helper Functions
 * 
 * This file provides utilities for making authenticated API calls to Django
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Get the Django API base URL from environment variable
 * Falls back to localhost for development
 * 
 * In production, set NEXT_PUBLIC_DJANGO_API_URL in your .env file
 */
export const DJANGO_API_URL = 
  process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://127.0.0.1:8000";

// ============================================================================
// CLIENT-SIDE FETCH HELPER
// ============================================================================

/**
 * fetchWithAuth - Client-side helper for authenticated API calls
 * 
 * Automatically adds the Clerk JWT token to requests
 * 
 * @param url - API endpoint (e.g., "/api/students/" or full URL)
 * @param getToken - Clerk's getToken function from useAuth() hook
 * @param options - Standard fetch options (method, body, headers, etc.)
 * 
 * Usage in a component:
 *   const { getToken } = useAuth();
 *   const data = await fetchWithAuth("/api/students/", getToken);
 * 
 * Example with POST:
 *   const data = await fetchWithAuth("/api/students/", getToken, {
 *     method: "POST",
 *     body: JSON.stringify({ name: "John" })
 *   });
 */
export async function fetchWithAuth(
  url: string,
  getToken: () => Promise<string | null>,
  options: RequestInit = {}
) {
  // Get the Clerk JWT token
  const token = await getToken();
  
  if (!token) {
    throw new Error("No authentication token available");
  }

  // Build the full URL if only path is provided
  const fullUrl = url.startsWith("http") ? url : `${DJANGO_API_URL}${url}`;

  // Add authentication header
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers, // Allow overriding headers if needed
  };

  // Make the fetch request
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Handle errors
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  // Parse and return JSON response
  return response.json();
}

// ============================================================================
// TYPE-SAFE API ERROR
// ============================================================================

/**
 * ApiError - Custom error class for API-related errors
 * 
 * Provides additional context about API failures
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}


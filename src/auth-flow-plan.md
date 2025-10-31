# Auth Flow with Role-Based Access Control

## Architecture Overview

- **Clerk**: Handles sign-in/sign-up UI and session management
- **Django**: Source of truth for users and roles, verifies Clerk JWT tokens
- **NextJS Context**: Caches user profile (including role) for client-side access
- **Defense in depth**: Server middleware protects routes + client Context for UX

## Current State

- ✅ Clerk authentication working
- ✅ Django `ClerkAuthentication` class verifies JWT tokens
- ✅ Dashboard fetches from `/api/me/` endpoint
- ❌ No centralized user context
- ❌ No role-based access control

## Implementation Steps

### 1. Django Backend Setup

**Ensure Django User/Profile Model has roles:**

- Verify User model or create UserProfile model with `role` field
- Define role choices (e.g., ADMIN, STAFF, VIEWER)
- Add role to `/api/me/` endpoint response

**Create/verify endpoint** `GET /api/me/`:

- Uses `ClerkAuthentication` (already exists)
- Returns: `{email, username, first_name, last_name, role, id}`
- This endpoint already seems to exist (referenced in dashboard)

### 2. NextJS Context & Provider

**Create `src/contexts/AuthContext.tsx`:**

- Provides user profile data and loading state
- Fetches from Django `/api/me/` on mount (if Clerk session exists)
- Exports: `AuthProvider`, `useUser()`, `useRequireAuth()`, `useRequireRole(role)`
- Handles loading, error, and unauthenticated states

**Create `src/lib/api.ts`:**

- Helper function `fetchWithAuth()` that automatically adds Clerk token to requests
- Centralized API base URL configuration (from env variable)
- Standardized error handling

### 3. Integrate Provider in Layout

**Update `src/app/layout.tsx`:**

- Wrap children in `AuthProvider` (inside ClerkProvider)
- Provider runs once at app level, not on every page

### 4. Role-Based Middleware (Server-Side Protection)

**Update `src/middleware.ts`:**

- After Clerk authentication, fetch user role from Django
- Block access to role-restricted routes
- Define route → role mapping (e.g., `/dashboard` requires STAFF role)
- Cache role checks to avoid excessive Django calls

### 5. Update Dashboard to Use Context

**Simplify `src/app/dashboard/page.tsx`:**

- Remove local fetch logic
- Use `const { user, isLoading } = useUser()`
- Display user profile from context

### 6. Create Protected Route Examples

**Create `src/components/auth/RequireRole.tsx`:**

- Component wrapper that checks user role
- Shows loading state or redirects if unauthorized
- Can be used to wrap pages or sections

### 7. Environment Configuration

**Update `.env.local`:**

- Add `NEXT_PUBLIC_DJANGO_API_URL=http://127.0.0.1:8000`
- Ensures consistent API endpoint across app

### 8. Testing Checklist

Create tests to verify:

1. New user creation in Django on first Clerk login
2. Existing user authentication returns correct role
3. Context provides user data across different pages
4. Protected routes redirect unauthorized users
5. Role-specific UI elements show/hide correctly
6. API calls include authentication token
7. Token expiration handling

## Files to Create/Modify

**Create:**

- `src/contexts/AuthContext.tsx` - User context and provider
- `src/lib/api.ts` - Authenticated fetch helper
- `src/components/auth/RequireRole.tsx` - Role protection component

**Modify:**

- `src/app/layout.tsx` - Add AuthProvider
- `src/middleware.ts` - Add role-based protection
- `src/app/dashboard/page.tsx` - Use context instead of local fetch
- `.env.local` - Add Django API URL

**Django (guidance needed):**

- Verify User/UserProfile model has role field
- Verify `/api/me/` endpoint exists and returns role
- Document available roles

## Key Benefits

- ✅ User data fetched once, available everywhere via Context
- ✅ Server-side security with middleware
- ✅ Client-side UX with conditional rendering
- ✅ Django is source of truth for roles
- ✅ No prop drilling needed
- ✅ Clean separation of concerns

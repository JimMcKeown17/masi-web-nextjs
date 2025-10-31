# Auth Flow with Role-Based Access Control

## Architecture Overview

- **Clerk**: Handles sign-in/sign-up UI and session management
- **Django Backend**: Source of truth for users and roles, verifies Clerk JWT tokens via `/api/me/`
- **Server-Side Fetching**: NextJS Server Components fetch user data at the root layout level
- **UserProvider Context**: Client-side context provides user profile (including role) to all components
- **Defense in depth**: Server-side data fetching + client context for optimal UX

## Current Implementation Status

- ✅ Clerk authentication working (sign-in/sign-up flows)
- ✅ Django `ClerkAuthentication` class verifies JWT tokens
- ✅ Django `/api/me/` endpoint returns user profile with role
- ✅ Server-side user fetching via `getUserProfile()` in `lib/server/user.ts`
- ✅ Client-side user context via `UserProvider`
- ✅ User data available across all components via `useUser()` hook
- ⚠️ Middleware protection for role-based routes (optional, can be added)

## How It Works

### 1. Django Backend (Unchanged)

**Django User Model with Roles:**
- User model has `role` field
- Available roles: Administrator, Project Manager, etc.

**API Endpoint:** `GET https://www.masinyusane.org/api/me/`
- Uses `ClerkAuthentication` to verify Clerk JWT tokens
- Returns user profile: `{id, email, username, first_name, last_name, role}`
- Creates Django user if first-time Clerk login

### 2. Server-Side User Fetching

**File:** `src/lib/server/user.ts`

```typescript
export async function getUserProfile() {
  const { userId } = await auth();
  
  if (!userId) return null;

  const response = await fetch(`https://www.masinyusane.org/api/me/`, {
    headers: {
      'Authorization': `Bearer ${await getClerkToken()}`,
      'Content-Type': 'application/json'
    },
    next: { revalidate: 300 } // Cache for 5 minutes
  });

  if (response.ok) {
    return await response.json();
  }
  
  return null;
}
```

**Key Features:**
- Runs on the server (NextJS Server Components)
- Checks Clerk authentication via `auth()`
- Fetches user profile from Django with Clerk JWT token
- Caches result for 5 minutes to reduce API calls
- Returns null if user not authenticated or fetch fails

### 3. Root Layout Integration

**File:** `src/app/layout.tsx`

```typescript
export default async function RootLayout({ children }) {
  const userProfile = await getUserProfile(); // Server-side fetch
  
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <UserProvider user={userProfile}> {/* Pass to client context */}
            <Navbar />
            <main className="pt-16">
              {children}
            </main>
          </UserProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

**How it works:**
1. Root layout is a Server Component (async)
2. Calls `getUserProfile()` to fetch from Django
3. Passes user data to `UserProvider` (client component)
4. User data is now available to all child components

### 4. Client-Side User Context

**File:** `src/components/providers/UserProvider.tsx`

```typescript
'use client';

import { createContext, useContext, ReactNode } from 'react';

type UserProfile = {
  id: string;
  role: string;
  email: string;
  // ... other fields from Django API
};

const UserContext = createContext<UserProfile | null>(null);

export function UserProvider({ children, user }) {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
```

**Key Features:**
- Simple context wrapper (no client-side fetching)
- Receives pre-fetched user data from server
- Provides `useUser()` hook for all components
- Returns `null` if user not authenticated

### 5. Using User Data in Components

**Example:** `src/components/layout/Navbar.tsx`

```typescript
'use client';

import { useUser } from '@/components/providers/UserProvider';

export function Navbar() {
  const user = useUser();
  
  // Check role for conditional rendering
  const hasManagementAccess = 
    user?.role === 'Administrator' || 
    user?.role === 'Project Manager';

  return (
    <nav>
      {/* Clerk handles sign-in/out UI */}
      <SignedOut>
        <Link href="/auth/sign-in">Log In</Link>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      
      {/* Role-based UI elements */}
      {hasManagementAccess && (
        <Link href="/operations">Operations</Link>
      )}
    </nav>
  );
}
```

## Data Flow Diagram

```
1. User visits site
   ↓
2. layout.tsx (Server Component)
   - Checks Clerk auth
   - Calls getUserProfile()
   ↓
3. getUserProfile() fetches from Django
   - Sends Clerk JWT token
   - Django verifies token
   - Returns user + role
   ↓
4. User data passed to UserProvider
   ↓
5. All client components access via useUser()
   - Navbar checks role for conditional UI
   - Protected pages check authentication
   - No additional API calls needed
```

## Key Architecture Decisions

### Why Server-Side Fetching?

**Benefits:**
- ✅ No loading states on client (data ready on initial render)
- ✅ Better performance (server-side caching)
- ✅ SEO-friendly (user data available for SSR)
- ✅ Reduced client bundle size (no API client code)
- ✅ More secure (API calls from server, not exposed in browser)

### Why UserProvider Context?

**Benefits:**
- ✅ Makes server-fetched data available to client components
- ✅ No prop drilling needed
- ✅ Clean separation between data fetching (server) and data access (client)
- ✅ Works seamlessly with Next.js App Router

### Caching Strategy

- Server-side cache: 5 minutes (`next: { revalidate: 300 }`)
- Reduces load on Django API
- Balance between freshness and performance
- Can be adjusted based on needs

## Current File Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout with UserProvider
│   ├── auth/
│   │   ├── sign-in/[[...sign-in]]/  # Clerk sign-in page
│   │   └── sign-up/[[...sign-up]]/  # Clerk sign-up page
│   └── ...other pages
├── components/
│   ├── providers/
│   │   └── UserProvider.tsx         # Client context for user data
│   ├── layout/
│   │   └── Navbar.tsx               # Uses useUser() hook
│   └── ...other components
├── lib/
│   ├── server/
│   │   └── user.ts                  # Server-side getUserProfile()
│   └── utils.ts
└── middleware.ts                     # Clerk middleware (routes protection)
```

## Future Enhancements (Optional)

### 1. Role-Based Route Protection

**Add to `middleware.ts`:**
- Define protected routes and required roles
- Redirect unauthorized users
- Server-side enforcement (not just UI hiding)

### 2. Additional Context Helpers

**Add to `UserProvider.tsx`:**
```typescript
export function useRequireAuth() {
  const user = useUser();
  const router = useRouter();
  
  if (!user) {
    router.push('/auth/sign-in');
    return false;
  }
  return true;
}

export function useRequireRole(requiredRole: string) {
  const user = useUser();
  return user?.role === requiredRole;
}
```

### 3. Optimistic Updates

- If user data changes in Django, implement revalidation strategy
- Consider using `router.refresh()` after profile updates

## Testing Checklist

- [x] User can sign up via Clerk
- [x] User profile created in Django on first login
- [x] User data accessible via `useUser()` hook
- [x] Role-based UI elements show/hide correctly
- [ ] Protected routes redirect unauthorized users (optional)
- [x] Clerk sign-out clears user session
- [x] Server-side caching reduces API calls

## Environment Variables

No public environment variables needed in current setup.

Django API URL is hardcoded in `lib/server/user.ts`:
- Production: `https://www.masinyusane.org/api/me/`
- Can be moved to environment variable if needed for local development

## Key Benefits of Current Approach

- ✅ **Simple**: No complex client-side state management
- ✅ **Fast**: User data ready on initial render (no loading spinner)
- ✅ **Secure**: API calls happen server-side with proper authentication
- ✅ **DX**: Clean separation between server fetching and client access
- ✅ **Scalable**: Easy to add new user-dependent features
- ✅ **Django as source of truth**: Roles managed in Django admin
- ✅ **Next.js App Router native**: Uses RSC patterns correctly

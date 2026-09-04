// components/providers/UserProvider.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';

// Django role choices (stored values from UserProfile.ROLE_CHOICES)
export type UserRole = 
  | 'ADMIN'
  | 'STAFF'
  | 'PROJECT MANAGER'
  | 'MENTOR'
  | 'VIEWER'
  | 'FUNDER'
  | 'YOUTH';

// Matches Django User + UserProfile serialized response from /api/me/
export type UserProfile = {
  // From Django User model
  username: string;           // required in Django User
  email: string;             // required in Django User
  first_name?: string;       // optional in Django User (blank=True)
  last_name?: string;        // optional in Django User (blank=True)
  
  // From Django UserProfile model
  role: UserRole;            // required, has default='VIEWER'
  capabilities: string[];    // sorted application grants from /api/me/
  job_title?: string;        // optional (blank=True, null=True)
  project?: string;          // optional (blank=True, null=True)
  
  // May be included in API response
  id?: string | number;      // Django primary key (if included)
};

const UserContext = createContext<UserProfile | null>(null);

export function UserProvider({ 
  children, 
  user 
}: { 
  children: ReactNode;
  user: UserProfile | null;
}) {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  // You could throw here if context is undefined, or return null
  return context;
}

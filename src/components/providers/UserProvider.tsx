// components/providers/UserProvider.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';

type UserProfile = {
  id: string;
  role: string;
  email: string;
  // ... other fields from your Django API
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
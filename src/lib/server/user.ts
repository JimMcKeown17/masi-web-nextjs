// lib/server/user.ts
import { auth } from '@clerk/nextjs/server';
import { cache } from 'react';

import type { UserProfile } from '@/components/providers/UserProvider';
import { userProfileRequestInit } from '@/lib/server/user-request';

export const getUserProfile = cache(async (): Promise<UserProfile | null> => {
  const { userId, getToken } = await auth();

  if (!userId) return null;

  try {
    const token = await getToken();
    if (!token) return null;
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/me/`,
      userProfileRequestInit(token),
    );

    if (response.ok) {
      return await response.json() as UserProfile;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }

  return null;
});

// lib/server/user.ts
import { auth } from '@clerk/nextjs/server';

export async function getUserProfile() {
  const { userId } = await auth();
  
  if (!userId) return null;

  try {
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
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
  
  return null;
}

async function getClerkToken() {
  const { getToken } = await auth();
  return getToken();
}
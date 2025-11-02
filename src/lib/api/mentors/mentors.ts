// lib/api/mentors.ts
import type { User } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMentors(token: string): Promise<User[]> {
  const response = await fetch(`${API_URL}/mentors/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch mentors');
  }

  return response.json();
}
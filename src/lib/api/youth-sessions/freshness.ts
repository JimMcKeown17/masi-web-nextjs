import type { YouthSessionFreshness } from '@/lib/types/youth-sessions';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getYouthSessionFreshness(
  token: string
): Promise<YouthSessionFreshness> {
  const response = await fetch(`${API_URL}/youth-sessions/freshness/`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to verify session data freshness');
  return response.json();
}

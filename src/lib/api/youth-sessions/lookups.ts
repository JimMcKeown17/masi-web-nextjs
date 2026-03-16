import type { LookupsResponse } from '@/lib/types/youth-sessions';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getLookups(token: string): Promise<LookupsResponse> {
  const res = await fetch(`${API_URL}/youth-sessions/lookups/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch lookups');
  return res.json();
}

import type { InactiveYouthResponse, YouthSessionsFilters } from '@/lib/types/youth-sessions';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getInactiveYouth(
  token: string,
  filters?: YouthSessionsFilters & { days?: number }
): Promise<InactiveYouthResponse> {
  const params = new URLSearchParams();
  if (filters?.days) params.append('days', filters.days.toString());
  if (filters?.programme && filters.programme !== 'all') params.append('programme', filters.programme);
  if (filters?.mentor_id) params.append('mentor_id', filters.mentor_id);
  if (filters?.school_uid) params.append('school_uid', filters.school_uid);
  if (filters?.youth_uid) params.append('youth_uid', filters.youth_uid);
  // date_from/date_to intentionally not forwarded: this endpoint's window is "last N working days".

  const url = `${API_URL}/youth-sessions/inactive-youth/${params.toString() ? `?${params}` : ''}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch inactive youth');
  return res.json();
}

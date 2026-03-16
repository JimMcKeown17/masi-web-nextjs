import type { YouthSessionsSummary, YouthSessionsFilters } from '@/lib/types/youth-sessions';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getYouthSessionsSummary(
  token: string,
  filters?: YouthSessionsFilters
): Promise<YouthSessionsSummary> {
  const params = new URLSearchParams();
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.programme && filters.programme !== 'all') params.append('programme', filters.programme);
  if (filters?.youth_uid) params.append('youth_uid', filters.youth_uid);
  if (filters?.school_uid) params.append('school_uid', filters.school_uid);
  if (filters?.mentor_id) params.append('mentor_id', filters.mentor_id);

  const url = `${API_URL}/youth-sessions/summary/${params.toString() ? `?${params}` : ''}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch youth sessions summary');
  return res.json();
}

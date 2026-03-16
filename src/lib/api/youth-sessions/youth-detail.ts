import type { YouthDetailResponse, YouthSessionsFilters } from '@/lib/types/youth-sessions';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getYouthDetail(
  token: string,
  youthUid: string,
  filters?: Pick<YouthSessionsFilters, 'date_from' | 'date_to'>
): Promise<YouthDetailResponse> {
  const params = new URLSearchParams();
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  const url = `${API_URL}/youth-sessions/youth-detail/${youthUid}/${params.toString() ? `?${params}` : ''}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch youth detail');
  return res.json();
}

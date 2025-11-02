// lib/api/yebo-visits.ts
import type { YeboVisit, CreateYeboVisitData, MentorVisitFilters } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getYeboVisits(
  token: string,
  filters?: MentorVisitFilters
): Promise<YeboVisit[]> {
  const params = new URLSearchParams();
  if (filters?.time_filter) params.append('time_filter', filters.time_filter);
  if (filters?.school) params.append('school', filters.school);
  if (filters?.mentor) params.append('mentor', filters.mentor);

  const url = `${API_URL}/yebo-visits/${params.toString() ? `?${params}` : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Yebo visits');
  }

  return response.json();
}

export async function createYeboVisit(
  token: string,
  data: CreateYeboVisitData
): Promise<YeboVisit> {
  const response = await fetch(`${API_URL}/yebo-visits/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create Yebo visit');
  }

  return response.json();
}
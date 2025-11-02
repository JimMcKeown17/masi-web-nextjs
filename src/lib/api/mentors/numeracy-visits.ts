// lib/api/numeracy-visits.ts
import type { NumeracyVisit, CreateNumeracyVisitData, MentorVisitFilters } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getNumeracyVisits(
  token: string,
  filters?: MentorVisitFilters
): Promise<NumeracyVisit[]> {
  const params = new URLSearchParams();
  if (filters?.time_filter) params.append('time_filter', filters.time_filter);
  if (filters?.school) params.append('school', filters.school);
  if (filters?.mentor) params.append('mentor', filters.mentor);

  const url = `${API_URL}/numeracy-visits/${params.toString() ? `?${params}` : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Numeracy visits');
  }

  return response.json();
}

export async function createNumeracyVisit(
  token: string,
  data: CreateNumeracyVisitData
): Promise<NumeracyVisit> {
  const response = await fetch(`${API_URL}/numeracy-visits/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create Numeracy visit');
  }

  return response.json();
}
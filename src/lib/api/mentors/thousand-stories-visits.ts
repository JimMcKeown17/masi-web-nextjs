// lib/api/thousand-stories-visits.ts
import type { ThousandStoriesVisit, CreateThousandStoriesVisitData, MentorVisitFilters } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getThousandStoriesVisits(
  token: string,
  filters?: MentorVisitFilters
): Promise<ThousandStoriesVisit[]> {
  const params = new URLSearchParams();
  if (filters?.time_filter) params.append('time_filter', filters.time_filter);
  if (filters?.school) params.append('school', filters.school);
  if (filters?.mentor) params.append('mentor', filters.mentor);

  const url = `${API_URL}/thousand-stories-visits/${params.toString() ? `?${params}` : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch 1000 Stories visits');
  }

  return response.json();
}

export async function createThousandStoriesVisit(
  token: string,
  data: CreateThousandStoriesVisitData
): Promise<ThousandStoriesVisit> {
  const response = await fetch(`${API_URL}/thousand-stories-visits/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create 1000 Stories visit');
  }

  return response.json();
}
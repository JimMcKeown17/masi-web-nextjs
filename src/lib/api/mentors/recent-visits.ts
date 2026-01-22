// lib/api/mentors/recent-visits.ts
import { RecentVisitsResponse, RecentVisitsFilters } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Fetch recent visits across all programs
 * Returns a unified list of visits sorted by date (most recent first)
 */
export async function getRecentVisits(
  token: string,
  filters?: RecentVisitsFilters
): Promise<RecentVisitsResponse> {
  const params = new URLSearchParams();

  if (filters?.time_filter) {
    params.append('time_filter', filters.time_filter);
  }
  if (filters?.school) {
    params.append('school', filters.school);
  }
  if (filters?.mentor) {
    params.append('mentor', filters.mentor);
  }
  if (filters?.limit) {
    params.append('limit', filters.limit.toString());
  }

  const queryString = params.toString();
  const url = `${API_URL}/recent-visits/${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch recent visits: ${response.statusText}`);
  }

  return response.json();
}

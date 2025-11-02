// lib/api/dashboard.ts
import type { DashboardSummary, DashboardFilters } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getDashboardSummary(
  token: string,
  filters?: DashboardFilters
): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (filters?.time_filter) params.append('time_filter', filters.time_filter);
  if (filters?.school) params.append('school', filters.school);
  if (filters?.mentor) params.append('mentor', filters.mentor);

  const url = `${API_URL}/dashboard-summary/${params.toString() ? `?${params}` : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard summary');
  }

  return response.json();
}
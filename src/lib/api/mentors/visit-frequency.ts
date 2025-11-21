// lib/api/mentors/visit-frequency.ts
import type { VisitFrequencyResponse, VisitFrequencyData } from '@/lib/types/visit-frequency';
import type { DashboardFilters } from '@/lib/types';
import type { MentorVisit, YeboVisit, ThousandStoriesVisit, NumeracyVisit } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RawVisit {
  visit_date: string;
}

export async function getVisitFrequency(
  token: string,
  filters?: DashboardFilters
): Promise<VisitFrequencyResponse> {
  const params = new URLSearchParams();
  if (filters?.time_filter) params.append('time_filter', filters.time_filter);
  if (filters?.school) params.append('school', filters.school);
  if (filters?.mentor) params.append('mentor', filters.mentor);
  
  const queryString = params.toString() ? `?${params}` : '';

  // Fetch all visit types in parallel
  const [literacyVisits, yeboVisits, storiesVisits, numeracyVisits] = await Promise.all([
    fetch(`${API_URL}/mentor-visits/${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : []),
    
    fetch(`${API_URL}/yebo-visits/${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : []),
    
    fetch(`${API_URL}/thousand-stories-visits/${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : []),
    
    fetch(`${API_URL}/numeracy-visits/${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(r => r.ok ? r.json() : []),
  ]) as [MentorVisit[], YeboVisit[], ThousandStoriesVisit[], NumeracyVisit[]];

  // Aggregate by month
  const monthlyData = new Map<string, VisitFrequencyData>();

  const addToMonth = (date: string, program: keyof Pick<VisitFrequencyData, 'literacy_visits' | 'yebo_visits' | 'stories_visits' | 'numeracy_visits'>) => {
    const monthKey = date.substring(0, 7); // YYYY-MM format
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, {
        time_period: monthKey,
        literacy_visits: 0,
        yebo_visits: 0,
        stories_visits: 0,
        numeracy_visits: 0,
      });
    }
    
    const entry = monthlyData.get(monthKey)!;
    entry[program]++;
  };

  // Process each visit type
  literacyVisits.forEach((visit: RawVisit) => addToMonth(visit.visit_date, 'literacy_visits'));
  yeboVisits.forEach((visit: RawVisit) => addToMonth(visit.visit_date, 'yebo_visits'));
  storiesVisits.forEach((visit: RawVisit) => addToMonth(visit.visit_date, 'stories_visits'));
  numeracyVisits.forEach((visit: RawVisit) => addToMonth(visit.visit_date, 'numeracy_visits'));

  // Convert to array and sort by date
  const data = Array.from(monthlyData.values())
    .sort((a, b) => a.time_period.localeCompare(b.time_period))
    .map(entry => ({
      ...entry,
      time_period: formatMonthYear(entry.time_period),
    }));

  return { data };
}

function formatMonthYear(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}


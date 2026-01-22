// lib/types/recent-visit.ts
// Unified visit type that combines data from all program types

export interface RecentVisit {
  id: string; // Format: "programType-visitId" (e.g., "literacy-123")
  program_name: 'MASI Literacy' | 'Yebo' | '1000 Stories' | 'Numeracy';
  program_type: 'literacy' | 'yebo' | 'stories' | 'numeracy';
  school_name: string;
  visit_date: string; // ISO date format (YYYY-MM-DD)
  session_quality: number | null; // 1-10 rating
  comments: string;
  mentor_name: string;
}

export interface RecentVisitsResponse {
  visits: RecentVisit[];
  total_count: number;
}

export interface RecentVisitsFilters {
  time_filter?: '7days' | '30days' | '90days' | 'thisyear' | 'all';
  school?: string;
  mentor?: string;
  limit?: number;
}

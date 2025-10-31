// lib/types/dashboard.ts
export interface DashboardSummary {
    total_visits: number;
    recent_visits: number;
    schools_visited: number;
    avg_quality: number;
    literacy_visits: number;
    literacy_recent_visits: number;
    yebo_visits: number;
    yebo_recent_visits: number;
    stories_visits: number;
    stories_recent_visits: number;
    numeracy_visits: number;
    numeracy_recent_visits: number;
  }
  
  export interface DashboardFilters {
    time_filter?: '7days' | '30days' | '90days' | 'thisyear' | 'all';
    school?: string;
    mentor?: string;
  }
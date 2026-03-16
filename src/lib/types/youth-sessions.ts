export interface YouthSessionsFilters {
  date_from?: string;
  date_to?: string;
  programme?: 'literacy' | 'numeracy' | 'all';
  youth_uid?: string;
  school_uid?: string;
  mentor_id?: string;
}

export interface YouthSessionsSummary {
  total_sessions_today: number;
  total_sessions_this_week: number;
  total_sessions_this_month: number;
  active_youth_today: number;
  active_youth_this_week: number;
  total_active_youth: number;
  inactive_youth_2_days: number;
  schools_covered_today: number;
  total_schools: number;
  avg_sessions_per_youth_this_week: number;
  literacy_sessions: number;
  numeracy_sessions: number;
}

export interface DailyActivityEntry {
  date: string;
  primary_school: number;
  ecd: number;
  other: number;
  total: number;
}

export interface DailyActivityResponse {
  data: DailyActivityEntry[];
}

export interface YouthHeatmapEntry {
  youth_uid: string;
  full_name: string;
  mentor_name: string;
  daily_counts: number[];
  total_active_days: number;
  total_sessions: number;
}

export interface YouthHeatmapResponse {
  dates: string[];
  youth: YouthHeatmapEntry[];
}

export interface InactiveYouthEntry {
  youth_uid: string;
  full_name: string;
  mentor_name: string;
  school_name: string;
  last_session_date: string | null;
  days_inactive: number | null;
  total_sessions_this_month: number;
}

export interface InactiveYouthResponse {
  inactive_youth: InactiveYouthEntry[];
}

export interface CoveredSchool {
  school_uid: string;
  name: string;
  type: string;
  session_count: number;
  youth_count: number;
}

export interface UncoveredSchool {
  school_uid: string;
  name: string;
  type: string;
  last_session_date: string | null;
}

export interface SchoolCoverageResponse {
  covered: CoveredSchool[];
  uncovered: UncoveredSchool[];
}

export interface YouthDailySession {
  date: string;
  literacy: number;
  numeracy: number;
}

export interface YouthDetailResponse {
  youth_uid: string;
  full_name: string;
  mentor_name: string;
  school_name: string;
  total_sessions: number;
  total_sessions_this_month: number;
  avg_sessions_per_day: number;
  days_with_no_sessions: number;
  total_working_days: number;
  children_worked_with: number;
  daily_sessions: YouthDailySession[];
}

export interface LookupYouth {
  youth_uid: string;
  full_name: string;
}

export interface LookupSchool {
  school_uid: string;
  name: string;
  type: string;
}

export interface LookupMentor {
  id: number;
  name: string;
}

export interface LookupsResponse {
  youth: LookupYouth[];
  schools: LookupSchool[];
  mentors: LookupMentor[];
}

export type AssessmentType = "letters" | "words" | string;

export interface StaffRosterRow {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  assigned_school: string | null;
  children_count: number;
  sessions_count: number;
  assessments_count: number;
  last_activity: string | null;
}

export interface AssessmentResultRow {
  id: string;
  user_id: string;
  coach_name: string | null;
  child_id: string;
  child_name: string | null;
  assessment_type: AssessmentType | null;
  accuracy: number | null;
  correct_responses: number | null;
  date_assessed: string;
}

export interface TableHealthRow {
  table: string;
  total: number;
  // Rows with created_at in the last 7 days — a flow signal ("is sync
  // happening?") rather than a pending-queue signal. The cloud `synced`
  // column is NOT a useful pending indicator because the mobile app
  // (offlineSync.js:122) strips `synced` from every upsert payload, so
  // cloud rows all carry the column default (false) and never get flipped.
  last_7d: number;
  error?: string;
}

export interface InactiveStaffRow {
  id: string;
  first_name: string;
  last_name: string;
  assigned_school: string | null;
  last_activity: string | null;
}

export interface SyncHealthSnapshot {
  tables: TableHealthRow[];
  activity_24h: number;
  inactive_staff: InactiveStaffRow[];
}

export interface CoachProfile {
  id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  assigned_school: string | null;
  created_at: string | null;
}

export interface CoachChild {
  id: string;
  first_name: string;
  last_name: string;
  teacher: string | null;
  class: string | null;
  school: string | null;
  age: number | null;
  assigned_at: string | null;
}

export interface CoachSession {
  id: string;
  session_type: string | null;
  // Prod column is `session_date` (DATE). Earlier iterations of this code
  // used `date`, which does not exist in the Masi Supabase schema — that was
  // a Phase 1 exploration note error. Keep the name aligned with the column.
  session_date: string | null;
  created_at: string;
  notes: string | null;
  children_count: number;
}

export interface CoachAssessment {
  id: string;
  child_id: string;
  child_name: string | null;
  assessment_type: AssessmentType | null;
  accuracy: number | null;
  correct_responses: number | null;
  date_assessed: string;
}

export interface CoachDetail {
  profile: CoachProfile | null;
  children: CoachChild[];
  sessions: CoachSession[];
  assessments: CoachAssessment[];
}

export interface FetchResult<T> {
  data: T;
  isLive: boolean;
}

export const EMPTY_ROSTER: StaffRosterRow[] = [];

export const EMPTY_ASSESSMENT_RESULTS: AssessmentResultRow[] = [];

export const EMPTY_SYNC_HEALTH: SyncHealthSnapshot = {
  tables: [],
  activity_24h: 0,
  inactive_staff: [],
};

export const EMPTY_COACH_DETAIL: CoachDetail = {
  profile: null,
  children: [],
  sessions: [],
  assessments: [],
};

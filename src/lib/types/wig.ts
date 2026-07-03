// Types for the WIG (Wildly Important Goals) dashboard.
// Mirrors the backend payloads from /api/wig/* (see backend api/wig_metrics.py
// and documentation/dashboard-log.md).

export type RagStatus = "green" | "amber" | "red" | "none";
export type Direction = "gte" | "lte";
export type ValueScale = "percent" | "ratio" | "per_day" | "count";
export type WigPeriod = "week" | "month" | "programme_year";

export interface MeasureValue {
  value: number | null;
  numerator?: number;
  denominator?: number;
  target?: number | null; // present on Zazi measures (Zazi supplies its own)
  eligible_entity_count?: number;
  incomplete_count?: number;
  calculation_note?: string;
}

export interface WigWindow {
  period: WigPeriod;
  date_from: string;
  date_to: string;
  working_days: number;
  data_as_of: string;
}

export interface LeadMeasuresPayload {
  window: WigWindow;
  measures: Record<string, MeasureValue>;
}

export interface DataQualityPayload {
  scope: string;
  measures: Record<string, MeasureValue>;
}

export interface ZaziPayload {
  // Availability is per programme key (e.g. "zazi_izandi", "zazi_izandi_ecd")
  // since each Zazi segment is fetched/cached independently.
  available: Record<string, boolean>;
  source?: string;
  generated_at?: string;
  fetched_at?: Record<string, string | null>;
  measures: Record<string, MeasureValue>;
}

// --- Outcome (lag) measures for hero WIG rings (GET /api/wig/outcomes/) ---

export interface OutcomeTermStat {
  value: number; // fraction 0..1
  numerator: number;
  denominator: number;
  term: string; // "Jan" | "Jun" | "Nov"
}

export interface WigOutcome extends OutcomeTermStat {
  cohort_total: number; // full grade cohort on the roster (assessed or not)
  baseline: OutcomeTermStat | null;
  calculation_note?: string;
}

export interface OutcomesPayload {
  available: boolean;
  source_note: string | null;
  outcomes: Record<string, WigOutcome | null>;
  data_as_of?: string;
}

// --- Board configuration (defines what renders; see lib/wig/config.ts) ---

export interface MeasureConfig {
  key: string; // source key into the merged measures map
  label: string;
  unit?: string; // small text under the ring number, e.g. "/ day", "%"
  scale: ValueScale;
  target: number; // fallback target (a Zazi payload target overrides this)
  direction: Direction;
  glossary: { intent: string; source: string; formula: string };
}

export interface ProgrammeConfig {
  key: string;
  label: string;
  featured?: boolean;
  accent?: string; // hex accent for the WIG banner/tag
  wig: { statement: string; awaitingLabel: string; target?: number };
  measures: MeasureConfig[];
}

// --- Drill-down detail payloads (GET /api/wig/detail/), discriminated by `kind` ---

export interface HeatmapWeek {
  start: string;
  label: string;
}

export interface HeatmapRow {
  youth_uid: string;
  full_name: string;
  mentor_name: string;
  weekly_counts: number[];
  total: number;
}

export interface SessionHeatmapDetail {
  kind: "session_heatmap";
  weeks: HeatmapWeek[];
  rows: HeatmapRow[];
}

export interface CoveredSchoolDetail {
  school_uid: string;
  name: string;
  type: string;
  session_count: number;
  youth_count: number;
}

export interface UncoveredSchoolDetail {
  school_uid: string;
  name: string;
  type: string;
  last_session_date: string | null;
}

export interface CoverageDetail {
  kind: "coverage";
  covered: CoveredSchoolDetail[];
  uncovered: UncoveredSchoolDetail[];
}

export interface DetailColumn {
  key: string;
  label: string;
}

export interface VisitRow {
  visit_date: string;
  mentor_name: string;
  school_name: string;
  school_type: string;
  flags: Record<string, boolean | null>;
  compliant: boolean;
}

export interface VisitTableDetail {
  kind: "visit_table";
  columns: DetailColumn[];
  visits: VisitRow[];
}

export interface DqRecordsDetail {
  kind: "dq_records";
  title: string;
  columns: DetailColumn[];
  rows: Record<string, string | number | null>[];
  total_flagged: number;
  note: string;
}

export interface NoneDetail {
  kind: "none";
}

export type WigDetail =
  | SessionHeatmapDetail
  | CoverageDetail
  | VisitTableDetail
  | DqRecordsDetail
  | NoneDetail;

// Types for the School Programme Grid (/operations/school-programme-grid).
// Mirror the backend api.school_programme.build_grid response.

export type CountSource = "computed" | "manual";
export type CountBasis = "child_level" | "whole_school" | "percent_of_school";

export interface Programme {
  key: string;
  label: string;
}

export interface GridCell {
  id: number;
  children_count: number | null;
  count_source: CountSource;
  count_basis: CountBasis;
  percent_of_school: number | null;
  youth_planned: number | null;
  youth_active: number;
  as_of: string | null;
  updated_at: string | null;
  editable: boolean; // manual children_count is human-editable; computed is read-only
}

export interface GridStats {
  id: number;
  total_kids_in_school: number | null;
  pct_african: number | null;
  pct_coloured: number | null;
  pct_white: number | null;
  pct_female: number | null;
  demographic_source: string;
  unique_beneficiaries: number | null;
  as_of: string | null;
  updated_at: string | null;
}

export interface GridSchool {
  school_uid: string | null;
  name: string;
  site_type: string | null; // normalized: "Primary" | "ECD" | null
  stats: GridStats | null;
  cells: Record<string, GridCell>; // keyed by programme key
}

export interface ReachEntry {
  school: string;
  school_uid: string | null;
  programmes: string[];
}

// The persisted nightly-refresh integrity report (api.school_programme.build_grid_health).
export interface GridHealth {
  as_of: string;
  year: number;
  summary: { schools_processed: number; rows_created: number; rows_updated: number };
  rollup: { children: number; sites_total: number; schools_primary: number; schools_ecd: number } | null;
  reach_without_identities: {
    total: number;
    buckets: {
      zazi_sourced: ReachEntry[]; // Zazi identities live in a separate backend — expected
      masi_staffing: ReachEntry[]; // a Masi coach is placed but no 2026 sessions matched yet
      manual_count: ReachEntry[]; // a manual aggregate (e.g. 1000 Stories) with no identities
    };
    by_programme_set: { programmes: string[]; count: number }[];
  };
  schools_missing_uid: string[];
  site_assigned_no_school: Record<string, number>;
  // Active youth whose school FK points at a row outside the grid (a legacy
  // is_active=false duplicate, or a non-grid-eligible type). Optional: reports
  // persisted before 2026-07-27 predate the flag.
  youth_on_nongrid_schools?: {
    school: string;
    school_id: number;
    school_is_active: boolean | null;
    youth: number;
  }[];
  unmapped_job_titles: Record<string, number>;
  unresolved_zazi_participants: number;
  unmapped_zazi_schools: string[];
  unknown_site_type_tokens: string[];
  off_grid_roster: Record<string, number>;
}

export interface SchoolProgrammeGrid {
  year: number;
  programmes: Programme[];
  schools: GridSchool[];
  roster: Record<string, number>; // site-unassigned youth by job title
  health: GridHealth | null; // null until a nightly refresh has persisted a report
}

export interface CellEdit {
  children_count?: number | null;
  percent_of_school?: number | null;
  youth_planned?: number | null;
}

export interface StatsEdit {
  total_kids_in_school?: number | null;
  pct_african?: number | null;
  pct_coloured?: number | null;
  pct_white?: number | null;
  demographic_source?: string;
}

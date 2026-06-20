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

export interface SchoolProgrammeGrid {
  year: number;
  programmes: Programme[];
  schools: GridSchool[];
  roster: Record<string, number>; // site-unassigned youth by job title
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

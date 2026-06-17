export interface PublishedStat {
  key: string;
  value: string;
  numeric_value: number | null;
  numeric_value_secondary: number | null;
  label: string;
  description: string;
  source_system: string;
  population: string;
  comparison_type: "none" | "comparison_group" | "control_group" | "benchmark";
  as_of: string;
  methodology_note: string;
  group: string;
  sort_order: number;
}

export interface PublishedStatsPayload {
  stats: Record<string, PublishedStat>;
  groups: Record<string, string[]>;
  verified_through: string | null;
}

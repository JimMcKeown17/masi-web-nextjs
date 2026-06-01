// Types for the WIG (Wildly Important Goals) dashboard.
// Mirrors the backend payloads from /api/wig/* (see backend api/wig_metrics.py
// and documentation/dashboard-log.md).

export type RagStatus = "green" | "amber" | "red" | "none";
export type Direction = "gte" | "lte";
export type ValueScale = "percent" | "ratio" | "per_day" | "count";

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
  period: string;
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
  available: boolean;
  source?: string;
  generated_at?: string;
  measures: Record<string, MeasureValue>;
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
  wig: { statement: string; awaitingLabel: string };
  measures: MeasureConfig[];
}

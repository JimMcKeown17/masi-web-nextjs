// Impact Data Portal — Zazi iZandi Programmatic view (Slice 1).
// Shape mirrors the Masi backend proxy of the Zazi backend's
// /api/programmatic-impact-2026/ payload (recomputed & verified server-side).

export interface CohortResult {
  n: number;
  avg_gain: number;
  baseline_pct: number;
  midline_pct: number;
}

export interface BenchmarkMovement {
  population: string; // e.g. "treatment+sef" (Masi-taught learners)
  n: number;
  baseline_at: number;
  midline_at: number;
  baseline_pct: number;
  midline_pct: number;
}

export interface ZaziProgrammaticPayload {
  programme: string; // "Zazi iZandi"
  view: string; // "programmatic"
  metric: string; // "letters_correct_per_minute"
  grade: string; // "Grade 1"
  benchmark_lpm: number; // 40
  national_average_pct: number; // 27
  as_of: string; // ISO date of the latest assessment response
  results: {
    g1_benchmark_movement: BenchmarkMovement; // flagship #1
    g1_treatment_vs_control: {
      treatment: CohortResult;
      control: CohortResult;
      sef: CohortResult;
    }; // flagship #2
  };
}

import { ZaziProgrammaticPayload } from "@/lib/types/data-portal";

// Verified Zazi Programmatic payload, data as of 2026-06-17 (reconciled against
// the Zazi prod DB: Python aggregation == SQL to the decimal). Used for local
// visual checks and component tests, NOT shipped in the live page (which fetches
// the Masi proxy).
export const ZAZI_PROGRAMMATIC_SAMPLE: ZaziProgrammaticPayload = {
  programme: "Zazi iZandi",
  view: "programmatic",
  metric: "letters_correct_per_minute",
  grade: "Grade 1",
  benchmark_lpm: 40,
  national_average_pct: 27,
  as_of: "2026-06-17",
  results: {
    g1_benchmark_movement: {
      population: "treatment+sef",
      n: 2270,
      baseline_at: 36,
      midline_at: 363,
      baseline_pct: 1.6,
      midline_pct: 16.0,
    },
    g1_treatment_vs_control: {
      treatment: { n: 1654, avg_gain: 11.7, baseline_pct: 1.9, midline_pct: 16.2 },
      control: { n: 910, avg_gain: 7.0, baseline_pct: 3.8, midline_pct: 11.2 },
      sef: { n: 616, avg_gain: 11.8, baseline_pct: 0.6, midline_pct: 15.6 },
    },
  },
};

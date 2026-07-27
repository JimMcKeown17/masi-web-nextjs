// The WIG board definition: programmes -> WIG + leading measures. Targets,
// directions, scales and glossary text live here (config-driven, not a DB, for
// v1). Measure `key`s match the backend payload keys exactly.
import type { ProgrammeConfig } from "@/lib/types/wig";

const ratioGlossary = {
  active: {
    intent: "Is the whole team showing up, not just a subset?",
    source: "2026 sessions + Youth (active, started)",
    formula: "coaches with ≥1 session / eligible coaches",
  },
  coverage: {
    intent: "Are we reaching the schools we staffed this week?",
    source: "2026 sessions + Youth.school",
    formula: "assigned schools reached / schools with ≥1 active coach",
  },
};

export const PROGRAMMES: ProgrammeConfig[] = [
  {
    key: "zazi_izandi",
    label: "Zazi iZandi · Primary",
    featured: true,
    accent: "#7c3aed",
    wig: {
      statement:
        "67% of Gr R reach 20 letters/min · 67% of Gr 1 reach 40 · 40% of Gr 2",
      awaitingLabel: "Awaiting midline assessment",
    },
    measures: [
      {
        key: "zazi.pct_eas_on_track",
        label: "EAs on track",
        unit: "%",
        scale: "percent",
        target: 80,
        direction: "gte",
        glossary: {
          intent: "Share of Education Assistants hitting the daily dosage bar.",
          source: "Zazi backend · programme-overview API (Primary cohort)",
          formula: "pre-computed by Zazi vs target_on_track_pct",
        },
      },
      {
        key: "zazi.sessions_per_day",
        label: "Sessions/day",
        unit: "/ day",
        scale: "per_day",
        target: 2.5,
        direction: "gte",
        glossary: {
          intent: "Average sessions per day worked, across all EAs.",
          source: "Zazi backend (Primary cohort)",
          formula: "avg_sessions_per_day_worked",
        },
      },
      {
        key: "zazi.weighted_dosage",
        label: "Weighted dosage",
        unit: "dose",
        scale: "per_day",
        target: 2.5,
        direction: "gte",
        glossary: {
          intent: "Enrolment-weighted sessions per child per week.",
          source: "Zazi backend (Primary cohort)",
          formula: "Σ(group sessions × size) / children",
        },
      },
    ],
  },
  {
    key: "zazi_izandi_ecd",
    label: "Zazi iZandi · ECD",
    featured: true,
    accent: "#9333ea",
    wig: {
      statement: "ECD children master 20+ letter sounds before Grade R",
      awaitingLabel: "Awaiting midline assessment",
    },
    measures: [
      {
        key: "zazi_ecd.pct_eas_on_track",
        label: "EAs on track",
        unit: "%",
        scale: "percent",
        target: 80,
        direction: "gte",
        glossary: {
          intent: "Share of ECD Education Assistants hitting the daily dosage bar.",
          source: "Zazi backend · programme-overview API (ECD cohort)",
          formula: "pre-computed by Zazi vs target_on_track_pct",
        },
      },
      {
        key: "zazi_ecd.sessions_per_day",
        label: "Sessions/day",
        unit: "/ day",
        scale: "per_day",
        target: 2.5,
        direction: "gte",
        glossary: {
          intent: "Average sessions per day worked, across ECD EAs.",
          source: "Zazi backend (ECD cohort)",
          formula: "avg_sessions_per_day_worked",
        },
      },
      {
        key: "zazi_ecd.weighted_dosage",
        label: "Weighted dosage",
        unit: "dose",
        scale: "per_day",
        target: 2.5,
        direction: "gte",
        glossary: {
          intent: "Enrolment-weighted sessions per child per week (ECD).",
          source: "Zazi backend (ECD cohort)",
          formula: "Σ(group sessions × size) / children",
        },
      },
    ],
  },
  {
    key: "core_literacy",
    label: "Core Literacy",
    wig: {
      statement: "50% of Grade 1 children read 16+ words per minute",
      awaitingLabel: "Awaiting baseline assessment",
      target: 0.5,
    },
    measures: [
      {
        key: "core_literacy.sessions_per_day",
        label: "Sessions/day",
        unit: "/ day",
        scale: "per_day",
        target: 2.5,
        direction: "gte",
        glossary: {
          intent: "Are coaches teaching often enough each day to move children?",
          source: "literacy_sessions_2026 (Masi PG), primary sites",
          formula: "sessions / (eligible coaches × working days)",
        },
      },
      {
        key: "core_literacy.active_coaches",
        label: "Active coaches",
        unit: "%",
        scale: "ratio",
        target: 0.9,
        direction: "gte",
        glossary: ratioGlossary.active,
      },
      {
        key: "core_literacy.school_coverage",
        label: "Coverage",
        unit: "%",
        scale: "ratio",
        target: 0.9,
        direction: "gte",
        glossary: ratioGlossary.coverage,
      },
      {
        key: "core_literacy.tracker_compliance",
        label: "Tracker compliance",
        unit: "%",
        scale: "ratio",
        target: 0.9,
        direction: "gte",
        glossary: {
          intent: "Are coaches using their letter/reading/session trackers?",
          source: "MentorVisit observation visits at primary sites",
          formula: "visits with all trackers correct / observation visits",
        },
      },
      {
        key: "core_literacy.school_visits",
        label: "Visits/wk",
        unit: "/ wk",
        scale: "count",
        target: 5,
        direction: "gte",
        glossary: {
          intent: "Are mentors getting into schools enough to support coaches?",
          source: "MentorVisit observation visits",
          formula: "observation visits / distinct mentors",
        },
      },
    ],
  },
  {
    key: "ecd_literacy",
    label: "ECD Literacy",
    wig: {
      statement: "75% of children learn 20+ letter sounds",
      awaitingLabel: "Awaiting baseline assessment",
      target: 0.75,
    },
    measures: [
      {
        key: "ecd_literacy.sessions_per_day",
        label: "Sessions/day",
        unit: "/ day",
        scale: "per_day",
        target: 3.5,
        direction: "gte",
        glossary: {
          intent: "Are coaches teaching often enough each day at ECD sites?",
          source: "literacy_sessions_2026 (Masi PG), ECD sites",
          formula: "sessions / (eligible coaches × working days)",
        },
      },
      {
        key: "ecd_literacy.active_coaches",
        label: "Active coaches",
        unit: "%",
        scale: "ratio",
        target: 0.9,
        direction: "gte",
        glossary: ratioGlossary.active,
      },
      {
        key: "ecd_literacy.school_coverage",
        label: "Coverage",
        unit: "%",
        scale: "ratio",
        target: 0.9,
        direction: "gte",
        glossary: ratioGlossary.coverage,
      },
      {
        key: "ecd_literacy.tracker_compliance",
        label: "Tracker compliance",
        unit: "%",
        scale: "ratio",
        target: 0.9,
        direction: "gte",
        glossary: {
          intent: "Are ECD coaches keeping their admin/trackers correct?",
          source: "MentorVisit observation visits at ECD sites",
          formula: "visits with all trackers correct / observation visits",
        },
      },
    ],
  },
  {
    key: "numeracy",
    label: "Numeracy",
    wig: {
      statement: "50% of learners count to 30 by end of 2026",
      awaitingLabel: "Awaiting baseline assessment",
      target: 0.5,
    },
    measures: [
      {
        key: "numeracy.sessions_per_week",
        label: "Sessions/wk",
        unit: "/ wk",
        scale: "count",
        target: 20,
        direction: "gte",
        glossary: {
          intent: "Are numeracy coaches delivering enough sessions weekly?",
          source: "numeracy_sessions_2026 (Masi PG)",
          formula: "sessions this week / eligible coaches",
        },
      },
      {
        key: "numeracy.active_coaches",
        label: "Active coaches",
        unit: "%",
        scale: "ratio",
        target: 0.9,
        direction: "gte",
        glossary: ratioGlossary.active,
      },
      {
        key: "numeracy.school_coverage",
        label: "Coverage",
        unit: "%",
        scale: "ratio",
        target: 0.9,
        direction: "gte",
        glossary: ratioGlossary.coverage,
      },
      {
        key: "numeracy.admin_compliance",
        label: "Admin compliance",
        unit: "%",
        scale: "ratio",
        target: 0.9,
        direction: "gte",
        glossary: {
          intent: "Are numeracy coaches keeping their tracker admin correct?",
          source: "NumeracyVisit observation visits",
          formula: "visits with numeracy_tracker_correct / observation visits",
        },
      },
    ],
  },
  {
    key: "data_team",
    label: "Data Team",
    accent: "#0ea5e9",
    wig: {
      statement: "98% accurate databases",
      awaitingLabel: "Headline accuracy formula being finalised",
    },
    measures: [
      {
        key: "dq.child_fk_resolution",
        label: "Child-FK",
        unit: "%",
        scale: "ratio",
        target: 0.95,
        direction: "gte",
        glossary: {
          intent: "Can we reliably link sessions to specific children?",
          source: "literacy_sessions_2026 child_1 + child_2 slots",
          formula: "resolved slots / (2 × sessions)",
        },
      },
      {
        key: "dq.capture_on_time",
        label: "On-time",
        unit: "%",
        scale: "ratio",
        target: 0.9,
        direction: "gte",
        glossary: {
          intent: "Is session data being captured promptly?",
          source: "literacy_sessions_2026 capture_delay",
          formula: "sessions with 0 ≤ capture_delay ≤ 2 / all",
        },
      },
      {
        key: "dq.duplicate_rate",
        label: "Dup rate",
        unit: "%",
        scale: "ratio",
        target: 0.02,
        direction: "lte",
        glossary: {
          intent: "How much duplicate session data is leaking in? (lower better)",
          source: "literacy_sessions_2026 duplicate_status",
          formula: "duplicate_status='Duplicate' / all",
        },
      },
      {
        key: "dq.site_job_mismatch",
        label: "Mismatch",
        unit: "youth",
        scale: "count",
        target: 0,
        direction: "lte",
        glossary: {
          intent: "Obvious data errors: an ECD job title at a primary site.",
          source: "Youth + School",
          formula: "active youth with ECD title at primary site",
        },
      },
    ],
  },
];

// Assessment term -> display label for the hero WIG ring.
export const TERM_LABELS: Record<string, string> = {
  Jan: "Baseline (Jan)",
  Jun: "Midline (Jun)",
  Nov: "Endline (Nov)",
  baseline: "Baseline",
  midline: "Midline",
  endline: "Endline",
};

// URL slug <-> programme key. Keys use underscores; slugs use hyphens, so the
// route `/operations/wig/core-literacy` maps to the `core_literacy` programme.
export function programmeSlug(key: string): string {
  return key.replace(/_/g, "-");
}

export function programmeBySlug(slug: string): ProgrammeConfig | undefined {
  return PROGRAMMES.find((p) => programmeSlug(p.key) === slug);
}

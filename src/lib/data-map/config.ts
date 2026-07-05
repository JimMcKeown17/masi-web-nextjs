// The Data Map: single source of truth for /operations/data-map.
//
// This file IS the page content. When the wiring changes (a new sync, a new
// dashboard, a steward gets named, a mobile app goes live), update it here
// and the page re-renders itself. Keep facts verifiable against the two
// backend repos; scale figures are labelled with their as-of date below.

export const AS_OF = "July 2026";

// ---------------------------------------------------------------------------
// Roles: the three kinds of data. These drive the colour legend used on every
// section of the page (validated for colour-blind separation on both the
// paper and dark surfaces).
// ---------------------------------------------------------------------------

export type Role = "canonical" | "event" | "derived";

// `light`/`dark` are the mark colours per surface; `deep` is a darker step
// used for text so small type stays WCAG-legible on light tints.
export const ROLE_META: Record<
  Role,
  { label: string; plural: string; light: string; dark: string; deep: string }
> = {
  canonical: {
    label: "Canonical entity",
    plural: "Canonical entities",
    light: "#E72D4D",
    dark: "#EF4A66",
    deep: "#C81E3C",
  },
  event: {
    label: "Event stream",
    plural: "Event streams",
    light: "#1D4ED8",
    dark: "#5A8CEE",
    deep: "#1D4ED8",
  },
  derived: {
    label: "Derived & serving",
    plural: "Derived & serving",
    light: "#B8860B",
    dark: "#BA8C29",
    deep: "#8A6508",
  },
};

// ---------------------------------------------------------------------------
// Capture layer: where staff actually type things in.
// ---------------------------------------------------------------------------

export interface CaptureSource {
  name: string;
  status: "live" | "field test" | "arriving";
  feeds: "Masi backend" | "Zazi backend" | "both backends";
  description: string;
}

export const CAPTURE_SOURCES: CaptureSource[] = [
  {
    name: "Airtable",
    status: "live",
    feeds: "Masi backend",
    description:
      "Staff-facing data entry for Masi programmes: child, school, youth and staff registries, literacy and numeracy sessions, assessments.",
  },
  {
    name: "Teampact",
    status: "live",
    feeds: "Zazi backend",
    description:
      "The app Zazi iZandi EAs use in the field. Every session, EGRA assessment and mentor visit starts life here.",
  },
  {
    name: "Website forms",
    status: "live",
    feeds: "Masi backend",
    description:
      "Mentor visit forms, the closure calendar and grid planning cells write straight into the Masi backend. No sync lag.",
  },
  {
    name: "Masi Field App",
    status: "field test",
    feeds: "Masi backend",
    description:
      "Our mobile app on its own Supabase Postgres. Already visible live at /operations/field-app; will sync into the canonical store.",
  },
  {
    name: "ZZ Mobile App",
    status: "arriving",
    feeds: "Zazi backend",
    description:
      "Zazi iZandi's mobile app, also Supabase-backed. Push notifications are already wired through the Zazi backend.",
  },
];

// ---------------------------------------------------------------------------
// Backends: the two canonical Postgres stores and what lives in each.
// ---------------------------------------------------------------------------

export interface DatasetRow {
  role: Role;
  name: string;
  table: string; // db table (or model) name, shown in mono
  keys: string[]; // the IDs this table carries
  grain?: string; // for events: what one row means
  source: string; // where it comes from + cadence
  scale?: string; // approximate size, as of AS_OF
}

export interface BackendSpec {
  id: "masi" | "zazi";
  name: string;
  db: string;
  stack: string;
  intro: string;
  datasets: DatasetRow[];
  legacyNote: string;
}

export const MASI_BACKEND: BackendSpec = {
  id: "masi",
  name: "Masi backend",
  db: "masi_database",
  stack: "Django + Postgres on Render",
  intro:
    "The organisation's centre of gravity. It owns the canonical registries of children, schools, youth and staff, receives every Masi-programme event from Airtable and the website, and is the only API the website ever calls.",
  datasets: [
    {
      role: "canonical",
      name: "Children",
      table: "canonical_children",
      keys: ["CH-XXXXX", "mcode", "participant_id"],
      source: "Airtable Child Registry, nightly sync",
      scale: "10,700+",
    },
    {
      role: "canonical",
      name: "Schools",
      table: "api_school",
      keys: ["SCH-XXXXX"],
      source: "Airtable schools base, nightly sync",
      scale: "341",
    },
    {
      role: "canonical",
      name: "Youth",
      table: "api_youth",
      keys: ["YTH-XXXX", "employee_id"],
      source: "Airtable youth base, nightly sync",
      scale: "hundreds",
    },
    {
      role: "canonical",
      name: "Staff",
      table: "staff",
      keys: ["employee_number"],
      source: "Airtable staff base, on demand",
    },
    {
      role: "event",
      name: "Literacy sessions",
      table: "literacy_sessions_2026",
      keys: ["CH-XXXXX", "SCH-XXXXX", "YTH-XXXX"],
      grain: "one session with exactly two children",
      source: "Airtable, synced twice daily",
      scale: "thousands, growing daily",
    },
    {
      role: "event",
      name: "Numeracy sessions",
      table: "numeracy_sessions_2026",
      keys: ["CH-XXXXX", "SCH-XXXXX", "YTH-XXXX"],
      grain: "one group session, 3 to 10 children",
      source: "Airtable, synced twice daily",
    },
    {
      role: "event",
      name: "Literacy assessments",
      table: "literacy_assessments_2026",
      keys: ["CH-XXXXX"],
      grain: "one child assessed, per term",
      source: "Airtable Assessments DB, per assessment window",
      scale: "13,800+",
    },
    {
      role: "event",
      name: "Mentor visits",
      table: "api_mentorvisit + 3 sister tables",
      keys: ["SCH-XXXXX"],
      grain: "one school visit (Literacy, Yebo, 1000 Stories, Numeracy)",
      source: "Website forms, written live",
    },
    {
      role: "event",
      name: "School programme grid",
      table: "SchoolProgrammeYear",
      keys: ["SCH-XXXXX"],
      grain: "one school x programme x year cell",
      source: "Nightly recompute + manual planning edits",
    },
    {
      role: "event",
      name: "Closures & absences",
      table: "SchoolClosure / StaffAbsence",
      keys: ["SCH-XXXXX", "YTH-XXXX"],
      grain: "one non-working day",
      source: "Closure calendar, written live",
    },
    {
      role: "derived",
      name: "Published stats",
      table: "PublishedStat",
      keys: [],
      source: "Hand-approved by the data team; the only numbers donors see",
    },
    {
      role: "derived",
      name: "Zazi snapshot",
      table: "ZaziOverviewSnapshot",
      keys: [],
      source: "Cached copy of the Zazi programme overview, refreshed by cron",
    },
    {
      role: "derived",
      name: "Sync log",
      table: "api_airtablesynclog",
      keys: [],
      source: "One row per sync run: counts, errors, health flags",
    },
  ],
  legacyNote:
    "History shelf: WELA assessments (2022 to 2024, keyed on mcode), the 2025 assessment and session tables, and the original Session model. Kept for year-on-year comparisons, no longer synced.",
};

export const ZAZI_BACKEND: BackendSpec = {
  id: "zazi",
  name: "Zazi iZandi backend",
  db: "zazi_izandi_db",
  stack: "Django + Postgres on Render",
  intro:
    "A separate, fully instrumented store for the Zazi iZandi programme. Teampact feeds it nightly; it computes its own summaries and serves aggregates to the Masi backend over a shared-secret API. The website never calls it directly.",
  datasets: [
    {
      role: "canonical",
      name: "Education assistants",
      table: "api_educationassistant",
      keys: ["user_id"],
      source: "Teampact roster + session data",
    },
    {
      role: "canonical",
      name: "Participants",
      table: "teampact_participants",
      keys: ["participant_id"],
      source: "Teampact, nightly sync",
    },
    {
      role: "canonical",
      name: "Identity maps",
      table: "SchoolIdentity2026 / YouthIdentity2026",
      keys: ["SCH-XXXXX", "YTH-XXXX"],
      source: "Pulled from the Masi backend's identity feed",
    },
    {
      role: "event",
      name: "Sessions",
      table: "sessions_2026",
      keys: ["participant_id", "user_id"],
      grain: "one child's attendance at one session, letters taught included",
      source: "Teampact, nightly sync",
      scale: "134,000+",
    },
    {
      role: "event",
      name: "EGRA assessments",
      table: "assessments_2026",
      keys: ["participant_id", "response_id"],
      grain: "one child assessed, per phase (baseline / midline / endline)",
      source: "Teampact surveys, nightly sync",
      scale: "13,600+ (plus 2.3M letter-level detail rows)",
    },
    {
      role: "event",
      name: "Mentor visits",
      table: "mentor_visits_2026",
      keys: ["response_id"],
      grain: "one quality-observation visit",
      source: "Teampact survey, nightly sync",
    },
    {
      role: "derived",
      name: "School & group summaries",
      table: "school_summaries_2026 / group_summaries_2026",
      keys: [],
      source: "Recomputed nightly after the syncs land",
    },
    {
      role: "derived",
      name: "Letter alignment",
      table: "child_letter_alignment_2026",
      keys: [],
      source:
        "Joins each child's sessions to their assessment: are EAs teaching the right letters?",
    },
    {
      role: "derived",
      name: "Targets & caches",
      table: "programme_targets + summary caches",
      keys: [],
      source: "The 2026 targets (dosage, coverage, on-track) live in the database, not in code",
    },
  ],
  legacyNote:
    "History shelf: the frozen 2025 Teampact tables and the SurveyCTO-era imports. Kept for comparisons, no longer synced.",
};

// ---------------------------------------------------------------------------
// The bridge between the two backends. Data flows BOTH ways.
// ---------------------------------------------------------------------------

export const BRIDGE = {
  masiToZazi: "Identity feed (school & youth UIDs) + the closures calendar",
  zaziToMasi: "WIG aggregates, outcome measures, per-school reach",
  transport:
    "Server to server over HTTPS with a shared secret. The website only ever talks to the Masi backend.",
};

// ---------------------------------------------------------------------------
// Serving layer: how data leaves the backends.
// ---------------------------------------------------------------------------

export interface ServingChannel {
  name: string;
  auth: string;
  description: string;
}

export const SERVING_CHANNELS: ServingChannel[] = [
  {
    name: "Masi REST API",
    auth: "Clerk sign-in",
    description:
      "The only API the website calls. Every operations dashboard reads from it; role checks (Admin, Project Manager) happen here.",
  },
  {
    name: "Zazi internal API",
    auth: "shared secret",
    description:
      "Serves pre-computed Zazi metrics to the Masi backend, which relays them to the WIG scoreboard and the grid.",
  },
  {
    name: "Published snapshots",
    auth: "public",
    description:
      "Hand-approved stats served to the public impact pages. Refreshed hourly at most; a person signs off every number.",
  },
  {
    name: "Parquet exports",
    auth: "file drop",
    description:
      "Nightly analysis-ready extracts feeding the two Streamlit data portals. Backups and deep analysis, never the serving path.",
  },
  {
    name: "Supabase direct",
    auth: "server-side key",
    description:
      "The Field App live view reads the mobile app's Supabase tables directly while the app is in field test.",
  },
];

// ---------------------------------------------------------------------------
// The ID system: the spine that links every event to its entities.
// ---------------------------------------------------------------------------

export interface KeySpec {
  key: string;
  identifies: string;
  mintedBy: string;
  usedBy: string;
}

export const KEY_SYSTEM: KeySpec[] = [
  {
    key: "CH-XXXXX",
    identifies: "A child, across every programme and year",
    mintedBy: "Airtable Child Registry",
    usedBy: "Masi sessions, assessments, rosters",
  },
  {
    key: "SCH-XXXXX",
    identifies: "A school",
    mintedBy: "Airtable schools base",
    usedBy: "Everything, in both backends",
  },
  {
    key: "YTH-XXXX",
    identifies: "A youth (coach / EA) we employ",
    mintedBy: "Airtable youth base",
    usedBy: "Sessions, absences, the grid, Zazi identity map",
  },
  {
    key: "mcode",
    identifies: "A child in the 2022 to 2025 history tables",
    mintedBy: "Legacy Airtable",
    usedBy: "WELA and 2025 assessments; year-on-year growth",
  },
  {
    key: "employee_number",
    identifies: "A staff member in HR",
    mintedBy: "Airtable staff base",
    usedBy: "Staff table, HR reporting",
  },
  {
    key: "participant_id",
    identifies: "A child inside Teampact",
    mintedBy: "Teampact",
    usedBy: "All Zazi sessions and assessments; stored on the canonical child record to bridge the two systems",
  },
  {
    key: "user_id",
    identifies: "An EA inside Teampact",
    mintedBy: "Teampact",
    usedBy: "Zazi sessions, EA roster, EA performance",
  },
  {
    key: "response_id",
    identifies: "One submitted Teampact survey",
    mintedBy: "Teampact",
    usedBy: "Zazi assessments and mentor visits (de-duplication)",
  },
];

// ---------------------------------------------------------------------------
// Dashboards: where the data lands and who reads it.
// ---------------------------------------------------------------------------

export interface DashboardSpec {
  name: string;
  route: string;
  audience: string;
  freshness: "Live" | "Nightly" | "Snapshot" | "External";
  reads: { label: string; role: Role }[];
  note?: string;
}

export const DASHBOARDS: DashboardSpec[] = [
  {
    name: "WIG Scoreboard",
    route: "/operations/wig",
    audience: "Leadership",
    freshness: "Live",
    reads: [
      { label: "Masi sessions & visits", role: "event" },
      { label: "Masi assessments", role: "event" },
      { label: "Zazi aggregates (via bridge)", role: "derived" },
      { label: "Data-quality checks", role: "derived" },
    ],
    note: "The one board that spans both backends: six programmes, outcome rings plus leading indicators.",
  },
  {
    name: "Youth Sessions",
    route: "/operations/youth-sessions",
    audience: "Project managers",
    freshness: "Live",
    reads: [
      { label: "Literacy & numeracy sessions", role: "event" },
      { label: "Youth registry", role: "canonical" },
      { label: "Closures & absences", role: "event" },
    ],
  },
  {
    name: "Mentor Visits",
    route: "/operations/mentors",
    audience: "Mentors & PMs",
    freshness: "Live",
    reads: [
      { label: "Visit events (4 programmes)", role: "event" },
      { label: "Schools & mentors", role: "canonical" },
    ],
    note: "Also writes: the visit form is a capture tool.",
  },
  {
    name: "School Programme Grid",
    route: "/operations/school-programme-grid",
    audience: "Leadership",
    freshness: "Nightly",
    reads: [
      { label: "Grid cells & school stats", role: "event" },
      { label: "Schools registry", role: "canonical" },
      { label: "Zazi reach (via bridge)", role: "derived" },
    ],
  },
  {
    name: "Closure Calendar",
    route: "/operations/closures",
    audience: "Admin & PMs",
    freshness: "Live",
    reads: [
      { label: "Closures & absences", role: "event" },
      { label: "Schools & youth", role: "canonical" },
    ],
    note: "Feeds both backends: every 'per working day' metric depends on it.",
  },
  {
    name: "ETL Preview",
    route: "/operations/preview",
    audience: "Data team",
    freshness: "Live",
    reads: [
      { label: "Sync log", role: "derived" },
      { label: "Orphan-key checks", role: "derived" },
    ],
    note: "The pipeline's own dashboard: is every event finding its entities?",
  },
  {
    name: "Field App Live View",
    route: "/operations/field-app",
    audience: "Admin & PMs",
    freshness: "Live",
    reads: [
      { label: "Mobile-app Supabase tables", role: "event" },
    ],
    note: "Reads the field-test mobile backend directly, ahead of canonical sync.",
  },
  {
    name: "Public Impact pages",
    route: "/impact",
    audience: "Donors & public",
    freshness: "Snapshot",
    reads: [{ label: "Published stats", role: "derived" }],
    note: "Only hand-approved numbers cross this line.",
  },
  {
    name: "Data portals",
    route: "data.masinyusane.org",
    audience: "Analysts & funders",
    freshness: "External",
    reads: [{ label: "Parquet exports", role: "derived" }],
    note: "Streamlit apps fed by the nightly parquet drops (Masi and ZZ).",
  },
];

// ---------------------------------------------------------------------------
// Stewardship register: every dataset needs a name on it.
// Fill in `steward` as leadership assigns owners; empty string renders as an
// amber "Assign" chip on the page.
// ---------------------------------------------------------------------------

export interface StewardshipRow {
  domain: string;
  role: Role;
  enteredBy: string;
  pipeline: string;
  atStake: string;
  steward: string;
}

export const STEWARDSHIP: StewardshipRow[] = [
  {
    domain: "Child registry",
    role: "canonical",
    enteredBy: "Programme admins, Airtable",
    pipeline: "Nightly sync",
    atStake: "Every per-child count on every dashboard",
    steward: "Tumelo",
  },
  {
    domain: "School registry",
    role: "canonical",
    enteredBy: "Ops team, Airtable",
    pipeline: "Nightly sync",
    atStake: "School rollups, the grid, the map",
    steward: "Tumelo",
  },
  {
    domain: "Youth roster",
    role: "canonical",
    enteredBy: "HR, Airtable",
    pipeline: "Nightly sync",
    atStake: "Youth dashboards, staffing gaps, absence tracking",
    steward: "Noxolo",
  },
  {
    domain: "Staff roster",
    role: "canonical",
    enteredBy: "HR, Airtable",
    pipeline: "On-demand sync",
    atStake: "HR reporting",
    steward: "Zola",
  },
  {
    domain: "Literacy & numeracy sessions",
    role: "event",
    enteredBy: "Coaches, Airtable forms",
    pipeline: "Twice-daily sync",
    atStake: "Session dashboards, WIG leading indicators",
    steward: "Tumelo",
  },
  {
    domain: "Masi assessments",
    role: "event",
    enteredBy: "Assessors, Airtable Assessments DB",
    pipeline: "Synced each assessment window",
    atStake: "WIG outcome rings, every impact claim we publish",
    steward: "Tumelo",
  },
  {
    domain: "Zazi sessions & assessments",
    role: "event",
    enteredBy: "EAs, Teampact",
    pipeline: "Nightly sync + recompute",
    atStake: "The Zazi WIG tile, funder-facing results",
    steward: "Noxolo",
  },
  {
    domain: "Mentor visits",
    role: "event",
    enteredBy: "Mentors, website forms",
    pipeline: "Written live",
    atStake: "Coaching coverage, visit quality trends",
    steward: "Chombe",
  },
  {
    domain: "Closures & absences",
    role: "event",
    enteredBy: "Ops, closure calendar",
    pipeline: "Written live, cached to Zazi",
    atStake: "Every 'per working day' metric in both backends",
    steward: "Chombe",
  },
  {
    domain: "Published stats",
    role: "derived",
    enteredBy: "Data team, hand-approved",
    pipeline: "Editorial sign-off",
    atStake: "Everything donors and the public see",
    steward: "Jim",
  },
];

// ---------------------------------------------------------------------------
// What's next: the map's known future.
// ---------------------------------------------------------------------------

export const NEXT_CHAPTERS: { title: string; body: string }[] = [
  {
    title: "Mobile apps replace forms",
    body: "The Masi Field App (already in field test) and the ZZ mobile app each run on their own Supabase Postgres. As they go live, nightly syncs will carry their data into the two canonical backends, the same pattern Airtable and Teampact follow today. Capture tools change; the canonical stores do not.",
  },
  {
    title: "Close the Airtable audit gap",
    body: "Most Airtable data reaches Postgres via crons, but not all of it. We need a definitive list of what still lives only in Airtable so coverage is a fact, not an assumption.",
  },
  {
    title: "One identity spine",
    body: "The UID system (CH, SCH, YTH) is becoming the organisation-wide standard. Every new system, including the mobile apps, must carry these keys so a child's story stays whole across tools and years.",
  },
];

// Derived counts for the hero, computed from the config so they can't drift.
export const COUNTS = {
  captureTools: CAPTURE_SOURCES.length,
  canonical:
    MASI_BACKEND.datasets.filter((d) => d.role === "canonical").length +
    ZAZI_BACKEND.datasets.filter((d) => d.role === "canonical").length,
  events:
    MASI_BACKEND.datasets.filter((d) => d.role === "event").length +
    ZAZI_BACKEND.datasets.filter((d) => d.role === "event").length,
  dashboards: DASHBOARDS.length,
};

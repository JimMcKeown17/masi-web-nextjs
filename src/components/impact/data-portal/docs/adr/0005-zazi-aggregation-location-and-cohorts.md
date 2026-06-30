# Zazi Programmatic aggregation lives in the Zazi backend; cohorts use an explicit control list; Slice 1 is baseline -> midline

## Context

Slice 1 needed the two flagship Grade-1 Headline Results recomputed and verified from Postgres (ADR 0004). Three things had to be decided/verified during the build, and two of them diverged from the original brief.

## Decision

1. **Where the aggregation lives — the Zazi backend, proxied by Masi.** The metric is computed in the Zazi Django backend (a unit-tested pure module `api/programmatic_impact_2026.py` plus a view at `/api/programmatic-impact-2026/`, behind the existing `X-Internal-Auth` middleware). The Masi backend proxies it (`/api/impact/zazi-programmatic/`, reusing `zazi_client.py`); the Next.js portal only ever talks to Masi. This follows the decided WIG house pattern (`documentation/data-architecture.md`) and co-locates the metric with the assessment data and the treatment/SEF school lists, avoiding a third copy of the cohort definitions. Chosen by Jim over the brief's lean (compute in Masi against the Zazi DB).

2. **Cohorts use an EXPLICIT control list; unlisted schools are "other", not "control".** The existing Zazi `_classify_cohort` (in `compute_assessment_summary_2026.py`) returns `control` for any school not in treatment/SEF — so a mistyped or out-of-study school silently lands in the control arm. For a funder-facing treatment-vs-control chart that is a contamination risk. The new `api/cohorts_2026.py` adds the pre-registered 53-school control list and classifies unrecognised schools as `other` (excluded from the comparison). Verified leakage is tiny: 61 of 3,241 matched Grade-1 learners (1.9%, 2 schools).

3. **Slice 1 is baseline -> MIDLINE, not baseline -> endline.** The brief said "baseline -> endline", but the Zazi DB has no endline rows (baseline 8,519 learners through 2026-05-25; midline 7,047 through 2026-06-17, still collecting), and the verified-clean Streamlit 2026 helper only models `{baseline, midline}`. Flagship #1 is the matched Masi-taught (treatment+SEF) Grade-1 benchmark movement; the 27% national figure is a year-END mark and is labelled as such against our mid-year midline.

## Consequences

- The metric is verified twice (exploratory SQL == production Python, to the decimal; see `reconcile_programmatic_impact_2026`) and unit-tested on fixtures with no DB.
- The portal's control arm is trustworthy; the existing ops `assessments-summary` endpoint still uses the lenient classifier (acceptable for operations, noted as a known difference).
- Figures drift daily while midline collection continues, so every figure carries an "as of" date.
- Deploy ordering: the Zazi endpoint must ship before the Masi proxy returns live data.

## Status

accepted (2026-06-18)

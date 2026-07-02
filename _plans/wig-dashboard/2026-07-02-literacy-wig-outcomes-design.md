# Literacy WIG Outcomes - Design (2026-07-02)

Wires the hero WIG rings for Core Literacy and ECD Literacy to real 2026 assessment
data. Closes the "Awaiting baseline assessment" placeholder gap deferred as Phase 4
in `plan.md` (metric-contract.md marked assessment measures "Gap - no source").
Approved by Jim 2026-07-02 (metric definitions, display, architecture, ops).

## Context

- Lead measures for both programmes already load from `/api/wig/lead-measures/`.
  Only the hero (lag) ring is a hard-coded dashed placeholder (`HeroWig`,
  `src/components/wig/ProgrammeView.tsx`).
- New backend tables now hold the needed data, synced nightly from Airtable
  (backend repo, migrations 0037/0038):
  - `literacy_assessments_2026` (`LiteracyAssessment2026`): one row per child x
    term x year, raw EGRA skill scores incl. `letter_sounds`, `read_words`.
  - `on_the_programme_2026` (`OnTheProgramme2026`): 2026 Masi literacy roster
    (~1,388 children), `child_uid` unique, `on_the_programme` bool, grade/school/mentor.
- The Streamlit portal consumes these via a parquet export; the WIG board reads
  the tables directly via ORM (live, no parquet involvement).
- Verified against local snapshot (2026-07-02): Core Literacy Jan 2.8% -> Jun 23.3%
  (n=344); ECD Literacy Jan 2.2% -> Jun 22.9% (n=310).

## Metric definitions (decided)

Population base for both: children on the active roster
(`on_the_programme_2026.is_active AND on_the_programme`), joined to
`literacy_assessments_2026` on `child_uid`, `year=2026 AND is_active`. The roster
join scopes to Masi literacy children (excludes Zazi cohorts).

| Programme | Grade filter | Passing rule | Target |
|---|---|---|---|
| `core_literacy` | assessment `grade = 'Grade 1'` | `read_words >= 16` | 50% |
| `ecd_literacy` | assessment `grade = 'PreR'` | `letter_sounds >= 20` | 75% |

- Denominator = distinct children with a non-null score for that skill in the term.
- Numerator = distinct children with any row passing (duplicate rows counted once;
  simpler than the parquet exporter's `pick_winner`, duplicates ~0 per QA gates).
- Terms ordered Jan < Jun < Nov. Displayed value = latest term whose denominator
  is > 0 for that programme's skill. Baseline = Jan, shown as context; if Jan has
  no data the baseline field is null and the UI omits the baseline line.
- Thresholds are fixed year-end goals (16 wpm / 20 sounds); they do NOT shift
  mid-year vs end-year like the Streamlit on-grade-level chart.

## Backend

- New module `api/wig_outcomes.py` (style mirrors `api/wig_metrics.py`):
  `build_outcomes()` returning the payload below.
- New view `wig_outcomes` in `api/views/wig.py`, route `GET /api/wig/outcomes/`
  in `api/urls.py`, guarded by `IsAdminOrProjectManager` + the same auth classes.

```
GET /api/wig/outcomes/
{
  "outcomes": {
    "core_literacy": {
      "value": 0.233, "numerator": 80, "denominator": 344, "term": "Jun",
      "baseline": {"value": 0.028, "numerator": 10, "denominator": 361, "term": "Jan"},
      "calculation_note": "Grade 1 on-roster children with Read Words >= 16"
    },
    "ecd_literacy": { ...same shape... }
  },
  "data_as_of": "<ISO timestamp>"
}
```

- Values are fractions (frontend formats as %), matching the board's ratio convention.
- No qualifying rows for a programme -> that key is `null` -> frontend keeps the
  awaiting state. Empty prod tables are therefore correct-but-awaiting, not an error.

## Frontend

- `src/lib/types/wig.ts`: `WigOutcome`, `OutcomesPayload`.
- `src/lib/api/wig.ts`: `getWigOutcomes(token)`.
- `src/lib/wig/config.ts`: add `target` to the `wig` block for the two literacy
  programmes (0.5 / 0.75) so the ring has a structured target (today it lives only
  in the statement string). Zazi and other programmes unchanged.
- `WigDataProvider`: fourth call in the existing `Promise.all`, wrapped in
  `.catch(() => empty)` like the Zazi call. Expose `outcomes` in context.
- `HeroWig` (`ProgrammeView.tsx`): when an outcome exists for the programme,
  render a live ring instead of the dashed placeholder:
  - big % + term label ("23% - Midline (Jun)"); term label map
    Jan=Baseline, Jun=Midline, Nov=Endline
  - target tick at 50%/75% on the ring
  - baseline context line ("Jan: 2.8%")
  - n counts for auditability ("80 of 344 assessed")
  - NO red/amber RAG: lag measure below target mid-year is expected; ring fills
    in programme accent colour toward the target. RAG stays on lead measures.
- `ProgrammeRollupCard` (overview): replace the awaiting pill with the live %
  when an outcome exists.
- Out of scope: Zazi hero rings (their data comes from the Zazi backend),
  Numeracy/Data Team heroes, hero drill-down detail panel.

## Ops prerequisite (prod tables are EMPTY today)

Migrations ran on Render, but the two syncs have only run locally; no cron exists.

1. Set `AIRTABLE_LITERACY_ASSESSMENTS_2026_BASE_ID`/`_TABLE_ID` and
   `AIRTABLE_ON_THE_PROGRAMME_2026_BASE_ID`/`_TABLE_ID` on Render.
2. Add both sync commands to the nightly Render cron alongside the session syncs
   (roster sync first, then assessments).
3. Trigger one manual run so the WIG lights up immediately.

Until run, prod shows "Awaiting baseline assessment" - correct behaviour.

## Testing

- Backend fixture tests (`api/tests_wig.py` style): threshold boundary (exactly
  16/20 passes), null scores excluded from denominator, off-roster children
  excluded, latest-term selection (Jun over Jan; Nov over Jun), duplicate rows
  counted once, empty tables -> null payload.
- E2E: local backend + `pnpm dev`, load `/operations/wig/core-literacy` and
  `/operations/wig/ecd-literacy`, verify 23.3% / 22.9% against the SQL check.
- Docs: add endpoint to `documentation/api-endpoints.md`.

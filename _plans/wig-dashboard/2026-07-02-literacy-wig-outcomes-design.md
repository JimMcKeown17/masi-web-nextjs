# Literacy WIG Outcomes - Design (2026-07-02)

Wires the hero WIG rings for Core Literacy and ECD Literacy to real 2026 assessment
data. Closes the "Awaiting baseline assessment" placeholder gap deferred as Phase 4
in `plan.md` (metric-contract.md marked assessment measures "Gap - no source").
Approved by Jim 2026-07-02 (metric definitions, display, architecture, ops).
Revised same day after three Codex adversarial review rounds: source-health +
48h staleness gates, fail-closed dedupe exceptions, transport failures render
unavailable (never awaiting), roster-grade cohort rule, shared pick_winner
dedupe (no any-row-passes), cohort_total coverage visibility, out-of-range
score guard, Jan/Jun-only until parity surfaces support Nov, URL-level role
tests.

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
  (n=344); ECD Literacy Jan 2.2% -> Jun 22.9% (n=310). Caveat: this sanity SQL used
  raw assessment grade and no winner-dedupe; final numbers may shift slightly under
  the roster-grade + pick_winner rules below. E2E verifies against the Streamlit
  portal (same rules), not this SQL.

## Metric definitions (decided)

Population base for both: children on the active roster
(`on_the_programme_2026.is_active AND on_the_programme`), joined to
`literacy_assessments_2026` on `child_uid`, `year=2026 AND is_active`. The roster
join scopes to Masi literacy children (excludes Zazi cohorts).

| Programme | Grade filter | Passing rule | Target |
|---|---|---|---|
| `core_literacy` | cohort grade `= 'Grade 1'` | `read_words >= 16` | 50% |
| `ecd_literacy` | cohort grade `= 'PreR'` | `letter_sounds >= 20` | 75% |

- Cohort grade per child = `normalize_grade(roster.grade or assessment.grade)`,
  exactly the parquet exporter's rule (roster grade first, assessment grade as
  fallback, aliases normalised via `api/literacy_2026_grades.py`). One grade per
  child for the year, so Jan and Jun percentages use the same cohort split -
  matching the Streamlit portal. Grade-fallback count reported in the payload's
  `calculation_note` for auditability.
- Duplicate rows resolved with the exporter's winner policy, NOT any-row-passes:
  extract `pick_winner`/`dedupe` (and the row-dict helpers they need) from
  `export_literacy_2026_parquet.py` into a shared module
  (`api/literacy_2026_dedupe.py`); both the exporter and `wig_outcomes` import it.
  This keeps the WIG ring arithmetically consistent with the Streamlit export
  (a Duplicate-flagged passing row must never flip a child to passing).
- Denominator = children whose winning row has a non-null score for that skill
  in the term. Numerator = those whose winning row passes the threshold.
- Assessed-only denominator is a DECIDED trade-off (Jim, 2026-07-02): it matches
  the Streamlit portal's per-term population. To keep partial coverage visible
  rather than hidden, the payload carries `cohort_total` (the grade cohort's full
  roster size) and the UI shows "assessed X of Y" next to the ring. Revisit at
  Nov endline whether the year-end WIG should count unassessed children as
  non-passing.
- Known conditional divergence (final review, 2026-07-03): the WIG cohort
  filters `on_the_programme=True`; the Streamlit processor does not filter on
  that flag. Identical today because no active off-programme child has scores.
  If mid-year off-boarding starts using the flag, the surfaces drift - re-check
  at Nov endline.
- Out-of-range guard: scores above the instrument max (Read Words > 40,
  Letter Sounds > 60) are data errors, treated as missing - the portal's
  `_null_out_of_range` rule. These two maxima are language-invariant (no
  IsiXhosa/Afrikaans denominator override touches them), so no language table
  is needed backend-side.
- Terms ordered Jan < Jun. Nov (endline) is enabled later, together with the
  exporter's `TERM_TO_PREFIX` and the Streamlit processor's `MONTHS`, so the
  parity surfaces can always cross-check; until then Nov rows are ignored.
  Displayed value = latest term whose denominator is > 0 for that programme's
  skill. Baseline = Jan, shown as context; if Jan has no data the baseline field
  is null and the UI omits the baseline line.
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
  "available": true,
  "source_note": null,
  "outcomes": {
    "core_literacy": {
      "value": 0.233, "numerator": 80, "denominator": 344, "cohort_total": 412,
      "term": "Jun",
      "baseline": {"value": 0.028, "numerator": 10, "denominator": 361, "term": "Jan"},
      "calculation_note": "Grade 1 on-roster children with Read Words >= 16; 0 grade fallbacks"
    },
    "ecd_literacy": { ...same shape... }
  },
  "data_as_of": "<ISO timestamp>"
}
```

- Values are fractions (frontend formats as %), matching the board's ratio convention.
- **Source-health gate** (same rule as the exporter's `_assert_synced`): the
  endpoint checks the latest `AirtableSyncLog` for both `literacy_assessments_2026`
  and `on_the_programme_2026`. If either log is missing, failed, incomplete, or
  flagged (`details.retire_skipped` / `details.dup_uid_skipped`), the payload is
  `{"available": false, "source_note": "<which sync, why>", "outcomes": {}}`.
  This distinguishes "pipeline broken/not configured" (today's empty prod: no log
  rows -> unavailable) from "genuinely not assessed yet".
- **Staleness gate**: each sync's latest success must also be within 48h (two
  missed nightly runs), else `available: false` with a stale note. This is a
  dead-cron detector, not a data-freshness claim - it catches "cron stopped or
  was never scheduled" (prod's current state) and bounds roster/assessment skew
  between the two syncs to about a day. No batch-coupling mechanism: the age
  gate covers the skew risk without new machinery.
- **Dedupe fail-closed**: the endpoint evaluates the shared `dedupe()` exception
  list over the whole roster-joined 2026 row set (all grades), the same scope at
  which the exporter blocks. Any `unresolved_tie` or
  `duplicate_more_complete_rejected` exception -> `available: false` with a
  source note, mirroring the exporter's blocking defaults. The WIG must never publish numbers the parquet export would
  refuse to ship.
- With healthy sources, no qualifying rows for a programme -> that key is `null`
  -> frontend keeps the awaiting state.

## Frontend

- `src/lib/types/wig.ts`: `WigOutcome`, `OutcomesPayload`.
- `src/lib/api/wig.ts`: `getWigOutcomes(token)`.
- `src/lib/wig/config.ts`: add `target` to the `wig` block for the two literacy
  programmes (0.5 / 0.75) so the ring has a structured target (today it lives only
  in the statement string). Zazi and other programmes unchanged.
- `WigDataProvider`: fourth call in the existing `Promise.all`. Transport or
  backend failures (500/403/network) must NOT be swallowed to an empty payload:
  `.catch(() => ({ available: false, source_note: "outcomes request failed",
  outcomes: {} }))` so any failure renders as unavailable, never as the benign
  awaiting state. Expose `outcomes` in context.
- `HeroWig` (`ProgrammeView.tsx`): three states, mirroring the Zazi tiles'
  unavailable pattern:
  1. payload `available: false` -> "Assessment data unavailable" (grey, with
     `source_note`), NOT the awaiting label - a broken pipeline must not read
     as "not assessed yet";
  2. sources healthy but outcome `null` -> existing awaiting placeholder;
  3. outcome present -> live ring:
  - big % + term label ("23% - Midline (Jun)"); term label map
    Jan=Baseline, Jun=Midline, Nov=Endline
  - target tick at 50%/75% on the ring
  - baseline context line ("Jan: 2.8%")
  - n counts for auditability, including coverage ("80/344 passing - 344 of 412
    Grade 1 assessed")
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

Until run, prod shows "Assessment data unavailable" (no sync logs -> health gate
fails). The awaiting label only ever appears with healthy syncs and no rows.

## Testing

- Backend fixture tests (`api/tests_wig.py` style): threshold boundary (exactly
  16/20 passes), null scores excluded from denominator, out-of-range scores
  (Read Words > 40, Letter Sounds > 60) treated as missing, off-roster children
  excluded, latest-term selection (Jun over Jan; Nov rows ignored until endline
  support), empty tables with no sync logs -> unavailable payload.
- Endpoint tests hit the real URL via APIClient (proves routing AND the role
  gate): ADMIN 200 with payload, PROJECT MANAGER 200, MENTOR 403, anonymous
  401/403.
- Dedupe fixtures: a Duplicate-flagged passing row alongside a Single winner that
  fails -> child does NOT pass (winner policy holds); exporter and endpoint agree
  on the same fixture.
- Grade fixtures: roster/assessment grade disagreement resolves to roster grade;
  alias grades (via `normalize_grade`) land in the right cohort; fallback grades
  counted.
- Source-health fixtures: no sync logs, latest log failed, latest log flagged
  (`retire_skipped`/`dup_uid_skipped`), latest success older than 48h, one sync
  fresh + other stale -> `available: false` with note; healthy logs + no rows ->
  `available: true` with null outcomes.
- Dedupe-exception fixtures: an unresolved tie, and a duplicate-more-complete
  rejection, in the cohort -> `available: false`.
- Coverage fixture: large unassessed roster segment -> `cohort_total` reflects
  the full grade cohort while `denominator` reflects assessed only.
- Frontend failure handling: outcomes request rejects (simulate 500/network) ->
  hero shows unavailable, not awaiting (verified in E2E by stopping the backend).
- E2E: local backend + `pnpm dev`, load `/operations/wig/core-literacy` and
  `/operations/wig/ecd-literacy`; verify the June percentages match the Streamlit
  portal's equivalents (same roster-grade + dedupe rules) and baseline lines render.
- Docs: add endpoint to `documentation/api-endpoints.md`.

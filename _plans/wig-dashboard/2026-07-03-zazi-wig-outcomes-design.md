# Zazi iZandi WIG Outcomes - Design (2026-07-03)

Wires the Zazi iZandi Primary and ECD hero WIG rings to real 2026 assessment
data from the Zazi backend, extending the literacy WIG outcomes pattern
(2026-07-02 spec). Approved by Jim 2026-07-03 (metrics, three-mini-ring hero,
live-fetch architecture). Revised same day after a Codex adversarial round:
null scores count as non-passing (site parity), ECD raw rows both phases,
as_of staleness gate dropped (insert-only timestamps), deploy-order-safe
payload migration, lead/outcome population rationale documented.

## Context

- The two Zazi programme cards already show live lead measures via
  `ZaziOverviewSnapshot` (Masi proxies the Zazi backend's `programme-overview`
  with the `X-Internal-Auth` shared secret). Their heroes still show
  "Awaiting midline assessment".
- Assessment data lives in the ZAZI backend's Postgres, table
  `assessments_2026` (`Assessment2026`, api/models.py:799 in
  `/Users/jimmckeown/Development/Zazi_iZandi_Website_2025`): fields
  `letters_total_correct`, `grade` (Grade R/1/2; PreR for ECD midline),
  `language` (isiXhosa/English/Afrikaans; 'ECD' for ECD rows),
  `assessment_type` (baseline/midline/endline), `participant_id` (null for ECD
  baseline survey 805), `program_name` (school), `response_date`,
  `data_refresh_timestamp`. Synced nightly from Teampact
  (`sync_assessments_2026`). Surveys: 815/816/817 primary baseline,
  880/881/882 primary midline, 805 ECD baseline, 891 ECD midline.
- Parity surface = the ZZ Data Site ('/Users/jimmckeown/Development/ZZ Data
  Site', Streamlit): midline pages compute "% at benchmark" cross-sectionally
  with `letters_total_correct >= threshold`, deduped to the latest row per
  `participant_id` per `assessment_type`
  (`midline_primary_helpers_2026.py:186-200`, `benchmark_summary` :426-449).
  Its Grade 2 has NO distinct threshold (falls into the else-20 branch) and its
  ECD slider defaults to 10 - the WIG definitions below are the decided
  authority where the site is silent.
- Existing Zazi benchmark code uses different constants
  (`compute_assessment_summary_2026.py:204` has Grade R 10, Grade 2 40,
  baseline-only, ECD excluded; `programmatic_impact_2026.py` is Grade 1 only,
  treatment+SEF). The new endpoint is a separate module; those are untouched.

## Metric definitions (decided by Jim, 2026-07-03)

All: passing = `letters_total_correct >= threshold`; denominator = ALL
deduped rows in the grade+term (a null `letters_total_correct` counts as
NOT passing, exactly like the site's `benchmark_summary` which uses
`len(phase_df)`); value = fraction 0..1. NOTE this deliberately differs from
the Masi literacy convention (which excludes null scores) - each surface
matches ITS parity dashboard.

| Programme | Metric | Cohort | Threshold | Target |
|---|---|---|---|---|
| `zazi_izandi` | Gr R | grade='Grade R', primary languages, treatment+SEF schools | 20 | 67% |
| `zazi_izandi` | Gr 1 | grade='Grade 1', same | 40 | 67% |
| `zazi_izandi` | Gr 2 | grade='Grade 2', same | 55 | 40% |
| `zazi_izandi_ecd` | Letter sounds | ECD surveys (805 baseline, 891 midline) | 20 | 75% |

- Primary population = treatment + SEF, classified via the existing pure
  module `api/cohorts_2026.py` (`classify` with the treatment/SEF sets from
  `api.views`) - inclusion rule: classification in {'treatment','sef'}.
  Excludes the RCT control arm, matching `programmatic-impact-2026`.
  Deliberate asymmetry with lead measures (adversarial review, resolved):
  lead measures use cohort=primary (all primary schools), but control schools
  have no Masi EAs or sessions, so the lead-measure population is de facto
  treatment+SEF already; outcomes make the exclusion explicit because control
  children DO have assessments.
- Primary dedupe = ZZ Data Site rule: drop blank `participant_id`, sort by
  (`response_date`, `data_refresh_timestamp`, `response_id`), keep last per
  (`participant_id`, `assessment_type`).
- Grade backfill = ZZ Data Site rule (`midline_primary_helpers_2026.py:161-183`):
  a midline row with a blank grade inherits the same participant's baseline
  grade, so those children stay in their grade cohort on both surfaces.
- ECD: survey 891 (midline) and 805 (baseline). Raw response rows for BOTH
  phases, no dedupe at all - the site's ECD helper deliberately counts raw
  rows in both phases (deduping only midline would mix units, its docstring
  says so) even though survey 891 rows carry participant IDs.
- Terms: `baseline` < `midline` only. `endline` is enabled later, together
  with the ZZ Data Site pages, so the parity surfaces can always cross-check.
  Displayed term = latest with denominator > 0; baseline shown as context.
- Thresholds and targets are constants in the new Zazi module (the Zazi side
  supplies targets, as it does for lead measures). Grade 2's 55 and ECD's 20
  are NEW definitions (not in the site's sliders); the site remains the parity
  check only for grades where its defaults align (Gr R 20, Gr 1 40).

## Zazi backend (producer)

Repo: `/Users/jimmckeown/Development/Zazi_iZandi_Website_2025`.

- New module `api/wig_outcomes_2026.py`: pure computation over
  `Assessment2026`, plus the shared treatment/SEF school-set constant
  (extracted from `views.programme_overview`).
- New view + route `GET /api/wig-outcomes/` (api/urls.py; auto-secured by the
  existing `InternalAuthMiddleware` X-Internal-Auth gate; no per-view auth).

```
GET /api/wig-outcomes/
{
  "generated_at": iso,
  "as_of": iso | null,   // max data_refresh_timestamp across included rows
  "programmes": {
    "zazi_izandi": {
      "term": "midline",
      "metrics": [
        {"key": "grade_r", "label": "Gr R", "threshold": 20, "target": 0.67,
         "value": 0.31, "numerator": 120, "denominator": 390,
         "baseline": {"value": 0.05, "numerator": 20, "denominator": 402} },
        {"key": "grade_1", ...}, {"key": "grade_2", ...}
      ]
    },
    "zazi_izandi_ecd": {
      "term": "midline",
      "metrics": [ {"key": "letter_sounds", "label": "Letter sounds",
                    "threshold": 20, "target": 0.75, ...} ]
    }
  }
}
```

- A programme with no assessed rows in any term -> its key is `null`.
- `as_of` null (no rows at all) is valid - Masi treats it as unavailable.

## Masi backend (consumer)

- `api/zazi_client.py`: `fetch_zazi_wig_outcomes()` - live GET with a 5s
  timeout (the aggregate is sub-second, unlike the ~10s programme-overview;
  no snapshot model, no cron).
- 60s in-process cache around fetch+normalize (gate-2 review): success AND
  failure results are cached, so a Zazi outage costs at most one 5s wait per
  worker per minute instead of per request. Live-fetch architecture kept.
- Strict payload validation (gate-2 review): missing programme keys, non-dict
  programmes, empty metrics, or missing metric KEYS -> both Zazi entries
  unavailable ('Zazi payload malformed'). Null metric VALUES are valid. Only
  a literally-null programme value (key present) means awaiting.
- `api/wig_outcomes.py` `build_outcomes()`: after the literacy outcomes,
  merge Zazi. Fail-closed per programme:
  - fetch error/timeout/malformed payload -> both Zazi keys =
    `{kind: 'unavailable', note: 'Zazi backend unreachable'}`;
  - healthy fetch, programme null -> `null` (awaiting).
  - NO as_of staleness gate (adversarial review, fixed): Zazi's
    `data_refresh_timestamp` is stamped only on row INSERT, and between
    assessment rounds no new rows arrive for months, so a max-row-timestamp
    age gate would blank healthy data under normal conditions. `as_of` is
    informational only (surfaced in the calculation note).

### Payload contract change (breaking, we own both ends)

`outcomes` values become a discriminated union on `kind`:

```
outcomes: {
  core_literacy:    {kind:'single', value, numerator, denominator, term,
                     cohort_total, baseline, calculation_note} | {kind:'unavailable', note} | null,
  ecd_literacy:     same as core_literacy,
  zazi_izandi:      {kind:'multi', term, metrics:[{key,label,threshold,target,
                     value,numerator,denominator,baseline}]} | {kind:'unavailable', note} | null,
  zazi_izandi_ecd:  {kind:'single', value, numerator, denominator, term,
                     baseline, target} | {kind:'unavailable', note} | null
}
```

- Literacy builders gain `kind: 'single'` (tests updated); global `available`
  + `source_note` keep gating the MASI literacy sources exactly as today.
- Deploy-order safety (adversarial review, resolved): `single` KEEPS all its
  flat fields (value/numerator/denominator/term/cohort_total/baseline), so an
  old frontend against a new backend still renders literacy correctly (extra
  `kind` field ignored; Zazi keys ignored because old config has no
  `wig.target` on them). The new frontend defaults a missing `kind` to
  `'single'`, so it also works against an old backend. Either repo can deploy
  or roll back first.
- Zazi ECD maps to `kind:'single'` with `target` in the payload (overrides
  config, same precedence as lead measures); `cohort_total` is omitted (no
  roster concept on the Zazi side) and the UI omits the coverage phrase when
  absent.
- Terms: Zazi uses `baseline`/`midline`/`endline` strings; literacy keeps
  Jan/Jun. `TERM_LABELS` covers both vocabularies.

## Frontend

- `src/lib/types/wig.ts`: union types (`WigOutcomeSingle`, `WigOutcomeMulti`,
  `WigOutcomeUnavailable`); `ProgrammeConfig.wig` keeps optional `target`
  (used by literacy; Zazi targets come from the payload).
- `src/lib/wig/config.ts`: `TERM_LABELS` gains baseline/midline/endline;
  Zazi programmes' `awaitingLabel` unchanged.
- `HeroWig` routes by `kind`:
  - `single` -> existing live ring (target from payload ?? config);
  - `multi` -> new `HeroMultiRing`: three ~110px rings side by side, each with
    accent fill, target tick, % and grade label, target text beneath; shared
    term label under the rings; per-metric counts + baseline line under the
    statement ("Gr 1: 120/390 · baseline 5%"), omitting baseline when null
    (approved mockup);
  - `unavailable` -> grey dashed ring, "Assessment data unavailable", note as
    title attr;
  - `null` (or unwired programme) -> awaiting placeholder.
- `ProgrammeRollupCard` chip: `single` -> "N% · <term>"; `multi` -> Grade 1
  headline "Gr 1: N% · <term>"; `unavailable` -> "assessment data
  unavailable"; else existing fallbacks. Numeracy/Data Team cards unchanged
  (their keys never appear in `outcomes`).

## Testing

- Zazi backend (Django TestCase, new `api/tests_wig_outcomes_2026.py`):
  primary dedupe keeps the latest row per participant per term (older passing
  row cannot flip a child); threshold boundaries (exactly 20/40/55/20 pass);
  control-school rows excluded from primary ('other' classification also
  excluded); grade backfill from baseline; ECD counts raw rows in BOTH phases
  (duplicate midline rows for one participant each count); null
  letters_total_correct counted as NOT passing in the denominator (primary
  and ECD); term selection (midline over baseline; endline ignored);
  programme with no rows -> null; as_of = max data_refresh_timestamp.
- Masi backend (`api/tests_wig_outcomes.py` additions, Zazi fetch mocked):
  merge shape for both kinds; fetch exception and malformed payload -> both
  Zazi keys unavailable while literacy keys unaffected; literacy entries now
  carry kind:'single' with all flat fields intact (existing tests updated,
  plus an explicit flat-field compatibility assertion).
- Frontend compat: missing `kind` treated as `'single'` (unit-level assertion
  via the type guard, exercised in E2E against the old payload if feasible).
- Frontend: `pnpm lint` + `pnpm build`; browser E2E on
  `/operations/wig/zazi-izandi` (three mini-rings) and `/zazi-izandi-ecd`,
  values cross-checked against the ZZ Data Site midline pages (Gr R/Gr 1
  should match its defaults exactly; Gr 2 55 and ECD 20 verified by SQL
  against the Zazi DB since the site has no matching view); Zazi-down
  simulation (stop local Zazi server) -> Zazi heroes unavailable, literacy
  heroes still live.
- Docs: add endpoint to both repos' API docs
  (`documentation/api-endpoints.md` on Masi; Zazi's docs location per its
  conventions).

## Ops

None. `ZAZI_API_BASE_URL` / `ZAZI_INTERNAL_API_SECRET` (Masi) and
`INTERNAL_API_SECRET` (Zazi) already exist on Render; no new cron. Deploy =
push both repos. Until the Zazi backend deploy lands, Masi's fetch 404s and
the two Zazi heroes correctly show unavailable.

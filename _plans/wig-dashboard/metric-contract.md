# WIG Dashboard - Metric Contract (v1)

Date: 2026-05-30. Written in response to the adversarial review (`docs/plan-reviews/wig-dashboard-plan-adversarial-review-2026-05-30.md`).
Purpose: pin down cohorts, windows, denominators, and formulas BEFORE coding, so the scoreboard can't show confident-but-wrong numbers. Items marked **(confirm)** need Jim/team sign-off.

All figures below are production-verified (read-only) on 2026-05-30.

## Access (decided)

- `/operations/wig` restricted to **ADMIN + PROJECT MANAGER**, enforced server-side via a guard modelled on `assertFieldAppAccess()` (`src/lib/masi/auth-guard.ts`).
- Backend `/api/wig/*` endpoints must enforce the same role check (not just authentication). Hiding the nav link is not authorization.

## Period (decided)

- Default window = **last completed week, Mon-Sun**. Stable; no partial-week RAG ambiguity.
- v1 is **week-only**. Month view deferred (avoids target-scaling ambiguity).
- Working days = Mon-Fri. Public holidays ignored in v1.
- Backend returns a `window` object (below) so the frontend never re-derives dates.

## Cohort / programme map (CONFIRMED 2026-05-31 - site-type first)

Programme is determined by the **session's site type**, NOT the coach's job title (the same "Literacy Coach" works at both Primary and ECDC sites). Split the Masi session tables by the joined `school.type`; job_title is a secondary filter that excludes non-coach roles. Reuse the youth-sessions working-day/start-date helpers ONLY - never its `INCLUDED_JOB_TITLES`.

| Programme | Source | Site-type filter | Coach filter (job_title) |
|---|---|---|---|
| `core_literacy` | Masi PG `literacy_sessions_2026` | Primary School | Literacy Coach (+ active coach roles) |
| `ecd_literacy` | Masi PG `literacy_sessions_2026` | ECDC / ECD | Literacy Coach, ZZ ECD Coach, Practitioner |
| `numeracy` | Masi PG `numeracy_sessions_2026` | ECDC now; **Primary coming soon** (same job title, split by site type) | Numeracy Coach |
| `zazi_izandi` | **Zazi backend API** (not Masi PG) | n/a | n/a |
| `data_team` | data-quality over Masi session tables | n/a | n/a |

Excluded from v1: Homework Coach, EduTech Coach, 1000 Stories Youth.

- A coach's programme bucket (for denominators) = their assigned school's site type (`Youth.school.type`); their sessions are also filtered by the session school's type. With dedicated per-site-type staffing these agree - **a mismatch (e.g. an ECD job title at a Primary site) is a data error to flag** (see `dq.site_job_mismatch`).
- Numeracy is modelled site-type-aware now so adding Primary numeracy later is a config flip, not a rewrite.
- Eligible coach = in cohort + `employment_status='Active'` + `start_date <= window end`.

## API response shape

```
GET /api/wig/lead-measures/?period=last_week
{
  "window": { "period","date_from","date_to","working_days","data_as_of" },
  "measures": {
    "<source_key>": {
      "numerator": n, "denominator": d, "value": v, "unit": "ratio|per_day|count|percent",
      "eligible_entity_count": e, "calculation_note": "...", "status": null
    }
  }
}
```
RAG status is computed client-side from `value` vs config target/thresholds. Backend supplies numbers + notes only.

## Programme lead-measure definitions

Window = last completed week unless noted. "elapsed_working_days" = 5 for a full Mon-Fri week.

### Zazi iZandi (SEPARATE BACKEND - via Zazi API, NOT Masi PG)
Zazi data is not in the Masi PG. The Masi backend calls the Zazi backend API server-side (`X-Internal-Auth` shared secret) and normalizes the result. Reuse Zazi's existing computed metrics + its `programme_targets` row (dosage 2.5/day, on-track 80%, flag-resolution 70%, assessment-coverage 95%, mentor-coverage 30 days). Do NOT re-aggregate from raw `sessions_2026`.
- `zazi.pct_eas_on_track` = Zazi `ea-performance/` - % of EAs meeting the dosage target (>= 2.5 sessions/day). Already computed by Zazi. Target = `target_on_track_pct` (80%).
- `zazi.sessions_per_day` = Zazi `sessions-activity/` / `programme-overview/` - avg sessions/day per EA. Target >= `target_dosage` (2.5).
- `zazi.teaching_correct_letters` / `zazi.teaching_right_level` = Zazi `letter-alignment/` (`child_letter_alignment_2026`). Target >= 90%.
- `zazi.school_visits` = Zazi `mentor-visits-summary/`. Target = `target_mentor_coverage_days` (30).
- `zazi.assessment_coverage` = Zazi `assessments-summary/` (EGRA). Target = `target_assessment_coverage_pct` (95%).
- `zazi.flag_resolution` = Zazi flag data. Target = `target_flag_resolution_pct` (70%).
- Window: pass the WIG last-completed-week to Zazi endpoints where supported; otherwise surface Zazi's own window in `calculation_note`. If the Zazi API is unreachable, render the tile "data unavailable" (not red).

### Masi Core Literacy
- `core.sessions_per_day` = same formula, core_literacy cohort. Target >= 2.5.
- `core.tracker_compliance` = visit-compliance bundle on `MentorVisit` (see rules). Target >= 90%.
- `core.school_visits_week` = MentorVisit observations in window. Target >= 5.
- `core.one_min_assessments` = 🔴 Gap - no source. Render "data unavailable".

### ECD Literacy
- `ecd.sessions_per_day` = `literacy_sessions_2026` at ECD/ECDC schools, ecd cohort / (eligible coaches x working days). Target >= 3.5.
- `ecd.lc_admin_compliance` = visit-compliance bundle on `MentorVisit` for ECD-site visits. Target >= 90%.
- `ecd.school_visits_week` = MentorVisit observations at ECD/ECDC schools. Target >= 5.
- `ecd.one_min_assessments` = 🔴 Gap - "data unavailable".

### Masi Numeracy
- `numeracy.sessions_per_week` = `numeracy_sessions_2026` for cohort in window / eligible numeracy coaches. Target >= 20.
- `numeracy.lc_admin_compliance` = visit-compliance on `NumeracyVisit` (`numeracy_tracker_correct`). Target >= 90%.

### School coverage (per programme, intentional denominator)
- Denominator = distinct schools assigned to active cohort youth (`Youth.school_id` for eligible cohort). ECD restricts to ECD/ECDC type.
- Numerator = those schools with >=1 cohort session in window.
- Return both school lists for auditability. **Do not** derive denominator from "schools that ever had sessions." CONFIRMED 2026-05-31: denominator = schools with >=1 active assigned coach in the programme (site-type restricted). An explicit target-school list is a v2 option.

## Visit-compliance rules

- Denominator = visits with `visit_type='observation'` in window (non-observation visits don't complete tracker fields).
- A visit is **compliant** only if ALL bundle booleans are `true`. A `null` boolean = non-compliant; also report an `incomplete_count` for transparency.
- Bundles:
  - Literacy (`MentorVisit`): `letter_trackers_correct`, `reading_trackers_correct`, `sessions_correct`, `admin_correct`.
  - Numeracy (`NumeracyVisit`): `numeracy_tracker_correct` (teaching_* are pedagogy, tracked separately, not "admin").
  - YeBo (`YeboVisit`): `paired_reading_took_place`, `paired_reading_tracking_updated`.
- **Attribution (CONFIRMED 2026-05-31):** attribute each visit to a programme by the **visited school's site type** (Primary -> Core Literacy, ECDC/ECD -> ECD). Count "min 5/6 per week" **per submitting `User`** (= the mentor). Mentors are dedicated per site-type/programme (ECDC, Primary, ZZ, Yebo) with no expected overlap - so add a guard/test that flags any submitter posting visits across multiple site types. (Zazi visits come from the Zazi backend's `mentor-visits-summary/`.)

## Data-quality formulas (Data team WIG "98% accurate")

Computed over the full current dataset (accuracy is a state, not weekly). Real prod values shown.

- `dq.child_fk_resolution` (literacy) = 1 - null `child_1_id` / total = **42.8%** today (10,015/17,511 null). 🔴 far from target.
- `dq.youth_fk_resolution` = 1 - null youth_id / total = ~99.9% literacy, 100% numeracy.
- `dq.duplicate_rate` = `duplicate_status='Duplicate'` / total = literacy 0.33% (58), numeracy 1.95% (89). Note: literacy `duplicate_status` is **blank on 55%** of rows - unclassified, flag separately.
- `dq.capture_on_time` = sessions with `0 <= capture_delay <= 2` / total = ~87.7% literacy. Negative delays (min -26) are anomalies - count separately.
- `dq.future_dated` = `session_date > current_date` count (~9 literacy).
- `dq.school_type_hygiene` = schools with null/blank `type` or `type` not in {Primary School, ECDC, ECD, Secondary School} / active schools.
- **Do NOT use `overall_session_status='Clean'`** as a quality headline: literacy is **99.6% "Needs fix"** (18 Clean of 17,511) - the field appears to be a default/workflow flag, not a cleanliness signal.
- `dq.site_job_mismatch` = youth whose `job_title` is inconsistent with their assigned `school.type` (e.g. an ECD job title at a Primary site). These are the obvious pure errors Jim wants minimized - cheap, unambiguous; surface a count now.
- **(DEFERRED, non-blocking) "98% accurate" headline formula:** the team will define which checks count as genuine errors vs true outliers (hard, especially in the children's assessment DB). v1 Data-team tile shows the available sub-gauges (`child_fk_resolution`, `duplicate_rate`, `capture_on_time`, `site_job_mismatch`) as informational; the rolled-up "% accurate" headline is marked "definition pending".

## Config/source validation

- API response is a dict keyed by `source`. Frontend validates at load that every configured `source` exists in `measures`.
- Missing/unknown source -> distinct **"data unavailable"** state (grey), never red/"behind". Prevents a config typo from reading as failure.

## Testing (targeted, calculation-focused)

Django fixture tests before any prod smoke test:
- cohort inclusion/exclusion by job_title + school type (esp. that `zazi_izandi`/`ecd_literacy` are NOT dropped).
- last-completed-week boundary math; start-date eligibility.
- zero-denominator -> no divide-by-zero, renders "no eligible coaches".
- null visit booleans -> counted non-compliant + incomplete tally.
- data-quality formulas against known fixtures.
- payload `source` keys match the frontend config keys.

## Open confirmations (for Jim/team)

1. RESOLVED - cohort/programme map is site-type-first (see Cohort map). Numeracy expands to Primary soon (site-split-ready).
2. RESOLVED - school-coverage denominator = schools with >=1 active assigned coach (site-type restricted); explicit target list = v2.
3. DEFERRED (non-blocking) - formal "98% accurate" definition; team to separate genuine errors from true outliers. v1 shows dq sub-gauges + `site_job_mismatch`.
4. v2 - public holidays + admin-flaggable excluded days (see note below).
5. RESOLVED - visits attributed by site type; counted per submitting user; mentors dedicated per site-type (guard flags overlap).

version 2:
- Include both public holiday, but also a way for admin to flag days to not be counted. This is a constant problem as south african schools often close b/c of lack of water, electricity, floods, protests, or simply b/c schools close a week early before holidays etc. So our stats are always blown up by these things.
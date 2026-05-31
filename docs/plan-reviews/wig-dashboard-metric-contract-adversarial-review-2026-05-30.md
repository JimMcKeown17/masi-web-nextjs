# Adversarial Review: WIG Dashboard Metric Contract v1

Reviewed plan: `_plans/wig-dashboard/metric-contract.md`
Date: 2026-05-30

## Verdict

The metric contract is a meaningful improvement over the first WIG dashboard plan. It resolves several of the earlier review's high-risk ambiguities on paper: role-gated access is now decided, the default period is last completed week only, the response is keyed by metric source, the youth-sessions cohort filter is explicitly rejected for WIG, school coverage gets an intentional denominator, and visit nulls are no longer left undefined.

I would still not start implementation until the blocking items below are tightened. The remaining risks are not cosmetic. They can produce confident-looking but wrong scoreboard statuses, especially for school visits, Data Team accuracy, and client-side RAG scoring.

I did not re-query the production database in this review. The code/contract cross-check below uses the live backend/frontend files and the production-count assertions already written in the plan docs. Treat production counts in the metric contract as unverified by this review unless the implementation keeps the read-only query output or smoke-test evidence.

## Evidence Checked

- `_plans/wig-dashboard/metric-contract.md`
- `_plans/wig-dashboard/plan.md`
- `_plans/wig-dashboard/feasibility-matrix.md`
- `_plans/wig-dashboard/framework-decisions.md`
- `docs/plan-reviews/wig-dashboard-plan-adversarial-review-2026-05-30.md`
- `CLAUDE.md`
- `src/app/operations/youth-sessions/page.tsx`
- `src/app/operations/field-app/page.tsx`
- `src/components/layout/Navbar.tsx`
- `src/lib/masi/auth-guard.ts`
- `src/lib/server/user.ts`
- `src/lib/api/youth-sessions/*`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/CLAUDE.md`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/models.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/views/youth_sessions.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/views/mentor_visits.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/views/numeracy_visits.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/views/info.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/authentication.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/urls.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/views/__init__.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/core/models.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/masi_website/settings.py`

## Earlier Findings: Resolution Status

| Earlier finding | Status in `metric-contract.md` | Residual concern |
|---|---|---|
| Youth-sessions filters exclude Zazi iZandi and ECD | Mostly resolved. The contract says not to reuse `INCLUDED_JOB_TITLES`, and the implementation checklist repeats that. | `plan.md` still lists `api/views/youth_sessions.py` "programme/school-type filters" as reusable reference material. That line can lead an implementer back into the same bug. |
| Period and denominator semantics were undefined | Mostly resolved. Last completed week, week-only, Mon-Fri working days, and backend `window` are now stated. | Business timezone and mid-period coach starts are still under-defined. |
| School coverage denominator was not intentional | Improved. Denominator is now assigned schools for active cohort youth, with lists returned for auditability. | The denominator is still marked "confirm", so this is not actually locked. |
| Visit compliance nulls and visit type were undefined | Improved. Observation-only denominator, null-as-non-compliant, and field bundles are now explicit. | Programme ownership of visits is still not solved, and "per mentor" targets are being changed to programme totals without a real target rewrite. |
| Access was only "Clerk protected" | Improved. The contract decides ADMIN + PROJECT MANAGER and says backend must enforce it. | The backend currently has no role permission pattern; existing API views use only `IsAuthenticated`, so the implementation checklist needs a concrete permission class and tests. |
| Backend `views/__init__.py` export step was missing | Resolved. The checklist now includes `api/views/__init__.py` plus `api/urls.py`. | None. |
| Data-quality formulas were vague | Improved. The contract names formulas. | At least one formula is wrong for the live model grain: literacy has two child FK slots, but the contract checks only `child_1_id`. |
| Config/API source validation was missing | Partially resolved. Missing source now maps to "data unavailable". | Client-side RAG still lacks direction, percent scale, and intentional-unavailable/proxy metadata. |
| Verification relied too much on prod smoke checks | Improved. Fixture tests are now required. | Add tests for the new gaps below: role denial, business timezone, child_2 FK resolution, visit attribution, RAG direction/scale, and intentional unavailable states. |

## Blocking Gaps

### 1. The contract is marked "DONE" while blocking confirmations still define the formulas

`plan.md` marks "Metric contract & cohorts - DONE", but `metric-contract.md` still requires confirmation for:

- job title to programme mapping
- whether Core Literacy is distinct from Zazi iZandi
- whether ECD is defined by coach job title, school type, or both
- school-coverage denominator
- what "98% accurate databases" formally means
- whether visit targets are programme totals or per-mentor minimums

Those are not implementation details. They change numerators, denominators, targets, and whether a tile is meaningful. The plan should split these into:

- `blocking_before_backend`: cohort map, ECD lens, school denominator, visit target semantics, Data Team definition
- `can_confirm_after_v1`: public holiday handling if the team accepts weekday-only v1

Until the blocking confirmations are signed off, Phase 3 should not be treated as ready to code.

### 2. School visit metrics still cannot be attributed to Zazi iZandi vs Core Literacy safely

The contract defines:

- `zazi.school_visits_week` = count of all `MentorVisit` observations in the window, target >= 6
- `core.school_visits_week` = count of `MentorVisit` observations in the window, target >= 5
- `ecd.school_visits_week` = `MentorVisit` observations at ECD/ECDC schools, target >= 5

The live `MentorVisit` model has a submitter `User`, a `School`, `visit_date`, and visit fields. It does not have a programme field. Youth assignment uses the separate custom `Mentor` model, while visit submissions use Django `User`.

The contract acknowledges the Mentor-vs-User mismatch, but then defers the mapping and still leaves programme-specific visit targets in v1. That means Zazi iZandi and Core Literacy can end up sharing the same numerator, or ECD can be split only by school type while Core/Zazi remain unsplit. If the original target is "min 5/6 per mentor per week", a programme-total count of 5 or 6 across dozens of coaches is also a different metric and will be too easy to green-light.

Recommended fix:

- Either render visit counts as "unattributed literacy visits" in v1 and do not score Zazi/Core visit RAG, or
- define a concrete attribution rule before coding, such as visit school in assigned-school set for the cohort, submitter mapped through `Mentor.user`, or an explicit programme field.
- If the target is changed from per-mentor to programme total, set a new programme-total target and document who approved that change.

Add fixture tests that create overlapping Zazi/Core schools and prove visits do not get double-counted or falsely attributed.

### 3. `dq.child_fk_resolution` ignores `child_2`

The contract defines literacy child FK resolution as:

`1 - null child_1_id / total`

The live `LiteracySession2026` model states the grain is one row per session with exactly two children, and it has both `child_1` and `child_2` resolved FKs. Checking only `child_1_id` can overstate or understate child resolution and does not measure "child FK resolution" for the actual row grain.

Recommended fix: choose one of these formulas explicitly:

- child-slot resolution: `(resolved child_1 slots + resolved child_2 slots) / (2 * literacy session rows)`
- fully resolved session rate: `sessions where child_1_id is not null and child_2_id is not null / literacy session rows`
- report both, with the headline chosen by the team

Also define how null child UID source fields are handled. A null resolved FK with no source child UID is a different failure from a source UID that failed lookup.

### 4. Client-side RAG cannot be correct with the current API/config schema

The contract says the backend returns `value`, `unit`, and notes, while RAG is computed client-side from config. That is fine only if the config/API contract also defines:

- direction: higher-is-better vs lower-is-better
- threshold mode: target minimum, target maximum, exact count, or band
- percent scale: `0.9` vs `90`
- integer count semantics: whether `value=6` means total count or per-entity average
- data availability: intentional unavailable/gap vs backend missing source vs zero denominator
- caveat flags: proxy, partial, low-fill, stale, unclassified

This matters immediately for the Data Team tile. `child_fk_resolution` is higher-is-better, but duplicate rate, future-dated count, and school-type hygiene are lower-is-better. If the config only assumes "value >= target is good", some data-quality sub-gauges will invert.

Recommended fix: add these fields to `LeadMeasure`/config and the response contract before implementation:

```ts
direction: "gte" | "lte";
valueScale: "ratio_0_1" | "percent_0_100" | "count" | "per_day";
availability: "available" | "intentional_gap" | "no_eligible_denominator" | "source_missing";
caveats?: Array<"proxy" | "partial" | "low_fill" | "stale" | "unclassified_rows">;
```

The exact names can differ, but the concepts need to exist.

### 5. The weekly window needs a business timezone, not server UTC

The contract says last completed week, Mon-Sun. The live Django settings use `TIME_ZONE = 'UTC'`, and the frontend repo already documents a known issue: Youth Sessions "today" stats show 0 after 10pm SAST because Render runs UTC, not Africa/Johannesburg.

If WIG dates are South African programme dates, then `timezone.now().date()` in UTC is not always the business date. This can affect last-completed-week selection around Sunday/Monday boundaries and can make "data as of" confusing.

Recommended fix:

- Define the WIG business timezone in the contract, likely `Africa/Johannesburg`.
- Implement a helper like `get_business_today()` and use it for `last_week`, `future_dated`, and `data_as_of`.
- Add a unit test that freezes time near the UTC/SAST boundary.

### 6. Backend role authorization needs a concrete DRF permission, not just a checklist line

The contract correctly says `/api/wig/*` must enforce ADMIN + PROJECT MANAGER. The live backend pattern is weaker: existing API views generally use `permissions.IsAuthenticated`, and the user role lives at `request.user.profile.role`.

Because the current codebase has no obvious reusable DRF role permission, an implementer can satisfy "authentication" accidentally by copying `PERM_CLASSES = [permissions.IsAuthenticated]` from `youth_sessions.py`.

Recommended fix:

- Add a small backend permission class, for example `IsAdminOrProjectManager`, checking `request.user.profile.role in {"ADMIN", "PROJECT MANAGER"}`.
- Use it on every `/api/wig/*` endpoint.
- Add API tests for ADMIN allowed, PROJECT MANAGER allowed, MENTOR forbidden, VIEWER forbidden, unauthenticated forbidden, and missing profile forbidden.
- Keep `SessionAuthentication` in mind: Django-session users must pass the same role check as Clerk users.

### 7. The frontend page plan mixes a server-side guard with a client-only SWR page

`plan.md` says `src/app/operations/wig/page.tsx` will have a server-side role guard and SWR fetch. The existing Youth Sessions page is a client component using `useAuth()` and SWR. The field-app page is a server component that calls guarded server functions.

A single `page.tsx` cannot both import `server-only` guard logic and be a normal client component with `useAuth()`/SWR. This needs a simple split:

- server `page.tsx`: call an ADMIN/PM guard, handle redirect/access-denied, render shell
- client child component: call `useAuth()`, SWR, and the WIG API wrappers

Also adjust the nav: the Project Management dropdown currently includes MENTOR access, but the WIG nav item must be hidden for MENTOR while the broader dropdown can remain available for other pages.

### 8. `plan.md` still repeats a dangerous reuse instruction

The metric contract says not to reuse youth-sessions cohort filters. The Phase 3 checklist says the same. But the "Key reference" section still says:

`api/views/youth_sessions.py - working-day logic, programme/school-type filters, coverage/heatmap aggregations to reuse`

That should be edited before implementation. The safe phrasing is:

`api/views/youth_sessions.py - working-day helper and response-shaping examples only; do not reuse INCLUDED_JOB_TITLES, programme filters, or school-coverage denominator for WIG.`

This is a small documentation contradiction, but it points directly back to the first review's highest-risk bug.

## Additional Gaps To Tighten

### Exact job titles need an evidence artifact

`Youth.job_title` is free text, not a model choice. The metric contract proposes job titles such as `Zazi Izandi Coach`, `Literacy Coaches (ZZ)`, `ZZ ECD Coach`, `ECD Practitioner`, `Practitioner`, and `Count Coach`. The feasibility matrix lists related counts, but the implementation plan should require a raw `job_title` distribution artifact or a read-only smoke command output.

This is especially important because spelling, pluralization, and case are the contract.

### ECD school type normalization should be centralized

The feasibility matrix says production has both `ECDC` and `ECD`. The live model choices include `ECDC`, `Primary School`, `Secondary School`, and `Other`; `ECD` is not in the choices list even though production apparently contains it. The WIG implementation should not scatter `type__in=["ECD", "ECDC"]` in several queries without one helper and one test.

Recommended helper: `is_ecd_school_type(value)` / `ECD_SCHOOL_TYPES = {"ECD", "ECDC"}`.

### Data-quality scope and freshness should be explicit in the API shape

The contract says Data Team formulas are computed over the full current dataset because accuracy is a state, not weekly. That is reasonable, but the API response should make this impossible to confuse with last week's lead-measure window.

Recommended response fields:

- `scope: "full_dataset"` vs `scope: "last_completed_week"`
- `dataset`: `literacy_sessions_2026`, `numeracy_sessions_2026`, `api_school`, etc.
- `rows_evaluated`
- `unclassified_count`
- `latest_source_date`

### Unresolved-youth sessions need to be visible, not silently dropped

Programme session metrics will probably filter through `youth__job_title`. That excludes sessions where `youth_id` is null even if `youth_uid` exists. The contract notes youth FK resolution is about 99.9 percent for literacy and 100 percent for numeracy, so this may be small, but the endpoint should still report an excluded unresolved-youth count per programme/session source. Otherwise data-quality problems can quietly lower programme activity.

## Recommended Edits Before Coding

1. Change Phase 3.0 from "DONE" to "metric contract drafted; blocking confirmations pending" until cohort, visit-target, school-denominator, and Data Team definitions are approved.
2. Replace the unsafe `youth_sessions.py` reuse line in `plan.md`.
3. Add a concrete backend permission class and auth test checklist.
4. Add business timezone to the contract and tests.
5. Fix `dq.child_fk_resolution` to account for both literacy child FK slots.
6. Add RAG direction, value scale, and availability/caveat metadata to the frontend config/API contract.
7. Decide whether visit metrics are unattributed, school-attributed, submitter-attributed, or mapped through `Mentor.user`; do not score Zazi/Core visit tiles until this is settled.

## Bottom Line

The previous review was mostly addressed, but the metric contract is not yet implementation-ready. The highest-risk remaining issue is visit attribution: without a real mapping, Zazi iZandi and Core Literacy can share the same visit numerator and show meaningless RAG statuses. The second highest-risk issue is Data Team accuracy: the child FK formula currently ignores `child_2`, and client-side RAG needs lower-is-better support before data-quality measures can be safely displayed.

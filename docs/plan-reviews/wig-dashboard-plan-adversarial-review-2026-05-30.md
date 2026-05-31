# Adversarial Review: WIG Dashboard Plan

Reviewed plan: `_plans/wig-dashboard/plan.md`
Date: 2026-05-30

## Verdict

Directionally good, but not ready to implement as written.

The high-level choices are sound: backend aggregation, a typed frontend config for v1, lag tiles held in an awaiting-data state, and deferring manual-entry departments. The risky part is Phase 3. It currently leaves too much room for incorrect metrics, especially around programme cohorts, time windows, denominators, visit-compliance nulls, and access control.

If implemented literally, the dashboard could look polished while showing wrong WIG statuses.

## Evidence Checked

- `_plans/wig-dashboard/plan.md`
- `_plans/wig-dashboard/feasibility-matrix.md`
- `_plans/wig-dashboard/framework-decisions.md`
- `src/app/operations/youth-sessions/page.tsx`
- `src/components/layout/Navbar.tsx`
- `src/middleware.ts`
- `src/lib/masi/auth-guard.ts`
- `src/lib/api/youth-sessions/*`
- `/backend/Masi Web Main/api/views/youth_sessions.py`
- `/backend/Masi Web Main/api/models.py`
- `/backend/Masi Web Main/api/urls.py`
- `/backend/Masi Web Main/api/views/__init__.py`

## Blocking Gaps

### 1. The plan says to reuse youth-sessions helpers, but those helpers exclude two v1 cohorts

Plan Phase 3 says v1 covers "Zazi iZandi/Literacy, ECD, Numeracy, Data team" and says to reuse `youth-sessions/*` helpers for programme and school-type filters.

The live backend helper is deliberately narrower:

- `api/views/youth_sessions.py` hard-codes `INCLUDED_JOB_TITLES = ['Literacy Coach', 'Numeracy Coach']`.
- Its own comment says Zazi Izandi Coach and ZZ ECD Coach are excluded.
- `_get_session_querysets()` filters both literacy and numeracy sessions by those included job titles.

That means a naive reuse would silently undercount or zero out Zazi iZandi and ECD slices. Reuse the working-day helpers, but do not reuse the current programme filters as the WIG source of truth.

Recommended fix: add a WIG-specific cohort map before endpoint implementation, for example:

- `core_literacy`: explicit job titles and/or school-type constraints.
- `zazi_izandi`: explicit job titles.
- `ecd_literacy`: explicit job titles and ECD/ECDC school-type constraints.
- `numeracy`: explicit job titles.
- `data_team`: no youth cohort; session-data-quality source.

Back this with Django tests that prove each configured cohort includes the expected job titles and excludes the others.

### 2. Metric denominators and period semantics are not defined tightly enough

The plan lists measures like "sessions/day per coach", "% active coaches this week", "school coverage % this week", and a `period` toggle of week/month. Those phrases are not yet implementable without making hidden decisions.

The plan needs to define:

- Whether the default week is current week-to-date, last completed week, or rolling last 5 working days.
- Whether month means month-to-date, last 30 days, or full calendar month.
- Whether sessions/day divides by elapsed working days, eligible working days since coach start date, or all weekdays in the period.
- How the 20 sessions/week numeracy target behaves under a month view.
- Whether current partial weeks should be RAG-scored or shown as "in progress".
- Whether public holidays matter or weekdays are enough for v1.
- Whether denominators include all active coaches, only coaches started before period end, only assigned coaches, or only coaches with at least one session.

The existing youth-sessions code has useful working-day helpers and start-date handling, but the WIG dashboard needs an explicit metric contract. Without this, client-side RAG can be mathematically correct against the wrong denominator.

Recommended fix: make the backend return a `window` object and per-measure denominator metadata:

- `period`
- `date_from`
- `date_to`
- `elapsed_working_days`
- `eligible_entity_count`
- `numerator`
- `denominator`
- `calculation_note`
- `data_as_of`

### 3. School coverage cannot reuse the existing coverage denominator

The youth-sessions school coverage endpoint is useful for the current page, but it is not a WIG coverage formula.

It builds covered schools from session rows in the selected range, then builds uncovered schools from schools that have ever had a literacy or numeracy session. It is not a clean "programme target schools covered this week" denominator.

For WIG, the denominator must be intentional:

- All active schools?
- Schools with active youth assigned?
- Schools targeted by the programme?
- Schools of type ECD/ECDC for ECD Literacy?
- Primary schools only for core literacy or Zazi iZandi?

Recommended fix: define a programme-specific school denominator in the WIG backend, and return both numerator and denominator lists for auditability. Do not derive the WIG denominator from "schools that have ever had sessions."

### 4. Mentor-visit compliance needs null and visit-type rules

The visit models have nullable compliance booleans because non-observation visits do not necessarily complete those fields. The plan currently says "% visits with tracker/admin booleans true", which is under-specified.

The backend must decide:

- Is the denominator only `visit_type='observation'`?
- Are null booleans excluded, counted as non-compliant, or labelled incomplete?
- Does "compliance" mean every relevant boolean is true, or separate rates per boolean?
- For literacy, are `letter_trackers_correct`, `reading_trackers_correct`, `sessions_correct`, and `admin_correct` all required?
- For YeBo and Numeracy, which fields form the compliance bundle?

There is also a model mismatch to handle: youth assignment uses the custom `Mentor` model, while visit submissions use Django `User`. A per-mentor school-visits/week metric can count submitter `User`s, but mapping that back to programme ownership or assigned youth is not automatic.

Recommended fix: create explicit visit metric definitions per visit model, including denominator filters, required fields, null treatment, and whether the metric is by submitter, by assigned mentor, or by programme.

### 5. Access control is ambiguous and probably too loose for a WIG scoreboard

The plan says `/operations/wig` is "Clerk-protected, like other operations dashboards" and later says "Clerk middleware protects the route".

In the live frontend, middleware protects all non-public routes by sign-in only. The Project Management nav is hidden unless the Django role is ADMIN, PROJECT MANAGER, or MENTOR, but hiding a link is not authorization. A signed-in user could still try the URL directly.

The field-app dashboard uses a stricter server-side guard and deliberately restricts to ADMIN and PROJECT MANAGER.

Recommended fix: decide access before coding:

- If WIG is leadership-only, use a server-side role guard comparable to `assertFieldAppAccess()` and add backend permission checks for `/api/wig/*`.
- If mentors should see it, state that explicitly and keep the nav/backend permissions aligned.

Do not leave this as "Clerk-protected"; that only answers authentication, not authorization.

### 6. Backend wiring is missing one existing repo-specific step

The plan says to add `api/views/wig.py` and wire it in `api/urls.py`.

The current URL module imports `views` via `from . import views`, and `api/views/__init__.py` explicitly imports and exports view functions/classes. If new WIG functions live in `api/views/wig.py`, either `api/views/__init__.py` must import/export them, or `api/urls.py` must import directly from `.views.wig`.

Recommended fix: add this to the backend checklist so the plan does not produce an avoidable runtime import error.

### 7. Data-quality metrics are listed, but formulas are not yet real contracts

The data-quality endpoint lists capture-on-time, duplicate rate, future-date count, FK resolution, and school-type hygiene. The relevant fields exist on the 2026 session models, but each metric still needs a formula.

Define at minimum:

- Capture-on-time: based on `capture_delay <= N`, `capture_delay_flag`, or normalized flag values?
- Duplicate rate: which `duplicate_status` values count as duplicate?
- Future-date count: future relative to server date or selected period end?
- FK resolution: youth FK, school FK, child FK, or all? Literacy and numeracy have different child grains.
- School-type hygiene: missing school FK, missing type, unexpected type value, or ECD/ECDC normalization?
- Whether these are computed over literacy only, numeracy only, or both.

Recommended fix: include a small table of data-quality metric keys and exact formulas before implementing `/api/wig/data-quality/`.

### 8. The frontend config/API boundary needs validation

The plan has a good `source` key idea: config lead measures name backend metric keys. The risk is that a config typo or missing backend metric would render blanks or misleading "behind" states.

Recommended fix:

- Make the API response include a dictionary keyed by source.
- Validate at runtime that every configured source exists.
- Render a distinct "metric unavailable" state, not red/behind, when a source is missing.
- Add a tiny unit or build-time validation helper if the repo gains a test runner later.

### 9. Verification plan relies too much on prod manual checking

"Test endpoints against prod data (read-only)" is necessary, but it is not enough. The backend already has Django tests for endpoint behavior and data edge cases. WIG metrics are calculation-heavy, so they need deterministic fixture tests.

Recommended fix: add backend tests for:

- Cohort inclusion/exclusion by job title and school type.
- Week and month period boundaries.
- Start-date eligibility.
- Zero-denominator behavior.
- Null visit booleans.
- Duplicate/future/FK-resolution data-quality formulas.
- Payload source keys matching the frontend config.

Keep the prod check as a final smoke test, not the main correctness test.

## What Is Sound

- Backend aggregation is the right call. The frontend should not fetch raw sessions and calculate WIGs client-side.
- Config-not-DB is appropriate for v1 because definitions are auto-computed and targets are not team-edited yet.
- Deferring manual-entry departments is correct. Finance, Marketing, Fundraising, and Top Learners would otherwise force a different data-entry product into the MVP.
- Lag/outcome tiles should be scaffolded but not scored until 2026 assessment data is queryable.
- The bundled WIG pattern is better than collapsing multi-target programmes into one opaque average.
- The route `/operations/wig` fits the current information architecture, assuming access scope is clarified.

## Recommended Phase 3 Rewrite

Before building UI components, split Phase 3 into smaller slices:

1. Metric contract and cohort definitions
   - Write the backend response shape.
   - Define period semantics.
   - Define each programme cohort and denominator.
   - Define visit-compliance and data-quality formulas.

2. Backend metric service plus tests
   - Add `api/views/wig.py`.
   - Add `api/views/__init__.py` exports or direct URL imports.
   - Add Django tests with small fixtures.
   - Smoke-test against production read-only data after fixture tests pass.

3. Frontend config and API validation
   - Add typed config.
   - Add API wrappers.
   - Add missing-source handling.
   - Keep RAG client-side only after backend values are trusted.

4. UI page and nav
   - Add `/operations/wig`.
   - Add the Project Management nav item.
   - Implement loading/error/empty/unavailable states.
   - Use the existing operations dashboard visual pattern, but avoid hiding data-quality caveats.

5. Access-control decision
   - Either explicitly make it signed-in Project Management access including mentors, or make it ADMIN/PROJECT MANAGER only with server-side and backend enforcement.

## Open Questions To Resolve Before Coding

1. Should mentors be allowed to view the WIG dashboard, or only ADMIN/PROJECT MANAGER?
2. For weekly lead measures, should the default be current week-to-date or last completed week?
3. For coach targets, should denominators include all active assigned coaches or only coaches whose `start_date` makes them eligible in the period?
4. For ECD Literacy, is the cohort defined by youth job title, school type, or both?
5. For school coverage, what is the authoritative denominator for each programme?
6. For mentor visit compliance, are null observation fields counted as non-compliant or excluded as incomplete?
7. Should current partial-week metrics be RAG-scored, or shown as "in progress" until the week closes?

## Bottom Line

I would not start implementation from the current Phase 3 checklist. Tighten the metric contracts first. The plan is close, but the missing definitions are exactly the kind that create confident-looking dashboards with bad numbers.

# Adversarial Review: School Closure Calendar Plan

Reviewed plan: `/Users/jimmckeown/.claude/plans/i-have-a-problem-magical-meerkat.md`
Date: 2026-06-05

## Verdict

Directionally right, but not ready to implement as written.

The core insight is correct: once closures can vary by school/type/region, the denominator must become expected coach-days rather than `eligible_coaches x working_days`. The plan also picks the right system of record: Masi should author closures and Zazi should consume a local cache.

The risky part is the cross-system contract. If implemented literally, duplicate closure rows, stale deleted closures, region/type mismatches, and mid-period coach start dates can still produce wrong denominators while the UI looks authoritative.

## Evidence Checked

- `/Users/jimmckeown/.claude/plans/i-have-a-problem-magical-meerkat.md`
- `_plans/wig-dashboard/metric-contract.md`
- `documentation/data-architecture.md`
- `src/app/operations/wig/layout.tsx`
- `src/components/layout/Navbar.tsx`
- `src/lib/api/wig.ts`
- `src/lib/masi/auth-guard.ts`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/models.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/wig_metrics.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/views/youth_sessions.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/permissions.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/views/lookups.py`
- `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/api/management/commands/sync_airtable_schools.py`
- `/Users/jimmckeown/Development/Zazi_iZandi_Website_2025/api/views.py`
- `/Users/jimmckeown/Development/Zazi_iZandi_Website_2025/api/models.py`
- `/Users/jimmckeown/Development/Zazi_iZandi_Website_2025/api/management/commands/compute_school_summaries_2026.py`
- `/Users/jimmckeown/Development/Zazi_iZandi_Website_2025/api/middleware.py`
- `/Users/jimmckeown/Development/Zazi_iZandi_Website_2025/requirements.txt`

## Blocking Findings

### 1. The planned uniqueness constraint does not prevent duplicate global/type rows on Postgres

The plan proposes one unique constraint on `(date, scope_type, scope_school, scope_school_type, scope_region)` so holiday materialization can upsert cleanly.

That does not hold for nullable scope columns. Masi production is Postgres via `DATABASE_URL` (`masi_website/settings.py`), and Postgres unique constraints allow multiple rows where any constrained column is `NULL`. A global closure row will have several null scope fields, so duplicate global holidays can be inserted. Type and region rows have nulls too.

Impact: `load_public_holidays --year 2026`, the bulk endpoint, or concurrent admin edits can create duplicate rows. The proposed resolver then has to break same-specificity ties, and an accidental duplicate `is_open=True` row can override a closed row.

Recommended fix: replace the single nullable composite unique constraint with one of:

- Conditional unique constraints per scope:
  - global: unique `(date)` where `scope_type='global'`
  - type: unique `(date, scope_school_type)` where `scope_type='type'`
  - region: unique `(date, normalized_region)` where `scope_type='region'`
  - school: unique `(date, scope_school)` where `scope_type='school'`
- Or a non-null canonical `scope_key` column such as `global`, `type:ECDC`, `region:Gqeberha`, `school:SCH-12345`, unique with `(date, scope_key)`.

Add a migration test that proves duplicate global rows fail on the database actually used in production.

### 2. The model needs a nullable/system-safe author field for public holidays

The plan lists `created_by (FK->User)` while also requiring a management command to create `source=public_holiday` rows. A cron/import process has no `request.user`.

Impact: if `created_by` is non-null, public holiday loading either fails or requires inventing a fake staff user. If it is nullable but not explicitly planned, the serializer/admin contract will drift.

Recommended fix: specify `created_by = ForeignKey(User, null=True, blank=True, on_delete=SET_NULL)` and add an explicit `created_by_display` or `created_via` convention. In the serializer, set `created_by` only for request-authored manual rows.

### 3. Zazi cannot support region-scoped closures after Part B as claimed

The plan says global/type/region resolve from each backend's own data and that only single-school scope needs cross-system school-ID matching.

That is not true for the Zazi 2025 backend. The denominator-heavy Zazi data is built from `SchoolSummary2026` and `TeampactSession2026`. `SchoolSummary2026` has `school_name` and `school_type`, but no `city`. `TeampactSession2026` has `program_name`, coordinates, and session fields, but no city. City appears on EGRA assessment records, not on the school/session summaries that drive the programme metrics.

Impact: after Part B, Zazi can resolve global closures and maybe type closures, but not region closures. A city closure would be ignored or guessed from an unrelated dataset.

Recommended fix: move region support behind the same identity work as single-school support, or add `city` to the Zazi closure identity/cache before claiming region scope works. The export/cache should carry canonical `school_uid`, `school_type`, and `city` per school name, not rely on `SchoolSummary2026` alone.

### 4. Masi `School.city` is not reliably maintained by the current school sync

The plan chooses `Region = School.city` and says the frontend can derive region options from `/api/schools/`.

The live Masi school sync explicitly says the new Airtable table does not include `city` and preserves it as-is. It syncs `name`, `type`, `school_uid`, `school_number`, `suburb`, `latitude`, and `longitude`, but not `city`.

Impact: region closures can be incomplete or stale in the authoring system itself. The UI can show stale city values, omit current schools from a city, or apply a closure to a region label that is not maintained by the source-of-truth sync.

Recommended fix: before shipping region scope, either:

- Add a maintained region/city field to the Airtable school sync and backfill current schools, or
- Defer region scope and ship only global/type/school, or
- Use a dedicated normalized closure region mapping table with an explicit reconciliation workflow.

### 5. Masi and Zazi school-type values do not match

Masi school choices are `ECDC`, `Primary School`, `Secondary School`, and `Other`. The Masi Airtable sync maps Airtable `ECD` to Masi `ECDC`. Zazi summary code uses `ECD` and `Primary School`.

Impact: a type-scoped Masi closure stored as `ECDC` will not match Zazi's `ECD` rows unless the export/cache includes an explicit cross-system type map. This breaks the plan's claim that type closures work cross-system before identity reconciliation.

Recommended fix: make school type a canonical API enum at the closure boundary, for example `primary` and `ecd`, and map each backend's local values at ingress/egress. Do not export raw Masi `School.type` values and expect Zazi to match them.

### 6. The denominator refactor omits coach start-date clipping

The plan correctly changes WIG `sessions_per_day` from `eligible_coaches.count() * working_days` to per-coach expected days. But the current WIG code marks coaches eligible if `start_date <= period_end`, then gives every eligible coach the full period denominator.

Current evidence:

- `eligible_coaches()` includes active coaches whose `start_date` is null or `<= as_of`.
- `sessions_per_day()` then multiplies the eligible count by the full window working-day count.
- The youth heatmap already handles this better by counting only days on or after each youth's `start_date`.

Impact: a coach who starts on Friday of the period still receives Monday-Friday denominator days. School closures will reduce the denominator, but the metric can remain materially wrong.

Recommended fix: make the expected coach-days formula:

`sum(open days for coach.school from max(period_start, coach.start_date or period_start) through period_end)`

Also decide whether active coaches with `end_date` or status changes need end-date clipping. Add a fixture test with a mid-week starter and a school closure in the same window.

### 7. The Zazi sync plan has no deletion/tombstone strategy

The plan includes `DELETE /api/closures/<pk>/` on Masi, but the Zazi cache pull is described as `GET /api/closures/export/?since=&date_from=` and upsert local rows while keeping last-good on failure.

Impact: if an admin deletes a closure or changes its date/scope, Zazi can retain the old cached row forever. Denominators will stay wrong in Zazi after same-day corrections, exactly the workflow the feature is supposed to support.

Recommended fix: choose one sync contract before implementation:

- Soft-delete Masi closures with `deleted_at`, export tombstones, and delete/mark cache rows in Zazi.
- Or make Zazi refresh by bounded full window replacement: fetch all closures for `[date_from, date_to]`, upsert returned rows, and delete local cache rows in that window that are absent from the export.
- Or make closure rows immutable and create explicit open overrides instead of deletes, then remove hard delete from the API/UI.

Whichever choice is made, add a test where a closure is removed in Masi and the next Zazi sync removes its effect from `count_work_days`.

### 8. The export endpoint auth needs to be specified separately from staff CRUD auth

The plan says CRUD is gated to `IsAdminOrProjectManager`, while export is secret-gated. Masi currently has no internal-auth middleware. Zazi has `InternalAuthMiddleware` for inbound `/api/*`, but that only protects Zazi; it does not authenticate Zazi when it calls Masi.

Impact: if export is accidentally implemented with the same `SessionAuthentication, ClerkAuthentication` stack as staff CRUD, Zazi's shared-secret request will be unauthenticated. If it is implemented with `IsAdminOrProjectManager`, it will 403. If it is implemented as a broad middleware later, it can accidentally affect normal browser API calls.

Recommended fix: make `/api/closures/export/` its own view with:

- `authentication_classes = []`
- a dedicated `IsInternalService` permission that checks only `X-Internal-Auth` using `hmac.compare_digest`
- a separate `MASI_INTERNAL_API_SECRET` setting
- tests for no header, wrong header, right header, and proof that staff CRUD still requires Admin/PM user auth

### 9. Zazi has more denominator call sites than the plan's cache summary implies

The plan calls out deleting the duplicated `SCHOOL_HOLIDAYS_2026` and `count_work_days` copies in `api/views.py` and `compute_school_summaries_2026.py`. That is necessary, but the Zazi live API uses `count_work_days` in several user-facing calculations beyond the nightly school summary:

- `programme_overview` computes EA programme-day rates live.
- `sessions_activity` builds the last-10-weekday heatmap and skips hardcoded holidays inline.
- `ea_performance` computes per-EA programme-day rates.
- `ea_performance_history` recomputes historical x-axis values from live sessions.
- `compute_group_summaries_2026.py` imports `count_work_days` from the school-summary command.

Impact: a partial utility extraction can make one page correct while another page still uses stale denominators.

Recommended fix: make the Zazi work-days utility migration a tracked call-site inventory with tests per endpoint family, not just a helper extraction. Include `compute_group_summaries_2026.py` and any imports of the old function in the verification checklist.

## Important Non-Blocking Findings

### 10. The individual youth detail metric semantics are already inconsistent

The plan says `youth_sessions_detail` should update `total_working_days` and `avg_sessions_per_day`. Current code computes `total_working_days`, but `avg_sessions_per_day` is `total_sessions / days_with_sessions`, not `total_sessions / total_working_days`.

Impact: if the feature changes only `total_working_days`, the displayed active/total day counts will account for closures but the average will remain an average per active day. That may be desired, but it contradicts the plan's opening claim that every per-day stat divides by working days.

Recommended fix: explicitly choose and document one of:

- `avg_sessions_per_working_day = total_sessions / eligible_open_working_days`
- `avg_sessions_per_active_day = total_sessions / days_with_sessions`

Rename the field or add a new field rather than silently changing semantics.

### 11. `/api/schools/` currently returns all schools, despite the docstring saying active schools

The plan reuses `/api/schools/` for the closure UI school list and region options. The live `SchoolListAPIView` query is `School.objects.all().order_by('name')`, not `is_active=True`.

Impact: the UI may allow closure rows for inactive schools and may derive region options from inactive/stale records.

Recommended fix: either filter the lookup endpoint for closure use, add `?is_active=true`, or create a closure-specific lookup endpoint that returns only active schools plus normalized region/type values.

### 12. Frontend API paths should follow the existing `NEXT_PUBLIC_API_URL` convention

The plan documents backend routes as `/api/closures/...`, which is fine for Django URL descriptions. But frontend clients in this repo use `NEXT_PUBLIC_API_URL=https://.../api` and pass paths like `/wig/lead-measures/` or `/youth-sessions/summary/`.

Impact: a literal frontend wrapper that calls `${API_URL}/api/closures/` would produce `/api/api/closures/`.

Recommended fix: in `src/lib/api/closures.ts`, use `/closures/`, `/closures/bulk/`, and so on, mirroring `src/lib/api/wig.ts`.

### 13. New Zazi dependencies are missing from the plan

The plan proposes `rapidfuzz` for reconciliation. Zazi `requirements.txt` does not include it. If the Zazi Airtable sync is not implemented with plain `requests`, dependencies for that also need to be specified.

Impact: implementation can pass locally only if the developer happens to have packages installed, then fail on Render.

Recommended fix: add explicit dependency lines to the Zazi plan and include an import smoke test or command dry-run in verification.

## What Is Sound

- Masi as the system of record is the right boundary.
- Materializing public holidays as rows is better than computing them dynamically because overrides and export become ordinary closure data.
- A pure resolver module is the right place for most-specific-wins logic.
- Batch-loading closures for a date window is necessary; per-coach/per-day DB queries would not survive real dashboard traffic.
- Keeping closed-day sessions in the numerator is the right metric behavior.
- Deferring heatmap grey styling is reasonable once the denominator contract is correct.

## Recommended Rewrite Before Coding

1. Tighten the Masi data model.
   - Replace nullable composite uniqueness.
   - Make `created_by` nullable/system-safe.
   - Add normalized `scope_key` or per-scope constraints.
   - Define normalized region and type enums.

2. Lock the cross-system closure contract.
   - Export stable row IDs, `updated_at`, and `deleted_at` or full-window replacement semantics.
   - Export canonical scope values, not raw backend-local labels.
   - Make region support dependent on maintained identity/city data.

3. Fix denominator formulas before UI.
   - WIG expected coach-days must clip by coach start date.
   - Youth detail must explicitly choose active-day vs working-day average semantics.
   - Zazi utility migration must cover every `count_work_days` and inline holiday call site.

4. Split staff CRUD and service export auth.
   - Staff CRUD: Session/Clerk + Admin/PM.
   - Export: no user auth, shared-secret permission only.

5. Add failure-mode tests.
   - Duplicate global closure insert.
   - More-specific open override.
   - Mid-week coach start date.
   - Masi delete/update propagates to Zazi cache.
   - Zazi type mapping `ECDC` -> `ECD`.
   - Region closure rejected/deferred until city identity exists.

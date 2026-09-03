# Frontend Build Log

Last updated: 2 September 2026

This is the project-level implementation and release log for the Next.js repository. It starts with the current work rather than reconstructing older history. Detailed WIG-dashboard history remains in [`dashboard-log.md`](./dashboard-log.md).

## 2 September 2026 - Local finance funder dashboard verification

Status: the finance dashboard implementation is committed on the local
`feature/finance-dashboard` worktree through `39b2311`. The matching Django API was
migrated and loaded with the schema-1.0.0 example snapshot in a dedicated local
PostgreSQL database. This is local verification only: no branch was pushed, no pull
request was opened, and no production database or deployment was changed. Publication
of the corrected management workbook remains blocked by its current validation findings.

### Verified behavior

- A signed-out request to `/operations/finance/funders` redirected to Clerk sign-in and
  preserved the finance route as the post-authentication destination.
- Clerk created one profile in the isolated local database with its safe default
  `VIEWER` role. That role received the server-rendered `Access denied` state and no
  finance data. Temporarily changing only that local profile to `ADMIN` exposed the
  dashboard; restoring it to `VIEWER` and reloading the same authenticated finance tab
  returned to `Access denied` with no finance table. The local profile remains `VIEWER`.
- The authorized dashboard rendered its source/run provenance, five contract rows,
  allocation-coverage table, expected over-allocation badge, and hygiene findings grouped
  by code. Expanding an Alpha/current contract rendered its derived Youth Jobs line and
  asserted Training line.
- Finance appeared under Leadership in the primary navigation and on the Operations hub.
- Visual inspection passed at 1280 px desktop and 390 px mobile widths. At both widths,
  `body.scrollWidth` and `documentElement.scrollWidth` equalled `innerWidth`; the wide
  finance tables stayed inside their own horizontal scrollers instead of widening the
  page. Headings, provenance, badges, cards, and table content remained readable. The
  visible `N` control was the local Next.js development-tools overlay, not application UI.
- Recorded the prescribed four-frame `finance_funders_page.gif` at 1280 by 900 pixels,
  covering the contract overview, expanded Alpha lines, allocation coverage, and hygiene.

### Local proof boundary

- The Django fixture loader persisted exactly one 2026 snapshot with run ID
  `2026-09-01T12:00:00Z-0a1b2c`; the frontend then read that snapshot through the real
  local authenticated API path.
- The local database is separate from the existing application database. Production,
  internal, and external database URLs were not used.
- No real finance snapshot artifact was published. The corrected workbook dry run still
  fails closed on five missing KWF contract keys and nine genuinely over-allocated rows;
  these source findings must be resolved before the real workbook can replace the fixture.
- The in-app browser's virtual tab selection did not dispatch the page-focus event that
  SWR listens for. The exact focus-triggered destructive-alert transition is therefore
  unverified; the server-side `VIEWER` denial and absence of finance tables were verified.

## 1 September 2026 - Independent NYS and SEF theoretical subsidy scenarios

Status: backend commit `5f418f9` and frontend commit `bbcf24b` are on `main` and
`origin/main`. Render deployed the backend as live deployment
`dep-dabnb4rncjis73df5lvg` with migration `0048`, and both linked Vercel projects
deployed the frontend successfully. Authenticated production checks verified the saved
zero-SEF state and an unsaved 200-SEF preview. The production Airtable publication and
the shared Budget Scenario remain unchanged.

### Decisions and behavior

- Added the reviewed V1 specification at
  `_plans/youth-budget-subsidy-scenarios-v1.md`. The review blocked a destructive
  one-step field rename and a migration that would have silently activated 200 SEF jobs.
  The implemented contract keeps temporary legacy aliases and requires an explicit
  what-if action before an existing saved scenario moves from zero to the suggested 200
  SEF full-time jobs.
- Separated Airtable source information from theoretical planning. The source panel shows
  precisely defined NYS and SEF counts, last complete SAST sync time, and unavailable or
  latest-attempt-failed states. It explicitly says that the counts do not enter V1 costing.
- Reorganized the levers into compact organisation controls followed by vertically stacked
  NYS and SEF cards. Each scheme owns contribution, full-time, part-time, exact start date,
  and exact end date. The cards show backend-authored requested, modelled, and future-hire
  shortfall values.
- Renamed Vacancy Start Month in the UI to `Open Posts Assumed Filled From`, which states
  its real effect. Holiday Pay, Mentor Reserve, and the combined planned-subsidy total now
  sit below both scheme cards as requested.
- The combined status uses one backend capacity pool, and communicates when requested
  theoretical jobs are excluded from relief because they require future hires.
- Removed the unused client-side committed financial calculator. Live financial results
  continue to come only from the authenticated backend preview.
- Kept Quick Estimate as a clearly manual rough scratchpad. Its one month multiplier
  cannot correctly prefill NYS and SEF cohorts with different date intervals.
- Renamed static headcount copy to `current core youth in source` so it is not confused
  with the month-specific payroll population after part-time conversions.

### Verification

- `pnpm test:unit`: all 9 budget tests passed, including source available/unavailable
  semantics and canonical scenario payload fields.
- `pnpm exec tsc --noEmit --incremental false`: passed.
- `pnpm lint`: passed with zero errors and the pre-existing
  `@next/next/no-img-element` warning in `src/app/image-debug/page.tsx`.
- Network-enabled `pnpm build`: passed; compilation, TypeScript, all 27 static pages, and
  `/operations/school-programme-grid/budget` completed successfully. Existing
  duplicate-lockfile and middleware-deprecation warnings remain.
- The local visual route could not be inspected through the connected Chrome surface
  because its loopback navigation proxy failed before rendering. No desktop, 390px,
  interaction, or dark-state visual claim is made from this local pass. The application
  remains light-only based on the previously verified shell state.
- Render identifies backend commit `5f418f9` as live deployment
  `dep-dabnb4rncjis73df5lvg`; the deploy log records migration `0048` applying
  successfully before Gunicorn started and the service became live.
- GitHub deployment status reports success for both `Vercel - masi-web-nextjs` and
  `Vercel - masi-web-nextjs-dqdn` on frontend commit `bbcf24b`.
- The authenticated production page rendered the unavailable source state honestly rather
  than fabricating zeroes, the renamed open-post control, stacked NYS and SEF cards, exact
  dates, the explicit `Use planned 200` action, and the combined planning status.
- The migrated saved state remained 127 NYS full-time plus 41 part-time and zero SEF jobs.
  Selecting `Use planned 200` without saving requested 368 combined jobs, modelled all
  323 eligible current core youth, and reported 45 jobs requiring future hires. The
  at-plan headline changed from R688,314 over budget to R254,314 over budget. `Reset to
  saved` restored the zero-SEF scenario and original headline; no Save action was used.
- Desktop and narrow responsive production screenshots were inspected. The new source
  panel, organisation controls, both scheme cards, dates, shortfall status, and the moved
  Holiday Pay and Mentor Reserve fields remained readable and inside the viewport. The
  pre-existing Funding Pots table remains the only wide element and is bounded by its
  existing scroller. The application exposes no dark theme, so no dark-state claim is made.
- The guarded production `sync_airtable_youth --dry-run` reported zero creates, 1,898
  updates, zero skips, zero orphan deletes, 1,898 matched enrichment links, and zero link
  errors. It did not change the source snapshot, so the live panel correctly remains
  unavailable pending a separately authorized apply.

### Release work still required

1. Obtain fresh count-specific authorization before publishing the reviewed production
   dry-run result: zero creates, 1,898 updates, zero skips, zero orphan deletes, and all
   1,898 enrichment links matched. Re-run the preflight immediately before `--apply` and
   stop if any count changes.
2. Read back the published source receipt and source-only NYS/SEF counts after an
   authorized apply; until then the live unavailable state is correct.
3. Preview and explicitly authorize any shared production scenario save separately. The
   deployment does not activate the suggested 200 SEF jobs.

## 1 September 2026 - Variable programme horizon and category forecast preview

Status: backend commit `4392964` and frontend commit `39ff288` are on `main` and
`origin/main`. Render deployed the backend successfully as live deployment
`dep-dabij415efls739n0sl0` and applied migration
`0047_budgetscenario_last_paid_programme_date`. Both linked Vercel projects deployed the
frontend successfully. Authenticated production browser checks verified the default and
Mid-November forecast paths without saving a shared scenario.

### Decisions and behavior

- Added one saved `Last paid programme date`, defaulting to 30 November 2026, with exact
  date input and End October, Mid-November, Full November, and Custom date affordances.
  The date caps eligible working days for core and ringfenced rural youth. NYS remains a
  full-month contribution capped at gross plus UIF, so it is not divided by the fraction
  of school days worked.
- Added an authenticated stateless backend preview. Every draft lever now recalculates
  currently employed and at-plan projections, core verdicts, per-pot and unique rural
  projections, feasibility, and the category chart without saving the shared scenario.
  The page has one draft owner, so the headline, chart, tables, and lever comparison all
  derive from the same preview rather than separate client calculations.
- Projected chart bars now stack core, mentor, and rural. Core remains the prominent Rand
  label. Rural uses the unique ringfenced youth union rather than summing per-funder
  forecasts, which prevents overlapping pot school lists from double-counting youth.
- Mentor is explicitly an estimate rather than a hidden salary model: each projected month
  uses the arithmetic mean of the latest three published Mentor actuals. The chart states
  the monthly estimate and names the source months. A touched month receives the full
  mentor estimate; the programme end date does not prorate mentor within a month.
- Projected bars visibly show working-day counts. Each projected SVG group and each day
  cell in the projection tables exposes the exact backend-supplied working dates for hover,
  focus, and assistive technology. The frontend contains no duplicated term calendar.

### Verification

- `pnpm test:unit`: all 6 budget component and pure-data tests passed.
- `pnpm exec tsc --noEmit`: passed.
- `pnpm lint`: passed with zero errors and the pre-existing
  `@next/next/no-img-element` warning in `src/app/image-debug/page.tsx`.
- Sandboxed `pnpm build`: reached compilation but failed only because Google Fonts were
  network-blocked. Re-running with network access passed: compilation and TypeScript
  completed, all 27 static pages generated, and
  `/operations/school-programme-grid/budget` appeared in the route manifest. The existing
  duplicate-lockfile/workspace-root and `middleware` deprecation warnings remain.
- Backend `api.tests_youth_budget`: all 63 tests passed.
- Full backend `manage.py test api`: all 562 tests passed.
- Render identifies `4392964` as the last successfully deployed commit. Deployment
  `dep-dabij415efls739n0sl0` completed in 1m59s; its build log records
  `Applying api.0047_budgetscenario_last_paid_programme_date... OK` before the service
  became live.
- GitHub deployment statuses for `Vercel - masi-web-nextjs` and
  `Vercel - masi-web-nextjs-dqdn` both completed successfully for `39ff288`.
- An authenticated production reload rendered the exact date picker, End October,
  Mid-November, Full November, and Custom date controls; January through August actuals;
  projected core, mentor, and rural segments; visible working-day counts; and exact date
  descriptions.
- The live default remained 30 November with the core-only headline at R718,965 over
  budget. Selecting Mid-November changed the date to 14 November, the headline to
  R386,871 over budget, and November to 10 working days with core R195,749, mentor
  R81,586, and rural R52,148. Returning to Full November restored 21 working days and the
  R718,965 headline. No Save action was used, so the shared scenario was not changed.
- Desktop light-mode rendering was visually inspected. At the narrow mobile breakpoint,
  the new headline cards and programme-date control fit the viewport; the pre-existing
  850-pixel Funding Pots table remained bounded by its own horizontal scroller and clipped
  section rather than widening the page. The current application shell exposes no dark
  theme, so no dark-mode production claim is made.

## 31 August 2026 - Youth Budget actuals publication and dynamic chart boundary

Status: backend commit `ca97504` and frontend commit `7076c04` are on their respective
`main` and `origin/main` branches. Render deployed the backend successfully as live
deployment `dep-dab0c50ae00c73dfdvh0`, and both linked Vercel projects deployed the
frontend successfully. The production expenditure dry run succeeded and changed no
database rows. Jim then explicitly authorized the guarded production apply, which
restated all eight January-through-August rows. Independent database readback and
authenticated desktop and mobile browser checks confirmed the published figures and
actual/projected boundary.

### Source decision and finance evidence

- Jim designated the newest dated workbook in the ignored
  `/Users/jimmckeown/Development/masi-finance/management_sheets` directory as the complete
  source of truth. Historical website months are restated from that workbook; missing
  rows are not recovered from another workbook or an older database value.
- The selected file was `20260829 - Masinyusane Management Accounts.xlsx`, SHA-256
  `81ed709ff0506f574d00e3c9f9852a28b87b421383282135c382d32882262fe6`. Filtering the
  `Expenditure` tab to 2026 rows whose Category 3 contains `Youth Jobs:` classified 2,020
  rows through August.
- Published-source totals are July R172,852.53 and August R882,963.85. January through
  August totals R3,009,253.32. The workbook also has three 2026 rows with Excel errors in
  all category columns: July R700, August R700, and August R275. They remain excluded from
  the Youth Jobs totals and visible as import warnings; the apply path requires explicit
  acknowledgement of that exclusion.

### Implementation

- The backend now owns workbook selection, validation, Youth Jobs classification,
  core/mentor/rural aggregation, historical restatement, and source provenance. The
  command is dry-run by default and refuses an apply when category errors are present
  unless the operator passes `--allow-category-errors`.
- The frontend no longer hardcodes June as the last actual month. It derives the boundary
  from the latest `MonthlyYouthExpenditure` row, renders every actual month through that
  boundary, and includes projections only after it. With the August source snapshot, the
  chart displays January through August as actual and starts projections in September.
- Added small pure chart-series tests and a server-rendered component test. SVG tooltip
  titles were converted to single text children so React 19 server rendering retains the
  accessible descriptions.

### Verification

- Backend focused command and budget suites: 62 tests passed.
- Backend full API suite: 554 tests passed.
- Backend `manage.py check`, `makemigrations --check --dry-run`, and `pip check` passed;
  no migration is required.
- A new temporary SQLite database was migrated, then the real selected workbook was
  applied twice. The first run wrote eight January-through-August rows totalling
  R3,009,253.32 with matching source hashes; the second run reported zero monthly deltas.
  This proves the local database write path and idempotence, not production publication.
- `pnpm test:unit` passed all 4 chart tests.
- `pnpm exec tsc --noEmit --incremental false` passed.
- `pnpm lint` passed with zero errors and one pre-existing
  `@next/next/no-img-element` warning in `src/app/image-debug/page.tsx`.
- The network-enabled `pnpm build` passed: compilation and TypeScript completed, all 27
  pages generated, and `/operations/school-programme-grid/budget` appeared in the route
  manifest. The existing duplicate-lockfile/workspace-root and `middleware` deprecation
  warnings remain.
- Render reports `ca97504` as the live backend commit; its automatic deployment completed
  successfully in 1m36s.
- The production dry run selected the expected workbook SHA-256, classified 2,020 rows,
  reported the same three category errors, reproduced all local totals and production
  deltas, and ended with `DRY RUN: no database rows changed`.
- GitHub deployment statuses for both `Vercel - masi-web-nextjs` and
  `Vercel - masi-web-nextjs-dqdn` are successful for `7076c04`.
- An authenticated reload of the production budget route rendered the new
  `saved currently-employed projection` copy and readable SVG title descriptions. The
  API still returned January-through-June actuals, proving deployed code against the
  intentionally unchanged production data, not the pending August publication result.
- Before the authorized apply, the operator preflight reconfirmed that the selected
  workbook was still the newest dated file and retained SHA-256
  `81ed709ff0506f574d00e3c9f9852a28b87b421383282135c382d32882262fe6`.
- The production apply completed transactionally with eight restated months. A separate
  readback returned months 1 through 8, aggregate R3,009,253.32, and matching source
  provenance on every row.
- The authenticated live page now states `Actual nett spend from January to August`,
  renders eight actual bars, and starts projections in September. Every displayed
  core/mentor/rural description and total matched the database readback.
- Desktop light-mode rendering passed. At the mobile breakpoint, the page body remained
  viewport-width while the 760-pixel chart used an internal 360-pixel horizontal scroller;
  both January-May and July-November views were inspected successfully.
- The deployed application shell has no dark-theme control or dark class and reports the
  normal color scheme, so no dark-mode verification claim is made.

### Operational follow-ups

- Correct the three Excel category-error rows in the management workbook when their
  intended categories are known; this publication intentionally excluded their R1,675.
- Repeat the dry-run, explicit-authorization, apply, readback, and authenticated-page
  sequence for future monthly publications.
- If the application later introduces a dark theme, add and verify a dark-state treatment
  for this page; the current shell is light-only.

## 14 August 2026 — Both repositories deployed; authenticated verification pending

Status at 18:32 UTC: backend ingestion is healthy, the incremental schedules are active, and the frontend freshness banner and automatic revalidation are deployed. Authenticated dashboard acceptance, database credential rotation, and handoff closure remain open.

### Backend and production evidence now available

- Backend commit `efbb946` (`feat: harden youth sessions sync freshness`) is on backend `main`, deployed by the Render web service, and built by the retained full-sync cron.
- Migration `0046_airtable_sync_cursor` was applied by the web deployment. A subsequent explicit `migrate --noinput` was a no-op, and production inspection confirmed both the migration-recorder entry and `api_airtablesynccursor` table.
- Production full bootstrap log 915 processed 25,068 literacy records: 52 created, 25,016 updated, 0 skipped. Its cursor advanced to `2026-08-14T17:19:28.820113+00:00`.
- Production full bootstrap log 916 processed 6,606 numeracy records: 24 created, 6,582 updated, 0 skipped. Its cursor advanced to `2026-08-14T17:23:19.200999+00:00`.
- Production now contains 25,128 literacy and 6,647 numeracy rows. The difference from the current Airtable counts is historical source-deletion residue; deletion reconciliation is intentionally not part of this release.
- Direct production incremental smoke logs 917 and 918 both completed successfully with zero fetched records, proving the PostgreSQL lock, Airtable filter, transaction, and cursor paths.
- Render-managed literacy log 919 and numeracy log 920 both completed successfully with zero fetched records. The separate Starter jobs now run on staggered 15-minute schedules: literacy at `0,15,30,45 * * * *` and numeracy at `5,20,35,50 * * * *`. Workspace-default failure notifications remain enabled.
- The schedules then fired without manual intervention. Numeracy log 921 succeeded at 18:20 UTC and literacy log 922 succeeded at 18:30 UTC, both with zero fetched, created, updated, or skipped records.
- The retained full reconciliation cron remains at `0 4,12 * * *` so Airtable edits and FK repairs continue to be upserted. Its command now preserves the intent to run both feeds while recording any failure and exiting non-zero if either command fails. Render settings show the saved command; its next scheduled full execution remains the runtime verification of the wrapper.
- An unauthenticated request to `/api/youth-sessions/freshness/` now returns `403`, replacing the pre-deploy `404` and proving the route is live and protected. Authenticated response and dashboard presentation still require frontend deployment and browser verification.

### Final frontend pre-release verification

- Reviewed the SWR implementation against the repository design system and Vercel React/Next.js guidance. Only `youth-sessions-freshness` polls; the first freshness response does not duplicate the initial dashboard fetch, and a later version change invalidates the heavier `youth-sessions-*` and `youth-detail-*` keys once.
- Added the authenticated freshness response contract to `documentation/api-endpoints.md`; source timestamps remain UTC and the component formats them explicitly with `Africa/Johannesburg` and the SAST label.
- `pnpm exec eslint src/app/operations/youth-sessions/page.tsx src/components/youth-sessions/SessionFreshnessBanner.tsx src/lib/api/youth-sessions/freshness.ts src/lib/api/youth-sessions/index.ts src/lib/types/youth-sessions.ts` — passed.
- `pnpm exec tsc --noEmit --incremental false` — passed.
- `git diff --check` — passed in both the frontend and backend repositories.
- The first `pnpm build` attempt was unable to reach the repository's configured Google Fonts from the sandbox and failed before compilation completed. The network-enabled rerun passed: compilation completed in 13.1 seconds, TypeScript passed, all 27 static pages generated, and `/operations/youth-sessions` appeared in the route manifest. The pre-existing duplicate-lockfile/workspace-root and `middleware` deprecation warnings remain.

### Source publication and deployment

- Frontend commit `08764bb` (`feat: add youth sessions freshness`) was pushed directly to `main`; `HEAD`, `origin/main`, and `origin/HEAD` matched after the push.
- Both linked Vercel contexts, `masi-web-nextjs` and `masi-web-nextjs-dqdn`, reported successful deployments for `08764bb`.
- The production route `https://www.masinyusane.org/operations/youth-sessions` resolves and redirects an unauthenticated browser to Clerk sign-in with the dashboard URL preserved as `redirect_url`. This proves deployment and route protection, not authenticated dashboard behavior.
- The available Chrome session is not signed into Masi. Freshness payload presentation, responsive light/dark review, and open-page automatic revalidation remain unverified until an authenticated staff session is available.

### Credential incident and release boundary

While repairing a stale shared Render `DATABASE_URL`, one failed private cron log included the production database connection string. The shared variable was immediately replaced with the correct value and both managed incremental jobs subsequently connected successfully. The database credential must still be rotated across Render and the local production-only configuration; rotation is intentionally pending explicit authorization because missing a consumer could interrupt production services.

Frontend commit, push, and Vercel deployment are complete. The remaining acceptance work is to sign into the production dashboard, verify the authenticated freshness payload and responsive light/dark presentation, leave the page open across a successful scheduled sync to confirm version-driven revalidation, rotate the exposed database credential after explicit authorization, and close the handoff.

## 14 August 2026 — Full Youth Sessions rollout authorized; frontend held behind backend

Jim reviewed the unfinished-work handoff and authorized the safe backend-first production sequence. Frontend `main` and `origin/main` are at `89a8436`; the intervening Stanford Ndlovu team-photo change is already committed and does not overlap this feature. The Youth Sessions frontend source remains local and uncommitted while the paired backend is finalized, deployed, migrated, bootstrapped, and scheduled.

Current pre-release checks against the working tree:

- `pnpm exec eslint src/app/operations/youth-sessions/page.tsx src/components/youth-sessions/SessionFreshnessBanner.tsx src/lib/api/youth-sessions/freshness.ts src/lib/api/youth-sessions/index.ts src/lib/types/youth-sessions.ts` — passed.
- `pnpm exec tsc --noEmit --incremental false` — passed.
- `pnpm build` — passed with network access for the repository's configured Google Fonts; compilation, TypeScript, all 27 static pages, and `/operations/youth-sessions` completed successfully. The pre-existing duplicate-lockfile/workspace-root and `middleware` deprecation warnings remain.
- `git diff --check` — passed.

No frontend commit, push, deploy, or browser claim has been made in this finalization pass yet. Production still returns `404` for the paired freshness resource, so the frontend remains intentionally held until the backend contract exists live.

## 10 August 2026 — Finalization handoff recorded

The 4 August Youth Sessions work remains present but uncommitted and without production proof. A cross-repository finalization handoff was added at [`handoffs/2026-08-10-youth-sessions-sync-finalization.md`](./handoffs/2026-08-10-youth-sessions-sync-finalization.md), and both repositories’ `AGENTS.md` and `CLAUDE.md` now require the next conversation to raise it with Jim. No implementation, test, deployment, migration, sync, or Render schedule was changed or re-verified in this documentation-only pass.

## Maintenance contract

Every material frontend change must update this file in the same change. Each entry must distinguish implementation, verification, deployment, and live proof; list exact checks; and carry unresolved release work forward until it is closed.

## Current snapshot

- Runtime: Next.js 16.1.2, React 19, TypeScript, Tailwind CSS 4, SWR, Clerk.
- Protected Youth Sessions route: `/operations/youth-sessions`.
- Session data source: authenticated Django REST endpoints under `/api/youth-sessions/`.
- Release state of the latest entry: backend and frontend committed, pushed, and deployed; production schedules verified automatically. Authenticated dashboard behavior and database credential rotation remain open.

## 4 August 2026 — Youth Sessions freshness and automatic revalidation

Status: local implementation verified; backend deployment dependency outstanding.

### Problem

The dashboard previously gave staff no way to distinguish current data from a delayed Airtable import. An open browser could also retain pre-sync SWR results until focus or manual reload, making stale data look like poor staff performance.

### Built

- Added a typed client for `GET /api/youth-sessions/freshness/`.
- Added a visible freshness banner with explicit SAST formatting via the `Africa/Johannesburg` time zone.
- Fresh, syncing, stale, failed, never-synced, and health-endpoint-failure states are distinct. Unverifiable freshness fails closed with a warning while leaving the dashboard usable.
- Added a 60-second SWR poll for the small freshness resource only.
- Added version-driven invalidation of summary, activity, heatmap, inactivity, coverage, and open youth-detail caches. Expensive dashboard resources are not polled continuously.

### Contract with the backend

The freshness response includes `status`, `is_stale`, cadence and stale thresholds, a combined `last_successful_sync`, a stable `version`, and per-source literacy/numeracy health. All server timestamps are UTC ISO strings; presentation is always SAST.

### Verification

- `pnpm exec eslint src/app/operations/youth-sessions/page.tsx src/components/youth-sessions/SessionFreshnessBanner.tsx src/lib/api/youth-sessions/freshness.ts src/lib/api/youth-sessions/index.ts src/lib/types/youth-sessions.ts` — passed.
- `pnpm exec tsc --noEmit` — passed.
- `pnpm lint` — passed with zero errors and two pre-existing `@next/next/no-img-element` warnings in `src/app/image-debug/page.tsx` and `src/components/about/staff-photo.tsx`.
- `pnpm build` — passed with network access required by the repository’s `next/font` Google-font imports; all 27 static pages generated and `/operations/youth-sessions` was included. Next.js also reported pre-existing workspace-root/duplicate-lockfile and `middleware` deprecation warnings.
- Browser-level visual and live revalidation verification remains a release check because the paired backend endpoint is not deployed in this work.

### Release work still required

- Deploy the paired backend freshness endpoint and migration before deploying this frontend change.
- Deploy the frontend and verify fresh, stale, failed, and syncing states against production data in light and dark modes.
- Leave the dashboard open across a successful sync and verify that session cards refresh without a manual reload.

## Open follow-ups

- The incremental backend slice initially captures newly created Airtable records. Airtable edits and source deletions still rely on, or require extensions to, full reconciliation; do not imply otherwise in UI copy.
- The Youth Sessions “today” boundary still needs a separate audit for UTC-versus-SAST query semantics.
- Resolve Next.js workspace-root inference (duplicate frontend lockfiles) and migrate the deprecated `middleware` convention to `proxy` in separate maintenance work.

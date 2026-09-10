# Frontend Build Log

Last updated: 8 September 2026

This is the project-level implementation and release log for the Next.js repository. It starts with the current work rather than reconstructing older history. Detailed WIG-dashboard history remains in [`dashboard-log.md`](./dashboard-log.md).

## 8 September 2026 - WP4 wire review and presentation follow-up

The approved backend stores/returns budget `derived` directly as `run.payload`,
with `manifest` beside it. Review found that the first frontend and its mocks
incorrectly expected the whole artifact wrapper. Public API/summary and current
reader/Fix RED regressions reproduce and close the mismatch; corrected core is
`7758427`. Contract file byte equality alone was not run-detail compatibility proof.

A bounded follow-up adds hierarchy chevrons, readable completeness flags and shared
plain-language compatibility copy. No calculations or monetary values changed.
Focused suite: 34/34; TypeScript and lint pass (existing image-debug warning only).
Full unchanged-tree rerun: 102/102 with no skips. The first full run had one
intermittent existing cross-account demotion assertion; its failed log and passing
exact/full reruns are preserved in the stage log, without weakening the assertion. A privately instrumented 10-run focused check
also passed; all returning-B requests followed React's B commit with B credentials.
The original failure was not reproduced, so its cause remains unresolved.
Supervisor's authorized-network production builds pass with localhost API origin,
including the final presentation build (`frontend-build-presentation.log`).

Actual Chrome checks with synthetic API/auth verified the corrected desktop table,
keyboard hierarchy, shared contributor pagination, and real downloaded CSV/XLSX
parity. Browser upload picker stalled and was aborted; upload/approval recovery,
Fix browser checks and final mobile/dark/presentation recapture remain unverified.
The exact boundary, screenshot/download artifacts and remaining gates are recorded
in [the stage-log follow-up](../docs/build-logs/2026-09-08-wp4a-frontend.md#review-corrections-and-bounded-browser-follow-up-2026-09-08).
No deployment or real backend/provider/workbook evidence is claimed.

## 8 September 2026 - WP4 slice A budgets frontend

Local uncommitted budgets upload/reader/Fix/contributor implementation on
`feat/wp4a-budgets-frontend`, based on `633cc44`, using approved backend source
`0a6e4ce`. Extends the existing finance run workflow with explicit ledger dependency,
producer-owned budget values and findings, exact source provenance, shared-BC
contributor disclosure, authenticated exports and stale actor/selection protection.
ExcelJS 4.4.0 is loaded on demand for genuine XLSX display-value exports.

`pnpm test:unit`: 99 passed, 0 failed/skipped. TypeScript passed; lint passed with
0 errors and the one existing image-debug warning. `git diff --check` passed.
Local `pnpm build` failed exclusively on the existing Google Fonts network fetches;
the authorized-network rerun remains with the supervisor and no build pass is claimed.

Detailed scope, RED evidence, exact contract hashes, final gates, environment
warnings and pending browser/release work are in
[the WP4 stage log](../docs/build-logs/2026-09-08-wp4a-frontend.md).
Local tests only; no backend edits, real workbook/data use, production API requests,
Git metadata writes, commits, pushes or deployment. The approved backend and
publisher-owned formula-cache fix remain release dependencies.

## 6 September 2026 - WP2a review fixes, round 2

Successful finance approval/demotion now clears shared snapshot and mutable run
state for every previously used account without revalidation. Account-separated
keys and the publishing account's verified reads/read-only retry remain intact.
New real-SWR/jsdom B → A → B approval/demotion interactions verify that delayed
reader GETs show loading without superseded figures or run state and preserve
credential isolation. Reader pages and their data path are unchanged.

`pnpm test:unit`: 79 passed, 0 failed (RED: 77 passed, 2 failed).
`pnpm exec tsc --noEmit`: exit 0, no diagnostics. `pnpm lint`: exit 0,
0 errors, 1 existing image-debug warning, no new warnings. `git diff --check`: passed.
Exact failing names and verification are in [the stage log](../docs/build-logs/2026-09-05-wp2a-frontend.md#review-fixes-round-2).
`pnpm build` stays PENDING for the supervisor, along with real-browser visual/focus
checks and live release evidence. Local proof only; no network, package installation,
migrations, environment changes or deployments required or performed by this fix.

## 6 September 2026 - WP2a review fixes, round 1

Local fixes on `feat/wp2a-finance-runs` clear inactive account snapshot caches after
approval/demotion and explicitly verify current/list/detail GETs before announcing
refreshed state. Failed verification reports a successful change with refresh pending;
retry performs GETs only. Reader clients/hooks/pages are unchanged.

`pnpm test:unit`: 77 passed, 0 failed (RED: 69 passed, 8 failed).
`pnpm exec tsc --noEmit`: exit 0, no diagnostics. `pnpm lint`: exit 0,
0 errors and the single existing image-debug warning; no new warnings.
`git diff --check`: passed. Exact regression names, implementation and the installed
jsdom test prerequisite are in [the stage log](../docs/build-logs/2026-09-05-wp2a-frontend.md#review-fixes-round-1).
`pnpm build` remains PENDING for the supervisor. Real-browser visual/focus checks and
live deployment proof remain PENDING. No packages, migrations or deployments required
or performed by these fixes; no network used.

## 5 September 2026 - WP2a finance run publication frontend

Local implementation on `feat/wp2a-finance-runs` from `eb434c0`. Added the
read+publish-gated Upload page, typed raw upload/run APIs, run history/provenance,
checked approval/demotion, account-scoped refresh and additive snapshot 1.1.0
reader support. Existing reader pages keep the snapshot API/hook. Findings now group
by severity as well as scope/code so mixed-severity findings retain their labels.

RED commands, failing cases, contract boundaries, verification outcomes and release
dependencies are recorded in [the stage log](../docs/build-logs/2026-09-05-wp2a-frontend.md).
`pnpm test:unit` passed 69 tests; `pnpm exec tsc --noEmit` passed; `pnpm lint`
passed with zero errors and only the existing image-debug warning. `git diff --check`
passed. Build, browser interaction/visual verification and live deployment evidence remain
PENDING. The offline browser harness bundled, but Chrome launch aborted with SIGABRT
in this sandbox. The supervisor must align PARSER_WARNING in the backend/publisher
schema copies; the frontend includes it as explicitly requested.

## 4 September 2026 - Finance capability navigation

Status: implementation commit `23e0cba94fb0a5aebfe012932aab0f3ce854e862` is on
`main` and `origin/main`. Both linked Vercel production deployments reached `READY` for
that exact commit: `dpl_3qBmQq5i8oTMJkARdQwcf3ds4YNs` (`masi-web-nextjs`) and
`dpl_3gTropdXmK5fvh3nh82PKLutpaAV` (`masi-web-nextjs-dqdn`). The existing ADMIN
production session passed the positive browser smoke; no Finance Manager has been
assigned and the real Project Manager browser check remains pending.

- `/api/me/`'s sorted `capabilities` list is now part of the shared user profile. The
  Finance layout guard, FinanceNav, Operations hub, and desktop/mobile Navbar all require
  the exact `finance.read` string. None derives finance access from `role`; existing role
  policies remain unchanged for non-finance tools.
- A STAFF user with `finance.read` sees the Finance tool even without a leadership role.
  A PROJECT MANAGER or ADMIN without that capability does not see Finance, while their
  unrelated tools remain governed by the existing role policy. One `finance.read` grant
  exposes all four current tabs because the approved API remains the single snapshot.
- `getUserProfile()` uses `cache: "no-store"` so grants and revocations are refreshed on
  the next navigation. React request-local memoization deduplicates repeated profile reads
  within one render without creating cross-request authorization state.
- RED evidence was captured before implementation: the capability helper rejected
  `finance.read` and accepted the `ADMIN` role string; the Operations filter exposed
  Finance to a capability-less PROJECT MANAGER; FinanceNav rendered all tabs without a
  grant; and the no-store request helper did not exist. Each slice turned green before
  the next one was introduced.
- `pnpm test:unit`: 50 tests passed. `pnpm exec tsc --noEmit --incremental false` passed.
  `pnpm lint` reported zero errors and the pre-existing `@next/next/no-img-element` warning
  in `src/app/image-debug/page.tsx`. The release-equivalent build with
  `NEXT_PUBLIC_API_URL=https://masi-website-main.onrender.com/api` compiled, typechecked,
  generated all 27 static pages, and included the complete `/operations/finance/*` route
  set.
- Housekeeping: running the bare command `vercel ls --yes` from the unlinked temporary
  checkout caused Vercel CLI project detection to create the stray empty project
  `qhawes-projects/masi-web-release-20260904` (`prj_5ufTdrHdLN1i5yzDXFBBsuDaHWad`). It
  had zero deployments and was deleted. Do not repeat that bare command from an unlinked
  checkout; inspect the intended projects explicitly with
  `vercel ls masi-web-nextjs --yes --format json` and
  `vercel ls masi-web-nextjs-dqdn --yes --format json`.
- The existing signed-in ADMIN production session rendered Finance Overview from the
  current workbook (`9784baa19fc5...`), with Overview, Funders, Coverage, and Fix visible
  and the expected published status counts. This proves the positive frontend route and
  capability flow; it is separate from the production database role matrix recorded in
  the backend log.
- **PENDING — Project Manager Clerk/browser denial:** when Jim supplies a real Project
  Manager session, verify that Finance is absent from Operations navigation, direct
  `/operations/finance/overview` navigation visibly renders `Access denied`, and the
  session receives HTTP 403 from `/api/finance/snapshot/`. Do not infer this browser
  evidence from the already-passing backend production check.

## 4 September 2026 - Finance access hotfix: ADMIN only

Status: hotfix commit `e09d635` is on `main` and `origin/main`. Both linked Vercel contexts
completed successfully for that exact commit: deployments `CdZLtAFjbLjv4x5V3t38QiFmEVUZ`
and `72AWSRjvprQFkrgjHWZx1tETPko3`. The Admin production path is verified; the Project
Manager Clerk/browser denial check remains explicitly pending and does not block Step 2.

- The `/operations/finance/*` layout now uses a finance-specific ADMIN-only guard instead of
  the shared ADMIN / PROJECT MANAGER field-app guard. Other leadership and programme routes
  retain their existing authorization behavior.
- A small pure authorization decision is shared by the server guard and its behavior tests.
  Project Managers are denied, Admins are admitted, and the visible denial copy now states the
  temporary ADMIN-only boundary.
- `pnpm test:unit`: all 45 tests passed.
- `pnpm exec tsc --noEmit --incremental false`: passed.
- `pnpm lint`: zero errors and the pre-existing `@next/next/no-img-element` warning in
  `src/app/image-debug/page.tsx`.
- The first sandboxed `pnpm build` compiled but could not fetch the configured Google Fonts.
  A network-enabled build without the API base then timed out only while statically generating
  the unrelated `/impact` pages. The release-equivalent build with
  `NEXT_PUBLIC_API_URL=https://masi-website-main.onrender.com/api` passed compilation,
  TypeScript, all 27 static pages, and the complete `/operations/finance/*` route set.
- An existing signed-in Admin production session rendered Finance Overview after deployment,
  proving the positive frontend path. The available session was not a Project Manager, and no
  live role or identity was changed to manufacture that evidence.
- **PENDING — Project Manager Clerk/browser denial:** complete this item only when a real
  Project Manager Clerk session at `/operations/finance/overview` visibly renders `Access denied`
  and `/api/finance/snapshot/` returns HTTP 403 from that same session. Until then, do not claim
  the end-to-end Project Manager browser boundary is verified. The Django trust boundary is
  separately production-verified in the backend release log.

## 4 September 2026 - Finance routes deployed

Status: finance route commit `5f7f4ee` is on `main` and `origin/main`. Both linked Vercel
production contexts completed successfully for that exact commit: deployments
`9kQQ76mZpnNhX5iqB4PLYXWe762K` and `C7duWg2ykPBcyx3mxuhXiQjaK2PC`. The matching Django
API is live and the approved 2026 snapshot is loaded in production.

- The live protected route redirects a signed-out browser to Clerk and preserves the requested
  `/operations/finance/overview` destination. The live API independently returned 403 to an
  anonymous request.
- Authenticated production rendering is not claimed from this release pass because the available
  browser had no production Clerk session. Authenticated real-data behavior and responsive
  rendering remain established by the local end-to-end checks recorded below.

## 4 September 2026 - Finance route skeleton and current-year fix scope

Status: WP1a is implemented on the isolated local `wp1a/finance-skeleton` branch. This is
local verification only. The branch has not been merged or pushed, and no deployment or
production data has changed.

### Route and interaction contract

- `/operations/finance` now redirects to `/operations/finance/overview`; the authenticated
  finance layout exposes Overview, Funders, Coverage, and Fix as persistent subnavigation.
- Overview is deliberately status-only: publication provenance, current-year finding/error
  counts, and domain record counts. It does not duplicate financial KPIs from the domain views.
- Funders retains the contract table. A coded contract row and its primary link open
  `/operations/finance/funders/<contract_code>`; the detail route shows only that canonical
  contract, expanded to its published line items. Rows without a contract code remain inert.
- Coverage owns allocation coverage. Fix defaults to findings whose `in_scope_year` is true and
  requires an explicit toggle to include historical findings.
- The Operations hub and unauthenticated finance redirect now land on Overview.

### Test-driven proof and quality gates

- RED/GREEN tests established the four-view navigation and nested Funders active state, the
  status-only Overview contract, stable contract-code navigation and detail lookup, the default
  current-year findings scope with an explicit historical opt-in, and the Operations-hub route.
- `pnpm test:unit` passed all 43 tests. `pnpm lint` reported zero errors and only the pre-existing
  `@next/next/no-img-element` warning in `src/app/image-debug/page.tsx`.
- `node_modules/.bin/tsc --noEmit` passed. A network-enabled `pnpm build` completed and wrote a
  production build ID after the sandboxed build correctly failed to fetch configured Google
  Fonts. The existing duplicate-lockfile/workspace-root and middleware-deprecation warnings
  remain.
- Authenticated local browser checks against the real local snapshot passed at 1,280 by 900 and
  390 by 844. Overview, Funders, Coverage, and Fix each selected the correct navigation item;
  a whole contract-row click opened the canonical detail URL and kept Funders active; Fix hid
  `Outside 2026` until its explicit toggle was used. At both widths, body and document scroll
  widths equalled the viewport. On mobile the 977-pixel funder table stayed inside its
  356-pixel horizontal scroller. The only console errors came from conflicting wallet browser
  extensions, not the application.
- No backend migration, snapshot publication/load, merge, push, deployment, or authenticated
  production browser proof is claimed by this WP1a entry.

## 3 September 2026 - Real finance snapshot local dashboard proof

Status: the corrected 1 September workbook was published and loaded into the dedicated local
PostgreSQL database, then read through the real authenticated Django and Next.js path. This is
local verification only. No branch was pushed, no pull request was opened, and no production
database or deployment was changed.

### Real-data and authorization proof

- The authorized dashboard showed run `2026-09-03T16:37:09Z-31ed61`, the workbook name and
  short source hash, 50 contract rows, and 32 allocation-coverage rows.
- All six current-year `CATEGORY_NOT_IN_BLOCK` messages and the TSI Skills R4,400-versus-R0
  `STALE_CACHED_SPENT` message were present in the Hygiene panel. The nine acknowledged
  over-allocated ledger rows remained present rather than being filtered by publication.
- The KWF Other NGOs row visibly showed an R80,000 budget, R160,000 lifetime and 2026 allocation,
  negative R80,000 remaining, and 200.0% used.
- The one local profile was temporarily changed from `VIEWER` to `ADMIN` for the authorized
  check, then restored to `VIEWER`. After restoration, the same route rendered `Access denied`,
  zero finance tables, and no snapshot provenance. An anonymous API request returned 403.

### Responsive defect found and fixed

- The first 1,280-pixel inspection found a 1,406-pixel contracts table inside a 1,214-pixel card:
  the shared table primitive forced the descriptive contract cell onto one 551-pixel line, hiding
  the in-year values and Status column behind an internal horizontal scroll.
- Commit `5b9e198` lets only the contract-description cell wrap. Financial cells remain non-wrapping,
  tabular and right-aligned. Browser remeasurement at 1,280 by 900 returned a 1,214-pixel table in
  a 1,214-pixel container; both finance tables fit, every contract column was visible, and the page
  itself had no horizontal overflow.
- Regression development followed RED/GREEN: the focused contract-table test first failed on the
  absent wrapping class, then all seven focused tests passed after the one-cell fix.

### Quality gates and remaining boundary

- `pnpm test:unit` passed all 36 tests. `pnpm lint` reported zero errors and the pre-existing
  `@next/next/no-img-element` warning in `src/app/image-debug/page.tsx`. `npx tsc --noEmit` passed.
- `pnpm build` passed compilation, TypeScript, all 27 static pages, and included the dynamic
  `/operations/finance/funders` route. The pre-existing duplicate-lockfile/workspace-root and
  middleware-deprecation warnings remain.
- Production migration/load, merge, push, pull request, deployment, and authenticated production
  browser proof remain intentionally unperformed.

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

## 2026-09-08 — WP4B Google budget refresh and account-switch request fences

Status: isolated implementation on `feat/wp4b-budget-pull`, based on reviewed
WP4A `04265fe`; not merged or deployed. Approved WP4 section 5.3 scope.

- Budget mode offers `Refresh from Google Sheets`, using the same approved ledger
  selector and candidate/failed/replay review states as file upload. The POST sends
  only year and ledger UUID directly to Django with bearer authentication. No
  automatic approval or client-side credentials/source URL. Fixed safe error
  messages explain retry/access/source-change cases and the file-upload fallback;
  the selected ledger remains available for fallback.
- Independent review reproduced a pending-token GET after account replacement.
  Cleanup now fences old contexts synchronously at layout commit. A separate
  delayed-pagination reproduction showed the next dependency page reusing an old
  token; the loop now obtains the existing fenced token before every page. Tests
  demonstrate both REDs and GREENs. No stale POST, cross-account data disclosure,
  or backend authorization bypass was established by those probes.
- The historical demotion assertion used fixture account assignment before React
  committed the switch. Tests now record committed actor identity and wait for the
  actual loading render, while immediately requiring stale figures/run data absent.
- Full frontend unit suite: 106/106 pass. Pull behavior tests exercise candidate
  creation without approval, access-error-to-upload fallback with retained ledger,
  and delayed dependency pagination across replacement. Type/lint/build and
  revised independent review are being completed separately. No new frontend
  dependencies or financial calculations.

Final local gate update:
- Revised independent review: APPROVED, zero findings; independent full unit suite
  106/106 PASS. TypeScript and changed-file ESLint pass.
- Production `pnpm build` PASS with the public backend API URL configured and
  network access for existing Google Fonts. The first isolated build failed on an
  external node_modules symlink; a local dependency copy resolved it. An unset
  API URL then stalled existing impact-page static generation; supplying the
  documented environment setting resolved it without unrelated source changes.
- GitHub confirms both website repositories are public. The originating finance
  repository forbids public pushes, so these reviewed source changes remain local
  pending Jim's explicit destination decision. No merge or deployment occurred.


## 2026-09-09 — WP5 compact finance workspace and investigation views

Status: implemented and verified locally on `feat/wp5-finance-workspace`, based
on production main `5fb69ce`. Not merged or deployed at this entry.

- Finance-scoped Masi ink/crimson/blue navigation and compact overview put the
  approved department comparison before source metadata. Overview and Budgets
  share one published-variance chart. Department selection opens budget lines;
  expenses open a Radix Sheet with pinned BC/year/run queries, full original
  amounts, explicit applied share, pagination, source rows and server exports.
- Funder cards retain lifetime and accounting-year amounts separately. Attention
  identifies exact-cent line overspend (typed values labelled), missing budgets,
  and positive derived budgets with zero recorded allocation rows. Net-zero rows
  are not assumed absent. No deadlines are inferred from period labels.
- Null totals, known subtotals, incompatible sources, findings, source details and
  capability/account/year/run boundaries remain visible and tested. Financial
  figures use original producer strings; numeric chart geometry does not supply
  money calculations. No dependencies, backend changes, migrations or env changes.
- No client-derived organisation totals, spending pies, flexible-funding split,
  contract-line expense endpoint, contract-end forecast or history implementation
  is claimed. Those require defined backend reporting contracts. Allocation gaps
  are explicitly not flexible funding. Historical expenditure will start in 2023.
- Independent cross-agent review found the initial Overview expense panel could
  appear offscreen; replaced it with a Sheet and focus return. Final review of
  budget/funder semantics found no remaining source-level findings.
- Browser visual inspection caught implicit mobile grid min-content clipping that
  document scrollWidth alone missed. Explicit minmax(0,1fr) and a min-width-zero
  navigation container fixed it; final checks also assert content bounds. Sheet
  motion respects reduced-motion preferences. Screenshots wait for transitions.

Verification:
- `npm_config_manage_package_manager_versions=false node_modules/.bin/pnpm test:unit`:
  118/118 PASS. Initial integrated run exposed a test race with Radix deferred
  autofocus; the test now waits for the unchanged exact focus condition.
- Final expense-column ordering: `pnpm exec node --import tsx --test
  src/components/finance/FinanceBudgets.test.tsx
  src/components/finance/FinanceBudgetOverview.test.tsx`: 17/17 PASS.
- Changed-file `pnpm exec eslint`: PASS. `pnpm exec tsc --noEmit`: PASS.
- `NEXT_PUBLIC_API_URL=https://masi-website-main.onrender.com/api pnpm build`: PASS
  after final mobile corrections. Existing public font/static-page reads only.
- Chromium 149: actual React pages with local synthetic API/auth fixtures, 30
  page/width/theme combinations (Overview/Budgets/Funders, 1440/1024/720/390/320,
  light/dark), plus expense drawer/pagination/focus and exact funder attention
  focus. No page errors; final content bounds checked. This is local component
  browser evidence, not hosted authentication, real-database or financial proof.
  Harness and screenshots live under `/private/tmp/wp5-browser-app`; no fixture
  route or authentication bypass is included in the application.
- Review/release remaining: deploy this frontend against existing WP4 APIs and
  verify approved-data browser behavior under existing finance capability roles.

## 2026-09-09 — WP5 organisation outlook and spending mix

The compact overview now consumes the backend's optional `budget_insights` report:
exact projected expenditure, budget, actual against mapped budget lines, variance,
and a department spending mix including unmapped expenditure. Missing totals retain
labelled known subtotals; unavailable charts retain their amounts and explanation.
Version/run/dependency/year/as-of context is checked before displaying enrichment.
Older backend responses keep the existing department investigation workflow.

The donut uses backend six-decimal percentage strings for geometry; monetary labels
remain exact API strings. Department rows connect to the existing line/expense Sheet,
including keyboard focus when reselecting an already-open department. Projection
scope and unmapped expenditure are explicit; allocation gaps are not classified as
flexible funding. Amount/share cells remain on one line on mobile.

Validation:
- Full unit suite 127/127 PASS; final focused overview/API suite 19/19 PASS.
- TypeScript and changed-file ESLint PASS; production build PASS.
- Independent review fixed two reproduced issues: half-cent money rounding distorted
  pie slices, and budget-line totals needed scope labels separate from annual ledger
  totals. The regressions verify 50/50 arcs and an unmapped-spending notice even when
  those rows net to zero. No remaining correctness findings.
- Actual-component Chromium fixture checks: 30 page/width/theme combinations and
  existing expense/funder interactions PASS; six final overview layout checks plus
  composition-to-department-to-expense and repeated-selection focus PASS. No page
  errors. Synthetic data for the new chart was generated by the actual budget
  producer; auth/API remain local fixtures. Visual review corrected wrapping within
  mobile money amounts. A harness assertion initially used the abbreviated department
  text; it now checks the actual accessible heading, with no product behavior change.

No new package dependencies, API requests, funder changes or authentication changes.
First WP5 PR #6 is production merge 8ac7710; this follow-on slice is authorized for
live deployment. Exact release evidence belongs in the private supervision log;
local/browser fixture checks do not claim authenticated production acceptance.

## 2026-09-09 — clarify finance import, source selection and approval

Jim's production budget import succeeded but remained a candidate until he approved
it. The approval action was below the budget preview and hundreds of findings.
Move the existing action above that content and explain the awaiting-approval state
both after import and at the top of the summary. Empty budget readers explain the
publication step and offer publishers an Upload link; read-only users get guidance
without candidate reads or publish controls.

Rename the upload kind label from Funders to Management Accounts (API kind remains
funders). Rename Ledger dependency to Management Accounts source, default to the
first eligible approved run in the API's newest-first order, retain an explicit
operator choice, and reset naturally with the existing account/year/kind context.
Remove schema/hash implementation details from the source chooser; full provenance
remains in the run summary. Approval remains an explicit server-checked action.

Validation: full unit suite 129/129 PASS, TypeScript, changed-file ESLint and production
build PASS. Regressions cover eligible default, manual source retention, no automatic
approval, action placement and publisher-only empty-state navigation. The isolated
DOM harness now supplies Next's browser build environment for Link; initial failures
were missing process in that harness. Chromium actual-component checks reproduce
283 synthetic findings at desktop/mobile widths in light/dark: import-to-review,
default source, early Approve action and explicit confirmation PASS. Auth/API are
local fixtures; no production financial mutations or permission changes were made.

## 2026-09-10 — Actionable failed finance imports

Failed imports now lead with a plain-language explanation, a next step, and a
notice that the approved source has not been replaced. Budget subtotal failures
show publisher-supplied sheet/cell references and expected child cells (up to 20
checks). Old failures without diagnostics still receive useful general guidance.
Formatting incompatibility is explicitly distinguished from incorrect financial
entries. Raw exception messages are not rendered. Failed-run counts say Not
checked/Not processed; timings and package details are collapsible.

Validation: `pnpm test:unit` 131/131; `pnpm exec tsc --noEmit` passed;
`pnpm lint` passed with the existing image-debug warning only;
`NEXT_PUBLIC_API_URL=https://masi-website-main.onrender.com/api pnpm build` passed.
Actual React components checked in Chrome at 1440/390px, light/dark: four layouts
passed, no page overflow or console errors, repair table and approved-source
notice visible, no failed-run approval action. Browser evidence uses synthetic
API/auth and is not authenticated production proof. No new environment variables,
migrations or permissions. Detailed cell diagnostics require backend publisher
0.3.1; existing failed records are not rewritten. Deployment pending this entry.

## 2026-09-10 — Focused finance upload workflow

Implements Jim's approved upload UX: keyboard-accessible Management Accounts and
Budget tabs, prominent Masi-blue primary buttons, primary accounts file drop area,
and primary Google Sheets budget refresh. Budget source is supporting text with
Change source disclosure; Excel budget upload is a secondary disclosure. Desktop
context/history sidebar moves below the main panel on mobile. Year remains visible
with a compact Change disclosure; import history contains rare status/run controls.
Approval becomes a blue Review and approve action with the same existing dialog.

Findings now keep current-year errors open and warnings/information collapsed.
All outside-year findings sit inside one closed Previous years and other periods
disclosure, including unmatched/undated references. Counts and technical references
remain available. Three requested labels use domain-checked plain English; asserted
lines distinguish a typed value (including zero) from a missing value using existing
API fields. A budget-key reference without a matching project is not mislabeled as
a missing description. No backend calculations, data contracts, approval rules,
permissions, new dependencies or configuration changed.

Validation: final `pnpm test:unit` 132/132; `pnpm exec tsc --noEmit` passes;
`pnpm lint` passes with only the existing image-debug warning. Interaction tests
retain source/year/actor isolation and approval refresh coverage after replacing
select-based kind changes with real tab interactions. Chrome actual-component
harness passes eight desktop/mobile light/dark layouts, no page overflow or console
errors; source disclosure and Excel fallback usable, 695 historical findings hidden,
manual zero/blank copy correct, explicit approval dialog preserved. This browser
proof uses synthetic API/auth and does not claim authenticated hosted writes.
Final production build and deployment identity are recorded below.

Final `NEXT_PUBLIC_API_URL=https://masi-website-main.onrender.com/api pnpm build`
passes on the browser-verified tree. Local verification complete; production
release follows via the authorized PR merge and Vercel deployment.


## 2026-09-10 — Four-metric finance overview

Overview leads with Annual Budget, Expected Income, Budgeted Surplus/Shortfall
and Projected Surplus/Shortfall. Values come from the budget detail API's exact
outlook; the Masi projection assumes WF-excluded projects finish at budget.
Historical imports explain that a fresh reviewed budget import is needed for
income. No source values or calculated fallback balances are invented.

The year control is a quiet right-aligned disclosure. Department bars default
to column-N Masi variance with an All funds switch, and the drilldown uses the
same selected basis. Missing expense links name their exact budget-code cells;
variance formula/typed-override differences remain in a separate disclosure.
The source strip distinguishes budget and Management Accounts file dates from
the worksheet reporting date. Over-allocated expense row references correctly
name Expenditure in the Upload findings.

Validation: 133 frontend tests, TypeScript and lint pass (existing image-debug
warning only). Production build and six synthetic Chrome layouts passed; local
browser tests exercise basis switching, repair disclosure and expense drilldown.
Backend 0.4.0 release supplies income on newly approved budget imports. The UI
also supports existing imports. No frontend environment/configuration changes.
Production release identity follows.

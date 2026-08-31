# Frontend Build Log

Last updated: 31 August 2026

This is the project-level implementation and release log for the Next.js repository. It starts with the current work rather than reconstructing older history. Detailed WIG-dashboard history remains in [`dashboard-log.md`](./dashboard-log.md).

## 31 August 2026 - Youth Budget actuals publication and dynamic chart boundary

Status: backend commit `ca97504` and frontend commit `7076c04` are on their respective
`main` and `origin/main` branches. Render deployed the backend successfully as live
deployment `dep-dab0c50ae00c73dfdvh0`, and both linked Vercel projects deployed the
frontend successfully. The production expenditure dry run succeeded and changed no
database rows. The authenticated production page was reloaded and verified to render the
new dynamic-chart copy and accessible SVG descriptions; it correctly remains
January-through-June actual until the database apply is separately authorized.

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

### Release work still required

1. Obtain explicit production-write authorization before re-running the command with
   `--apply --allow-category-errors` to publish January through August.
2. Read back the production rows and source provenance after an authorized apply.
3. Reload the authenticated page and verify January-through-August actuals,
   September-through-November projections, chart labels, values, horizontal overflow,
   light mode, and dark mode against the published API response.

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

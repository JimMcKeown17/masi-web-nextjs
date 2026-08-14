# Handoff: Finalize Youth Sessions Sync Freshness Work

Date prepared: 10 August 2026

## 14 August 2026 rollout progress at 18:17 UTC

The backend portion is now committed, deployed, migrated, bootstrapped, and exercised through both local-to-production and Render-managed incremental runs. Backend `main` is at `efbb946`. Full bootstrap logs 915 and 916 succeeded, production contains 25,128 literacy and 6,647 numeracy rows, managed incremental logs 919 and 920 succeeded, and the protected freshness route is live. The separate Render jobs are enabled at `0,15,30,45 * * * *` for literacy and `5,20,35,50 * * * *` for numeracy; the existing `0 4,12 * * *` full reconciliation remains in place.

The frontend implementation remains local on `main` at `89a8436`. Its source review and API-reference update are in progress; commit, push, deployment, authenticated browser verification, and handoff closure remain outstanding.

During Render environment repair, a private failed cron log exposed the production database connection string. The value was corrected and both managed jobs subsequently succeeded, but the production database credential still requires an explicitly authorized coordinated rotation across every consumer. Do not reproduce the credential in documentation or messages.

## 14 August 2026 status update

Jim reviewed this handoff and authorized the complete safe rollout: scoped commits and pushes, backend-first deployment, production migration, full literacy and numeracy bootstrap, staggered incremental schedules with retained full reconciliation, frontend deployment, and live verification. Finalization is now in progress; keep this handoff active until the build logs contain the actual commit, deploy, migration, schedule, and live-browser evidence.

The revalidated starting point is:

- Frontend `main`/`origin/main`: `89a8436`; its Stanford Ndlovu team-photo commit is unrelated and already pushed.
- Backend `main`/`origin/main`: `1845c32`; the unrelated backend `.gitignore` edit remains excluded.
- All 547 backend API tests, the 16 focused backend tests, migration drift, Django system checks, focused frontend ESLint, frontend TypeScript, and both repositories' diff checks pass.
- Production has 25,076 literacy and 6,623 numeracy session rows, but migration `0046_airtable_sync_cursor` is not applied and the freshness endpoint still returns `404`.
- The existing Render full-sync cron is healthy at 04:00 and 12:00 UTC, auto-deploys backend `main`, and uses workspace-default failure notifications.

## Required opening in the next conversation

Before making changes or taking release actions, explicitly bring this unfinished work to Jim’s attention. A useful opening is:

> We still have the Youth Sessions incremental Airtable sync, freshness banner, and automatic dashboard revalidation work from 4 August in both working trees. It was locally green then, but it is still uncommitted and has not been migrated, scheduled, deployed, or verified live. Let’s review the current diffs and decide whether to finalize and release it now.

Do not silently commit, deploy, migrate, run production syncs, or alter Render schedules. Those require current user direction.

## Current state verified on 10 August 2026

- Frontend repository: `/Users/jimmckeown/Development/Masi_Website_2026/frontend/masi-website`
  - Branch: `main`, with `HEAD` and `origin/main` at `1b2f3fc`.
  - The Youth Sessions frontend implementation, build log, and new `AGENTS.md` remain uncommitted in the working tree.
- Backend repository: `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main`
  - Branch: `main`, with `HEAD` and `origin/main` at `1845c32`.
  - The cursor migration, incremental importer, freshness endpoint, tests, build log, and new `AGENTS.md` remain uncommitted in the working tree.
  - `.gitignore` also has a pre-existing unrelated user change for a youth-payments CSV. Preserve it and keep it out of this work unless Jim explicitly includes it.
- No current production migration, Render schedule, deployment, or live-dashboard proof was established while preparing this handoff.
- The comprehensive test/build results in the build logs are evidence from 4 August. Re-run them against the current working trees before committing or releasing.

## Read these instead of reconstructing the implementation

- Frontend implementation and release record: `documentation/build-log.md` in the frontend repository.
- Backend implementation, safety model, tests, limitations, and production sequence: `documentation/build-log.md` in the backend repository.
- Backend ingestion convention: `documentation/airtable_pipeline_sync.md`.
- Inspect the live diffs and untracked files in both repositories before relying on this handoff. The build logs explain the work; the current source is authoritative.

## What the unfinished work covers

The paired changes implement three slices:

1. An authenticated backend freshness contract and a visible SAST freshness/staleness warning on the Youth Sessions dashboard.
2. Lightweight 60-second freshness polling that invalidates the heavier SWR dashboard data only when the successful-sync version changes.
3. New-record incremental Airtable ingestion for literacy and numeracy, using an immutable creation-time cursor, overlap replay, Airtable-record-ID upserts, transactional cursor advancement, bounded retries, selected fields, and per-feed PostgreSQL advisory locks.

The detailed file inventory and verification commands already live in the two build logs and should not be duplicated here.

## Boundaries that must remain explicit

- Incremental mode discovers newly created Airtable records only. It does not detect later edits because the source tables do not expose a suitable last-modified field.
- Retained full upserts handle edits and FK repair, but they do not currently reconcile source deletions.
- `AirtableSyncCursor` is mutable acknowledgement state; `AirtableSyncLog` is audit history. Do not collapse them.
- Incremental commands fail closed until migration `0046_airtable_sync_cursor` exists and a successful full sync has bootstrapped each feed.
- The endpoint/UI exposes stale and failed data, but external alert delivery is still a follow-up.
- Staff-facing timestamps must remain explicitly formatted in `Africa/Johannesburg` and labelled SAST.

## Recommended finalization agenda

1. Re-open both working trees, inspect all diffs and untracked files, and confirm no intervening user work overlaps the feature.
2. Review the implementation with Jim at a high level and confirm whether the goal is source finalization only or full production rollout.
3. If source changes are needed, use test-driven changes and re-run the focused regressions first.
4. Re-run the literal backend and frontend gates recorded in the build logs. Treat August 4 results as historical evidence, not current proof.
5. If Jim authorizes commits, commit each repository intentionally and do not add an agent co-author. Exclude the unrelated backend `.gitignore` change unless separately requested.
6. If Jim authorizes production rollout, follow the backend-first sequence in the backend build log: deploy backend, apply migration, run one full bootstrap per feed, configure separate staggered incremental jobs while retaining daily full reconciliation, then deploy the frontend.
7. Perform live verification: create or identify a safe new Airtable session, prove PostgreSQL ingestion within cadence, prove the freshness version advances, and leave the dashboard open to prove automatic revalidation without reload. Check fresh, syncing, stale, failed, light, dark, and SAST presentation states.
8. Update both build logs with literal commit, deploy, migration, cron, and live evidence. Do not mark the work complete before those claims are proven.

## Suggested skills for the next session

- Use `tdd` if any behavior or safety fix is needed.
- Use `vercel-react-best-practices` if the Next.js/SWR implementation changes.
- Use `browser:control-in-app-browser` for local or live end-to-end dashboard verification after the required backend is available.

The desired end condition is not merely “code exists.” It is: reviewed current diffs, current gates green, intentionally committed in both repositories, deployed backend-first if authorized, Render cadence configured safely, and the staff-visible behavior proven live.

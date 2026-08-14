# Working in this repository

Read `CLAUDE.md` and `documentation/build-log.md` before making material changes. Consult the domain documentation linked from `documentation/README.md` rather than inferring API or data contracts.

## Active handoff — raise this with Jim

Before continuing the Youth Sessions sync/freshness rollout, read `documentation/handoffs/2026-08-10-youth-sessions-sync-finalization.md` and explicitly bring it up with Jim so the two repositories can be reviewed and finalized. The backend is deployed and the incremental schedules are enabled, but the frontend source, live dashboard verification, handoff closure, and production database credential rotation remain open; do not silently treat the rollout as complete.

## Build log is part of the change

Update `documentation/build-log.md` in the same change whenever you add or materially alter a feature, API dependency, migration requirement, operational workflow, or release state. Record:

- what changed and why;
- the exact verification commands and their outcomes;
- migrations, environment variables, schedules, or deploy actions still required;
- whether the result is only local, built, deployed, or verified live.

Never describe local or CI evidence as production proof. Keep detailed status and chronology in the build log; keep this file short and stable. WIG-specific changes must also update `documentation/dashboard-log.md`.

## Repository rules

- Use `pnpm` for development, linting, and builds.
- Keep aggregation and business rules in the Django backend; the frontend should consume typed, bounded API responses.
- For UI work, read `documentation/design-system.md` and verify responsive, light, and dark states.
- Diagnose root cause before implementing a fix.
- Do not add an agent as a commit co-author.

# Handoff — Impact Data Portal: build the navigation shell (Slice 1.5)

## What this next session builds

The **portal navigation shell** so the single Zazi page becomes a real multi-programme "portal". Design decided with Jim (he picked it from 3 ASCII mockups):

**Option A — editorial top strip + scroll-anchored views.** A slim *sticky* programme switcher under the global navbar (neutral chrome: ink + hairlines + eyebrow-style labels, the active programme lit in its own accent — NOT a sidebar, which reads as "dashboard" and is the Streamlit aesthetic we're moving away from per ADR 0001). Within a programme, the Views (Programmatic / Site-Level / Children) are **sequential scroll sections with anchors**, not tabs — so the sparse matrix self-handles (a programme simply omits a section it lacks; no dead tabs).

### Concrete plan
- **Routing** (each programme = its own bookmarkable URL):
  - `/impact/data-portal` → Overview front door (Slice 5 — leave as a stub/placeholder for now; the live iframe currently sits here, see Guardrails)
  - `/impact/data-portal/zazi-izandi` → the existing Zazi page (currently at `/impact/data-portal/preview`)
  - `…/core-literacy`, `…/numeracy`, `…/1000-stories`, `…/community-jobs` → "Coming soon" placeholders for now
  - Views within a programme = anchors (`#programmatic`, `#site-level`, `#children`), not sub-routes.
- **Two reusable pieces to create** (in `src/components/impact/data-portal/`):
  - `PortalNav` — sticky programme strip, programme-primary, active programme accented; lives on every portal page.
  - A per-programme **view config** object, e.g. `{ 'zazi-izandi': ['programmatic','site-level'], 'core-literacy': ['programmatic','site-level','children'], 'numeracy': [...], '1000-stories': ['reach'], 'community-jobs': ['aggregate'] }`. This single config drives BOTH the in-page anchor nav and which sections render — it is how the sparse matrix stays honest.
- **Scope this increment to the shell only**: Zazi fully live + the other four as quiet "Coming soon" entries. Do NOT build other programmes' data/charts (those are Slices 3–4) or the Overview hub (Slice 5).

### Open sub-decision (surface to Jim, don't guess)
Each programme needs an accent from the Ink & Signal palette. **Set:** Zazi iZandi = crimson `#C81E3C` (early literacy = children); Community Jobs = blue `#1D4ED8` (youth). **Unassigned:** Core Literacy, Numeracy, 1000 Stories. The nav strip stays neutral and borrows the active programme's accent as the indicator, so this only blocks the per-programme pages, not the shell. Confirm with Jim when convenient.

## Current state (Slice 1 — DONE, deployed, verified)

Slice 1 (Zazi Programmatic, two flagship charts) is built, deployed to Render, and verified end-to-end. Jim has viewed it locally and loves it. Full detail (files, commits, verified figures, the data path) is in memory: **`project_impact_portal_slice1_datapath.md`** — READ THAT FIRST. Highlights:
- Zazi backend (`Zazi_iZandi_Website_2025`): `/api/programmatic-impact-2026/` (commit `e1ac2bf`), pure metric module `api/programmatic_impact_2026.py` + `api/cohorts_2026.py`, 15 unit tests. Also fixed the ops `assessments-summary` cohort classifier (commit `460acd8`, cache regenerated). All on `origin/main`.
- Masi backend (`backend/Masi Web Main`): proxy `/api/impact/zazi-programmatic/` (commit `4c83dd7`) on `origin/main`.
- Frontend: `src/lib/types/data-portal.ts`, `src/lib/api/impact/zazi-programmatic.ts`, `src/components/impact/data-portal/{BarComparison,MethodologyNote,ZaziProgrammatic}.tsx`, page `/impact/data-portal/preview/page.tsx`, fixture `__fixtures__/zazi-programmatic.sample.ts`. **Frontend is UNCOMMITTED** (Jim wanted to review locally first). visx installed (ADR 0002).

## Guardrails (do not violate)
- **NO cutover.** The live iframe at `/impact/data-portal` (`page.tsx`) stays untouched until Jim explicitly says so. Build the shell behind the preview path; the eventual cutover is a later, separate flip.
- **Frontend not yet committed** — coordinate with Jim before committing (his school-programme-grid work is on other branches; the frontend repo is on `main` with the portal changes uncommitted).
- **Backend deploys go to `origin/main`** and Jim runs parallel sessions that switch branches under you — if you ever touch backend git, isolate your commit onto `origin/main` (stash → branch off origin/main → commit → `push origin HEAD:main` → restore) and never sweep up his WIP. (This shell work is frontend-only, so likely no backend git at all.)
- **Recompute & verify; every figure gets a MethodologyNote with an "as of" date; visx not Plotly; SSR-render charts; responsive at 390px; no emojis; no em dashes in copy.**

## How to run / view locally
- Frontend dev server may already be running on :3000 (Jim's). View at `http://localhost:3000/impact/data-portal/preview`. If `next dev` errors with "Unable to acquire lock", a server is already up — use :3000 or `lsof -ti:3000 | xargs kill` then `pnpm dev`.
- Frontend `NEXT_PUBLIC_API_URL=http://localhost:8000/api` → needs the local Masi backend running (`cd "backend/Masi Web Main" && venv/bin/python manage.py runserver`); its `ZAZI_API_BASE_URL` points at the deployed Zazi, so live data flows. (Numbers drift daily — midline collection is ongoing.)
- Project uses **pnpm** (`pnpm dev`, `pnpm build`, `pnpm lint`).

## Reference (don't duplicate — read these)
- Spec & 5-slice plan: `_plans/impact-data-portal.md`; Slice 1 brief: `_plans/impact-data-portal-slice-1.md`
- Domain language: `src/components/impact/data-portal/CONTEXT.md` (programme-primary IA, the sparse View matrix, Funder-Analyst persona)
- ADRs: `src/components/impact/data-portal/docs/adr/0001`–`0005` (0005 = aggregation location + cohorts + baseline→midline scope)
- Design system: `documentation/design-system.md` (Ink & Signal — MUST follow)
- Reuse kit: `src/components/impact/dashboard/{Section,HBar}.tsx` (`Section`, `Kicker`, `Accent`, `GradientRule`, `Panel`); animations `CountUp`, `FadeUp`.

## Suggested skills for the next session
- `superpowers:brainstorming` — only if Jim wants to refine the shell further; the high-level nav model (Option A) is already chosen, so likely skip and go straight to building.
- `frontend-design` — for the `PortalNav` strip + route restructure (distinctive, on-brand, Ink & Signal).
- `superpowers:test-driven-development` — light here (mostly presentational), but the view-config → which-sections-render logic is worth a small test.
- Skip the heavy data/backend skills — this increment is frontend-only.

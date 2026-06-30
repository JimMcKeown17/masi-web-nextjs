# Slice 1 Build Brief — Zazi iZandi "Programmatic" view (end-to-end tracer bullet)

Fresh-context handoff. Goal: build the **first vertical slice** of the Impact Data Portal — the Zazi iZandi Programmatic view — through every layer (Zazi Postgres → verified aggregation endpoint → API layer → visx chart → on-brand Next.js page), proving the whole stack before widening.

## Read these first (do not duplicate — they are authoritative)

- Spec & build plan: `_plans/impact-data-portal.md`
- Glossary / domain language: `src/components/impact/data-portal/CONTEXT.md`
- Decisions: `src/components/impact/data-portal/docs/adr/0001`–`0004` (all **accepted**)
- Design system (Ink & Signal — MUST follow): `documentation/design-system.md`
- Data architecture (the three backends): `documentation/data-architecture.md`
- Streamlit bug punch-lists (do NOT port this Python; reimplement & verify): `Masi_Data_Site/METRIC_BUGS.md`, `ZZ Data Site/METRIC_BUGS.md`

## What Slice 1 ships

The Zazi Programmatic view with its **two flagship charts** only (keep scope tight):

1. **% of Grade 1 at the 40-LPM benchmark, baseline → endline**, with the **South African national average (27%)** reference line.
2. **Treatment vs Control** — matched-learner letter-sound gain + benchmark movement (the credibility centrepiece).

Plus the reusable scaffolding both later slices depend on: the visx chart kit (start with `BarComparison`) and the portal page shell.

**Out of scope for Slice 1**: Site-Level map, Children view (Zazi has none — single metric, no radar), other programmes, the Overview landing. Zazi headline metric is **letters-correct-per-minute (LPM) only** — no words-per-minute / blending.

## Data path (audit-reported — VERIFY before building, don't trust this doc blindly)

- **Zazi backend**: a *separate* Django + Postgres app on Render, Teampact-fed. Local path reported as `/Users/jimmckeown/Development/Zazi_iZandi_Website_2025/`. Jim has full Render access to both DBs.
- **Tables (2026)**: `assessments_2026` (EGRA baseline/midline/endline), `assessment_cells_2026` (letter-level), `sessions_2026`, `mentor_visits_2026`.
- **Pre-computed endpoints reported to exist** on the Zazi backend: `programme-overview/`, `ea-performance/`, `assessments-summary/`, `schools-2026-summary/`. Reached **server-side only** via shared-secret `X-Internal-Auth` (the house pattern). **Check whether the Next.js side already proxies any of these.**
- **Metric logic to reimplement (verified CLEAN in Streamlit, safe to mirror the approach, not the code)**:
  - `ZZ Data Site/new_pages/2026/midline_primary_helpers_2026.py` → `build_matched_assessment_pairs()` (dedupes latest-per-phase, inner-joins on `participant_id`), `benchmark_summary()`, `benchmark_by_cohort_matched()`.
  - Cohorts: `ZZ Data Site/data/2026_cohorts.py` — **51 Treatment / 10 SEF / 53 Control** schools; `classify_cohort()` (SEF precedence).
  - Benchmark: **≥ 40 LPM** for Grade 1 (use `>=`, the EGRA convention — see ZZ bug BUG 5). National ref: **27%** of EC Grade 1s hit 40 LPM by year-end.
- **CRITICAL freshness check**: 2026 is mid-collection — the audit found 2026 *endline* may be placeholder/empty (endline pies were placeholders). **Verify which phases actually have data** before choosing baseline→midline vs baseline→endline for Slice 1. Stamp the result "data as of". Pick the most recent phase pair that has real, complete data.

## Architecture decisions for the fresh agent to make (then record)

1. **Where the aggregation endpoint lives**: a new endpoint in the Main Masi Django backend (`/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/`) that proxies/queries the Zazi DB server-side, **vs** a Next.js route handler calling Zazi directly with the shared secret. Lean: Masi backend endpoint (keeps the "backend-first aggregation" rule and one auth surface). Confirm and note in an ADR if it surprises.
2. **Delivery shape**: mirror the existing `/api/impact/published-stats/` pattern (cached payload, ISR `revalidate`), per ADR 0001. Reuse `src/lib/api/impact/` conventions.
3. **Programme accent for Zazi/literacy**: `documentation/design-system.md` assigns crimson to children/ECD, blue to youth/jobs, gold to scholarship — it does NOT name a literacy accent. Pick one per the design system (likely crimson, as early literacy = children) and keep ONE accent per section. Flag the choice.

## Reuse (don't rebuild)

- Page kit: `src/components/impact/dashboard/{Section,HBar,RadarChart,ScaleMap}.tsx` — `Section`, `Kicker`, `Accent`, `Panel`, `MethodologyNote`. The two-column narrative+Panel layout in `EcdParity.tsx` / `NumeracySnapshot.tsx` is the per-result template.
- Data spine: `src/lib/api/impact/{published-stats,selectors}.ts`, types in `src/lib/types/impact.ts`.
- `CountUp` (`src/components/animations/count-up.tsx`), `FadeUp` family (`src/components/animations/FadeAnimations.tsx`).

## New dependency

- **visx** (ADR 0002) — modular, add only what's used: `@visx/scale @visx/shape @visx/axis @visx/group @visx/text` (and `@visx/tooltip` if needed). `pnpm add ...`. No Plotly in the portal.

## Non-negotiables (from the grilling)

- **Reimplement & verify** every number from Postgres — never port the Streamlit Python (it has the bugs in the punch-lists). Verify each figure against a known-good value.
- **Every Headline Result carries a `MethodologyNote`** (source, population/N, "as of" date, comparison group, any caveat — e.g. dose, "3-month intervention"). Visible-but-collapsible.
- **Replace the iframe**: build behind `/impact/data-portal` (or a preview route first), full Ink & Signal, then cut over.
- Verify at **390px** — no horizontal overflow. SSR-render the charts (visx is pure SVG; no `ssr:false`).
- No emojis. No gradient text. Apply the G1-style normalization decision only if Core-Lit later (not relevant to Zazi LPM).

## Acceptance criteria

- [ ] A verified backend aggregation endpoint returns Zazi's % G1 at ≥40 LPM (baseline→[latest real phase]) and Treatment-vs-Control matched gains, with an "as of" date, computed fresh from the Zazi DB.
- [ ] `BarComparison` visx component + portal page shell, on-brand.
- [ ] Zazi Programmatic page renders both flagship charts with `MethodologyNote`s, no hardcoded numbers.
- [ ] Numbers spot-checked against a trusted source (not the buggy Streamlit columns).
- [ ] Responsive at 390px; charts SSR-rendered; lint/build clean.

## Suggested skills for the next session

- `superpowers:test-driven-development` — for the backend aggregation/metric (write the expected figures as tests first; this is how we "verify, don't port").
- `frontend-design` — for the visx chart kit + the page (distinctive, on-brand, production-grade).
- `superpowers:executing-plans` — there's a written plan; execute with review checkpoints.
- Skip `brainstorming` — the design tree is already resolved in CONTEXT.md + ADRs.

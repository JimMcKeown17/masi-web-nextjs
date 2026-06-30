# Impact Data Portal — Spec & Build Plan

A native, on-brand Next.js data portal for Masinyusane's headline programme results. Replaces the bare Streamlit iframe at `/impact/data-portal`. Built for one persona — a **Funder Analyst** (think Gates Foundation) — and designed "rigorous but legible."

> Language and decisions are authoritative in [`src/components/impact/data-portal/CONTEXT.md`](../src/components/impact/data-portal/CONTEXT.md) and the ADRs in `src/components/impact/data-portal/docs/adr/`. This plan is the buildable synthesis.

## Decisions (locked via grilling)

| # | Decision | Record |
|---|---|---|
| 1 | Funder-facing curated showcase, **fresh but not interactive**; Streamlit Deep-Dive retained for power users | ADR 0001 |
| 2 | Charting on **visx** (+ MapLibre for the map); **no Plotly** in the portal | ADR 0002 |
| 3 | Children view is **curated + fully anonymized** (POPIA), not browseable | ADR 0003 |
| 4 | Headline numbers **recomputed & verified server-side** from Postgres — never blind-ported from Streamlit | ADR 0004 |
| 5 | **Programme-primary** IA; the three Views (Programmatic, Site-Level, Children) nest inside | CONTEXT.md |
| 6 | Distinct-but-linked from the editorial `/impact` story page (hook vs proof) | CONTEXT.md |

## Information architecture

Programme-primary. Top-level = Programme; Views nest inside. Matrix is sparse.

| Programme | Programmatic | Site-Level (map) | Children (radar, anonymized) |
|---|---|---|---|
| **Zazi iZandi** (LPM only) | yes | yes | — (single metric, no radar) |
| **Core Literacy** | yes | yes | yes (11-skill radar) |
| **Numeracy** | yes | yes | yes (component radar) |
| **1000 Stories** | reach only | reach by centre/suburb | — |
| **Community Jobs** | aggregate dual-impact employment story (its own page) | — | — |
| **Overview** (landing) | cross-programme de-duped reach + "N taught to read" + children-per-programme | — | — |

## Headline results per programme (the "keep" list)

**Zazi iZandi** — metric is **letters-correct-per-minute (LPM) only**; drop WPM/blending.
- % of Grade 1 at the **40-LPM benchmark**, baseline→endline, with the **SA national average (27%)** reference line *(flagship chart)*
- Average LPM gain by grade (baseline→endline)
- **Treatment vs Control** (matched-learner gain + benchmark movement) *(credibility centrepiece)*
- Zero-letter learners reduced (baseline→endline)
- Cross-year benchmark trend (2023→2026)
- Site-Level: map + per-school benchmark %

**Core Literacy** (English TaRL)
- % on grade level (letter sounds) Jan→Nov, SA-avg line
- Average Total Literacy Score Jan vs Nov (overall + by grade)
- Improvement by skill category (Letters & Sounds / Reading / Writing)
- On-programme vs off-programme improvement *(impact claim)*
- Masi Core vs control benchmark (54% vs 30% / 27%)
- Children: baseline→endline 11-skill radar, impact leaderboard, "where change happened" (anonymized)

**Numeracy** (Yazi Amanani)
- Average baseline→endline + gain
- Milestone attainment: count to 20+, identify numbers to 100, write numbers 1-10
- Baseline vs endline by component
- Improvement by gender (equity)
- Children: component radar, leaderboard (anonymized)

**1000 Stories** (ECD reach)
- Total stories read *(headline)*
- Cumulative stories read over time
- Reach by centre / suburb

**Community Jobs** (Dual-Impact aggregate)
- Youth currently employed + cumulative jobs created (5-year)
- Cumulative hires over time
- Gender / race demographics
- Alumni into work / further study + top destinations
- Retention / employment duration

**Overview** (built last)
- Total Reach (de-duplicated estimate — NOT a sum) + youth employed + schools
- "N children being taught to read" banner (Core Literacy + Zazi)
- Children per programme

## Data architecture

- **Source of truth: Postgres.** Two databases: Main Masi DB (Core Literacy, Numeracy, 1000 Stories, Community Jobs) and the separate **Zazi iZandi DB** (queried server-side — the house pattern; Jim confirms easy, full Render access).
- **Fresh, not interactive**: a backend aggregation produces a curated payload (same delivery shape as `/api/impact/published-stats/`), cached at the API/ISR layer, stamped "data as of". No live query engine. Interactive pocket: the Children view's anonymized per-child lookup.
- **Recompute & verify every metric** server-side (ADR 0004). Do not port the Streamlit Python — it has bugs (see prerequisite below). Replace all hardcoded literals and hardcoded baseline fallbacks.
- **Caveats are first-class**: every Headline Result carries a `MethodologyNote` (source, population/N, as-of, comparison group, dosage/cohort caveat). Visible-but-collapsible. Comparability rules enforced: standardized scores across languages (never raw); cohort/dose labeled; ECD midline marked cross-sectional. Presentation iterated during the build.

## Charting (visx)

Build a small reusable Ink & Signal chart kit on visx primitives, reused across programmes:
- [ ] `BarComparison` (baseline→endline pairs, % at benchmark, grouped bars) — replaces most `HBar` uses
- [ ] `TrendLine` / area (cumulative over time, cross-year trend)
- [ ] `Distribution` (histogram with benchmark line)
- [ ] `Scatter` (baseline-vs-endline individual trajectories, y=x line)
- [ ] `Radar` — port/adapt existing `RadarChart.tsx` for Core-Lit/Numeracy Children view
- [ ] Keep **MapLibre `ScaleMap`** for the Site-Level geographic view
- Styling: Fraunces labels, exact programme accent hex, transparent bg, hairlines; SSR-rendered; animate via framer-motion. No Plotly.

## Build plan — tracer-bullet vertical slices

- [ ] **Prerequisite — fix Streamlit computation bugs.** Verified, fix-ready punch-lists live in each repo: `Masi_Data_Site/METRIC_BUGS.md` (2 definite/dormant + 1 live-chart decision: G1 weights=0.95) and `ZZ Data Site/METRIC_BUGS.md` (1 live bug: blending mean-of-means; 4 suspicious; ECD cross-sectional + 2026 matched-pair helpers verified clean). Because we recompute Zazi on **LPM/letters** (not blending) per ADR 0004, the portal won't inherit the live Zazi blending bug — but fix it in Streamlit anyway (owner standard: zero bugs).
- [ ] **Slice 1 — Foundation + flagship (Zazi Programmatic), end-to-end.**
  - [ ] visx chart kit (BarComparison + the page shell using the existing `Section`/`Panel`/`Kicker`/`MethodologyNote`)
  - [ ] Backend: verified aggregation endpoint over the Zazi DB (server-side proxy), returning the % G1 at 40 LPM (baseline→endline) and Treatment-vs-Control, stamped "as of"
  - [ ] API layer (`src/lib/api/impact/...`) + types
  - [ ] Zazi → Programmatic view page, fully on-brand; replaces the iframe (start behind `/impact/data-portal` or a preview route)
- [ ] **Slice 2 — Zazi Site-Level**: MapLibre map + per-school benchmark %.
- [ ] **Slice 3 — Core Literacy + Numeracy** (Main Masi DB; easier): Programmatic + Site-Level + the **Children radar** (anonymized leaderboard + representative profiles).
- [ ] **Slice 4 — 1000 Stories** (reach) + **Community Jobs** (aggregate Dual-Impact).
- [ ] **Slice 5 — Overview landing** (last): de-duped Total Reach + banner + children-per-programme. Cross-link `/impact` story ↔ portal ↔ Streamlit Deep-Dive.

## Open / iterate during build

- Exact caveat/explainer presentation (dosage, pilot lengths, cross-sectional notes) — refine against real charts.
- Anonymization fine points for the Children view (pseudonym scheme; whether any consented children become named case studies later).
- Whether Zazi gets a minimal anonymized individual-learner view later (no radar) — deferred.

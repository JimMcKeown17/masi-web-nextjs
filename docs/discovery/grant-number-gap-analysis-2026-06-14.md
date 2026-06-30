# Grant Number Gap Analysis (first pass)

Date: 2026-06-14. The first discovery artifact for the agentic fundraising system (`_plans/agentic-fundraising-system.md`, Discovery & validation). It does what Jim's "practice-run" idea proposed: take real proposals and check whether the system can supply each number — then sort every gap into **expose / curate / collect**.

**Sources analysed**
- `…/Fundraising/Funders/funding-applications-qa-guide.md` (3,236 lines; 6 funders extracted: Global Schools Forum, E'Zethu, LOTTO/NLC, Winds of Change/Grassridge, DGMT; 2015–2026 trails)
- `…/Fundraising/Funders/log.md` (extraction tracker + map of ~60 funder folders)
- `…/Fundraising/Grant-Writing Reference Guide 2024.docx` (canonical narrative + key numbers)
- Cross-referenced against the live `PublishedStat` seeds (`seed_published_stats.py`) and the `Youth` / `CanonicalChild` data models.

**Method:** exhaustive quantitative grep-sweep across all 3,236 lines, plus full read of the Global Schools Forum 2026 application and representative E'Zethu/LOTTO/DGMT sections. Line numbers below refer to the Q&A guide unless noted.

---

## The headline finding

The numbers are not merely **dated** — they **disagree**, across documents, across years, and *within a single document*. The flagship "how much better do Masi kids do than control groups" claim alone appears as: *3×*, *400%*, *200%+*, *43%*, *40%+*, *"double the benchmark"*, *"2 years ahead"*, and *11.7 vs 2.7 phonics*. A funder reading two Masi proposals side by side sees different numbers for the same thing.

**Root cause: undefined denominators, not sloppiness.** Almost every number is correct for *some* definition — the definition just isn't pinned to it. "334 vs 515 youth" is *currently-employed* vs another year's count; "94 vs 128 vs 231 schools" is *Masi-direct* vs *government-partnered* vs *active-this-year*. This is exactly the disease `ADR 0005` (Answer Library, live data slots) and the `PublishedStat` registry were built to cure — and `seed_published_stats.py` already carries "Reconcile vs 18,276 / 25,000+" notes, meaning the `/impact` work and this grant corpus are the **same problem discovered from two ends**.

The fix is not engineering. It is ~12 definitional decisions only Jim can make (Part B). Once pinned, every number becomes a `PublishedStat` with `population` + `as_of` + `methodology_note`, and the whole org inherits one consistent set.

---

## Part A — The number-conflict catalog (the evidence)

### A1. Youth employed
| Value | Source | Likely definition |
|---|---|---|
| 334 | 2024 Reference Guide / log.md | currently employed, 2024 |
| 297 (90% female, 57 sites) | L1498 (~2019 LOTTO) | currently employed, that year |
| 293 | L2564 (DGMT, 2022) | *DGMT programme only* |
| 66 ("125 unique, 66 current") | L2700/2799 (DGMT) | *one programme*, point-in-time |
| 515 | `/impact` PublishedStat (2026) | currently employed, 2026 |
| ~400 / year | Jim Q8 | *annual hires* |
| 350 | 2024 outputs | *target*, not actual |
| 800 / "1,500 women over 8 yrs" / "1,000 women over 7 yrs" / "200+ youth" | L2129, L2260, L2861 | *cumulative ever* (and 1,500-over-8 vs 1,000-over-7 are a year apart) |

### A2. Children / beneficiaries reached
| Value | Source | Likely definition |
|---|---|---|
| 15,206 (2,039 ECDC + 13,167 primary) | 2024 Ref / log.md | current on programme, 2024 |
| 19,444 | `/impact` (2026) | current on programme, 2026 |
| 25,000+ | 2024 Ref | *cumulative over 5 years* |
| 10,704 (canonical) / 18,276 (site) | data model / memory | *deduped canonical* vs site count |
| 367 / 1,081 / 2,345 / 5,878 / 4,550 / 3,550 / 1,140 | E'Zethu & LOTTO apps | *per-project scope*, not org-wide |

### A3. Active sites (schools + ECD centres)
| Value | Source | Note |
|---|---|---|
| 6 primary + 9 ECDC | L732 (older) | early state |
| 57 sites (37 ECD + 20 primary) | L1498 | |
| 37 ECD centres | L2564/2566 (DGMT 2022) | DGMT programme |
| **41 primary + 53 ECDC (=94) AND "over 100, incl 54 ECD"** | 2024 Ref | **contradicts itself: 53 vs 54, 94 vs 100, same document** |
| "more than 80 schools" / "more than 100 ECD centres and schools" | L2649 / L432 | |
| 128 | GSF 2026 (5c) | currently implementing |
| 231 | `/impact` (2026) | schools & ECD centres |

### A4. Gender & race of youth/staff
| Value | Source | Definition |
|---|---|---|
| 77% female | L1639/1753 (LOTTO) | staff overall |
| 80% of new hires female | 2024 Ref | *new hires* |
| 90% female | L1343/1453/1498 | programme-specific |
| **97% black** | L1639/1753 | staff — **computable now from `Youth.race`** |

### A5. Founded / years operating
2008 (GSF 5a / L2757 / L3043 "Founded in 2008") · registered **2009** (E'Zethu A2) · "14-year track record" (L2649) · "15 years implementing literacy" (GSF 5b) · "over a decade" (multiple). Mostly 2008; ambiguity is incorporation vs NPO-registration vs literacy-programme start.

### A6. Finances
Revenue: **R23M** (2023, Ref) · **R20,165,754** revenue / R20,148,532 expenditure (GSF "most recent FY") · R18,499,679 projected income (L1463). Overhead split: **90%/6%/4%** programme/overhead/fundraising (L1094/1254 + 2024 Ref) · **9%** overhead (audited, L1885) · 10% (L927) · 15% (L1228). Income growth: "12 straight years" (L1753) then "13 straight years" (L1639) — *consistent when dated*, a good example of a number that's fine once `as_of` is attached.

### A7. Top Learners / university
88% pass-rate over 3 yrs (L1149/1181) vs 40% historical financial-aid / 76% avg university (L1181) · application rate 20%→95% (L2507) · "500th graduate expected 2025" (L2260, matches Jim's 500+) · pass-rate table 87/89/89% university, 91.7/94.7/94.7% house (L1265/1270).

### A8. The flagship impact claim (worst offender)
3× rate + "more than doubled benchmark %" (2024, L431) · 400% little ones / 43% school-age (2024 Ref) · 200%+ / 40%+ (2024 outputs) · 70% benchmark 2023 → 54% 2024 (GSF, L139) · 11.7 vs 2.7 phonics, sight words 2×, lit +30%/+50% by grade (L703–705/1749) · Jim Q8: "2 years ahead, double benchmark." Stated by **age band × metric × cohort-year × framing** — every axis varies.

### A9. External context citations (also need a canonical set)
81% Grade 4 can't read for meaning (PIRLS 2021, L65) · 27% reach 40-LCPM benchmark (Dept of Ed 2022) · 93% of our Grade 3 "completely illiterate" (Ref) · 22% Grade 4 functionally literate (older framing, L793) · youth unemployment 63.1% (World Bank). The `PublishedStat` "argument" group already seeds some of these (`arg_pirls` 81%, `arg_letter_sounds` 73%) — extend it to the full citation set.

---

## Part B — The ~12 canonical numbers to define (decisions only Jim can make)

This is the actionable core — the first hour of the metrics session. Pin each definition; it becomes a `PublishedStat`. Bucket legend: **Expose** = data exists, build a `metrics.compute` function · **Curate** = number exists, verify + pin · **Collect** = not captured, needs upstream change.

**STATUS: all 12 pinned 2026-06-15** (decisions inline below; "What to build" roadmap + by-bucket rollup at the end of this section).

1. **Children currently on programme** — 15,206 / 19,444 / 10,704?
   DECISION (Jim, 2026-06-15): **unique children on any Masi programme in the current year, incl. Zazi iZandi**, deduped per-site (whole-school programme present → unique = Total Kids in School; else deduped child-level), summed across sites. Programme-specific applications use the single-programme count. · Source: new `SiteProgrammeChildren` rollup (see below) · Bucket: **Expose**
2. **Children reached, cumulative (all-time)** — is "25,000+" defensible, and from what base year?
   DECISION (Jim, 2026-06-15): **opening balance + movements.** Cumulative unique children = a frozen, dated historical figure (from the CSVs, for pre-canonical years + manual programmes) + net-new unique children since, leaning on `CanonicalChild.years_active` (deduped across years, ~10,704 and growing) where child-level data exists. · Source: CSV baseline + `SiteProgrammeChildren` · Bucket: **Curate**
3. **Youth employed in a given year (PRIMARY youth stat)** — the true count of youth/women who held a Masi job during the year. A *flow* measure (income-statement view), not a point-in-time snapshot — because the job is a stepping-stone they springboard from, so throughput is the benefit, not attrition.
   DECISION (Jim, 2026-06-15): for year Y, distinct `Youth` who worked any part of Y = **`start_date <= Y-12-31 AND (employment_status='Active' OR end_date >= Y-01-01)`**. (Jim's rule: "end_date in Y, plus anyone currently Active"; the `start_date` guard is a refinement to exclude next-year starters.) **Secondary stat** also reported: number *currently* active (point-in-time, balance-sheet view). Org-wide, **all job titles** — must NOT inherit the youth-sessions dashboard's Literacy+Numeracy-coach-only filter. · Source: `Youth` · Bucket: **Expose** · Current year computable; older years need the CSV (see #5).
4. **Women employed per year** — ~400. NOT a separate definition: it is **#3 filtered to `gender = female`** (`Youth.gender`). · Bucket: **Expose**
5. **Youth employed cumulatively (all-time, distinct persons)** — resolves the contradictory 800 / 1,500-women / 200+ quotes (they were undated cumulative points: 839 @ 2023, ~1,500 women ≈ 83% of 1,806 @ 2025).
   DECISION (Jim, 2026-06-15): **opening balance + live movements, cutover end-2021** (Airtable/Postgres reliably start 2022). Opening balance from the documented deduped cumulative series (source of truth): **309 distinct youth through 2021**, ~**91% female ≈ 281 women**. Live: distinct `Youth` with `start_date >= 2022` (total) + `gender=female` subset, from Postgres. Cumulative-ever = 309 + live; cumulative-women = 281 + live-female. **Reconciliation check:** series says cumulative 2025 = 1,806 ⇒ distinct Postgres 2022–2025 should ≈ 1,497. Store the full series as a `youth_cumulative_by_year` reference table + annual roll-forward (close the books each year-end). · Source: series (≤2021) + `Youth` (2022+) · Bucket: **Curate→Expose**
   Series of record (cumulative distinct youth): 2014:12 · 2015:28 · 2016:52 · 2017:80 · 2018:122 · 2019:172 · 2020:219 · 2021:309 · 2022:548 · 2023:839 · 2024:1318 · 2025:1806. (% female pre-2022 = 91%.)
6. **% female of youth** — exact, per-person from `Youth.gender`, reported against the **same population as the headline stat** (e.g. "of youth employed in 2026, X% women"). Cumulative opening balance = 91% female pre-2022, only if a cumulative gender % is ever needed. · Source: `Youth.gender` · Bucket: **Expose**
7. **% Black (race)** — CRITICAL SA DOMAIN NUANCE (see CONTEXT.md "Black"): "% Black" = everyone *not white* (BBBEE sense: African + Coloured + Indian). For Masi = **100%** (no white youth or children) — that is the standard grant answer. Detailed split (African / Coloured / White) is rare (≈ HCI only), **current-year only**, exact from `Youth.race` (youth) / site-% estimates (children). **No cumulative all-time race is ever calculated** (Jim has never been asked). Pre-2022 detail if ever needed: 97% African / 3% Coloured (now shifting as Masi works in more Coloured schools). · Source: `Youth.race` (exact) / site-% (children, estimate) · Bucket: **Expose**, no cumulative
8. **Active primary schools / active ECD centres** (Jim, 2026-06-15) — count distinct canonical `School` (Masi PG) with **ANY Masi beneficiary in the current year**, split by type. Includes all programmes incl. Zazi iZandi (government-partnered sites count); "directly staffed" available as a sub-figure. · Source: `School` × `SiteProgrammeChildren` (current year) · Bucket: **Expose**
9. **Total active sites** = #8 summed — any school with ≥1 beneficiary this year. Surfaced on the NextJS schools-×-programmes grid (the same surface that answers #1 and #8). · Source: derived · Bucket: **Expose**
   **Sync note:** canonical `School` lives in Masi PG (`school_uid` = `SCH-XXXXX` join key). Zazi iZandi participation lives in the Zazi backend → pulled **nightly** via the existing `zazi_client` + cron pattern (same as WIG / `refresh_zazi_overview`), joined on `school_uid`; add an "unmatched Zazi schools" check so missing mappings can't silently undercount. Literacy/Numeracy already land in Masi PG via the nightly Airtable sync. One nightly job refreshes all computed columns of the grid.
10. **University graduates: total + per year** (Jim, 2026-06-15) — "graduate" = **completed a diploma or degree from university** (NOT enrolled / sent / supported). **Opening balance = 505 graduates as of June 2025.** Live increment pending: Top Learner data is mid-transition into Postgres (not ready yet); a few graduated Dec 2025 + a cohort in 2026 — Jim to supply the updated count. Use **505** until then. Related Top Learner stats — HS learners supported, currently in university, annual pass-rate — **DEFERRED** (Jim to gather; reminder set ~2026-07-06). · Source: Top Learner data (→ Postgres, in progress) · Bucket: **Collect → Expose**
11. **Annual revenue + expenditure split** (Jim, 2026-06-15, from FY2024-25 SA annual report) — pinned **per Receiving Entity** (this is SA only; US 501(c)(3) figures are separate; show the entity matching the funder).
    **SA, FY2024-25 (year-end March 2025):** total income **R20,036,914** (Contributions R7,677,012 + Grants R12,359,902); total expenditure **R20,148,532**. **Split: 89% programmes** (52% Children & Youth + 37% Scholarships/Bursary) · **9% Operations & Management** · **3% Fundraising**. The Bursary/Scholarship (Top Learner) line counts as **programme**, not overhead — that resolves the old 90/6/4 vs 9%/15% confusion. "~90% to programmes" Key Message now = **89%**. · Source: audited SA annual financials (manual, annual, `as_of` = FY-end Mar 2025) · Bucket: **Curate** · US entity figure: TBD
12. **Year founded** (Jim, 2026-06-15) — canonical **2008**, used consistently (so "15+ years" computes from 2008); **2009** = NPO registration date, footnote only when a form asks specifically. · Source: fixed fact · Bucket: **Curate**

Bonus pin: **the flagship impact statement** (A8). Choose the *one* canonical framing for "vs control group" (recommend Jim's "children reach benchmark at ~2× the comparison-group rate," which the `/impact` seeds 53% vs 27% support) and retire 400%/200%/3× from new proposals.

### Resolved design: the children-count model (2026-06-15)

#1 and #2 are computed from a new per-site table that replaces the staff Google Sheet (`…/static/data/Masinyusane ALL Schools Database - Children Per Programme.csv`). The sheet already encodes the right logic: a "Masi Beneficiaries" column (unique, deduped) distinct from "Masi Programmes" (reach, summed). We move that logic into code.

**`SiteProgrammeChildren`** — one row per **site × programme × year**: `count`; `source` = `computed` (Zazi iZandi / Masi Literacy / Masi Numeracy, from live PG child records) or `manual` (1000 Stories / EduTech / Yebo, entered — they live outside PG); `basis` = `child_level` / `whole_school` / `percent_of_school` (this is the sheet's "Include Which Beneficiaries" rule made explicit); `as_of`; note. Per-site unique beneficiaries derive from the dedup rule (**whole-school programme present → Total Kids in School; else deduped child-level**). Three numbers roll up: programme-specific (filter one programme), unique children (Σ per-site deduped), programme reach (Σ across programmes).

**Surfaced as a NextJS grid in `/operations`** (behind Clerk) that retires the Google Sheet: computed columns read-only (greyed, source + `as_of` on hover); manual columns editable (1000 Stories, EduTech, Yebo, the 1000-Stories-in-primary %, demographics). It belongs to the **impact/programme domain** (Masi PG `api`/stats), NOT the fundraising spine — fundraising's `published_stats` / `metrics.compute` *read* the resulting PublishedStats, keeping ADR 0002's contexts clean. Design against the failure that rotted the sheet: the computed columns auto-updating is the big win; add a staleness signal ("EduTech last updated N months ago") + inline validation (beneficiaries ≤ Total Kids in School) so the remaining manual cells can't silently drift.

**Demographics = site-level % estimates, not per-child (supersedes Part C's child-race "collect gap").** Per-child race is unreliable in SA (mixed heritage), so child race/ethnicity is stored as a per-site estimated percentage with `demographic_source` (usually the school's own estimate, e.g. "Astra: 90% coloured, 10% Xhosa") + `as_of`; the breakdown = Σ(site beneficiaries × site %), explicitly labelled an estimate. Store the **percentage** (not absolute counts, as the sheet does) so it survives beneficiary-count changes. This is for **children**. **Youth** race/gender stays per-person (the `Youth` table has real `race`/`gender` fields) — so youth demographics are exact, children's are estimates, and proposals should label them differently.

### What to build (production roadmap — all 12 pinned 2026-06-15)

By how each number is produced:
- **Computed** (live from PG/Zazi via `metrics.compute` + the grid): #1 children current · #3 youth employed/year · #4 women/year · #6 % female · #7 race detail · #8 schools · #9 sites.
- **Opening balance** (frozen anchor + live movements): #2 children cumulative · #5 youth cumulative (309 youth / 281 women @ end-2021 → reconcile against series' 1,806 @ 2025) · #10 graduates (505 @ Jun-2025).
- **Curated** (manual, annual or fixed): #11 revenue + 89/9/3 split *per Receiving Entity* (SA FY24-25 income = R20,036,914) · #12 founded 2008.
- **Domain rule, not a number:** #7 "% Black = not-white = 100%" (see CONTEXT.md "Black").

Build order:
1. **`SiteProgrammeChildren` table** (impact/programme domain) + **nightly refresh job** — computed columns from PG; Zazi participation via `zazi_client` + `school_uid` join + unmatched-schools check. Unblocks #1, #8, #9, and child demographics.
2. **NextJS schools-×-programmes grid** in `/operations` — retires the Google Sheet (read-only computed columns, editable manual columns, freshness signal, validation: beneficiaries ≤ Total Kids in School).
3. **`metrics.compute` functions** for the Computed set (youth/children/site rollups + demographic facets).
4. **Store opening-balance anchors** (youth `_cumulative_by_year` series, 505 graduates, children cumulative) with `as_of` + source; wire the youth reconciliation check (PG 2022–25 ≈ 1,497).
5. **Reconcile + de-provisionalize** the existing `/impact` `PublishedStat` seeds against these pinned definitions.

Deferred: Top Learner stats (reminder 2026-07-06) · US-entity financials (#11).

---

## Part C — Demographic & financial asks vs data availability

Funders *do* ask for breakdowns — the LOTTO/NLC beneficiary tables are explicit (L1323, L1533, L1662, L1775, L1939):

> "2,345 children; 130 women; 15 children with disabilities; 141 youth; 104 unemployed"
> "1,140 children; 104 women; 410 youth; 58 elderly; 3 adults with disabilities; 51 male food-parcel recipients"

Mapped to the data model:

| Funder asks for | Captured today? | Bucket |
|---|---|---|
| children count | `CanonicalChild` (yes) | **Expose** (pin denominator) |
| women / % female | `Youth.gender`, child gender | **Expose** |
| youth count | `Youth` | **Expose** |
| race (e.g. 97% black) | `Youth.race` (yes) | **Expose** |
| **children with disabilities** | **no field** | **Collect** (or stop quoting — the 15/30/30 values look estimated) |
| **elderly / household members / food-parcel recipients** | **no field** | **Collect** |
| children *with disabilities* among CanonicalChild | **no `race` either** for children | **Collect** if a funder needs child race |
| prior-unemployment status of hires | not seen in `Youth` | **Collect** (confirm) |

This validates Jim's instinct that `published_stats` (impact/improvement) must be supplemented by `metrics.compute` (descriptive counts) — and flags two genuine collect-gaps (disabilities, elderly) where today's proposals appear to use estimates.

---

## Part D — Answer Block themes (the Answer Library blueprint)

The 23 explicit prompts + recurring sections across 6 funders confirm `ADR 0005`'s estimate: **~16 recurring blocks**, each with live data slots (marked ⚡):

1. The problem / need — reading crisis + youth unemployment ⚡(national stats)
2. The solution / model — TaRL + phonics + youth-as-EAs
3. Beneficiaries — direct/indirect, demographics ⚡(counts)
4. Technology / AI-enabled
5. Evidence of impact ⚡(control-group, benchmark %)
6. M&E processes — four tools, EGRA
7. Implementation plan — government/district route
8. Policy integration — DBE/ECDoE alignment
9. Partnerships — Wordworks, Funda Wande, universities, government
10. Organisational capacity ⚡(founded, sites, staff, revenue)
11. Programme outcomes (1–4)
12. Budget breakdown — programme/capital/operational/job-creation ⚡
13. Sustainability — income diversification ⚡(no donor >X%)
14. Top Learners / university pipeline ⚡(pass-rate, graduates)
15. Staff & leadership bios — Zama, Jim, Fiks (stable voice anchor)
16. Why us / what sets Masi apart — data-driven, community-driven

Every ⚡ slot must pull from a Part B canonical number, never from prior prose. This is the mechanical enforcement of `ADR 0005`.

---

## Part E — Internal-consistency red flags (credibility risks to fix)

These are not cross-year drift — they are contradictions *inside* submitted applications:

- **53 vs 54 ECDCs and 94 vs "100+" schools — in the same 2024 document.**
- **R1,698,877.88 (business plan) vs R1,698,887.88 (form)** — same E'Zethu/LOTTO application (L1513).
- **R2,327,798 (form) vs R2,291,619 (business plan)** — same application (L1758).
- Gender quoted as 77% / 80% / 90% female across near-contemporary docs.

A funder who cross-checks the form against the business plan finds Masi's own numbers disagreeing. The Studio's **Fact Auditor** (System A) catches exactly this class of error before submission.

---

## What I need from Jim (the gate to the next step)

The 12 decisions in Part B. They are the first hour of the metrics session and they unblock three things at once: the `PublishedStat` reconciliation, the `metrics.compute` function list, and the Answer Library's data slots. Everything else here is mine to build once those denominators are pinned.

## Appendix — Funder universe & ask-size range (feeds Funder Research fit rubric)

~60 funder folders mapped in `log.md`; 6 extracted. Observed ask sizes (the rubric's R50k–R5M band, confirmed): E'Zethu R400k–R1M; LOTTO/NLC R1.7M–R6.1M (largest single ask: R6,105,267 at L1713); DGMT R900k; Grassridge ~R400k. Multi-year repeat funders (prime Tier-1/cultivation candidates): E'Zethu (2016–2025), LOTTO (2015–2023), Grassridge (2020–2026), DGMT (2012–2026). Cross-reference these against Jim's Tier 1 list (homework #7).

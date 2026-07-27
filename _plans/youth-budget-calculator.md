# Youth Budget Calculator

Scoped 2026-07-27 via grill session with Jim. Domain language in `CONTEXT.md` (repo root);
decisions in `docs/adr/0001` and `0002`. Attaches to the school-programme grid as a third
"Budget" tab.

**The verdict it produces:**

> remaining Funding Pots (as of entry date) − Mentor Reserve − projected youth cost
> through 30 November = surplus / shortfall (on, over, or under budget)

## Formula

Per active non-Yebo youth, per calendar month m (from today through November; December
ignored entirely):

```
gross(m)  = hours_per_day(site_type, job_title)
            x school_days(m) x (days_per_week / 5)
            x wage_rate
cost(m)   = gross(m) x 1.01           # employer UIF
            - subsidy_contribution     # only if subsidised in month m; floor at 0
```

- `hours_per_day` and `days_per_week`: Hours Matrix, keyed
  (normalize_site_type(School.type), job_title lower). Stored ON BudgetScenario (JSONField),
  seeded defaults: 4.5 primary, 5.5 ecd/preschool, 4.5 fallback, 5 days. Togglable per
  programme in the calculator UI (Jim 2026-07-27) with bulk "apply days to all".
- `school_days(m)`: config per month (EC school calendar, verify Term 3/4 2026 dates at
  build). Current month uses remaining school days only.
- Subsidised = (a) actuals: `subsidy_status` active from synced Airtable columns, or
  (b) intention: the NYS Conversion lever (count + start month) applied to eligible
  unsubsidised youth (never-SEF rule; ~287 eligible, ~200 to convert).
- Yebo youth (Yeboneer title): externally paid, cost = 0, shown but never costed.
- Youth Mentors: excluded v1 (they are Inactive in PG; 3 stale-Active leaks flagged).
- Holiday Pay: manual scenario input added to total cost.
- Committed projection = actives only. At-plan projection = committed + open planned-post
  vacancies (per grid cell, non-Yebo) filled from Vacancy Start Month at the cell's
  programme/site-type hours, unsubsidised.
- Population = ALL youth with employment_status='Active' (438 today), NOT the grid-visible
  428 — insulates money math from school-mapping bugs.

Calibration anchors (2026-07-27): wage_rate R32.01 (June payslip: 79.0h x 32.01 =
R2,528.79), pots R1,523,777.96, ~438 actives of which ~90 Yebo, 0 currently subsidised
(SEF ended; 151 ex-SEF are NYS-ineligible).

## Phase 0 — data prerequisites (mostly Jim's team)

- [ ] FIX (separate branch, ships first): duplicate-school bug — youth sync attaches youth
      to legacy `is_active=false` School rows; re-point active youths' school FKs to
      canonical UID rows (16 stranded: Lingelethu 7, Msobomvu 6, Nceduluntu 2, Lukhanyiso 1),
      make `sync_airtable_youth` match canonical schools only, add GridHealthPanel check
      "active youth on inactive school rows". Also explains Act First panel fake gaps.
- [ ] Team: verify/populate Airtable subsidy columns (Funder = SEF/NYS, SEF status,
      start/end dates) — currently not accurate.
- [ ] Team: correct job titles for stale-Active mentors (employee_ids 1691, 2078, 2045).
- [x] Team: confirm Hours Matrix values (Jim 2026-07-27: primary 4.5 / ECD 5.5 correct;
      matrix is UI-togglable anyway).
- [ ] Verify EC 2026 Term 3/4 dates -> school_days config (web check at build time).
- [x] Jim: as-of date for the R1,523,777.96 pot balances = 2026-07-27.

## Phase 1 — backend (Django)

- [ ] Youth model: add `subsidy_funder`, `subsidy_status`, `subsidy_start_date`,
      `subsidy_end_date`; map in `sync_airtable_youth` (skip Hours Cap — untrusted, unused).
- [ ] New models + migration:
      - `FundingPot`: year, funder_name, amount, as_of, note, schools (M2M, blank =
        unrestricted), is_active.
      - `BudgetScenario`: year (unique), wage_rate (32.01), subsidy_contribution (1600),
        hours_matrix (JSONField: {site_type}.{job_title} -> {hours_per_day, days_per_week},
        seeded defaults), nys_conversion_count (200), nys_conversion_start_month,
        vacancy_start_month, holiday_pay (0), mentor_reserve (0), updated_by, updated_at.
      - `MonthlyYouthExpenditure`: year, month, core_amount, mentor_amount, rural_amount,
        note. (History display only — reconciliation engine stays deferred.)
- [ ] `api/youth_budget.py` policy module (pure functions, mirroring school_programme.py):
      HOURS_MATRIX_DEFAULTS (seed for scenario), SCHOOL_DAYS_2026, cohort aggregation
      (site_type x job_title x subsidy),
      committed/at-plan projections, per-month series, generic restricted-pot feasibility
      check (UTS now, rural later), verdict.
- [ ] Endpoints (reads authenticated, writes IsAdminOrProjectManager, atomic):
      - `GET /youth-budget/?year=` -> pots, scenario, cohort primitives, saved-scenario
        projections + verdict, expenditure history, feasibility warnings, data-health notes
        (school-less youth, stale mentors).
      - `POST/PATCH/DELETE /youth-budget/pot/<pk>/`
      - `PATCH /youth-budget/scenario/`
      - `POST/PATCH /youth-budget/expenditure/<pk>/`
- [ ] `seed_youth_expenditure_2026` command: parse the ledger CSV
      (staticfiles/data/youth-payments-jan-june-2026.csv) with normalisations (BOM, R-amounts,
      trailing-space months) into MonthlyYouthExpenditure, split core/mentor/rural by
      Category 2/3 rules (Mentor in Cat3 -> mentor; Wind Farm / Rural -> rural).
- [ ] Tests: subsidy floor at 0, Yebo exclusion, days_per_week ratio, November horizon,
      current-month partial days, NYS lever eligibility cap, at-plan vacancy costing,
      feasibility check, endpoint permissions.

## Phase 2 — frontend (Next.js)

- [ ] Read `documentation/design-system.md` first (Ink & Signal).
- [ ] `GridNav`: add "Budget" tab -> `/operations/school-programme-grid/budget/`.
- [ ] Types in `src/lib/types/`, API functions in `src/lib/api/school-programme/` (SWR,
      three states, Clerk token — house pattern).
- [ ] Components (`src/components/school-programme/budget/`):
      - `BudgetHeadline` — on/over/under verdict, surplus/shortfall, as-of provenance.
      - Committed vs At-Plan panels (A and B side by side; gap = "cost of remaining plan").
      - `LeversPanel` — what-if recompute client-side on cohort primitives; Save (ADMIN/PM)
        persists scenario; visible "saved team scenario" snap-back. Includes per-programme
        hours/day + days/week toggles (the Hours Matrix) alongside the global levers.
      - `QuickEstimate` — back-of-envelope C mode: editable buckets (count x monthly rate)
        x months, prefilled from live data; client-only, never persisted. Prefill assumes
        all 200 NYS slots utilised (~200 at top-up rate, remainder full rate) until real
        subsidy data lands in Airtable.
      - `PotsPanel` — pot CRUD + total + feasibility warnings.
      - `ExpenditureChart` — actual bars (Jan-Jul, from MonthlyYouthExpenditure) flowing
        into projected bars (Aug-Nov) in one continuous chart.
- [ ] Affordability strip on Youth staffing tab (saved verdict one-liner -> links to tab).
- [ ] E2E in browser via Clerk login as staff would use it; pixel pass.

## Phase 3 — wrap

- [ ] Cross-check verdict against Jim's spreadsheet expectations (trust bridge).
- [ ] Update `documentation/api-endpoints.md`, `documentation/roadmap.md`.
- [ ] Feature branches per repo (`feature/youth-budget-calculator`), PR, merge.

## Deferred (explicitly out of v1)

- Reconciliation engine (ledger ingestion, predicted-vs-actual) — Jim: existing payroll
  checks cover it.
- Funder funding windows / proper per-funder budget tracking.
- Per-pot allocation engine (pooled + feasibility checks instead — ADR pending revisit).
- Youth Mentor costing (Mentor Reserve input stands in).
- Rural pots + rural schools (design is generic; add when Jim shares numbers).
- December / Holiday-pay modelling beyond the manual input.

# WIG Dashboard - Build Plan

Branch: `feature/wig-dashboard`
Date: 2026-05-30
Companion docs: `feasibility-matrix.md` (data reality), `framework-decisions.md` (framework decisions + team follow-ups)

A "Wildly Important Goals" scoreboard for Masinyusane: one tile per programme/department, each showing its WIG (lag/outcome) and its lead measures (controllable, weekly behaviours) against target. Built in phases; v1 is a lead-measure scoreboard for the data-rich slice.

---

## Architecture decisions for v1

_CONFIRMED by Jim 2026-05-30: route #1 (`/operations/wig`), config-not-DB #2, access #7 (ADMIN+PM, server-side), period #8 (last completed week, week-only). Full metric details in `metric-contract.md`._

1. **Route:** `/operations/wig` (Clerk-protected, like other operations dashboards; surfaced under the "Project Management" nav).
2. **Definitions live in a typed config, not a DB (for now).** A single source-of-truth file (`src/lib/wig/config.ts`) describes each programme -> WIG(s) with sub-targets -> lead measures (label, unit, target, cadence, RAG thresholds, and a `source` key naming the backend metric that fills it). Rationale: v1 measures are all auto-computed, targets change rarely, and YAGNI - we add a team-editable backend `WigConfig` model only when manual-entry tiles arrive (deferred phase). Aligns with "never over-engineer."
3. **Values come from backend aggregation endpoints.** The frontend never aggregates raw sessions. Reuse `youth-sessions/*` logic; add WIG-specific endpoints where needed.
4. **Status (RAG) is computed client-side** from value vs target vs thresholds in the config.
5. **WIG outcome (lag) tiles render an "awaiting baseline/midline" state** until 2026 assessment data lands (~mid-June). They are scaffolded in v1 but not populated.
6. **Bundled WIG pattern** (per decision 5): one programme tile, one row per sub-target + "X of N on track" roll-up.
7. **Access (CONFIRMED):** ADMIN + PROJECT MANAGER only, enforced server-side (guard modelled on `assertFieldAppAccess()`) on BOTH the page and `/api/wig/*` - authorization, not just authentication.
8. **Period (CONFIRMED):** default window = last completed week (Mon-Sun); v1 week-only; backend returns a `window` object + per-measure numerator/denominator metadata so the frontend does no date math. See `metric-contract.md`.
9. **Two backends (CONFIRMED):** Zazi iZandi lives in the separate `zazi_izandi_db` backend (Teampact-fed); Masi PG `literacy_sessions_2026` is Core Literacy only. The Masi backend AGGREGATES: it calls the Zazi backend's existing API (`programme-overview/`, `ea-performance/`, `assessments-summary/`, `letter-alignment/`, `mentor-visits-summary/`) server-side via the `X-Internal-Auth` shared secret, and normalizes into the WIG payload. Frontend talks only to Masi. See `documentation/data-architecture.md`.

---

## Phase roadmap

- [x] **Phase 0 - Reconcile data & lock source-of-truth.** Prod = `masi_database`; analyse read-only against prod, experiment local. (Done.)
- [x] **Phase 1 - Feasibility matrix.** Every WIG + lead measure mapped to data reality. (Done - `feasibility-matrix.md`.)
- [~] **Phase 2 - Framework refinement.** Dates, bundled WIGs, lead/lag, deferrals decided; remaining items (real deadlines, targets/cadence, YeBo status, lead/lag confirmation) owned by Jim with the team. (`framework-decisions.md`.)
- [ ] **Phase 3 - v1 lead-measure scoreboard (data-rich slice).** This plan's focus. Zazi iZandi/Literacy, ECD, Numeracy, Data team.
- [ ] **Phase 4 - Instrument the assessment gap.** Wire 2026 baseline/midline into a queryable model; light up WIG outcome tiles; add 1-min-assessment capture if adopted.
- [ ] **Phase 5 - Expand measures/programmes.** 1000 Stories instrumentation; lift Zazi iZandi 🟡 partials to full (improve `sounds_covered`/`blending_level` fill; curriculum reference for "right level / correct letters").
- [ ] **Phase 6 - Manual-entry tiles + team self-service.** Backend `WigConfig`/`WigValue` model + admin; brings back Top Learners (HS+Univ), Finance, Marketing, Fundraising.
- [ ] **Phase 7 - Cadence & governance.** Weekly review ritual; who updates manual measures; "data as of" + freshness indicators.

---

## Phase 3 - v1 implementation checklist

Build order enforces the review's core lesson: lock the metric contract, build + test the backend, then UI. Full formulas in `metric-contract.md`.

v1 has TWO independent tracks: **(A) Masi-PG tiles** - Core Literacy, Numeracy, ECD, Data team - no external dependency, can start now; **(B) Zazi tile** - via the Zazi backend API (needs the Zazi `INTERNAL_API_SECRET` + base URL provisioned in the Masi env). The metric-contract's Zazi section must be rewritten to source from the Zazi API, not Masi `literacy_sessions_2026`.

### 3.0 Metric contract & cohorts - DONE (one item deferred, non-blocking)
- [x] `metric-contract.md` finalized: site-type-first cohort map; visit attribution (by site type, per submitter); school-coverage denominator (assigned coaches); `job-titles-evidence` pins exact strings
- [ ] DEFERRED (non-blocking): formal Data-team "98% accurate" formula - v1 shows dq sub-gauges + `site_job_mismatch`
- [ ] v2: public holidays + admin-flaggable excluded days

### 3a. Backend metric service + tests (`api/views/wig.py`)
Reuse ONLY the youth-sessions working-day / start-date helpers - NOT its `INCLUDED_JOB_TITLES` filter (it excludes Zazi iZandi + ECD, the largest cohorts).
- [ ] Add a `WIG_COHORTS` map (programme -> job_titles + school-type) per the contract
- [ ] `GET /api/wig/lead-measures/?period=last_week` - one payload keyed by `source`; each measure returns numerator/denominator/value/eligible_count/note inside a `window` envelope (no client date math). Covers sessions/day (zazi/core/ecd/numeracy), active coaches, school coverage (intentional per-programme denominator), visit-compliance bundles, EA admin proxy
- [ ] `GET /api/wig/data-quality/` - child-FK resolution (BOTH `child_1` + `child_2` slots), youth-FK, duplicate rate, capture-on-time, future-dated, school-type hygiene (do NOT use `overall_session_status='Clean'` - it's 99.6% "Needs fix"); response carries `scope`/`dataset`/`rows_evaluated`/`latest_source_date`
- [ ] Add DRF permission `IsAdminOrProjectManager` (`request.user.profile.role in {ADMIN, PROJECT MANAGER}`; none exists today - views use IsAuthenticated only) on both endpoints; must cover Clerk AND SessionAuthentication users
- [ ] Compute the window in `Africa/Johannesburg` (settings TIME_ZONE='UTC') via a `get_business_today()` helper; use for last_week, future_dated, data_as_of
- [ ] Export new views in `api/views/__init__.py` (+ `__all__`) and wire `api/urls.py` - repo requires this or it's an import error
- [ ] Django fixture tests: cohort include/exclude (prove Zazi iZandi + ECD are NOT dropped), UTC/SAST week boundary, start-date eligibility, zero-denominator, null visit booleans, child_2 FK resolution, visit non-double-counting, role denial (MENTOR/VIEWER/anon/no-profile), dq formulas, payload keys == config keys
- [ ] Final read-only smoke test against prod

### 3b. Frontend types & config
- [ ] `src/lib/types/wig.ts` - `WigProgramme`, `WigTarget`, `LeadMeasure`, `MeasureValue`, `RagStatus`
- [ ] `src/lib/wig/config.ts` - board definition; each `LeadMeasure` carries `direction` (gte/lte - data-quality measures are lower-is-better), `valueScale`, `availability`, `caveats[]`, target/cadence/thresholds, `source` key
- [ ] `src/lib/api/wig/{lead-measures,data-quality,index}.ts`
- [ ] Load-time validation: every config `source` exists in the API payload; missing -> "data unavailable" state, never RAG

### 3c. Page & components (`src/components/wig/`)
- [ ] `src/app/operations/wig/page.tsx` - SERVER component: ADMIN+PM guard (redirect/deny) + render shell (a page can't be both a server guard and a client SWR component - split it)
- [ ] `WigScoreboardClient.tsx` - CLIENT child: `useAuth()` + SWR + WIG API wrappers + loading/error/success states (no period toggle in v1)
- [ ] `WigScoreboard.tsx` - grid of programme tiles
- [ ] `ProgrammeWigTile.tsx` - WIG header (or "awaiting baseline/midline") + "X of N on track" roll-up + lead rows
- [ ] `WigTargetRow.tsx` - bundled-WIG sub-target row (actual vs its own target + RAG)
- [ ] `LeadMeasureRow.tsx` - value vs target + RAG + cadence + partial/proxy/unavailable labelling
- [ ] `RagBadge.tsx` - on track / close / behind / unavailable
- [ ] `AwaitingDataTile.tsx` - lag placeholder w/ expected-date note
- [ ] Nav entry under Project Management (link visibility ALSO role-gated)

### 3e. Zazi iZandi tile (cross-backend, Track B)
- [ ] Provision Zazi `INTERNAL_API_SECRET` + base URL in the Masi backend env
- [ ] Masi `/api/wig/zazi/` calls Zazi endpoints with `X-Internal-Auth`, normalizes into the WIG payload shape
- [ ] Reuse Zazi's computed metrics (`pct_eas_on_track`, letter-alignment, assessment coverage) rather than re-aggregating from raw `sessions_2026`
- [ ] Map Zazi `programme_targets` (dosage 2.5, on-track 80%, flag-res 70%, assessment-coverage 95%, mentor-coverage 30d) into config targets
- [ ] Failure handling: if the Zazi API is unreachable, the Zazi tile renders "data unavailable", not red/"behind"

### 3d. Verification
- [ ] `pnpm build` clean (no TS errors)
- [ ] `pnpm dev` -> `/operations/wig`; a non-ADMIN/PM user is blocked server-side; measures load from prod
- [ ] Zazi iZandi + ECD tiles show real, non-zero numbers (proves the cohort fix)
- [ ] Proxy / partial / unavailable measures clearly labelled
- [ ] Dark mode + mobile (tiles stack)

---

## Out of scope for v1 (deferred)

Top Learners (HS + University), Finance, Marketing, Fundraising; all assessment-based WIG outcomes; 1-min-assessment capture; 1000 Stories; team-editable config/manual entry. See `feasibility-matrix.md` "Deferred" section.

## Key reference (pattern reuse)
- `src/app/operations/youth-sessions/page.tsx` + `src/components/youth-sessions/*` - page/SWR/filter/tile patterns
- `api/views/youth_sessions.py` - working-day / start-date helpers and response-shaping examples ONLY; do NOT reuse `INCLUDED_JOB_TITLES`, its programme filters, or its school-coverage denominator for WIG
- `src/components/mentors/*` - stat-card/gauge styling

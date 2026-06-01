# WIG Dashboard - Build Log

A running, human-readable log of the big steps (endpoints, calculations, decisions) so the work is easy to follow later. Companion to `_plans/wig-dashboard/plan.md`, `metric-contract.md`, and `data-architecture.md`.

---

## Current state (2026-05-31)

### Backend — Masi PG (repo: `backend/Masi Web Main`, branch `feature/wig-dashboard`)

**Files:** `api/wig_metrics.py` (calculation logic), `api/views/wig.py` (endpoints), `api/permissions.py`, `api/tests_wig.py` (tests).

**Endpoints (ADMIN / PROJECT MANAGER only, enforced server-side):**
- `GET /api/wig/lead-measures/` -> `{ window, measures: { "<key>": {numerator, denominator, value, eligible_entity_count, calculation_note} } }`
- `GET /api/wig/data-quality/` -> `{ scope: "full_dataset", measures: {...} }`
- `GET /api/wig/zazi/` -> `{ available, source, generated_at, measures: { "zazi.*": {value, target} } }` — Masi backend calls the Zazi backend's `programme-overview/` (X-Internal-Auth) and normalises; degrades to `available: false` if unreachable. Client: `api/zazi_client.py`.

**Window:** last completed Mon-Sun week, computed in `Africa/Johannesburg` (server is UTC).

**Cohorts (site-type first — the session's `school.type` decides the programme):**
| Cohort | Site types | Coach job_titles | Session table |
|---|---|---|---|
| core_literacy | Primary School | Literacy Coach, Literacy Coaches (ZZ) | literacy_sessions_2026 |
| ecd_literacy | ECD, ECDC | Literacy Coach, ZZ ECD Coach, ECD Practitioner, Practitioner | literacy_sessions_2026 |
| numeracy | (all sites) | Numeracy Coach, Count Coach | numeracy_sessions_2026 |
| zazi_izandi | — (Zazi backend) | — | (Zazi API, separate) |

**Calculations:**
| Measure key | Formula | Source |
|---|---|---|
| `eligible_coaches` | Active + started by window end + job_title in cohort + (literacy: school.type in site types) | Youth + School |
| `{core,ecd}.sessions_per_day` | sessions in window / (eligible coaches x working days) | literacy_sessions_2026, split by school.type |
| `numeracy.sessions_per_week` | sessions in window / eligible coaches | numeracy_sessions_2026 |
| `*.active_coaches` | eligible coaches with >=1 session this window / eligible coaches | sessions + Youth |
| `*.school_coverage` | assigned schools reached this window / schools with >=1 active assigned coach | sessions + Youth.school |
| `dq.capture_on_time` | sessions with 0<=capture_delay<=2 / all literacy sessions | literacy_sessions_2026 |
| `dq.duplicate_rate` | duplicate_status='Duplicate' / all literacy sessions | literacy_sessions_2026 |
| `dq.site_job_mismatch` | active youth with an ECD title at a primary site / all active youth | Youth + School |
| `{core,ecd}.tracker_compliance` | observation visits with all tracker booleans true / observation visits (by site type) | MentorVisit |
| `{core,ecd}.school_visits` | observation visits / distinct mentors (avg per mentor) | MentorVisit |
| `numeracy.admin_compliance` | observation visits with numeracy_tracker_correct / observation visits | NumeracyVisit |
| `dq.child_fk_resolution` | resolved child_1 + child_2 slots / (2 x literacy sessions) | literacy_sessions_2026 + CanonicalChild |

**Tests:** `api/tests_wig.py` — run with `DATABASE_URL="" venv/bin/python manage.py test api.tests_wig` (forces SQLite test DB; no Postgres perms needed). 33 WIG tests, 41 total, all green.

**Prod smoke (2026-05-31, read-only):** window 2026-05-25..31; core_literacy sessions/day 2.29 (92 coaches), active 0.91, coverage 1.00; ecd sessions/day 1.47; numeracy/week 13.33; capture_on_time 0.876; duplicate_rate 0.003; site_job_mismatch 0.

### Backend status: COMPLETE
Masi-PG programmes (Core Literacy, Numeracy, ECD) + Data team + the Zazi tile (via Zazi API) are all built, tested (42 tests), and prod-smoke-verified. Needs `ZAZI_API_BASE_URL` + `ZAZI_INTERNAL_API_SECRET` env vars on the Masi backend (set on Render).

### Frontend
- Not started. Route `/operations/wig`; config-driven; sub-gauge + roll-up tiles. To build together.

---

## Changelog

- **2026-05-31** — Backend Track A core. Built (TDD): SAST window, site-type-first cohorts + eligibility (proves Zazi/ECD not dropped), sessions/day + sessions/week, active coaches, school coverage, 3 data-quality gauges, `IsAdminOrProjectManager`, and the two `/api/wig/*` endpoints. 33 tests green, no regressions, prod smoke verified.
- **2026-05-31** — Added visit-based measures (tracker compliance + school visits per programme, attributed by site type) and `dq.child_fk_resolution` (both child slots). Now 38 tests green. Prod smoke: child-FK resolution 38.4%. Masi-PG backend complete.
- **2026-05-31** — Track B: Zazi tile. `api/zazi_client.py` calls the Zazi backend's `programme-overview/` and maps KPIs/targets into WIG measures; `GET /api/wig/zazi/` (role-gated, graceful degradation). 42 tests green; live smoke verified (pct_eas_on_track 76.3/80, sessions/day 3.2/2.5). **Backend complete.**

# WIG Dashboard - Lead Measure Feasibility Matrix

Date: 2026-05-30 (updated)
Source of truth: **production** Render DB (`masi_database`), read-only. Local `masi_db` is an unreliable partial snapshot - do not analyse against it.

## Scope decisions applied (see `framework-decisions.md`)

- **Expired deadlines removed** - all targets assumed "by end of 2026" until the team confirms real dates.
- **Lead measures that are actually outcomes removed** from lead consideration (recorded in decisions log).
- **Deferred to a future session:** Top Learners (High School + University), Marketing, Finance, Fundraising. Documented at the bottom, not part of current work.
- **Assessment timing:** baseline 2026 results are being loaded now; midline assessments run over ~the next 2 weeks (mid-June 2026). So for now **only lead measures have data** - the WIG outcome (lag) tiles stay in an "awaiting baseline/midline" state until then. v1 is therefore a lead-measure scoreboard.

## Legend

- ✅ **Now** - measurable today from existing production data
- 🟡 **Partial** - data exists but incomplete (low fill rate), or only a proxy
- 🔴 **Gap** - needs new instrumentation (no data captured today)
- 🔧 **Derivable** - computable from existing data-quality fields with new logic

## Production data confirmed available (2026-05-30)

- `literacy_sessions_2026`: 17,511 rows, fresh to May 29 (1,495 last 7d). Fields incl. `sounds_covered_clean`, `blending_level` (~43% filled), `overall_session_status` (100%), `capture_delay_flag`, `duplicate_status`.
- `numeracy_sessions_2026`: 4,557 rows, fresh to May 29. Fields incl. `group_count_level`, `group_number_recognition`, `children_count`.
- Mentor visit tables (all active through late May): `api_mentorvisit` 934 (211 in 2026), `api_numeracyvisit` 307, `api_yebovisit` 285, `api_thousandstoriesvisit` 135 - each with per-visit compliance booleans + quality_rating.
- `api_youth`: ~346 active. Active cohorts: Zazi Izandi Coach 132, Literacy Coach 121, ZZ ECD 25, Numeracy 24, 1000 Stories 17, EduTech 10, Practitioner 8. **No active "Yeboneer."**
- `assessment_2025`: 7,219 rows (2025 cycle). `wela_assessments`: 5,509 (year 2024). **No 2026 assessment capture yet** - baseline loading in progress, midline ~mid-June.
- Data quality: literacy capture-on-time 15,103/17,511 = 86%. `capture_delay_flag` has inconsistent variants (hygiene issue).
- `api_school` active: Primary School 167, ECDC 121, Secondary 49, ECD 3. ECD = ECDC+ECD ~124.

---

## Active programmes

### 1. Masi Core Literacy
**WIG (lag):** 50% of Gr1 read 16+ words/min; 50% of GrR read 8+ words/min. (bundled - 2 grade targets; see decisions log)
- WIG outcome: 🔴 awaiting 2026 assessment (baseline loading; midline ~mid-June).

| Lead measure | Status | Source / action |
|---|---|---|
| 90% of youth using letter & blending trackers correctly | ✅ Now (proxy) | `api_mentorvisit.letter_trackers_correct`, `reading_trackers_correct` - % visits compliant |
| 2.5+ sessions per day | ✅ Now | `literacy_sessions_2026` per coach per working day |
| Utilize 1-min assessment (min 5/week) | 🔴 Gap | No capture of 1-min assessment events; new instrumentation |
| Monitor school visits (min 5/week) | ✅ Now | `api_mentorvisit` per mentor per week |

### 2. ECD Literacy
**WIG (lag):** 75% of children learn 20+ letter sounds.
- WIG outcome: 🔴 awaiting 2026 assessment.

| Lead measure | Status | Source / action |
|---|---|---|
| 90% monthly compliance: LC admin (letter/session tracker, back-of-book) | ✅ Now (proxy) | `api_mentorvisit` booleans |
| 3.5+ sessions/day average | ✅ Now | `literacy_sessions_2026` filtered to ECD-type schools |
| Utilize 1-min assessment (min 5/week) | 🔴 Gap | New instrumentation |
| Monitor school visits (min 5/week) | ✅ Now | `api_mentorvisit` |

_Removed (outcome, not lead): "75% of children learn 1 letter sound/week" - see decisions log._

### 3. Zazi iZandi
**WIG (lag, bundled - 3 grade targets):** 67% GrR achieve 20 letters/min; 67% Gr1 achieve 40 letters/min; 40% Gr2 achieve [words]/min.
- WIG outcome: 🔴 awaiting 2026 assessment.

| Lead measure | Status | Source / action |
|---|---|---|
| 90% monthly compliance: EA admin (session tags/comments/tracking/SYNC) | 🟡 Partial | `overall_session_status` (100% filled), `sounds_covered_clean` (~43%) - derivable, low fill |
| 90% of EAs teaching at the right level | 🟡 Partial | `blending_level` (~43% filled) vs child level - needs reference + better fill |
| 90% of EAs teaching the correct letters | 🟡 Partial | `sounds_covered_clean` vs expected curriculum sequence - needs reference data |
| 2.5+ sessions per day | ✅ Now | `literacy_sessions_2026` |
| Monitor school visits (min 6/week) | ✅ Now | `api_mentorvisit` |

_Removed (outcome, not lead): "75% of children learn 3 letter sounds/week" - see decisions log._

### 4. 1000 Stories
**WIG (lag, bundled):** avg 300 stories/child/centre; read 5,000 stories by EOY.
- WIG outcome: 🔴 Gap - no stories-read table.

| Lead measure | Status | Source / action |
|---|---|---|
| Each youth reads avg 3 stories/day | 🔴 Gap | No stories-read capture; new instrumentation |
| >1 ECD visited per day | 🔴 Gap | 1000 Stories youth activity not in session tables; needs visit capture |

### 5. Masi Numeracy
**WIG (lag, bundled - 2 targets):** 50% of learners count to 30; 50% count backwards 10->1.
- WIG outcome: 🟡 Partial - `numeracy_sessions_2026.group_count_level` / `group_number_recognition` are group-level proxies, not per-child assessment.

| Lead measure | Status | Source / action |
|---|---|---|
| Coaches complete avg 20 sessions/week | ✅ Now | `numeracy_sessions_2026` per coach per week |
| 90% monthly compliance: LC admin (numeracy tracker, back-of-book) | ✅ Now (proxy) | `api_numeracyvisit.numeracy_tracker_correct` etc. |

### 6. Year Beyond (YeBo)
**WIG (lag):** 40% of children move pink->red sticker books; 90% monthly Yeboneer admin compliance.
- ⚠️ No active "Yeboneer" job title - confirm programme is still running (open item in decisions log).
- WIG outcome: 🔴 Gap - no sticker-book-level capture.

| Lead measure | Status | Source / action |
|---|---|---|
| 90% monthly compliance: Yeboneer admin (paired reading tracking, afternoon attendance) | 🟡 Partial | `api_yebovisit` booleans (285 rows, active) - confirm who logs these |

---

## Department in scope

### Data Team
**WIG:** 98% accurate databases.

| Lead measure | Status | Source / action |
|---|---|---|
| % errors in databases / month | 🔧 Derivable / ✅ Now | `capture_delay_flag`, `duplicate_status`, future-date flags, FK-resolution, school-type hygiene |

---

## Summary (active scope only)

| Bucket | ~Count (lead measures) |
|---|---|
| ✅ Now / 🔧 Derivable | ~11 |
| 🟡 Partial | ~4 |
| 🔴 Gap (needs instrumentation) | ~4 |

**Biggest recurring gap:** child-level **2026 assessment / 1-minute reading capture**. Every programme WIG outcome plus the 1-min-assessment lead measures depend on it. Baseline is loading now; midline ~mid-June - so the lag tiles will light up then.

## v1 scope (data-rich slice)

Fully supported by production data today:

- **Zazi iZandi / Literacy:** sessions/day, school visits/week, tracker compliance (✅); EA admin/teaching-level (🟡 where fill allows).
- **Numeracy:** sessions/week, admin compliance (✅).
- **ECD (literacy):** sessions/day at ECD sites, visits, compliance (✅).
- **Data team:** capture timeliness, duplicate/error rate (🔧).

Lag/WIG-outcome tiles render as "awaiting baseline/midline (~mid-June 2026)" until assessment data lands.

---

## Deferred to a future session (not current scope)

Parked per decision on 2026-05-30 - no backend data; manual-entry design to be tackled later.

- **Top Learners - High School.** WIG: increase tertiary access 250 -> 500. Lead: 6 dated onboarding/application milestones.
- **Top Learners - University.** WIG: increase NMU graduates to 554. Lead: monthly check-ins, tutoring, Masi House stats.
- **Finance.** WIG: 12/12 monthly funder budgets shared with PMs. Lead: monthly management sheets.
- **Marketing.** WIG: 60 packaged stories. Lead: 15 captured stories/month.
- **Fundraising.** WIG: 12 proposals/quarter (>=8 new). Lead: proposals submitted, donor sheet progress, 20 personalised funder emails/quarter.

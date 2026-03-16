# Youth Sessions Dashboard - Implementation Checklist

Branch: `feature/youth-sessions-dashboard`

---

## Phase 1: Backend Endpoints

All endpoints in `/backend/Masi Web Main/api/views/youth_sessions.py`

- [x] Create `youth_sessions.py` with shared helpers (_apply_common_filters, _get_working_days, etc.)
- [x] Endpoint 1: `GET /api/youth-sessions/summary/` - Top-level stat cards
- [x] Endpoint 2: `GET /api/youth-sessions/daily-activity/` - Stacked bar chart data by school type
- [x] Endpoint 3: `GET /api/youth-sessions/youth-heatmap/` - Youth x date session counts
- [x] Endpoint 4: `GET /api/youth-sessions/inactive-youth/` - Active youth with no recent sessions
- [x] Endpoint 5: `GET /api/youth-sessions/school-coverage/` - Covered vs uncovered schools
- [x] Endpoint 6: `GET /api/youth-sessions/youth-detail/<youth_uid>/` - Individual youth drilldown
- [x] Endpoint 7: `GET /api/youth-sessions/lookups/` - Filter dropdown data
- [x] Wire URLs in `api/urls.py`
- [x] Update `api/views/__init__.py` with imports
- [ ] Test all endpoints with curl/browser

---

## Phase 2: Frontend Types and API Layer

- [x] Create `src/lib/types/youth-sessions.ts` - All TypeScript interfaces
- [x] Create `src/lib/api/youth-sessions/summary.ts`
- [x] Create `src/lib/api/youth-sessions/daily-activity.ts`
- [x] Create `src/lib/api/youth-sessions/heatmap.ts`
- [x] Create `src/lib/api/youth-sessions/inactive.ts`
- [x] Create `src/lib/api/youth-sessions/school-coverage.ts`
- [x] Create `src/lib/api/youth-sessions/youth-detail.ts`
- [x] Create `src/lib/api/youth-sessions/lookups.ts`
- [x] Create `src/lib/api/youth-sessions/index.ts` - Barrel export

---

## Phase 3: Frontend Page and Components

### Page
- [x] Create `src/app/operations/youth-sessions/page.tsx` - Main page with SWR, filters, layout

### Components (`src/components/youth-sessions/`)
- [x] `YouthSessionsFilterBar.tsx` - Date presets, programme toggle, youth/school/mentor selects
- [x] `SummaryStats.tsx` - 5 gradient stat cards (sessions, active youth, inactive, schools, avg)
- [x] `DailyActivityChart.tsx` - Plotly stacked bar chart (primary school + ECD)
- [x] `YouthActivityHeatmap.tsx` - Color-coded table (red/amber/green), sortable, scrollable
- [x] `InactiveYouthPanel.tsx` - Tiered severity cards with day thresholds
- [x] `SchoolCoverageGrid.tsx` - Tabs for covered/uncovered schools
- [x] `YouthDetailSheet.tsx` - Slide-out sheet with mini chart and stats

---

## Phase 4: Polish and Verification

- [x] Run `pnpm build` - no TypeScript errors
- [ ] Run `pnpm dev` and navigate to `/operations/youth-sessions`
- [ ] Verify all SWR calls load with real data
- [ ] Test filter changes trigger data refetch
- [ ] Test heatmap sorting and youth click -> detail sheet
- [ ] Test dark mode
- [ ] Test mobile responsiveness (charts hidden on mobile, heatmap scrollable)
- [ ] Verify middleware protects the route (Clerk auth required)

---

## Key Reference Files

**Backend (read):**
- `api/models.py` lines 46-153: School, Youth models
- `api/models.py` lines 216-232: Mentor model
- `api/models.py` lines 663-800: LiteracySession2026, NumeracySession2026

**Frontend (pattern reference):**
- `src/app/operations/mentors/page.tsx` - Page pattern
- `src/components/mentors/DashboardStats.tsx` - Stat cards
- `src/components/mentors/FilterBar.tsx` - Filter bar
- `src/components/mentors/VisitFrequencyChart.tsx` - Plotly chart

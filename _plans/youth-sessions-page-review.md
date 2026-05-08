# Youth Sessions Page Review

Reviewed page: `src/app/operations/youth-sessions/page.tsx`

Supporting files checked:
- `src/components/youth-sessions/*`
- `src/lib/api/youth-sessions/*`
- `src/lib/types/youth-sessions.ts`
- Backend endpoint contract in `/backend/Masi Web Main/api/views/youth_sessions.py`

## 1. Bugs, Errors, and Miscalculations

### High priority

1. **Lookup failures can leave the page stuck on loading forever.**
   - In `page.tsx`, the component returns the loading skeleton whenever `!lookups` before it checks `lookupsError`.
   - Reference: `src/app/operations/youth-sessions/page.tsx:134-157`
   - Impact: if `/youth-sessions/lookups/` fails, the user never sees the error state. They just see skeleton loading indefinitely.
   - Fix direction: check `lookupsError` before `!lookups`, or make the loading condition `!lookups && !lookupsError`.

2. **Filters do not apply consistently across the dashboard.**
   - The filter bar exposes date, programme, youth, school, and mentor filters, but several panels either ignore some filters or use different time windows.
   - Summary intentionally drops date filters in `page.tsx:49-80`, while daily activity, heatmap, school coverage, and inactive youth use other rules.
   - Inactive youth drops `date_from`, `date_to`, `youth_uid`, and `school_uid` in the frontend helper.
   - References:
     - `src/app/operations/youth-sessions/page.tsx:49-80`
     - `src/lib/api/youth-sessions/inactive.ts:8-14`
     - `/backend/Masi Web Main/api/views/youth_sessions.py:37-45`
   - Impact: selecting a school or youth can make the summary/inactive panels report numbers for a broader population than the selected filter implies.
   - Fix direction: define which filters each panel should honor, then make the UI labels and API params match that contract.

3. **Summary active-youth and inactive-youth counts ignore selected school/youth filters.**
   - The backend summary uses `_active_youth_qs(params)` for `total_active_youth` and inactive counts, but `_active_youth_qs` only filters programme and mentor.
   - References:
     - `/backend/Masi Web Main/api/views/youth_sessions.py:37-45`
     - `/backend/Masi Web Main/api/views/youth_sessions.py:146-159`
   - Impact: with a school filter selected, the "Active Youth Today of X total" denominator can still be all active Literacy/Numeracy Coaches, not active youth at that school. With a youth filter selected, the inactive count can still compare against all active youth.
   - Fix direction: add `school_uid` and `youth_uid` support to `_active_youth_qs`, or explicitly label the summary as global/live rather than filtered.

4. **Youth detail ignores the current selected date range and filter state.**
   - The SWR key is only `youth-detail-${selectedYouthUid}`, and the fetch passes no filters.
   - Reference: `src/app/operations/youth-sessions/page.tsx:124-131`
   - Impact: if a user filters to Today, This Week, a school, or a mentor and clicks a youth, the sheet still shows default/unfiltered detail data.
   - Fix direction: include the relevant filters in the SWR key and pass them to `getYouthDetail(token, selectedYouthUid, { date_from, date_to })`. If school/mentor/programme filters matter for detail, add backend support too.

5. **Youth detail average can be mathematically wrong.**
   - When no date filters are passed, backend `total_sessions` is all-time, but `days_with_sessions` and `daily_sessions` are based on the default last 30 days.
   - References:
     - `/backend/Masi Web Main/api/views/youth_sessions.py:474-515`
     - `src/components/youth-sessions/YouthDetailSheet.tsx:73-78`
   - Impact: `Avg/Day` can become all-time sessions divided by active days in the last 30-day chart window, which overstates the average.
   - Fix direction: either make `total_sessions` use the same default 30-day window or make the average denominator match the same period as `total_sessions`.

6. **School coverage omits active schools that have never had a session.**
   - The backend builds `uncovered_uids` from schools that have ever had Literacy or Numeracy sessions, then subtracts covered schools.
   - Reference: `/backend/Masi Web Main/api/views/youth_sessions.py:418-424`
   - Impact: an active school with zero historical sessions is not shown as covered or uncovered, even though the UI says it is showing schools with and without sessions in the selected period.
   - Fix direction: base uncovered schools on `School.objects.filter(is_active=True)` and subtract covered schools. Keep `last_session_date` as `Never` for schools with no session history.

7. **Not-yet-started or newly started youth are counted as inactive in summary/inactive panels.**
   - The heatmap has special logic to exclude youth whose `start_date` is after the heatmap window, but `_active_youth_qs` and the inactive endpoint do not.
   - References:
     - `/backend/Masi Web Main/api/views/youth_sessions.py:37-45`
     - `/backend/Masi Web Main/api/views/youth_sessions.py:274-281`
     - `/backend/Masi Web Main/api/views/youth_sessions.py:329-331`
   - Impact: future-start youth or youth who started mid-period can be flagged as inactive before they were expected to run sessions.
   - Fix direction: filter active youth by `start_date <= reference_date` and treat dates before `start_date` as non-eligible working days across all panels.

### Medium priority

8. **The heatmap active-days denominator includes pre-start N/A days.**
   - The component displays pre-start cells as `N/A`, but still shows progress as `total_active_days / data.dates.length`.
   - Reference: `src/components/youth-sessions/YouthActivityHeatmap.tsx:133-163`
   - Impact: a youth who started mid-window can look worse than they are because non-eligible dates are included in the denominator.
   - Fix direction: calculate eligible days per youth and display `active_days / eligible_days`.

9. **"Last 7 Days" returns 8 inclusive dates.**
   - `getDateRange('last_7')` subtracts 7 from today and the backend treats `date_from` and `date_to` as inclusive.
   - Reference: `src/components/youth-sessions/YouthSessionsFilterBar.tsx:41-44`
   - Impact: the label says 7 days, but the date range includes today plus the previous 7 days.
   - Fix direction: subtract 6 if "Last 7 Days" includes today, or relabel it as "Last 8 Days".

10. **Date presets can shift by one day because they format with UTC.**
    - The filter bar uses `toISOString().split('T')[0]`, which formats the local date as UTC.
    - Reference: `src/components/youth-sessions/YouthSessionsFilterBar.tsx:28-31`
    - Impact: users near midnight, especially in South Africa or other non-UTC time zones, can send yesterday/tomorrow as the selected local date.
    - Fix direction: format local dates manually or use `date-fns/format` with local time.

11. **Inactive-day labels mix working-day thresholds with calendar-day display.**
    - The endpoint checks recent activity over the last N working days, but the returned `days_inactive` is calendar days since last session.
    - References:
      - `/backend/Masi Web Main/api/views/youth_sessions.py:318-327`
      - `/backend/Masi Web Main/api/views/youth_sessions.py:363`
      - `src/components/youth-sessions/InactiveYouthPanel.tsx:88-95`
    - Impact: a youth who last had a session on Friday can show `3d` on Monday even though only one working day has elapsed.
    - Fix direction: return both `working_days_inactive` and `calendar_days_inactive`, then label the badge clearly.

12. **Daily activity hides zero-session dates.**
    - The backend only returns dates present in the session aggregation.
    - Reference: `/backend/Masi Web Main/api/views/youth_sessions.py:206-228`
    - Impact: a day with no sessions disappears from the chart instead of showing a zero bar, which hides operational gaps.
    - Fix direction: generate the full selected date range and fill missing days with zero totals.

13. **Youth detail `children_worked_with` ignores `date_to`.**
    - The backend counts child UIDs from `daily_from` onward but does not apply `daily_to`.
    - Reference: `/backend/Masi Web Main/api/views/youth_sessions.py:517-526`
    - Impact: if date filters are passed later, the child count can include children outside the selected end date.
    - Fix direction: apply both `session_date__gte=daily_from` and `session_date__lte=daily_to`.

14. **School coverage `youth_count` is undercounted when literacy and numeracy youth differ.**
    - The backend merges literacy and numeracy rows by taking `max(existing, row['youth_count'])`.
    - Reference: `/backend/Masi Web Main/api/views/youth_sessions.py:402-414`
    - Impact: the current UI does not display `youth_count`, but if it is used later it will undercount distinct youth across programmes.
    - Fix direction: merge sets of youth UIDs per school, or compute the distinct count in one normalized query.

15. **The page-level error state is too broad.**
    - Any one endpoint failure replaces the whole dashboard with a single error.
    - Reference: `src/app/operations/youth-sessions/page.tsx:155-178`
    - Impact: if school coverage fails, the user loses summary, heatmap, and inactive-youth visibility even if those endpoints succeeded.
    - Fix direction: keep the lookup/auth error page-level, but render panel-level errors for summary, chart, heatmap, inactive youth, coverage, and detail.

16. **The detail sheet likely creates invalid DOM nesting.**
    - `SheetDescription` wraps content in Radix `Dialog.Description`, and the component places `div` elements inside it.
    - Reference: `src/components/youth-sessions/YouthDetailSheet.tsx:88-116`
    - Impact: this can cause React DOM nesting warnings and weaker accessibility semantics.
    - Fix direction: keep `SheetDescription` as plain text, then render the metadata badges below it in a separate `div`.

### Verification notes

- `pnpm build` passes after allowing the build to fetch Google Fonts.
- `pnpm lint` does not reach source-file linting because the project ESLint config currently crashes with `TypeError: Converting circular structure to JSON`.
- Current working tree already had uncommitted edits in `src/components/youth-sessions/YouthActivityHeatmap.tsx` and `src/lib/types/youth-sessions.ts`; this review did not modify those files.

## 2. Suggested Improvements to Make the Page More Helpful

1. **Make the time model obvious and consistent.**
   - Pick a default period, probably "This Week" for operations, and make every panel either follow that period or clearly label itself as "Live today", "Last N working days", or "Last 30 days".
   - Add a small "Data through <date/time>" label so staff know whether they are seeing today's live status or a historical range.

2. **Turn the top stats into operational KPIs.**
   - Add rates, not just counts: percent of active youth with sessions today, percent of schools covered this week, inactive youth rate, and sessions per active youth.
   - Add trend indicators versus the previous comparable period, for example "up/down vs last week".
   - Add target thresholds if MASI has expected session cadence, such as "at least one session every 2 working days".

3. **Make inactive youth the main action queue.**
   - Add columns or badges for mentor, school, start date, last session, working days inactive, this-month sessions, and "new starter" status.
   - Group or filter by mentor so a programme manager can immediately see who to follow up with.
   - Add a "needs attention" sort that prioritizes long inactive periods, high-priority schools, and youth with recent start dates separately.

4. **Improve the heatmap for scanning.**
   - Use eligible working days as the denominator for youth who started mid-window.
   - Add tooltips per cell with date, session count, literacy/numeracy split, and school.
   - Add visual separation for weekends/non-working days if calendar ranges are used.
   - Add a compact legend explaining None, 1-2, 3+, and N/A.
   - Keep the youth name and totals sticky when horizontally scrolling.

5. **Make the youth detail sheet answer "what should I do next?"**
   - Pass the active date range into the detail request and label the period.
   - Add last session date, working days inactive, expected next session status, and mentor contact/context if available.
   - Show recent session rows below the mini chart, including children worked with and session type.
   - Add a short "reason this youth is flagged" summary for inactive youth.

6. **Make school coverage more useful for programme managers.**
   - Include all active schools, including schools with no historical sessions.
   - Show coverage percentage by school type and mentor.
   - Display youth count and sessions per youth for each covered school.
   - Sort uncovered schools by longest time since last session, not just alphabetically.

7. **Improve the filters.**
   - Add a clear/reset filters button.
   - Make filters bookmarkable by storing them in URL query params.
   - Use searchable comboboxes for youth, schools, and mentors if the lookup lists are long.
   - Consider dependent filtering, for example selecting a mentor narrows the youth and schools lists.

8. **Add mobile-friendly alternatives instead of hiding the daily chart.**
   - The daily chart is hidden on mobile, but it still fetches data and may still load Plotly.
   - Replace it with a compact mobile table or sparkline and avoid loading Plotly until the chart is actually visible.

9. **Use panel-level loading, error, and empty states.**
   - Keep the dashboard usable when one endpoint is down.
   - Add helpful empty-state text that says what filters are active and what the absence of data means.
   - Add retry buttons for individual panels.

10. **Add export and sharing workflows.**
    - Export inactive youth and uncovered schools to CSV.
    - Add a "copy link to current view" action once filters are in the URL.
    - Add print-friendly output for weekly operations meetings.

11. **Make the data contract safer.**
    - Validate API responses at the boundary with a small schema for this dashboard.
    - Centralize filter serialization so every endpoint uses the same rules unless a panel intentionally opts out.
    - Add backend tests for the edge cases above: school filter, youth filter, future start date, mid-period start date, zero-session schools, and date ranges with zero-session days.

12. **Polish the visual hierarchy.**
    - Reduce repeated large rounded card styling so the action areas stand out.
    - Use one clear color language: red means needs attention, amber means watch, green means on track, gray means not eligible/no data.
    - Move the "coach types included" notice near the filters or into a filter summary so it stays connected to the data scope.

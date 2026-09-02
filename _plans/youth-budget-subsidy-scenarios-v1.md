# Youth Budget Subsidy Scenarios V1

Status: reviewed and revised for implementation

Date: 1 September 2026

Owners: Masinyusane Operations and Finance

Repositories:

- Django backend: `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main`
- Next.js frontend: `/Users/jimmckeown/Development/Masi_Website_2026/frontend/masi-website`

Related sources:

- `CONTEXT.md`
- `_plans/youth-budget-calculator.md`
- Backend `api/youth_budget.py`
- Backend `api/management/commands/sync_airtable_youth.py`
- Frontend `src/components/school-programme/budget/LeversPanel.tsx`

## 1. Objective

Let managers model complete theoretical NYS and SEF cohorts independently while showing,
but not calculating from, current subsidy records synced from Airtable.

The V1 calculator must answer:

1. What does Airtable currently record for active NYS and SEF youth?
2. What would core youth wages cost under the saved theoretical NYS and SEF assumptions?
3. How many requested theoretical subsidy jobs fit within the current eligible core youth
   population without assigning the same modelled youth to both schemes?

## 2. V1 boundary

V1 has two deliberately separate lanes.

### 2.1 Airtable source lane

- Airtable is the operational source for current youth subsidy tags.
- The budget page displays bounded aggregate NYS and SEF counts plus source-sync
  provenance.
- Airtable subsidy records do not add relief to projected costs.
- Airtable subsidy records do not reduce a theoretical scenario count.
- Airtable subsidy records do not make a youth ineligible for the theoretical scenario.
- The source panel is a reconciliation aid, not a roster assignment forecast.

### 2.2 Theoretical scenario lane

- The saved BudgetScenario is the only subsidy input to projected costs.
- Each scheme has its own contribution, full-time count, part-time count, start date, and
  end date.
- A scenario count is the complete theoretical cohort for that scheme. It is not an
  addition to the Airtable count.
- NYS 168 and Airtable NYS 125 therefore model 168, not 293 and not 43.
- SEF 200 and Airtable SEF 5 therefore model 200, not 205 and not 195.

This boundary is temporary but intentional. A later version may reconcile source and
scenario assignments only after Airtable reliably supplies funder, status, employment
basis, start date, and end date.

## 3. Confirmed defaults

| Scheme | Contribution | Full-time | Part-time | Start | End |
| --- | ---: | ---: | ---: | --- | --- |
| NYS | R1,900 | preserve saved value, currently 127 | preserve saved value, currently 41 | preserve the saved month as the first day, currently 1 September 2026 | 31 December 2026 |
| SEF | R1,400 | 200 suggested plan | 0 | 1 October 2026 | 31 March 2027 |

The SEF default is conservative. Full-time youth still leave Masi paying the wage balance,
while subsidy-only part-time youth cost Masi R0.

The suggested 200-person SEF plan is not activated by a migration. Existing saved
scenarios receive zero SEF jobs. The frontend offers an explicit `Use planned 200` action
in the unsaved what-if state, and a manager must review the preview and save it before it
changes the shared team scenario. Newly created yearly scenarios may use the 200-person
suggestion through year-aware API defaults.

## 4. Costing rules

### 4.1 Full-time subsidy

For a modelled full-time youth in an active subsidy month:

```text
gross = hours per day x school days x days-per-week ratio x wage rate x utilisation
cost before subsidy = gross x 1.01
relief = min(scheme contribution, cost before subsidy)
Masi cost = cost before subsidy - relief
```

When the subsidy ends, the youth remains in the costed population and Masi resumes paying
the full wage cost.

### 4.2 Subsidy-only part-time

- Part-time means the youth earns only the external contribution and never touches Masi
  payroll.
- The youth leaves Masi's costed population from the scheme start month onward.
- The youth contributes no gross, UIF, or subsidy relief to Masi's projection.
- The youth does not re-enter Masi payroll automatically when the scheme ends.

This preserves the current NYS part-time behavior and applies the same rule to SEF.

### 4.3 Full-month contribution

- Contributions are capped monthly and are not prorated by school days.
- A scheme receives its full monthly cap only when at least one costed school date lies
  inside both the inclusive subsidy interval and the programme interval.
- A qualifying mid-month start or end still activates the full capped contribution for
  that month.
- Exact dates are stored because cohorts may cross a year boundary.
- The global Last Paid Programme Date still caps wage-bearing school days. A subsidy end
  after the programme horizon does not create additional wage months.
- A subsidy that begins after the final paid school date does not offset earlier wages in
  the same calendar month.

## 5. Shared theoretical capacity

### 5.1 Eligible population

The theoretical pool consists of current active core youth who:

- are not Yebo;
- are not assigned to ringfenced rural schools;
- are not vacancy rows.

Airtable NYS and SEF tags are ignored for V1 theoretical eligibility.

### 5.2 Unique allocation

- NYS and SEF draw from one shared theoretical pool.
- The same modelled youth can appear in at most one scheme.
- Schemes allocate in ascending start-date order.
- A tie uses the stable order NYS, then SEF.
- Within a scheme, part-time requests allocate first, preserving the existing behavior;
  full-time requests allocate from the remaining pool.
- Whole youth are distributed proportionally across costing cohorts with the existing
  largest-remainder algorithm and stable cohort order.
- Once reserved to one theoretical scheme, capacity is not reused by another scheme even
  after the first scheme ends.

### 5.3 Capacity result

The backend returns, per scheme and in total:

- requested full-time;
- requested part-time;
- requested total;
- modelled full-time;
- modelled part-time;
- modelled total;
- unmodelled shortfall;
- contribution;
- start date;
- end date.

Vacancy Start Month remains independent. V1 does not assign subsidies to open Planned
Posts. If the request exceeds current eligible capacity, the calculator caps relief and
shows the shortfall, for example `368 requested, 323 modelled, 45 require future hires`.

## 6. Airtable enrichment

### 6.1 Root cause

The nightly Youth sync reads `Youth Basic Data`, whose Airtable records are canonical for
the Youth dimension. Subsidy lookup fields live on the linked `Combined Youth Data`
table. The current command attempts to map the lookup fields from Basic records, so
production subsidy fields remain empty even after a successful sync.

The two tables contain 1,898 records and currently have a complete reciprocal one-to-one
link. Their Airtable record IDs are different. The sync must not switch canonical tables,
because its orphan cleanup uses the Basic Airtable IDs.

The record total above is only the inspected 1 September snapshot. No implementation or
rollout check may hardcode it.

### 6.2 Enrichment contract

- Continue fetching Youth Basic Data as the canonical source.
- Fetch Combined Youth Data from `AIRTABLE_COMBINED_YOUTH_DATA_TABLE_ID` in the same base.
- Join each Basic record through its `Combined Youth Data` linked-record field.
- Preserve the Basic record ID as `Youth.airtable_id`.
- Copy only these direct fields from Combined into the existing Basic lookup-shaped
  extraction keys:
  - `Funder` -> `Funder`
  - `SEF (Current Status)` -> `SEF (Current Status) (from Office Link)`
  - `SEF Start Date` -> `SEF Start Date (from Office Link)`
  - `SEF End Date` -> `SEF End Date (from Office Link)`
- Do not allow Combined values to overwrite canonical employment, identity, school, or
  mentor fields from Basic.
- Treat the four subsidy fields as one atomic enrichment publication.
- Continue the canonical Basic-field sync when Combined configuration, fetching, schema
  validation, or linking is incomplete, but do not overwrite any of the four subsidy
  fields on existing Youth rows. New Youth rows receive null subsidy fields.
- Publish all four subsidy fields only when every canonical Basic record has exactly one
  resolvable Combined link and all required Combined fields were fetched successfully.
- Mark the source-count result unavailable rather than presenting a partial count as
  complete.
- Record matched, missing-link, multiple-link, and missing-target counts in
  `AirtableSyncLog.details.subsidy_enrichment`.
- Record `contract_version`, command name, canonical and Combined table identifiers, and
  Basic and Combined fetch counts in the same receipt.
- The API identifies canonical receipts by this contract marker rather than by the broad
  `youth` sync type alone, because the legacy importer writes the same sync type.
- Explicitly request and validate the Basic link field and four Combined subsidy fields so
  an Airtable rename fails closed instead of becoming an apparent genuine zero.
- Missing canonical configuration remains a command failure. Missing Combined
  configuration or a Combined fetch/schema failure leaves the canonical Basic sync usable
  but records a failed enrichment health signal and exits non-zero after the canonical
  transaction commits.
- Dry-run executes the full transformation and reports exact create, update, skip, and
  orphan-delete counts plus enrichment diagnostics without writing.
- Refuse an empty canonical Basic result before calculating orphan deletes.
- Orphan deletion, creates, and updates must occur in one `transaction.atomic` block so a
  later failure rolls back the entire canonical publication.

### 6.3 Source count definitions

Until NYS status and date fields are complete:

- NYS source count: active-employment Youth with `Funder = NYS`.
- SEF source count: active-employment Youth with `Funder = SEF` and subsidy status
  `Active`.

The UI labels these asymmetrical definitions exactly as `Active employees tagged NYS in
Airtable` and `Active employees tagged SEF with subsidy status Active`. Neither is
described as currently receiving subsidy.

## 7. Backend data model

Expand migration after `0047_budgetscenario_last_paid_programme_date`:

1. Keep the legacy `subsidy_contribution` and `nys_conversion_start_month` columns during
   V1 rollout.
2. Add `nys_subsidy_contribution`, initially nullable, copy each row's legacy contribution,
   then make it required.
3. Add `nys_start_date`, initially nullable, populate the first day of each row's own year
   and saved conversion month, then make it required.
4. Add `nys_end_date`, populated as 31 December of each row's own year.
5. Add `sef_subsidy_contribution`, default R1,400.
6. Add `sef_full_time_count`. Existing rows are explicitly backfilled to zero; newly
   initialized scenarios use the year-aware suggested value 200.
7. Add `sef_part_time_count`, default 0.
8. Add `sef_start_date`, populated as 1 October of each row's own year.
9. Add `sef_end_date`, populated as 31 March of the following year.

A later contract migration may remove the two legacy columns only after the new frontend
is deployed and old-client traffic is no longer possible. That removal is not part of V1.

No new subsidy-cohort table and no persisted Airtable aggregate counts are added.

API validation:

- counts and contributions are non-negative;
- scenario start dates must fall in the scenario year;
- end dates may fall in the scenario year or the following year;
- each start date must be on or before its end date;
- dates are ISO `YYYY-MM-DD` strings;
- partial preview and save requests validate the fully merged scenario, not only the
  submitted fields.
- `default_scenario_values(year)` creates dates from the requested year; there are no fixed
  2026 model defaults for a generic yearly scenario.

## 8. API contract

### 8.1 Scenario fields

Canonical V1 fields are:

- `nys_subsidy_contribution`
- `nys_start_date`
- `nys_end_date`
- `sef_subsidy_contribution`
- `sef_full_time_count`
- `sef_part_time_count`
- `sef_start_date`
- `sef_end_date`

During the expand-contract window the response also serializes deprecated
`subsidy_contribution` and `nys_conversion_start_month` aliases derived from the canonical
NYS values. Old writes map to the canonical NYS fields and update both database forms.
Sending old and new forms with different values returns HTTP 400. Compatibility tests
cover old GET, PATCH, and preview consumers as well as conflicts.

### 8.2 `subsidy_plan`

The summary and preview responses return:

```json
{
  "subsidy_plan": {
    "policy": "theoretical_only",
    "eligible_current_youth": 323,
    "requested_total": 368,
    "modelled_total": 323,
    "unmodelled_total": 45,
    "schemes": {
      "nys": {
        "contribution": 1900,
        "start_date": "2026-09-01",
        "end_date": "2026-12-31",
        "requested_full_time": 127,
        "requested_part_time": 41,
        "requested_total": 168,
        "modelled_full_time": 127,
        "modelled_part_time": 41,
        "modelled_total": 168,
        "unmodelled_total": 0
      },
      "sef": {
        "contribution": 1400,
        "start_date": "2026-10-01",
        "end_date": "2027-03-31",
        "requested_full_time": 200,
        "requested_part_time": 0,
        "requested_total": 200,
        "modelled_full_time": 155,
        "modelled_part_time": 0,
        "modelled_total": 155,
        "unmodelled_total": 45
      }
    }
  }
}
```

The numeric example is illustrative. Tests must use controlled cohort fixtures rather
than production counts.

### 8.3 `source_subsidies`

The saved summary response, but not the stateless preview response, returns:

```json
{
  "source_subsidies": {
    "policy": "informational_only",
    "available": true,
    "nys_tagged_active_employees": 125,
    "sef_active_status_employees": 5,
    "last_success_at": "2026-09-01T00:05:52Z",
    "latest_attempt_succeeded": true,
    "enrichment": {
      "matched": 1898,
      "missing_link": 0,
      "multiple_links": 0,
      "missing_target": 0
    }
  }
}
```

When the latest successful Youth sync predates the enrichment contract or its
enrichment is incomplete, `available` is false and both counts are null. Zero is reserved
for a complete source that genuinely contains zero matching youth.

If a prior complete enrichment exists and the newest canonical attempt fails, the API
continues returning the last complete counts and timestamp with
`latest_attempt_succeeded: false`. It never replaces a known complete count with zero or
partial results.

## 9. Frontend behavior

### 9.1 Source information panel

Inside the Live What-If section, before the planning cards:

- heading: `Airtable source check`;
- label it `Informational only`;
- show NYS and SEF recorded counts when available;
- show the last successful Youth sync time;
- explain that source records do not enter the V1 projection;
- use neutral blue styling when available;
- use a clear warning state when enrichment is unavailable or the latest attempt failed;
- never warn merely because the source count differs from the theoretical scenario;
- format freshness in `Africa/Johannesburg` and label it SAST;
- use `role="status"` for a verified informational state and `role="alert"` when source
  data is unavailable or the latest canonical attempt failed.

### 9.2 Organisation levers

Keep:

- Wage Rate per hour;
- Utilisation %;
- Open Posts Assumed Filled From, replacing the label Vacancy Start Month;
- Holiday Pay;
- Mentor Reserve.

Remove the global Subsidy Contribution control because each scheme owns its contribution.

### 9.3 Planning cards

Render vertically stacked NYS and SEF cards. Each card contains:

- contribution;
- full-time count;
- part-time count;
- derived Total Planned Jobs;
- start date;
- end date;
- requested, modelled, and shortfall status from the backend preview;
- concise explanation that full-time is top-up and part-time costs Masi R0;
- explicit copy that an end date stops full-time relief, while subsidy-only youth remain
  outside Masi payroll after their start.

Use the established Ink and Signal blue accent, warm paper panels, Fraunces for totals,
Geist for controls, and no color-only distinction between schemes.

### 9.4 Combined status

Below both cards, show total requested, total modelled, and unmodelled jobs. When the
shortfall is non-zero, state that those jobs require future hires and are not included in
projected subsidy relief.

### 9.5 Quick Estimate

Quick Estimate remains a clearly manual scratchpad in V1. Its one global month multiplier
cannot truthfully prefill cohorts with different start and end dates. Adapt it only enough
to compile with the expanded scenario type.

Delete the unused client-side committed projection calculator. Live financial previews
remain backend-authored.

Rename any static `costed_youth` presentation to `current core youth in source`. A static
source count must not imply that every youth remains wage-costed after part-time
conversions.

## 10. Tests

### 10.1 Backend focused tests

- Basic plus Combined enrichment copies only the four subsidy fields.
- Missing, multiple, and unresolved links produce incomplete diagnostics without
  replacing the Basic Airtable ID.
- Existing valid subsidy fields survive incomplete links, Combined fetch failure, and
  schema validation failure.
- A forced canonical bulk-update failure rolls orphan deletion and every other write back.
- Dry run reports exact transformed create/update/skip/delete counts without writes.
- Source counts are unavailable before a complete enrichment sync receipt.
- A complete receipt distinguishes genuine zero from unavailable.
- NYS source counting works with blank status and dates.
- SEF source counting requires Active status.
- Airtable subsidy fields do not change theoretical projection costs or eligibility.
- Two schemes share capacity without overlap.
- Earlier start date receives capacity first; NYS wins a tie.
- Part-time allocates before full-time within each scheme.
- Requested counts cap at eligible core headcount and report a shortfall.
- Vacancies and ringfenced rural youth do not enter the theoretical pool.
- Scheme contributions are applied independently.
- Start and end months are inclusive and full-month, with no day proration.
- Subsidy relief requires at least one costed school date inside the subsidy and programme
  intervals, including boundary and after-programme cases.
- Full-time relief stops after end date and full wage resumes.
- Part-time youth leave Masi payroll from start onward.
- Changing only a part-time end date does not change the projection.
- Cross-year SEF end dates validate and serialize.
- Partial save/preview rejects start-after-end after merging with saved state.
- Migration preserves the existing NYS contribution and converts the saved start month.

### 10.2 Frontend tests

- Scenario types and editable payload include every new field and exclude removed fields.
- Source panel renders available and unavailable states with informational-only language.
- NYS and SEF cards render their own contributions, counts, dates, and totals.
- Live preview capacity status renders requested, modelled, and shortfall values.
- The source count is not added to any planned total in rendered copy.
- Source freshness renders in SAST with accessible status or alert semantics.
- Stacked cards remain keyboard-usable and readable at 390px.
- No em dash or emoji appears in touched UI copy.

### 10.3 Verification

Backend:

- focused Youth Budget and Youth sync tests on SQLite;
- full `api` suite on SQLite;
- `manage.py check`;
- `makemigrations --check --dry-run`;
- migration apply on a fresh temporary SQLite database;
- live Airtable dry run only if explicitly authorized and never presented as database
  publication.

Frontend:

- `pnpm test:unit`;
- `pnpm exec tsc --noEmit --incremental false`;
- `pnpm lint`;
- `pnpm build`;
- authenticated local or production-like browser review at desktop and 390px mobile;
- verify the current light-only application state and do not claim dark-mode evidence.

## 11. Rollout

1. Apply the additive migration while the old backend remains compatible with its legacy
   columns.
2. Deploy the backward-compatible backend that serves and accepts both contracts.
3. Confirm `AIRTABLE_COMBINED_YOUTH_DATA_TABLE_ID` exists in the effective web and Youth
   cron environment before the new sync command is allowed to run.
4. Run `sync_airtable_youth --dry-run` and verify matched equals canonical Basic records
   fetched, zero enrichment errors, and reviewed create/update/skip/delete counts.
5. Obtain explicit authorization immediately before running the production Youth sync,
   because it updates the canonical Youth table and retains its existing orphan-delete
   behavior.
6. Read back source counts and sync details from production.
7. Deploy and verify the frontend against the compatible backend contract.
8. Verify the authenticated Budget page at desktop and mobile without saving the shared
   scenario.
9. Preview the suggested 200-person SEF scenario. Saving it to the shared production
   scenario remains a separate explicit user action.
10. Remove legacy fields only in a later, separately reviewed contract release.

## 12. Explicitly deferred

- Source Airtable assignments affecting projected relief.
- Reconciliation of theoretical counts against recorded source counts.
- Employment Basis from Airtable driving full-time versus subsidy-only classification.
- Subsidies assigned to open Planned Posts.
- Per-youth subsidy assignment or roster storage.
- Automatic hiring to satisfy an unmodelled subsidy shortfall.
- A generic subsidy-scheme table or arbitrary number of schemes.

## 13. Acceptance criteria

V1 is complete when:

1. The page displays source NYS/SEF counts and freshness as informational only.
2. The saved scenario exposes independent NYS and SEF contributions, counts, and dates.
3. Preview and saved projections use only the theoretical scenario.
4. The same theoretical capacity is never allocated to both NYS and SEF.
5. Requested counts beyond current core capacity are omitted from relief and shown as a
   shortfall requiring future hires.
6. Vacancy Start Month does not affect subsidy capacity.
7. Existing ringfenced and mentor boundaries remain unchanged.
8. Backend and frontend tests, type checks, lint, builds, and migration checks pass.
9. Both build logs state the exact local evidence and the still-unperformed deployment,
   migration, production sync, and authenticated live verification steps.

## 14. Complexity check

| Element | A: user-visible delta | B1: scenario occurs? | B2: user can tell? | C: deletion test | Build | Carrying | Verdict |
|---|---|---|---|---|---|---|---|
| Scheme-specific persisted NYS/SEF fields | Managers independently change contribution, full-time, part-time, start, and end for each scheme | Yes, NYS is R1,900 while planned SEF is R1,400 and starts later | Yes, relief, monthly cost, and affordability change | Deletion would recreate state across model, engine, API, types, controls, and payload mapping | Four slices plus additive migration | Seven existing production files | NOW, using expand-contract |
| Shared theoretical allocator and `subsidy_plan` | Managers see requested, modelled, and future-hire shortfall without double-counting youth | Yes, combined requests can exceed eligible current core youth | Yes, visible shortfall and relief change | Deletion recreates overlap and capacity logic in both schemes and combined status | Two backend/API slices | Policy engine, serializer, types, and planning UI | NOW |
| Basic-to-Combined Airtable enrichment and versioned receipt | Managers see counts from the Airtable fields their team maintains | Yes, canonical Basic records do not directly contain those fields | Yes, unavailable becomes source-derived with freshness | Only the canonical importer needs this direct join | Two sync/test slices plus publication gate | Canonical Youth sync and receipt | NOW, direct join only |
| Backend source aggregate and informational panel | Managers compare operational recording with theoretical assumptions without adding them | Yes, recorded and planned counts already differ | Yes, labels, counts, freshness, and warning are visible | Deletion recreates policy in separate NYS and SEF callers | Two API/UI slices | Aggregate, serializer, type, and panel | NOW |
| Quick Estimate NYS/SEF authoritative prefill | No trustworthy delta this cycle | Its one multiplier cannot represent different scheme intervals | No, it can visibly disagree with the backend | Deletion removes the added coupling without harming the objective | One frontend slice | One component | NEVER |

NEVER: Do not add authoritative NYS/SEF scenario prefill to Quick Estimate in V1. Its one
global month multiplier cannot represent the two cohort intervals, and removing that
coupling does not reduce the cycle objective.

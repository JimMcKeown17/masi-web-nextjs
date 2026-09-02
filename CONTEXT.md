# Masi Operations

Domain language for Masinyusane's operational tools (school-programme grid, youth staffing,
youth budgeting). Spans the Next.js frontend and the Django backend; terms here are the
canonical vocabulary for both.

## Language

### Youth budgeting

**Funding Pot**:
A named sum of money from one Funder, spendable on youth wages within a period. Pot
amounts are remaining balances; the 2026 entries (R1,523,777.96 total) are as of
2026-07-27.
_Avoid_: grant, donation, budget line

**Funder**:
An external organisation that provides a Funding Pot (e.g. TDH, DGMT, GWP, HCI, United Through Sport).
_Avoid_: donor, sponsor (note: `FUNDER` also exists as a user role in code — distinct concept)

**School Restriction**:
A constraint limiting a Funding Pot to named schools. 2026: only United Through Sport
(R138,471.54 → Astra, Isaac Booi, Green Apple, Noluthando). Handling (resolved 2026-07-27):
pots are POOLED for the headline; each restricted pot gets a generic Feasibility Check
(projected spend at its schools vs pot size, warn on stranding risk). Designed to absorb
rural funders + their schools later. No per-pot allocation engine in v1.

**Fungible Pot**:
A Funding Pot spendable on youth or mentors, at Masi's discretion. 2026: HCI (R200,000).

**Ringfenced Pot**:
A Funding Pot whose money is locked to its listed schools, with underspend rolling over
to next year; its surplus must NEVER appear as available in the main verdict. Boundary is
school-based: every youth at its schools is its cost, regardless of programme, and open
posts there cost against it, not core at-plan. 2026: the three wind farms (Kouga,
Tsitsikamma, Amakhala Emoyeni). Distinct from School Restriction: United Through Sport is
restricted-but-core (focus schools, some spending autonomy, no rollover). Resolved with
Jim 2026-07-28.
_Avoid_: restricted (that means the softer UTS case)

**Subsidy**:
An external party (NYS or SEF) paying the first ~R1,600/month of a youth's wage directly to
the youth (never through Masi payroll); Masi pays only the Top-Up. Tracked per youth with
status, start date, end date.
_Avoid_: co-funding, stipend

**Top-Up**:
The portion of a subsidised youth's wage Masi pays: earned wages minus the Subsidy
Contribution, floored at zero. Unsubsidised youth's full wage is effectively a 100% Top-Up.

**NYS Slot**:
One of a fixed count of subsidy positions granted by NYS (2026: 200 slots), assignable
only to a youth who was never previously on SEF.

**Externally Paid Youth**:
A youth whose full wage is paid directly by an external party; costs Masi's pots nothing.
2026: all Yebo youth.

**Hours Cap**:
The weekly hours expensable to a youth's Subsidy (SEF/NYS), tracked per youth in Airtable.
Youth always work beyond it, so it is NOT used for cost projection; the flat Subsidy
Contribution stands in for it. Column is also untrusted.

**Subsidy Contribution**:
The monthly amount a Subsidy pays toward one youth's wage. Calculator input, default
R1,600; shifts slightly each 6-month government subsidy round.

**Hours Matrix**:
The daily hours and weekly days youth are assumed to work, keyed by site type x job title
(confirmed defaults: 4.5 h/day primary, 5.5 h/day ECD/preschool; 5 days/week). Lives in
the saved Budget Scenario and is TOGGLABLE per programme in the calculator — the team
ramps hours/days up or down to see budget effects (resolved 2026-07-27). Authoritative
for cost projection; the per-youth Hours Cap is not. The site-type axis is `normalize_site_type(School.type)`
(primary | ecd) — NOT the `School.site_type` column, which despite its name is a
programme-membership list.

**Monthly Expenditure History**:
Actual nett youth spend per month (core / mentors / rural), published as a complete
year-to-date snapshot from the newest dated management workbook in the ignored
`masi-finance/management_sheets` directory. The `Expenditure` tab is filtered to the
selected accounting year and Category 3 values containing `Youth Jobs:`. Re-running the
import restates every historical month in the snapshot rather than freezing previously
published figures. The chart derives its actual/projected boundary from the latest
published month. This is a bounded publication workflow, not a general reconciliation
engine.

**Days per Week**:
Working days youth are scheduled, per Hours Matrix entry (not org-wide). Default 5;
lowered to 4 when funding is tight; bulk "apply to all" affordance in the UI.

**Youth Mentor**:
A youth with over a year's tenure promoted to a monthly salary (no hourly rate), expensable
only to certain Funders. The proper per-mentor salary model remains deferred. For operational
forecast visibility, each projected month uses the arithmetic mean of the latest three
published Mentor actuals as one full-month estimate, with source months exposed in the UI.
This estimate is informational and does not enter the core Funding Pot verdict. In the youth
DB they appear as Inactive ex-coaches (no mentor job titles exist); as of 2026-07-27 three
mentors (employee_ids 1691, 2078, 2045) sit wrongly Active under stale coach titles —
team to correct in Airtable.
_Avoid_: mentor (the separate staff Mentor concept in the youth DB)

**Currently Employed Projection**:
Projected cost of current Active Youth riding to the horizon with no new hires and no
attrition assumed (conservative; nightly cron self-corrects as youth leave). The API
field is still `committed`; the UI says "Currently Employed" because that is the team's
language (Jim, 2026-07-28).
_Avoid_: committed (in UI copy)

**At-Plan Projection**:
Committed Projection plus the cost of filling every open Planned Post from a chosen
Vacancy Start Month. The grid's editable youth_planned doubles as the sandbox: edit the
plan, watch affordability move.

**Quick Estimate**:
The back-of-envelope mode mirroring staff mental math: editable cohort buckets
(count x monthly rate) x months remaining, minus holiday weeks. A trust bridge, not a
source of truth. It deliberately does not prefill the authoritative NYS/SEF scenarios,
because its one global month multiplier cannot represent different scheme intervals.

**Subsidy-Only Youth**:
A part-time youth who works only the hours SEF/NYS pays for and never touches Masi
payroll; costs Masi exactly R0 (no gross, no UIF). They DO occupy grid Planned Posts.
Interim: modelled via the "of which subsidy-only" split on the NYS Conversion lever;
real fix is an Employment Basis column in Airtable (Full Time / Subsidy Only), team
discussion pending (2026-07-28). Candidates are reverse-engineerable from the payments
ledger: employed but never paid = Yebo or subsidy-only.

**Theoretical Subsidy Scenario**:
The V1 budget policy models complete NYS and SEF cohorts independently of Airtable source
tags. Each scheme owns a contribution, full-time count, subsidy-only part-time count,
start date, and end date. Both schemes reserve youth from one shared current-core pool in
start-date order, with NYS winning a tie and part-time allocating before full-time. The
same modelled youth can never receive both schemes, and requests beyond current capacity
are reported as requiring future hires rather than receiving relief. Airtable NYS/SEF
counts are shown separately as an informational reconciliation aid and never enter V1
costing or eligibility.

**Vacancy Start Month**:
Single global assumption for when open Planned Posts get filled; no per-post dates.
The UI calls this **Open Posts Assumed Filled From**. Subsidies are not assigned to these
vacancies in V1.

**Horizon**:
The global **Last Paid Programme Date** caps eligible school working days for core and
ringfenced rural youth. It defaults to 30 November 2026 and cannot extend beyond that
supported calendar. Mentor remains a full monthly estimate for every projected month the
horizon touches. Youth are assumed not to earn in December unless Holiday Pay is added
manually.

**Budget Scenario**:
The single shared, saved set of calculator assumptions per year (wage rate, hours matrix,
independent NYS and SEF contributions/counts/date intervals, vacancy start month, holiday
pay, mentor reserve, last paid programme date). ADMIN/PM edits; everyone sees the same verdict. Live
what-if changes are sent to an authenticated stateless backend preview so the browser does
not duplicate calendar or costing rules; they always snap back to the saved scenario after
navigation. Stored in Postgres, edited via the frontend CRUD panel (not Django admin).

**Utilisation**:
The average share of full-cap hours youth actually work (absenteeism, cancelled school
days, late starts). Scenario lever, default 100%. May/June ledger medians (39-68% by
programme) are LOWER BOUNDS only: SEF top-ups contaminate them until the subsidy columns
sync; August is the first clean calibration month. Zazi hours confirmed 3.5/day by the
full-attendance payment cluster (R2,218 = 3.5 x ~20 x R32.01).

**Mentor Reserve**:
Manual deduction from available funding for Youth Mentor salaries (fungible pots like HCI
can legally fund mentors); default R0. Prevents v1's mentor exclusion overstating youth money.

**Payment Record**:
One nett bank transfer to one youth, identified by employee_id; a youth can receive several
in one Payroll Month. Already net of Subsidy (top-up model). Source: finance ledger export
(Jan-June 2026: 1,448 records, R1.95m, 97% join to the youth DB). Payments run ~28th-30th;
an early-month payment is a correction for a prior month's underpayment.
DEFERRED (2026-07-27): ledger ingestion / predicted-vs-actual reconciliation is future
scope; existing payroll-vs-youth-DB checks cover it. v1 used the ledger once, offline, to
calibrate the formula (rate R32.01, employee_id join, top-up netting).

**Fiscal Year (Masi)**:
April to March; the ledger's FY column labels the *ending* year (April 2026 onward = FY2027).
Youth budgeting nonetheless runs on calendar 2026.

**UIF (employer)**:
Masi's matching 1% contribution on gross wages, included in projected cost as a x1.01
factor (per Jim, 2026-07-27).

**Wage Rate**:
Rand per hour paid to all youth, flat across the org. Calculator input, currently R32.01
(verified against June 2026 payslip: 79.0 h x R32.01 = R2,528.79).

**Payroll Month**:
Masi's youth pay period, running from the 20th to the 19th of the following month.

**Holiday Pay**:
Discretionary wages for training/workshop days during school holidays, paid only when
funding allows. Projection assumes school-holiday days are unpaid; Holiday Pay is a
separate manual input.

### Staffing grid (existing, shipped)

**Planned Post** (`youth_planned`):
Management's staffing allocation for a school x programme x year; typed by hand as
contracts are signed.

**Active Youth** (`youth_active`):
Nightly system count of Youth rows with `employment_status == 'Active'`, classified into
programmes via job title.

## Relationships

- A **Funder** provides one or more **Funding Pots**; a pot may carry a **School Restriction**
  or be a **Fungible Pot**.
- A **Youth** has at most one active **Subsidy** at a time (NYS or SEF); NYS assignment is
  blocked by any prior SEF history.
- An **Externally Paid Youth** draws from no **Funding Pot**.
- A **Youth**'s programme is derived from their job title (existing mapping in
  `api/school_programme.py`), and their cost from **Hours Cap** x **Wage Rate** minus any **Subsidy**.

## Example dialogue

> **Dev:** "This youth is on SEF — do they still cost us money?"
> **Domain expert:** "Yes. SEF pays the first R1,600 each month; Masi pays the rest of what
> their hours earn. Only an **Externally Paid Youth**, like all Yebo youth this year, costs
> the pots nothing."

## Flagged ambiguities

- **"Programme determines hours" vs per-youth Hours Cap**: RESOLVED 2026-07-27. Programme
  Hours are authoritative for projection (Jim distrusts the Airtable Hours Cap column, which
  anyway measures subsidy-expensable hours, not hours worked). Full per-programme hours
  table still to be collected.
- **"ECD Literacy"**: Jim's name for the 5.5 h/day programme; mapping to the grid's
  programme keys (zazi_izandi? preschool?) unconfirmed.
- **Wage Rate history**: Jim first quoted R30.42/hr; payslip proves R32.01 as of June 2026.
  Rate changes over time, so it is an input, not a constant.
- **Rural youth funding**: PARTIALLY RESOLVED 2026-07-28. Three wind-farm Funding Pots
  seeded at R0 with school restrictions (Kouga: Sandwater, Living Ubuntu, Kokkewiet;
  Tsitsikamma: Bambino, Clarkson, Vukani Daycare, Msobomvu Full Service, Siyazama;
  Amakhala Emoyeni: Lingelethu, Nceduluntu Edu-care, Mzamomhle Edu-care). Amounts still
  TBC by Jim; verdict overstates the shortfall until entered. Two names Jim must confirm:
  "Vukani" (Daycare vs Vukanibantu) and "Msobomvu Primary School" (no such row; closest
  is Msobomvu Preschool).
- **Pot semantics**: RESOLVED 2026-07-27. Pot amounts are REMAINING balances as of entry
  (each entry needs an explicit as_of date). Proper funder funding-window/budget tracking
  is future scope, deliberately out of v1.
- **Youth Mentors vs HCI pot**: RESOLVED 2026-07-27 via the Mentor Reserve manual input
  (default R0). Proper mentor cost modelling stays future scope; from 2026-09-01 the chart
  uses a clearly labelled latest-three-actual-month average as an informational forecast.
- **"Through November"**: RESOLVED 2026-07-27. One clean rule: ALL youth earn through end
  November by default; staff can move one global Last Paid Programme Date earlier to test
  affordability. December is ignored entirely (Holiday Pay input aside).
- **Airtable Funder column**: currently not updated/accurate; will hold SEF or NYS as
  assignments are made. Staff verification of subsidy columns still pending.
- **Duplicate School rows** (found 2026-07-27): youth sync attaches some youth to legacy
  is_active=false school rows without school_uid, while grid cells hang off canonical rows.
  438 true actives vs 428 grid-visible (3 school-less + 16 stranded). Makes the Act First
  panel report fake gaps (e.g. Lingelethu 0/8 with 7 coaches in post). Fix is a separate
  work item from the calculator.

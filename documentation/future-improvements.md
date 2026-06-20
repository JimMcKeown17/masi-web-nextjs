# Future Improvements

A running backlog of ideas worth building that were deliberately deferred, with
enough context to pick them up cold. **When deciding what to build next, start
here.** Keep entries rank-ordered within each area; move shipped items to the
"Shipped" note at the bottom of their section rather than deleting them.

---

## School Programme Grid — Youth staffing board

The youth board (`/operations/school-programme-grid/youth`) shows active vs.
planned youth per school x programme. Planned is typed by management as funding
contracts are signed; active refreshes nightly from the database. These ideas
came out of a design review on 2026-06-20.

### 1. Vacancy aging & week-over-week trend  (highest insight, highest effort)

Today the board is a **snapshot** — it shows that a gap exists, not how long it
has been open or whether we are closing or widening it. The shift is **stock ->
flow**: a 6-week-old vacancy is a very different leadership problem from a 2-day
one.

- Store the nightly `youth_active` / `youth_planned` numbers over time (the cron
  currently overwrites), so each vacancy carries an **age** and the board can show
  a **net delta** ("+3 filled since last week").
- Needs a small history/snapshot table on the backend. This is the dependency for
  the leadership-board deltas (see below).
- Effort: high. Payoff: turns the board from a status display into an
  accountability instrument.

### 2. Tie planned numbers to their funding source

Planned numbers move because contracts get signed sporadically, but the board
shows the number with no context. Attach **who set it, when, and against which
funder/contract** to each planned value.

- Closes the loop between money and people ("why is planned 8 here?" -> "the X
  grant, signed in May") and gives management's edits provenance instead of being
  anonymous.
- Effort: medium (extra fields on the cell edit + a small provenance popover).

### 3. Cell drill-down to the named people (and the gap owner)

Click a cell to see the actual active youth — names, start dates, employment
status — plus the PM accountable for filling any vacancy.

- Moves leadership from "there's a hole at Charles Duna literacy" to "here's who's
  in it and who's closing it."
- The youth data already exists; this is mostly a surfacing job.
- Effort: medium.

### Leadership-board deltas  (depends on #1)

The leadership scoreboard intentionally shipped **without** the "vs last week"
deltas because they need the snapshot history from idea #1. Once that table
exists, add the delta chips back to the hero ("+2 pts"), Open vacancies
("-6 since last week"), etc. The component was built to accommodate them.

### Shipped
- **Leadership scoreboard band** (idea #1 from the review) — shipped 2026-06-20.
  `LeadershipBoard.tsx` above the youth grid: hero "% staffed" ring, open
  vacancies, fully-staffed coverage, over-plan, and an "act first" gap watchlist.
  All five stats are derived live from the grid payload via `summarizeStaffing`
  in `shared.tsx`.

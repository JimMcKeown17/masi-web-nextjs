# Roadmap

Everything started but not finished, in one place. Written 2026-07-16.

This spans **three repos**, because most streams have a frontend half and a backend half:

- `frontend/masi-website` (this repo)
- `backend/Masi Web Main` (Django API)
- `Zazi_iZandi_Website_2025` (the Zazi iZandi backend, separate product, read via API)

**How to read status here.** Trust git state and the database, not plan checkboxes. Every
`_plans/*.md` file in this project has stale checkboxes: the work got done, the boxes never
got ticked. Where this doc quotes a number, it says where the number came from and how to
re-derive it. For deferred ideas rather than started work, see
[future-improvements.md](./future-improvements.md).

---

## At a glance

| Stream | Branch | Ahead | State | Next step |
|---|---|---|---|---|
| [Impact Data Portal](#1-impact-data-portal) | `feature/impact-data-portal` | 1 | Slice 1 of 5 built and verified | Build Slice 2, or merge now (invisible, safe) |
| [Agentic fundraising](#2-agentic-fundraising-system) | `feature/agentic-fundraising` (+ backend `feature/fundraising-spine`) | 15 (+17) | 1 of 4 agents working end to end | First live run of the newsletter skill |
| [Impact page lights](#3-impact-page-lights--why-it-matters) | `feature/impact-lights-superpower` | 6 | Code complete, post-review edits in | Browser pass, then merge |
| [Numeracy 2026 pipeline](#4-2026-numeracy-assessment-pipeline-backend) | `feature/numeracy-2026-pipeline` | 2 | Committed, 92 tests green | Run the syncs locally, work the correction queue |
| [Zazi reconciliation](#5-zazi-to-canonical-reconciliation-data-not-code) | `feature/zazi-reconciliation` | 1 | School side done, child side open | Staff work the Airtable worklists |
| [Youth budget calculator](#6-youth-budget-calculator) | none yet | - | Scoped 2026-07-27, not built | Phase 0 data tasks, then build per plan |
| [Duplicate school rows bug](#7-duplicate-school-rows-bug-prod) | none yet | - | Diagnosed 2026-07-27, unfixed | Fix sync + re-point youth FKs (own branch) |

All branches were pushed to remotes on 2026-07-27. See [Repo hygiene](#repo-hygiene).

---

## 1. Impact Data Portal

**Worktree:** `frontend/worktrees/impact-data-portal` | **Branch:** `feature/impact-data-portal` (clean)

A native, on-brand replacement for the bare Streamlit iframe currently sitting at
`/impact/data-portal`. Audience is a single persona: an analyst at a prospective
institutional funder. The design rule is "rigorous but legible", so it shows headline
outcomes and reach, and deliberately excludes operational metrics (sessions, assessment
counts, coach leaderboards). The Streamlit deep-dive is kept as a curated sibling, not
replaced.

**Built (Slice 1 + 1.5):**

- `/impact/data-portal/zazi-izandi`, the only page with real data, two flagship charts
- Placeholder pages for core-literacy, numeracy, 1000-stories, community-jobs
- A `(shell)` route group with a sticky programme nav, driven by `portalConfig.ts`
- A visx chart kit (only `BarComparison` so far), no Plotly, per ADR 0002

**Data path:** Next.js to Masi Django (`/impact/zazi-programmatic/`) to Zazi Django
(`/api/programmatic-impact-2026/`) to Zazi Postgres. Live-fetched with ISR on a 1 hour
window, returns null and renders an empty state on failure. **Both backend endpoints are
already on their respective mains**, so this branch merges with no backend coordination.

**Remaining:** Slice 2 (Zazi site-level, MapLibre map), Slice 3 (core literacy + numeracy),
Slice 4 (1000 Stories + Community Jobs), Slice 5 (overview landing + the cutover).

**Two things to know before picking this up:**

1. **Merging is safe but invisible.** It adds routes without touching the front door.
   `/impact/data-portal` still serves the iframe, and nothing links into the new shell.
   The cutover is explicitly gated on Jim and bundled with Slice 5.
2. **Scope is baseline to midline, not endline.** The Zazi DB has no endline rows, and
   midline collection is ongoing, so figures drift daily and every one carries an
   "as of" date. The 27% national benchmark is a year-end mark shown against our mid-year
   midline, and is labelled as such.

**Open:** Ink and Signal accents are unassigned for Core Literacy, Numeracy and 1000
Stories (currently neutral ink placeholders, deliberately not guessed). Streamlit metric
bugs in `METRIC_BUGS.md` on both data sites are unresolved; the portal dodges the live Zazi
blending bug by using LPM only, but the Streamlit fix is still owed.

---

## 2. Agentic fundraising system

**Worktree:** `frontend/worktrees/agentic-fundraising` (docs + skills)
**Code:** backend `feature/fundraising-spine`, 17 commits, **not pushed**

A fundraising back office for a nonprofit that has none. A "spine" of fact tables (Contact,
Donation, Opportunity, Grant, Deliverable, Interaction, Campaign, Draft) in Masi's own
Postgres, with LLM agents that read everything and **write only drafts**. Jim approves,
every send logs itself. The problem: under-communication is the documented number one cause
of donor loss, and Masi's real asset (stories, quotes, photos in Airtable and Drive) only
reaches donors through manual work. Agents supply cadence, Jim supplies judgment.

**The split that will confuse you:** the worktree's first commit says "system not yet
built" and that message is now badly stale. The worktree is genuinely docs and skills only
(26 markdown files, one Python helper, zero `src/` changes). The working system is ~1,700
lines with 64 tests on the **backend** branch. Docs in one repo, code in another.

| Piece | State |
|---|---|
| Layer 1 spine (11 models, migrations, admin) | Built |
| Voice guide (from 22 real Jim samples) | Built |
| Agent 1, Content Pipe (newsletter) | Built end to end |
| Tool belt (formal extraction) | Not done, logic still inlined |
| Answer library | Not started |
| Agent 2, Grant Application Studio | Not started (Jim's favourite) |
| Agent 3, Morning Portfolio Brief | Not started |
| Agent 4, Funder Research | Not started |
| Self-improving loop (ADR 0007) | Partial: `draft_body` captured, `final_body` sync-back not built |

**Proven live:** two real Mailchimp draft campaigns, 77 optimized hero photos public in GCS,
8 rendered drafts archived.

**Next step:** first live run of the `masi-newsletter` skill on a real one-off. The skill is
still untested end to end by Jim.

**Blockers, mostly human:**

- Jim's homework, 8 items, none done: donor workbooks, past proposals (20 to 40, gates the
  Grant Studio), Tier 1 list, funder CSVs, and two unbooked sessions (metrics brainstorm,
  answer library curation).
- Team task: 10 broken Airtable links to fix, then re-run `backfill_story_heroes --force`.
- Per-child stats blocked on identity friction (marketing does not know child mcodes);
  programme-level stats are the interim.
- `CanonicalChild` has `gender` but no `race`, so race-based counts cannot be answered.
- Nothing deployed. The fundraising tables exist only in local `masi_db`.

**Careful with two reversals** in the 2026-07-10 addendum: photo width caps were reverted to
full-width, and "portal visuals stay out of emails" was reversed by the chart library.

**Riding this branch but unrelated to it:** commit `e93e460` adds the `codex-first` skill and
a CLAUDE.md "Building" section codifying the delegation split (Claude designs and reviews,
Codex implements). It is general dev workflow, committed here only because that is where it
was written, and deliberately kept standalone. Cherry-pick it onto main whenever convenient:
`git cherry-pick e93e460`.

---

## 3. Impact page: lights + why-it-matters

**Branch:** `feature/impact-lights-superpower`, 6 commits, no worktree

Two sections of `/impact`, reworked:

- **`ArgumentChain` replaced by `WhyItMatters`.** The old section framed Masi too narrowly:
  readers could conclude letter sounds are the mission. Letter sounds are a measurement. The
  new section carries literacy and numeracy, with reading as the superpower that unlocks
  everything else.
- **`ClassroomLights` simplified.** Stripped the competing chrome (progress bar, month
  calendar, three stacked narrative boxes). The lights turning on are the point.

**State: code complete, including the amendments from Jim's 2026-07-12 browser review.** All
plan checkboxes are still unticked and should be ignored. The review produced two reversals
that are already implemented: the payoff line moved to an always-visible standfirst (fast
scrollers were missing it), and scroll-driven lighting was **restored** after autoplay felt
"video-like and skippable". The section is pinned again at 360vh, down from the original
460vh since the chrome is gone.

**Next step:** the plan's Task 3 (browser verification: desktop, mobile, reduced motion) was
never formally closed, and `pnpm lint` / `pnpm build` have not been confirmed since the last
commit. Do that pass, then merge. This is the closest branch to done.

---

## 4. 2026 numeracy assessment pipeline (backend)

**Branch:** `feature/numeracy-2026-pipeline`, 2 commits off `origin/main`, **not pushed**

Rescued 2026-07-17 from `feature/fundraising-spine`, where it had been sitting uncommitted.
Now two commits, tree clean, **92 tests green**, no missing migrations.

- `4b19344 feat(numeracy)`: the pipeline. Migration 0039, `api/numeracy_2026.py`, four
  management commands (two syncs, parquet exporter, reconciler), the ETL preview surface,
  and eight test files.
- `7a60017 feat(wig)`: the numeracy outcome ring, which generalises `wig_outcomes` from
  "Core Literacy + ECD Literacy" to any backend-owned programme.

The design worth preserving: identity resolution is entirely on `child_uid` (no reuse of the
2025 name-based merge). Publication fails closed on operational integrity failures but
quarantines record-level data quality problems into a correction report rather than taking
the dashboard down. Scores are never clipped or averaged. The WIG ring reuses the pipeline's
own quality evaluation rather than restating it, so a quarantined assessment is excluded
identically on the WIG board and in the data portal.

**Next step:** run the syncs and exporter locally against `masi_db`, reconcile with
golden-row hand-traces, and work the correction queue. There is deliberately no cron, since
assessment collection is window-based. Do not run the exporter on Render: its output target
is the sibling local Streamlit repo.

Documented in backend `documentation/airtable_pipeline_sync.md` section 7.

---

## 5. Zazi to canonical reconciliation (data, not code)

**Worktree:** `frontend/worktrees/zazi-reconciliation` | **Branch:** `feature/zazi-reconciliation`
(1 ahead, 23 behind main)

A one-time data reconciliation, not a feature. Changes zero application code: 13 files of
docs, CSV worklists, SQL and one standalone discovery script. **Merging is optional**, purely
to keep the record durable.

**The problem.** Children who received Zazi sessions but have no record in Masi's canonical
database are invisible to the School Programme Grid, which counts from canonical only. The
gap was measured at roughly 13 to 15% of session-active children, which is what would
undercount Zazi reach in the grid's deduped rollup. Root cause is a process gap, not a bug:
no code writes the Airtable Child Registry, staff populate it manually.

**Status, corrected against prod on 2026-07-16.** The status doc says "no fixes have been
written back to any database yet". **That is wrong, and was already wrong when written.** The
school side was applied on 2026-06-19 and is live:

- The 5 manual school mappings are in the Zazi DB (`api_schoolidentity2026`, `match_method
  = 'manual'`, stamped `2026-06-19 14:02`), 92 mappings total.
- The duplicate-school merge ran in Masi PG: Nonkqubela (85) and Emfundweni (76) are
  `is_active = false`, and "School 70" was correctly excluded as a placeholder.

This also answers one of the two questions the status doc lists as open: Nonkqubela and
Emfundweni appeared on the unmatched list because they were spelling-variant duplicates, and
they have since been merged.

**Genuinely outstanding: the child side.** Two worklists are for humans, not code, and the
spec is explicit that there are no automated Airtable writes:

- A relink list (~373 rows) of children already in canonical but not linked.
- An import-candidates list (~828 rows) needing real mcodes assigned by Jim.

Spot-check ~20 rows of each bucket before any bulk action. Acceptance: after the lists are
loaded, a re-run shows the session-active gap at roughly zero.

**Do not trust the doc's numbers cold.** They are from 2026-06-18 and the audit and the spec
used different dedupe methods, so their counts do not blend. Re-run
`docs/discovery/zazi_reconcile.py` against current sources before acting.

**Known traps:** no date of birth exists anywhere (23,525 participants, all null), so the one
deterministic match key is absent and name is the only identity signal. TeamPact has internal
cross-year duplicates, so `participant_id` is not canonical. `teampact_sessions_complete` is
**stale at 2026-02-24**; the live source is `sessions_2026`. TeamPact is being retired, which
is why this is one-time only and not a repeatable engine.

---

## 6. Youth budget calculator

**Branch:** none yet | **Scoped:** 2026-07-27 | **Plan:** `_plans/youth-budget-calculator.md`

A "Budget" tab on the school-programme grid answering "are we on, over, or under budget
given the youth we've hired and plan to hire?" Verdict: remaining funding pots
(R1,523,777.96 as of late July) minus projected cost of all active non-Yebo youth through
30 November, at assumption-based costing (ADR 0002). The grid's editable `youth_planned`
doubles as the hiring sandbox (ADR 0001). Domain language in `CONTEXT.md` at repo root.

**State:** fully scoped via grill session, nothing built. Reconciliation engine, funder
windows, mentor costing, and rural pots all explicitly deferred (see plan).

**Next:** Phase 0 data tasks (staff verify Airtable subsidy columns, fix 3 stale mentor
titles), then backend models + `api/youth_budget.py`, then the tab.

---

## 7. Duplicate school rows bug (PROD)

**Branch:** none yet | **Found:** 2026-07-27 during calculator scoping

`sync_airtable_youth` attaches some youth to legacy `is_active=false` School rows (no
`school_uid`) while grid cells hang off canonical rows. 16 active youth are stranded
invisible (Lingelethu 7, Msobomvu 6, Nceduluntu 2, Lukhanyiso 1) plus 3 school-less, so
the grid shows 428 of 438 true actives and the **Act First panel reports fake gaps** —
Lingelethu "0 of 8 in post" while 7 literacy coaches work there. (The hero's 339 vs 428 is
filled-post `min(active, planned)` semantics, by design, not part of the bug.)

**Fix (own branch, before or with calculator Phase 0):** re-point stranded youths' school
FKs to canonical rows, make the sync match canonical schools only, add a GridHealthPanel
check for youth on inactive school rows.

---

## Repo hygiene

### Everything is pushed (resolved 2026-07-27)

Originally nothing was pushed anywhere; all unmerged branches across both repos were
pushed to their remotes on 2026-07-27, so a disk failure no longer loses work. The
backend's local `main` may still trail `origin/main` by the wig-fix commit; fast-forward
when convenient.

### The backend branch tangle (mostly resolved)

`feature/fundraising-spine` used to carry three unrelated things. The numeracy pipeline has
been moved off to its own branch (2026-07-17), leaving:

- The fundraising system, its actual job.
- `fc12fc6`, a duplicate of the wig fix. **The fix is already on `origin/main`** as `52b7a3b`
  (identical content), so `fc12fc6` is redundant and `fix/wig-assessment-gate` can be
  deleted. `feature/fundraising-spine` should be rebased onto `origin/main`, which will drop
  the duplicate.

Local `main` is 1 behind `origin/main`, and that one commit is the wig fix. Fast-forward it.

### Merged branches, safe to delete (frontend)

All 21 have zero commits not already on `main`:

`claude-edits`, `feature/about-hero-redesign`, `feature/about-jobs-data-update`,
`feature/community-jobs-redesign`, `feature/ece-navbar-numeracy`, `feature/homepage-v3-live`,
`feature/ink-signal-redesign`, `feature/masi-field-app-dashboard`,
`feature/mobile-navbar-improvements`, `feature/navbar-redesign`, `feature/rename-zazi-navbar`,
`feature/wig-dashboard`, `feature/working-days-calendar`, `feature/youth-days-off-widget`,
`feature/youth-sessions-dashboard`, `feature/zazi-izandi-media-impact-pages`,
`feature/zazi-upgrades`, `fix/eslint-flat-config`, `fix/youth-sessions-mentor-dropdown`,
`homepage-motion`, `wig-live`

```bash
# from frontend/masi-website
git branch -d claude-edits feature/about-hero-redesign feature/about-jobs-data-update \
  feature/community-jobs-redesign feature/ece-navbar-numeracy feature/homepage-v3-live \
  feature/ink-signal-redesign feature/masi-field-app-dashboard \
  feature/mobile-navbar-improvements feature/navbar-redesign feature/rename-zazi-navbar \
  feature/wig-dashboard feature/working-days-calendar feature/youth-days-off-widget \
  feature/youth-sessions-dashboard feature/zazi-izandi-media-impact-pages \
  feature/zazi-upgrades fix/eslint-flat-config fix/youth-sessions-mentor-dropdown \
  homepage-motion wig-live
```

`-d` refuses to delete anything unmerged, so this is safe by construction.

---

## Where the other backlogs live

- [future-improvements.md](./future-improvements.md), deferred ideas not yet started. Start
  here when deciding what to build next.
- [data-architecture.md](./data-architecture.md), the three backends and the sync topology.
  Read before assuming where data lives.
- `_plans/`, per-feature plans in both repos. Useful for design intent, unreliable for status.
- Backend `documentation/etl_data_architecture_plan.md` and `data_map.md`.

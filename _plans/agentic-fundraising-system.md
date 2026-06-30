# Agentic Fundraising & Marketing System — Build Plan

Status: scoped 2026-06-12 (grill session); revised 2026-06-13 (rev 2) after Jim's answers in `docs/plan-reviews/agentic-fundraising-improvement-review-2026-06-12.md`. Domain language: `CONTEXT.md`. Decisions: `docs/adr/0001-0007`. Visual: `docs/design/agentic-fundraising-operation.html`.

## The system in one paragraph

One spine — a general ledger for relationships in Masi Postgres (Contact, Donation, Opportunity, Grant, Deliverable, Interaction, Campaign, plus content mirror, Content Use ledger, Answer Blocks, Funder Briefs, drafts). Work happens in the edge tools (Airtable, Drive, InDesign, Gmail, Mailchimp); only facts land in the spine. Agents (Python in the `fundraising` Django app, Anthropic SDK; cron + DRF endpoints) read everything and write only drafts; Jim approves; every send logs itself. Agents supply cadence, Jim supplies judgment and relationships.

## The reframe (rev 2): a platform and its agents, not five phases

Rev 1 was organized as five sequential feature phases. Jim's strongest reaction was to *"build the tool belt once; agents are cheap to rewrite, tools are the durable asset."* A phase plan fights that instinct — it buries the durable tools inside whichever feature happens to need them first. So rev 2 is organized as **two durable layers plus disposable agents**:

- **Layer 1 — the platform (build once, changes rarely).** The Spine (fact tables) + the Tool Belt (a small set of well-tested functions that read the spine and act on the edges). This is the asset. Getting it right is the whole game.
- **Layer 2 — the agents (composed, sequenced by ROI, cheap to rewrite).** Each agent is a thin orchestration of Tool Belt calls plus a prompt. Throw one away and rewrite it in an afternoon; the platform underneath is untouched.
- **Two curated voice assets** sit beside the platform: the **Voice Guide** (how Jim writes) and the **Answer Library** (what Masi says about itself). Both are authored once and improved continuously.
- **Woven through everything from day one: the self-improving loop.** Not a phase — a property every drafting agent has. (ADR 0007.)

**Mental model — the Tool Belt.** *Is:* the knives and pans of a kitchen — a small, sharp, shared set every recipe reaches for, owned and maintained centrally. *Isn't:* the recipes themselves (those are the agents, swapped freely), a framework, or a place for business logic to sprawl. The test of a good tool: a new agent nobody has imagined yet can be built almost entirely by composing existing tools.

**Mental model — the self-improving loop.** *Is:* keeping the diff between what an agent drafted and what Jim actually sent, classifying that diff, and feeding it back into the Voice Guide, the Answer Library, and the autonomy dial. *Isn't:* model fine-tuning or autonomous self-modification — it's an apprentice studying the editor's red pen, not a model retraining its own weights.

## What changed from rev 1 (legible diff)

- **Restructured** five phases into Layer 1 (Spine + Tool Belt) and Layer 2 (agents by ROI).
- **Grant Application Studio promoted** from Phase 3 to the second agent built — because its main blocker (live data slots) largely already exists as the `PublishedStat` registry on `/impact` (model `api/models.py:1526`, endpoint `/impact/published-stats/`, selector `pick(key)`). Dependency shrinks from "build a stats pipeline" to "verify seeded values + add the jobs/grad/retention numbers."
- **Steward reconceived as the Morning Portfolio Brief** (review improvement B): a portfolio manager that spends Jim's 15 minutes/day optimally, not a nagging rules engine.
- **Self-improving loop elevated to a foundation** (Jim: *"creating a self-improving loop for this system should be top priority"*) — schema support lands in Layer 1, every agent uses it. New ADR 0007.
- **Identity promoted to first-class** (reversible merge log + householding) — kept as a *correctness* concern (thank the right person), with the compliance/erasure parts deferred per Jim.
- **Voice Guide named as a durable artifact** every drafting agent reads.
- **Compliance edge cases explicitly deferred** (Jim: focus the 90%, high ROI; deletion has never once been requested in 20 years; team is compliance-strong). Moved to a "Deferred by decision" section so it's a conscious choice, not an oversight.
- **Non-email capture = transcribed voice note** (Jim's Q1) — concrete mechanism, lands in the first agent's window.
- **Metrics/scoreboard pulled out into a bookmarked brainstorming session** (Jim's explicit Q3 ask) rather than designed inline.

## Decisions locked

- ADR 0001 — native core, buy edges (no SaaS CRM)
- ADR 0002 — `fundraising` Django app in Masi backend, tables in masi_database
- ADR 0003 — one spine; agents draft, humans approve; Python-in-Django runtime
- ADR 0004 — two email rails: Mailchimp broadcasts + Gmail Personal Sends; spine records all
- ADR 0005 — Grant Writer = curated Answer Library with live data slots, not RAG (amended: the `PublishedStat` registry *is* the live-slot source)
- ADR 0006 — the Tool Belt is the durable asset; agents are thin, disposable compositions (NEW)
- ADR 0007 — the self-improving loop: capture draft-vs-final diffs; promote the autonomy dial on measured evidence (NEW)
- Two Receiving Entities (US 501(c)(3) + SA); Donations multi-currency; no bank feeds — manual entry/CSV only
- Tiers (1 Personal / 2 Warm / 3 List, Jim-assigned) orthogonal to Segments (US / RSA-EU / foundations)
- Social: team-run; agent assists draft-mode only
- Discovery import-led; Funder Research (language mirroring) is the key agent, not discovery
- Personal donor notes in the spine, privacy-flagged

---

# Layer 1 — The platform (build once)

## 1a. The Spine (schema foundation; everything depends on it)

- [ ] `fundraising` Django app: Contact, Donation, Opportunity, Grant, Deliverable, Interaction, Campaign models + migrations (lean fields; see CONTEXT.md relationships). NOT homework-gated — schema can start immediately.
- [ ] Donation: receiving_entity, currency, amount, date, optional grant FK
- [ ] **Draft artifact table with the self-improving loop built in:** every draft keeps `draft_body`; after send, the sync attaches `final_body`. The diff is computable forever after. This is ADR 0007 and costs two text columns now / is unrecoverable later.
- [ ] **Identity as first-class (correctness, not compliance):** soft merges only — a merge log (who merged what into what, when, why) with an unmerge operation. Survivorship rules written down (which email/name/segment wins). Householding decision before import: do couples appear as one Contact or two linked Contacts? (Driven by Q4 workbook anatomy.)
- [ ] **Expectations model (simple):** Jim's Q5 — "promises" are just annual funder contracts + monthly donors. Model expected giving minimally so the Morning Brief can detect a lapse, no more.
- [ ] Minimal /operations/fundraising UI: contact list/detail (notes incl. private flag), donation entry form, CSV import
- [ ] Local-snapshot rule: fundraising tables excluded/sanitized when refreshing local from prod (ADR 0002)

## 1b. The Tool Belt (the durable functions every agent composes)

Each is one well-tested function. Build and test these directly; agents call them, never reach around them. **`published_stats.*` already exists** — proof the belt is real, not hypothetical.

**Spine reads**
- [ ] `contact.get(id)` / `contact.search(query)` — identity-resolved
- [ ] `contact.history(id)` — interaction timeline, donations, Tier/Segment, what they've seen
- [ ] `opportunity.context(id)` / `grant.context(id)` — stage, deliverables, prior applications
- [ ] `content_use.history(contact)` — "what has this funder already seen"

**Capability tools (the high-value ones)**
- [ ] `published_stats.pick(key)` / `.group(name)` — **EXISTS** (`selectors.ts`). The curated source for *impact* numbers (improvement/outcome stats: reading gains, "2 yrs ahead"). Carries `as_of`, `source_system`, `methodology_note` — provenance for free. Audit coverage vs Jim's most-quoted impact numbers (Q8); de-provisionalize the seeded values.
- [ ] `metrics.compute(...)` — NEW. The *operational / demographic / financial* numbers grant proposals demand that are NOT curated impact: counts (jobs created, # schools), demographic breakdowns (by race/gender), financials. Jim's Q8 distinction: `published_stats` holds *improvement*; proposals also need *descriptive* stats, and these want computation from live data, not hand-curation. **Evidence (verified 2026-06-13):** `Youth` carries `race` + `gender` + employment dates -> youth counts/demographics are computable; `CanonicalChild` carries `gender` but **NOT `race`** -> "number of black/white/coloured children" cannot be answered today (a collect-gap, see Discovery & validation). Together, `published_stats` + `metrics.compute` are the only legal number sources; the Studio's Fact Auditor checks every number traces to one of them.
- [ ] `voice_guide.read()` — NEW. Every drafting agent reads this. (See Voice Guide below.)
- [ ] `answer_library.select(theme, angle)` — NEW. Built with the Studio.
- [ ] `funder_brief.read(contact)` — NEW. Built with Funder Research; the Studio degrades gracefully without it.
- [ ] `content.unused_stories(filters)` / `content.get(id)` — content library reads (newsletter).

**Draft-only writes**
- [ ] `draft.create(kind, contact, body, ...)` — returns a draft id, stores `draft_body` (feeds ADR 0007)
- [ ] `interaction.propose(contact, channel, summary, ...)` — a draft Interaction for one-tap confirm (the capture path)

**Rails (the edges)**
- [ ] `gmail.create_draft(...)` + `gmail.sync(tracked_addresses)` — sync logs Interactions AND attaches `final_body`, closing the self-improving loop. Restricted to tracked Contact addresses.
- [ ] `mailchimp.create_draft_campaign(...)` + `mailchimp.fetch_sent(campaign)` — final body + recipient list -> Content Uses + Interactions
- [ ] `edit_capture.classify(draft_body, final_body)` — the instrument: edit magnitude + categories (voice / facts / structure / killed). A cheap agent task; the input to dial promotion and voice recalibration.

## 1c. The two curated voice assets (authored once, improved forever)

- [ ] **Voice Guide** — the distilled "how Jim writes," seeded from his 2-3 high-open-rate direct emails (homework #4). A versioned artifact in the spine; `voice_guide.read()` serves it; the self-improving loop's classified edits update it quarterly. Jim has no one drafting for him today (Q2), so this is net-new leverage, not a replacement.
- [ ] **Answer Library** — built with the Grant Studio (see below). The "what Masi says about itself." Same learning loop.

---

# Layer 2 — The agents (sequenced by ROI)

Order is deliberate. Newsletter first for two reasons: under-communication is Jim's #1 documented cause of donor loss (Q9) and the ~500-person list is the lowest-hanging fruit (Q3); but the deeper reason (Jim, 2026-06-13) is that **the newsletter forces us to build the content->channel link — the missing operational link today.** Masi's real asset is its content (stories, quotes, photos, videos) sitting in Airtable/Drive; moving it into external comms is currently manual. The newsletter is the first consumer of a reusable Content Pipe, not a one-off feature — which is also why the Studio (Jim's favorite) is safely built second, on a platform that has already proven the hard integration. Each agent is a thin composition over Layer 1.

## Agent 1 — The Content Pipe: newsletter machine + calendar + social assists (highest ROI)

**The real prize (Jim, 2026-06-13):** the engineering heart of this agent is the link between Masi's content/assets (stories, quotes, photos, videos in Airtable/Drive) and the external channels — the missing operational link today, where the process is manual. The newsletter is the first thing the pipe feeds; the same content sync + Content Use ledger then serves Personal Sends, the Studio's report narratives, and social. Build the pipe once; the newsletter is its first consumer.

- [ ] Airtable marketing base: confirm token access + base ID; schema-dump management command (documents the base, foundation of sync)
- [ ] Content sync (house pattern, nightly + on-demand): Success Stories, Content Calendar, Funder Packages, Jean & Fiks Videos, Reels, LC/NC Comments, Testimonials -> content_* tables
- [ ] Content Use ledger; backfill from existing signals (Report Use columns, page-no columns, Instagram links, Date Published)
- [ ] Funder Packages rows -> report Deliverables, linked to Grant/Contact in spine ("card it, don't move it")
- [ ] Campaign Calendar: model + seed-the-year session with Jim (newsletter monthly to start)
- [ ] **Marketing Agent v1:** compose `content.unused_stories` + monthly video + `published_stats.pick` (one live number) + theme + `voice_guide.read` -> `draft.create` -> `mailchimp.create_draft_campaign` -> notify Jim
- [ ] Send detection: `mailchimp.fetch_sent` logs Content Uses + ~500 Interactions, attaches `final_body` (self-improving loop fires on issue #1)
- [ ] Personal variant: same issue re-voiced as a plain "update from Jim" -> `gmail.create_draft` for Tier 1
- [ ] Gmail integration: OAuth, draft creation, sync restricted to tracked Contact addresses. **Do this early in this agent** — it is the riskiest integration; surface scope/verification pain before more is built on it.
- [ ] **Non-email capture (Jim's Q1: transcribed voice note is easiest):** voice note or pasted Google-Meet transcript -> agent parses who/when/what/follow-up -> `interaction.propose` -> one-tap confirm. Data must exist before the Morning Brief consumes it.
- [ ] Social assists: proposed Content Calendar rows w/ story picks + captions ("Proposed by AI" — the single write-back exception); caption polish; newsletter repurposing; LinkedIn drafts (funder-voiced) -> /operations queue, Jim posts manually

## Agent 2 — Grant Application Studio (Jim's favorite; promoted from Phase 3)

The orchestrated version (review System A): one run per application. Promoted because the live-data-slot dependency is largely solved (`published_stats`). Multi-user from the start (Q7: Jim + Zama/ED + Zola/COO; Tongi is the designer, not a user here).

- [ ] Collect the 20-40 Word proposals; tag won/lost where known (homework #5)
- [ ] Distillation pass -> Jim curation day: Answer Blocks + angle variants + data-slot candidates + Key Messages checklist. Jim owns the voice once; this builds `answer_library`.
- [ ] **The run** (DRF, /operations): paste questions + limits + deadline + funder Contact ->
  - Question Classifier maps to themes; **flags unprecedented questions on day one**, not in the deadline crunch
  - Per-question Drafters (parallel): block + angle + `published_stats.fill` + compressed to word limit
  - Key Message Auditor: verifies every Key Message landed
  - Funder's Reviewer (adversarial): roleplays the programme officer from the Funder Brief, flags vocabulary mismatch, scores against their criteria
  - Fact Auditor: every number must trace to a `published_stats` call; naked numbers flagged (ADR 0005 enforced, not hoped)
  - Assembler: draft + a reviewer's memo (weakest answers, lowest adversarial scores) so Jim reviews a confidence map, not a wall of prose
- [ ] Application drafts attach to Opportunities; application-step Deliverables for due dates
- [ ] Library learning loop: on won/lost, the orchestrator's *choices* (which blocks, which angles) get tagged — the library learns at the level of decisions
- [ ] Grant report narratives: same engine drafts report text + story/stat selection feeding Tongi & Zola's Funder Packages

## Agent 3 — The Morning Portfolio Brief (the Steward, evolved)

Review System B: a portfolio manager that spends Jim's 15 minutes/day optimally (Q10: he's committed to weekly hours for 3-6 months). Nightly Render cron.

- [ ] Cadence rules per Tier x Segment (e.g., Tier 1 personal touch every 60-90 days; thank-you within 48h of any Donation)
- [ ] Sweep (plain query): Tier 1/2 Contacts, open Opportunities, Grants with approaching Deliverables, yesterday's replies
- [ ] Relationship Analyst subagents fan out (cap ~10/night): each reads `contact.history`, returns status + risk flags + ONE recommended next action with a drafted artifact attached (or explicit "no action, and why")
- [ ] Prioritizer: ranks across the portfolio, dedupes against touches already in flight, composes the brief
- [ ] Output: one /operations page each morning — "three things today, seven this week" — each one-tap approve (the draft already exists)
- [ ] Each recommendation type carries its own autonomy level; promotion uses the ADR 0007 instrument
- [ ] /subscribe form on website -> Contact (+ ESP sync) — list growth

## Agent 4 — Funder Research (feeds the Studio's angle selection)

- [ ] Funder Research Agent: per named funder -> crawl own site/annual reports/news/grantee lists + ProPublica 990 API (US) -> Funder Brief incl. language map. (Q9: Jim's real path is quarterly updates -> 12-18mo -> call -> site visit -> funded; e.g. HCI, DGMT. The Brief should serve that cultivation arc, not just the application.)
- [ ] Fit rubric: education / women & girls / children / Africa; R50k-R5M; SA-weighted; stretch flag above R5M
- [ ] Brief feeds: cultivation messaging, ED-intro prep doc, Grant Writer angle selection
- [ ] Optional Candid month workflow: bulk-import candidates -> Opportunities at `identified`
- [ ] Pipeline board in /operations (Opportunities by stage; compliance calendar from Deliverables)

---

## Cross-cutting

- **Autonomy dial** starts at zero everywhere; raised only on ADR 0007 evidence (e.g., "Tier 3 newsletter auto-send eligible at >=95% approve-without-edit over trailing 20 issues"). The dial stops being a metaphor.
- Single LLM provider (Anthropic) v1; thin abstraction, swap later if wanted.
- Costs: Mailchimp (existing), Candid ~1 month at a time when wanted, LLM API usage, social = none (manual posting).
- Risks: Jim's curation time is the bottleneck — protect the named sessions (Excel consolidation, Tier 1 pass, Answer Library day, calendar seeding, metrics session). The self-improving loop is what turns that constant into a declining curve.

## Discovery & validation (do early — de-risks everything downstream)

- [x] **Proposal gap-analysis (Jim's practice-run idea) — FIRST PASS DONE 2026-06-14:** `docs/discovery/grant-number-gap-analysis-2026-06-14.md`. Analysed the 6-funder Q&A corpus + 2024 Reference Guide. Found the numbers don't just lag, they *disagree* (undefined denominators; even 53-vs-54 ECDC within one doc). Output: a 12-number decision list (Part B) Jim must pin = the metrics session's first hour; the ~16 Answer Block themes (Part D); two collect-gaps (disabilities, elderly). GATE: the Part B definitions unblock PublishedStat reconciliation + the `metrics.compute` list + the Answer Library data slots. The framework, for reference:
  - **Expose** — we have the data, no function yet (e.g., youth counts by race/gender) -> build a `metrics.compute` function.
  - **Curate** — we have the number but it's unverified/PROVISIONAL -> a curation pass on `published_stats`.
  - **Collect** — we don't capture it at all (e.g., child race; likely the 29%-youth-re-employment follow-up, which needs post-exit tracking the `Youth` table doesn't hold) -> an upstream Airtable/operational change, or accept we can't report it.
  This one exercise scopes the metrics session, the Studio's data needs, and any data-collection changes at once. Doubles as the first real test of the Studio's value.
- [ ] **Donor CSV review** — import a few workbooks; produces the workbook-anatomy doc (below) and surfaces the householding/dedupe reality.

## Bookmarked for dedicated sessions (Jim's explicit asks)

- [ ] **Metrics / scoreboard / WIG lead measures** (Q3 — Jim wants a full brainstorming session). Candidate lead measures named: applications submitted, newsletters sent, personal emails sent, annual retention %. Lag measures: grants won, money raised, monthly donors. The scoreboard is a by-product of the spine; design the *measures* deliberately, not inline.
- [ ] **Workbook anatomy doc** (Q4) — after Jim imports a few workbooks, produce a `.md` documenting row counts, years, dirt, householding, and cross-workbook duplicates. Feeds the importer + householding decision.

## Deferred by decision (NOT oversight — Jim, 2026-06-13)

The team is compliance-strong; the system is small and will never be a spam factory; in 20 years no one has asked for erasure. These are deliberately out of scope for v1 to protect ROI:

- Right-to-erasure tombstones / GDPR-POPIA content-vs-fact schema split (handle the rare case manually: remove from lists, Jim deletes the record)
- Cross-rail automated suppression machinery (the small list + honorable practice covers it)
- Section 18A / US acknowledgment-letter automation (revisit when receipts volume justifies it; was homework #6)
- Heavyweight backup/restore drills beyond Render's defaults

Revisit any of these if the system grows or a real need appears.

## Code map for build sessions (verified 2026-06-12)

Build sessions should not have to rediscover these. Paths verified against the working tree.

- Backend root: `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/` (Django project `masi_website`; apps `api`, `core`, `dashboards`). New `fundraising` app sits alongside `api`. Run management commands from backend dir with `venv/bin/python manage.py ...`.
- House sync pattern (copy this shape): `api/management/commands/sync_airtable_literacy_sessions_2026.py` — bulk upsert keyed on `source_airtable_id`, logs to `AirtableSyncLog` (`api/models.py`). All content_* syncs follow it.
- **Live data slots already exist:** `PublishedStat` model `api/models.py:1526`; seed command `api/management/commands/seed_published_stats.py` (values currently seeded + many flagged PROVISIONAL); endpoint `/impact/published-stats/`; frontend fetch `src/lib/api/impact/published-stats.ts`; selector `pick(key)`/`group(name)` in `src/lib/api/impact/selectors.ts`; type `src/lib/types/impact.ts`.
- Zazi internal API: client at `api/zazi_client.py`; consumed by `api/management/commands/refresh_zazi_overview.py` and `api/views/wig.py`. Zazi backend repo: `/Users/jimmckeown/Development/Zazi_iZandi_Website_2025/`.
- Frontend /operations conventions: pages at `src/app/operations/` (wig, youth-sessions, closures are good references); Clerk route protection in `src/middleware.ts`; server-side guard `src/lib/masi/auth-guard.ts`; API helpers `src/lib/masi/api.ts`.
- Frontend data pattern: types in `src/lib/types/`, fetchers in `src/lib/api/<domain>/`, SWR with loading/error/success states (CLAUDE.md "API Integration Pattern").
- Database discipline: local `DATABASE_URL` is a partial snapshot; analyse against prod read-only via `EXTERNAL_DATABASE_URL` (never set prod as `DATABASE_URL`). Fundraising tables are PII: excluded/sanitized from local snapshots per ADR 0002.
- Plan reviews in `docs/plan-reviews/`; this plan's review (with Jim's answers): `agentic-fundraising-improvement-review-2026-06-12.md`.

## Homework (Jim) — revised given his answers

1. [ ] Import a few donor workbooks -> then we produce the workbook-anatomy `.md` (Q4)
2. [ ] Mailchimp export or API key
3. [ ] Airtable marketing base ID (`app...`) + confirm token can read it
4. [ ] 2-3 high-open-rate direct emails -> seeds the **Voice Guide** (Q2: no one drafts for Jim today, so this is the calibration source)
5. [ ] 3-5 past proposals incl. a winner and a loser -> Answer Library distillation
6. [ ] Funder-name CSVs/Excels
7. [ ] Draft Tier 1 list (the 15-40 names)
8. [ ] Book two sessions: the **metrics brainstorm** (Q3) and the **Answer Library curation day**

_Deferred from rev 1 homework: 18A/receipt-practice confirmation (see "Deferred by decision")._

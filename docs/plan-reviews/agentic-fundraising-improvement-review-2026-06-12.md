# Improvement Review: Agentic Fundraising System Plan

Reviewed: `_plans/agentic-fundraising-system.md`, `CONTEXT.md`, `docs/adr/0001-0005`, project memory.
Date: 2026-06-12. Purpose: rank-ordered improvements, two next-level agentic system sketches, and ten questions whose answers would produce a better plan. This is an iteration document, not a blocking adversarial review — the plan's architecture is sound; these are the gaps that will hurt most if left until they hurt.

## Verdict in one paragraph

The spine-and-edges architecture, draft-only writes, and Answer-Library-not-RAG decisions are right and well-reasoned. The plan's weaknesses are not architectural — they are missing feedback loops and missing capture paths. It builds a system that *produces* drafts and *records* sends, but never measures the gap between them (so the autonomy dial has no instrument), only hears about relationships through email (so the Steward will run on false data), and treats identity as a one-time import step rather than a continuous discipline (so the ledger quietly degrades). All five improvements below are cheap if designed in now and expensive to retrofit.

---

## Top 5 improvements, rank ordered

### 1. Capture the edit, not just the approval — instrument the learning loop

**The gap.** Every flow ends at "Jim approves and sends; send logs an Interaction." The diff between the agent's draft and what Jim actually sent is discarded. That diff is three things at once: the training signal for voice, the only honest evidence for raising the autonomy dial, and the measure of whether Jim's review burden is shrinking or static.

**Why this is #1.** The plan names its own top risk — "Jim curation time is the bottleneck" — and this is the only mechanism that turns that constant into a declining curve. The cross-cutting decision "autonomy dial starts at zero; raising it is an explicit later decision" currently has no defined evidence for *when* raising is justified. Without edit capture, that decision will be made on vibes in eight months. The data is nearly free to collect (the Gmail sync already reads sent mail; the Mailchimp API already exposes the final campaign body) but only if draft bodies are stored with stable IDs from day one — the early signal is unrecoverable later.

**Plan deltas.**
- Phase 0 schema: every draft artifact keeps `draft_body`, and after send the sync attaches `sent_body`. One table, two text columns, a diff is computable forever after.
- Per-agent metrics from the first send: approve-without-edit rate, edit magnitude, edits classified (voice / facts / structure / killed-entirely) — classification itself is a cheap agent task.
- Make dial promotion criteria explicit in the plan, e.g. "Tier 3 newsletter auto-send becomes eligible when approve-without-edit ≥ 95% over trailing 20 issues."
- Quarterly voice recalibration: the accumulated diffs become the input that updates the voice guidance, the same way accepted grant answers feed the Answer Library (the plan already has this loop for grants — generalize it to every drafting agent).

### 2. Promote identity to a first-class subsystem — merge discipline and the Excel cutover

**The gap.** One checklist line covers dedupe at import time ("fuzzy match -> review queue, not auto-merge" — correctly avoiding the worst footgun). But Contact creation is continuous, not one-time: four workbooks, Mailchimp, funder CSVs, the Gmail sync, the Phase 2 /subscribe form, and manual entry all mint Contacts. Nothing governs identity after week one.

**Why this is #2.** Every downstream agent reads through identity: Steward cadence math, receipts (a Section 18A certificate issued to a duplicate identity is a compliance problem, not a cosmetic one), the scoreboard, and "what has this funder already seen." A wrong merge thanks the wrong person for the wrong gift and is nearly undetectable later. The plan's own general-ledger metaphor makes the demand precise: ledgers never destroy — a merge is a journal entry, reversible and audited, not an UPDATE.

**Plan deltas.**
- Phase 0: merges are soft — a merge log (who merged what into what, when, why) with an unmerge operation. Survivorship rules written down (which email/name/segment wins on conflict).
- Phase 0 decision: householding. Donor workbooks almost certainly contain "Mr & Mrs Smith" rows. One Contact or two linked Contacts? This changes the importer, receipts, and Tier assignment, and is miserable to change after import. (Question 4 below feeds this.)
- Phase 1: ongoing identity candidates — when the Gmail sync sees a new address replying on a tracked Contact's thread, propose (never auto-create) an alias; when /subscribe or a CSV brings an email that fuzzy-matches an existing Contact, queue it.
- Phase 0: the Excel cutover moment, dated and explicit — after import sign-off, the four workbooks are frozen read-only and the /operations donation form is the only entry path. Without a named cutover, dual-write drift quietly poisons the ledger while everyone believes the migration is done.

### 3. Re-sequence for a tracer bullet: one Personal Send end-to-end in Phase 0

**The gap.** Phase 0 is all plumbing; the first agent-visible value arrives mid-Phase 1, gated behind the full Airtable content sync. Meanwhile Gmail OAuth — which the plan's own risk list flags — isn't touched until late Phase 1, and the approval queue UI doesn't appear until Phase 2 even though Phase 1's social assists already reference "an /operations queue."

**Why this is #3.** Two classic failure modes, one fix. (a) Highest-risk integration last: if Gmail scopes/verification turn out painful, you discover it after the content plane is built on assumptions. (b) Benefit-invisible foundations stall: homework-gated plumbing with no felt win is where side-project phases go to die. A tracer bullet — the thinnest possible slice through every architectural layer — proves the contract early and pays Jim something in week one.

**Plan deltas.**
- Add to Phase 0: one Tier 1 Contact entered by hand, agent drafts one personal update (content hand-fed — zero Airtable dependency), Gmail draft created via API, Jim sends from his inbox, sync logs the Interaction with draft and sent bodies stored (which also bootstraps improvement #1).
- This forces the minimal approval surface into Phase 0, resolving the Phase 1 social-queue / Phase 2 approval-queue inconsistency: the queue exists from the start and grows.
- Schema-only work (models, migrations) is not actually homework-gated — only the importer is. Note that in the plan so Phase 0 can start before all eight homework items land.

### 4. Give non-email Interactions a capture path, or the Steward runs on false data

**The gap.** CONTEXT.md defines Interaction to include meetings and calls, but no plan line creates a way to log one. The two rails auto-log email beautifully — and nothing else. Jim's highest-value Tier 1 touches are plausibly calls, coffees, WhatsApps, and conference hallways, all invisible to the spine.

**Why this is #4.** Phase 2's cadence math ("Tier 1 personal touch every 60-90 days") divides by recorded touches. If half of Jim's real touches never land in the ledger, the Steward nags him about a donor he had dinner with last week. He learns to ignore it within a month, and an ignored steward is a dead steward — trust in agent recommendations, once lost, doesn't come back. CRMs don't die because the schema was wrong; they die because logging cost more than it returned. The agentic answer is to make capture nearly free.

**Plan deltas.**
- Phase 1 (not 2 — the data must exist before the cadence rules consume it): quick capture designed for ten seconds, not two minutes. Most plausible shapes: a voice note or two-line message into /operations, or an email-to-self convention (e.g. subject tag) the existing Gmail sync already picks up — the agent parses who/when/what/follow-up into a structured Interaction draft for one-tap confirm.
- The parse-to-draft step is the same draft-only write contract as everything else; no new architecture, just a new inbound shape.
- Question 1 below should design this around Jim's actual last five non-email touches rather than guesses.

### 5. Harden the spine as a permanent institution: consent semantics, suppression, backups

**The gap.** Three items that are schema- or infra-shaped, all missing from Phase 0, all painful to retrofit:

1. **Erasure vs the append-only ledger.** The RSA-EU segment means GDPR plausibly applies to some donors; POPIA applies regardless. "Delete everything about me" collides with a ledger that never deletes. The standard resolution — redact content, keep an anonymized tombstone so aggregates stay true — only works if the schema separates *content* (note text, email bodies) from *fact-of-contact* (an Interaction happened on this date) from day one.
2. **Cross-rail suppression.** A Mailchimp unsubscribe and a do-not-contact request must be visible to the Personal Send drafting path too. Legally the rails are distinct; reputationally they are one relationship. One shared suppression check both rails consult before any draft is created.
3. **Backup posture.** The local-snapshot rule (exclude fundraising tables — correct for PII) means the organization's most irreplaceable data has *fewer* copies than its least sensitive data. Confirm Render PITR/retention for masi_database, write the restore drill down, and add one monthly reconciliation line — spine totals vs bank statement per Receiving Entity, fifteen manual minutes — so the scoreboard the Grant Writer quotes from stays provably honest.

**Plan deltas.** All three become Phase 0 checklist items; (1) is a schema decision, (2) is one model + one check, (3) is a confirmation task plus a recurring calendar line.

### Honorable mentions (one line each)

- **Measure replies, not opens, on the personal rail** — Gmail gives no open data without tracking pixels (don't); ADR 0004's "double open rate" rationale is fine, but the rail's *ongoing* success metric should be reply rate, which the sync already captures.
- **Name the Voice Guide as an artifact** — homework items 4-5 are inputs to something; give the distilled voice a home (spine table or versioned doc) that every drafting agent reads and improvement #1's recalibration updates.
- **Delegate-approval roles** — staff approving Tier 3 social captions is a small addition that removes Jim as single point of failure for low-stakes outputs (and Question 10's travel scenario will demand it).
- **Pledge/expectation modeling** — Phase 2's "recurring donor missed" lapse detection cannot work without a model of *expected* giving; whether that's a Pledge table or a derived cadence depends on Question 5.

---

## Two next-level agentic systems

Both are evolutions of lines already in the plan, not new scope — sketched at the altitude the orchestrator sees. The shared architectural point: **build the tool belt once; agents are cheap to rewrite, tools are the durable asset.** Both systems below call the same small set of spine tools, which is the strongest argument for getting those tools right early.

### A. The Grant Application Studio (next level of Phase 3's drafting tool)

One orchestrated run per application, kicked off from /operations: paste the funder's questions, word limits, deadline, and funder Contact.

**Shared tool belt** (DRF-internal functions the orchestrator exposes to every subagent):
- `answer_library.select(theme, angle)` — blocks with won/lost tags
- `live_stats.fill(slot)` — the only legal source of numbers (PG views + `api/zazi_client.py` reuse)
- `funder_brief.read(contact)` — priorities, sizes, language map
- `content_use.history(contact)` — what this funder has already seen
- `opportunity.context(opp)` — stage, prior Interactions, prior applications

**The run:**
1. **Question Classifier** maps each funder question to library themes — and flags unprecedented questions *on day one*, not in the deadline crunch. Novel questions escalate to Jim immediately while the rest proceeds; this single behavior is worth most of the system.
2. **Per-question Drafters** (parallel, one per question): block + angle chosen from the Funder Brief's language map + live slots filled + compressed to the word limit.
3. **Key Message Auditor**: verifies every Key Message landed somewhere; proposes placements for any that didn't.
4. **Funder's Reviewer** (adversarial): roleplays the programme officer using the Funder Brief — scores the draft against *their* published criteria, flags vocabulary mismatches ("you say learners, they say beneficiaries"), checks the fit rubric.
5. **Fact Auditor**: every number in the final text must trace to a `live_stats.fill` call; any naked number is flagged. ADR 0005's stale-stat firewall, mechanically enforced rather than hoped for.
6. **Assembler**: produces the draft *plus a reviewer's memo* — which answers are weakest, what the adversarial reviewer scored lowest, what was uncertain. Jim reviews a confidence map, not a wall of prose; his attention goes where the system is least sure.

On outcome (won/lost on the Opportunity), the orchestrator's *choices* — which blocks, which angles — get tagged, so the library learns at the level of decisions, not just text.

### B. The Morning Portfolio Brief (next level of Phase 2's daily sweep)

The Steward reconceived as a portfolio manager whose job is to spend Jim's fifteen minutes a day optimally — bounded attention, not generated work. Nightly Render cron, house pattern.

**The run:**
1. **Sweep** (plain query, no agent): every Tier 1/2 Contact, open Opportunities, Grants with approaching Deliverables, yesterday's replies.
2. **Relationship Analyst subagents** fan out — one per contact needing attention, capped at ~10/night. Each reads the full Interaction timeline, giving pattern, last content seen, open threads, upcoming dates, and returns: relationship status, risk flags, and *one* recommended next action with a drafted artifact attached (Gmail draft, call agenda, or an explicit "no action — and why").
3. **Prioritizer agent**: ranks across the whole portfolio against cadence rules and pipeline value, dedupes against touches already in flight this week (no piling on), and composes the brief.
4. **Output**: one page in /operations each morning — "three things today, seven this week" — each with one-tap approve, because the draft already exists.

Each recommendation type carries its own autonomy level, and promotion uses improvement #1's instrument: when thank-you drafts run at ≥95% approve-without-edit over twenty sends, the system proposes raising that one dial — evidence attached. This is the concrete mechanism by which the architecture's "autonomy dial" stops being a metaphor.

---

## Ten questions

Each answer changes a specific part of the plan; the target is named in italics.

1. Walk me through your last five donor interactions that were *not* email — calls, coffees, WhatsApps, conference moments. Where were you, what happened next, and what would capture have to feel like for you to actually do it within a minute? 

I had lunch with a donor. I had a google meet call with a donor, these notes were captured by an AI. I've had a couple whatsapps with donors, but most of the time it is indeed email. Perhaps a transcribed voicenote would be easiest to capture.

2. When someone else has drafted in your voice before — staff, a consultant, a board member — what did you find yourself fixing? Pull one real before/after if you can. 

No one drafts things for me right now, but I love the idea of a highly personalized voice guide.

3. What does "this system is working" mean in twelve months, as numbers — raised per entity and currency, retention rate, new Tier 1 relationships? And in WIG terms: what is the *lead* measure for fundraising, the thing you can influence weekly?

Excellent question and I'd like to bookmark this for an entire brainstorming session. The lead measures that immediately come to mind are applications submitted, newsletters sent, personal emails sent, annual donor retention %. Ultimately, grants won, money raised, and monthly donors are critical stats. We have such lower hanging fruit and do so little fundraising right now, that those newsletters should drive huge results.

4. Anatomy of the four workbooks: roughly how many rows, which years, and the dirtiest things you know are in there? Specifically — do couples/households appear as one row or two, and do any donors appear in multiple workbooks under different names or emails? 

I will import a few. Let's make a note to create a .md that documents them.

5. Who gives on a promise today — monthly debit orders, annual pledges, multi-year commitments? Where is each promise written down right now?

These are really just our annual contracts with funders and monthly donors.

6. If a donor wrote "delete everything you have about me" tomorrow, what do you want to be true — and what must *stay* true for your books and receipts? Separately: should a Mailchimp unsubscribe also stop personal emails from your own mailbox? 

No one, in 20 years, has ever asked me to do this. So I think removing them from contact lists and then I'll personally delete them from the records (i.e. email address csv right now). I'm not concerned about this as it almost never happens, I want to focus on the main 90% now and deal with edge cases later.

7. Who besides you touches this system in year one — Tongi and Zola, staff drafting grant answers, anyone entering donations or approving anything? For each: read what, draft what, approve what? 

Yes, if we get the grant writing studio up, Zama (our Executive Director) and Zola (our COO) will be using it with me. Tongi is our graphic designer.

8. List the ten numbers you quote most in newsletters and proposals. For each: where does it truly live today — Masi PG, the Zazi backend, Airtable, a spreadsheet, or someone's head?

Check out the new /impact page we just created. It highlights the major statistics. In general, I quote 3-4 child learning statisticis (the big one's being our children are 2 years ahead of control groups with reading scores and we double the number of children hitting reading benchmarks in every classroom we enter). I often discuss the number of jobs we create for unemployed women (around 400 a year) and the number of university graduates we have eithe per anum (around 50) or overall (over 500 right now). Occassionally, we'll mention that 29% of the youth we give a first job to go on to get another job within the first 12 months.

9. Pick one real funder you cultivated all the way to an ED intro: replay the journey step by step — artifacts, durations, who moved it, where it nearly died. And for one lost grant: was the application itself the reason?

I've reached out to a few funders via email, basically sending quarterly updates about our work. I did this with the HCI foundation and DGMT. After 12-18 months, they started engaging a bit. Then invited us to join a call. Then visited us on the ground. Then funded us.

Donors we've lost are almost always due to us not communicating enough, sort of taking them for granted to be honest.

10. Once running, what is your honest weekly budget for this system — minutes, not hopes — across approving, curating, and logging? And when you travel for three weeks, what must keep working without you?

I'll have to think about this, but for the first 3-6 months, I'm committed to contributing hours every week to get this right. Especially the feedback loop part where the system starts to harden and self-improve.

Bonus: I'm not sure how the Hermes agent does it, but creating a self-improving loop for this system should be top priority.

---

## Context report for future sessions

Writing this review required almost no code excavation — `_plans/agentic-fundraising-system.md` + `CONTEXT.md` + the five ADRs + project memory carried it. A *build* session will need the code map, so it has been added to the plan (`## Code map for build sessions`) with verified paths: backend sync-command house pattern, the Zazi client, AirtableSyncLog, frontend /operations and auth conventions, and the prod-vs-local database discipline.

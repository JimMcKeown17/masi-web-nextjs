# Newsletter Studio: skills-first Layer 2 over the fundraising kernel

Status: agreed 2026-07-09 (brainstorm session, Jim). Decision record: `docs/adr/0009-two-shells-skill-primary-authoring-surface.md`.
Companions: ADR 0006 (Tool Belt), ADR 0007 (self-improving loop), handoff `docs/handoff-2026-07-09-fundraising.md` (carries the copy-v2 rules and template fixes this spec folds in).

## Decision in one paragraph

Layer 2 becomes two thin shells over one kernel. The kernel is the Django `fundraising` app: spine models, Tool Belt services, and a new Editorial Layer of markdown files holding all voice and structure knowledge. Shell 1 (primary) is the `masi-newsletter` skill grown into the Newsletter Studio: any source, any issue type, Jim in the loop. Shell 2 is the `draft_newsletter` cron, kept as the organization-owned headless path, reading the editorial files as deployed (deploy = version pinning, so session experiments never leak into scheduled sends). The kernel is channel-agnostic: newsletter is the first built renderer, not the design's boundary.

## Design

### Kernel

- Spine: existing 10 models. `Draft` records every composed artifact from either shell (`kind`, `created_by_agent`, `draft_body`, later `final_body`).
- Tool Belt: existing `photos.py`, `email_template.render_email`, `mailchimp.py`, Airtable sync, plus the two additions below.
- Editorial Layer, in `fundraising/voice/` (existing canonical location, no churn):
  - `voice_guide.md` (exists): gains the copy-v2 rules (quote adds new info; donor "you" in first ~150 words; one direct ask, P.S. reinforces it; US phrasing; never-fabricate nuances per the handoff).
  - `structure-story.md` now; `structure-results.md`, `structure-appeal.md`, `structure-news.md` written when each type is first sent. Each states: what leads, what supports, where stats belong and which kinds suit this audience, where the ask sits. Single-story is the default in `structure-story.md`; the feature-plus-mini-cards variant lives there as a named option.
  - `qa_checklist.md`: pre-show-Jim check (names, pronouns, schools, stats sourced from catalog, child sounds distinct, donor in the story, one ask).
- Both shells read these files. `compose.py` keeps no editorial text of its own.

### Tool Belt additions

- Stats catalog (read-only): the Studio fetches the existing public `/api/impact/published-stats/` endpoint (12 pinned canonical numbers with methodology notes). Rule stated in structure files: stats may be woven in where they strengthen the story; every number must come from the catalog. `metrics.compute` joins the same catalog surface when built; the shells do not change.
- `record_and_draft` management command: takes subject, body-HTML file, `Draft.kind` (default `newsletter_broadcast`), source metadata (shell: studio or cron; source type: airtable, voice_note, instagram, stats_brief; story ids). Writes the Draft row and creates the Mailchimp draft campaign in one transaction. Becomes the only Tool Belt path to Mailchimp; the Studio's `manage.py shell` one-liner and any direct `create_draft_campaign` call sites migrate to it.

### Shell 1: the Newsletter Studio (skill)

Workflow: source, channel (default newsletter), type, draft, iterate, record.

1. Source: Airtable story by name or id; photos plus voice note or typed notes; an Instagram post (Jim pastes the URL and/or drops the asset; captions readable via browser; originals usually already in Drive); or a brief ("stats-led issue about the midline results").
2. Type: the skill infers one of the four issue types and confirms in one line.
3. Draft: read voice guide plus the type's structure file; optionally pull the stats catalog and weave in at most a couple; write body HTML; assemble via `render_email`; send Jim the rendered file.
4. Iterate: Jim's feedback is classified in-session as one-off edit (fix this draft) or durable rule (write into voice guide or structure file now). This is ADR 0007's generative direction running live.
5. Record: on approval, `record_and_draft` writes the spine row and creates the Mailchimp draft (never sends). One-offs stop being invisible to the loop.

### Shell 2: the cron

`draft_newsletter` stays: single-story default, organization-owned, delegable, runs from deployed code. `compose.py` shrinks to plumbing (load editorial files, build story payload, call model, validate, return subject and body). The Editorial Campaign Calendar (Layer 2, designed not built) later becomes this shell's brain: when to draft what type for which segment.

### Self-improving loop, per shell

Draft rows carry shell and source type. Final-body sync-back works identically for both shells. Approve-without-edit metrics are computed per shell; autonomy-dial promotion evidence comes from the cron shell only (its generator is frozen between deploys, so the statistic means something).

### One story, many channels (name the seam, build nothing)

The story is the atom; newsletter issue, Personal Send, LinkedIn post, social caption are renderings for a channel x audience pair. Per-channel variation lives in swappable parts: one structure file per channel (LinkedIn is funder-voiced), one renderer per channel, audience-aware stat selection guidance in the structure file. Constant parts live in the kernel. `Draft.kind` already enumerates channel artifacts; new kinds are a one-line choices change when needed. Boundaries kept: Mailchimp email is the only built renderer for now; nothing outside `render_email` and the Mailchimp client may assume email; social remains propose-only (drafts feed the Content Calendar's "Proposed by AI" rows; staff post).

### Surfaces (decided 2026-07-09, Jim's question)

The Studio runs in Claude Code (terminal, desktop app, or claude.ai/code web app; same skill, no build) for now. The compounding loop lives in the kernel (editorial files, Draft diffs, Voice Guide), not in the surface, so any future surface that reads and writes the kernel inherits all accumulated learning. A website surface, if ever built, is a third shell and most likely a *review/approve* page over pending Drafts (small build, team-usable), not an authoring chat (that would rebuild Claude Code in Next.js and freeze the workflow before the loop has taught us what it is). Pattern: learn in the flexible medium, sediment stable behavior down into editorial files, tools, and eventually UI. Trigger for building the review page: drafts flowing to channels Mailchimp doesn't cover, someone other than Jim authoring/reviewing, or the autonomy dial rising enough that Jim's role is review-only.

### Guarantees

Never-send: the belt has no send function, only draft creation. Never-fabricate: voice guide plus QA checklist, both shells. Numbers only from the stats catalog. Photos through the existing GCS pipeline (curated `heroes/`, one-offs `oneoff/`). Template chrome stays deterministic code.

### Testing

Tools stay TDD'd (template fixes, `record_and_draft`, compose plumbing; 41 existing tests stay green). Editorial markdown is not CI-testable; its check is the QA checklist at composition time plus Jim's review. Strict where unattended, loose where watched.

## Build checklist

Stage 1: extract the Editorial Layer (folds in the queued copy-v2 work)
- [ ] Fold critique rules from the 2026-07-09 handoff into `voice_guide.md`
- [ ] Write `structure-story.md` (single-story default; mini-cards variant named)
- [ ] Write `qa_checklist.md`
- [ ] Template fixes in `render_email` (TDD): tighten logo top margin; cap photo widths lead ~480px / inline ~420px, centered, no crop; second CTA after lead story or stat

Stage 2: mechanical spine recording
- [ ] Build `record_and_draft` command (TDD): Draft row + Mailchimp draft in one transaction; `--kind` default `newsletter_broadcast`; shell + source metadata (shell fits `created_by_agent`; source type + story ids likely need a small `source_meta` JSONField on Draft, decide at build time)
- [ ] Migrate `draft_newsletter` and the one-off script path to it; remove direct `create_draft_campaign` call sites

Stage 3: shrink the pipeline to plumbing
- [ ] Move all editorial text out of `compose.py` `_system_prompt`; read voice guide + structure file instead
- [ ] Tests green; live `--dry-run` render compared before/after

Stage 4: upgrade the skill into the Studio
- [ ] Rewrite `masi-newsletter` SKILL.md around source/channel/type/draft/iterate/record; keep the assemble script for photo handling
- [ ] Add stats-catalog fetch + weave guidance
- [ ] Add the rule-vs-one-off feedback classification step (writes durable rules into editorial files in-session)
- [ ] Wire `record_and_draft` as the ending step
- [ ] First live run on a real one-off (skill is still untested end-to-end by Jim)

Deferred (unchanged from backlog): `metrics.compute` exposure; video pattern 1 (poster + play button); nightly hero cron; Editorial Campaign Calendar; LinkedIn/social structure files and renderers; team's 10 Airtable link fixes.

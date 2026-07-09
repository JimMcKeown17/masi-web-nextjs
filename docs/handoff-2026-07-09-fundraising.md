# Handoff: Agentic Fundraising, session 2026-07-09

For a fresh agent continuing the fundraising build. This is the DELTA since the prior handoff
`docs/handoff-2026-07-07-fundraising.md` and the committed artifacts; it does not repeat them.

**Read first:** the prior handoff (above), project memory `project_agentic_fundraising.md` (updated
this session with full hero-photos + newsletter-template facts), then the specs/plan/ADR referenced
below. Glossary `CONTEXT.md`.

## What this session shipped (all committed, nothing pushed)

Two repos, two branches, both working trees clean:
- **Backend** `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/`, branch
  `feature/fundraising-spine`, HEAD `c57a9b1`. Run cmds from here with `venv/bin/python`.
- **Frontend worktree** `frontend/worktrees/agentic-fundraising/`, branch `feature/agentic-fundraising`,
  HEAD `a209136` (docs + the new skill).

1. **Story hero photos — BUILT + BACKFILLED, live.** Full pipeline (Drive read -> vision pick ->
   optimize -> GCS). Design: `_plans/fundraising-hero-photos-spec.md` + `_plans/fundraising-hero-photos-plan.md`
   + ADR 0008 + setup `docs/fundraising-photo-pipeline-setup.md`. Code: `fundraising/services/photos.py`,
   `photos_report.py`, cmd `backfill_story_heroes`. **Result: 77 optimized heroes** (~120-285KB JPEG)
   live+public at `gs://masi-website/fundraising/heroes/<source_airtable_id>.jpg`; `ContentStory.hero_image_url`
   set (local masi_db only). 10 problem links remain = TEAM Airtable fix (2 `/drive/search?q=` URLs +
   8 video/no-photo). Full detail in memory.
2. **Newsletter template — BUILT (TDD, commit `c57a9b1`).** Photos now appear in Mailchimp drafts.
   Deterministic chrome (`fundraising/services/email_template.py` `render_email`) around the model body:
   logo header + lead hero + inline story photos + donate CTA (`--cta-text`/`--cta-url`) + social footer;
   first-names-only rule in prompt + `voice_guide.md`. 41 fundraising tests green.
3. **`masi-newsletter` skill — FIRST STAB (commit `a209136`).** One-off newsletter from a photo +
   voice note/notes, outside Airtable, reusing the same template/voice/GCS. `.claude/skills/masi-newsletter/`.
   Verified end-to-end. v2 limits noted in memory (voice-note transcription, backend-path coupling, video).

## THE NEXT TASK (what Jim wants built next): newsletter copy + structure v2

Jim reviewed the first rendered draft (subject "Zeniqhame, Lungile, and Lisolethu are learning to read")
and got a second-agent critique. **Core decision (Jim, 2026-07-09): go SINGLE STORY per newsletter**
(not 3 parallel child profiles — they read "samey / AI-assembled"). Make the single story stronger by:
- **(a)** richer single story: more photos of the child, and/or commentary on their **Literacy Coach**; and/or
- **(b)** weave **programme-level backend stats** into the copy (like the existing "19,444 children"
  scale stat, add e.g. "in the last six months, kids averaged X gains") via `metrics.compute` /
  `PublishedStat`. See memory for the metrics work + the 12 pinned canonical numbers.

**Per-child progress data — context Jim gave:** he HAS every child's results (the /impact data portal
explores any child + makes compelling visuals, but those visuals are NOT for newsletters). Wiring
per-child data INTO the Airtable Success Stories is blocked because the marketing team doesn't know
kids' `mcode`/primary keys; Jim could supply them but wants to avoid that friction. So lean on
**programme-level stats (b)** first; per-child stat wiring is a friction-y later option.

### Copy rules to fold into `voice_guide.md` + `_system_prompt` (agreed, with 2 safer wordings)
From the critique (full text is in this session's transcript; the good parts):
- Quote must ADD new info, never restate its paragraph. Quotes 1-2 sentences, sound like a real coach.
- Put donor "you" in the first ~150 words; connect donor to impact early.
- ONE direct ask (monthly-donor ask); P.S. reinforces the SAME idea (our template button backs it).
- Tighter opening; US-donor phrasing ("learning with Masinyusane," not "on programme").
- Copy edits: "At just five years old", "new to the MasiLit programme", stat as "learning with Masinyusane".
- **QA checklist** (names/pronouns/schools/stats correct; child sounds distinct; donor in the story; ask direct).
- **NUANCE I flagged (keep this):** two suggestions fight our never-invent rule. (1) "unique signature
  detail per child" only works if the detail is IN the source story; if the Airtable narrative is thin,
  keep it short, do NOT fabricate (root fix = richer source capture, which the voice-note idea helps).
  (2) Do NOT use "mastered the first three letter sounds introduced" (assumes curriculum facts) — use the
  safe "a strong grasp of the letter sounds she's learned so far." This is the self-improving loop
  (ADR 0007) in action: this critique is an edit-capture that should feed the Voice Guide.

### Template fixes (render_email)
- **Logo whitespace too tall** (Jim + critique): tighten the top margin so the story starts sooner (mobile).
- **Photo height:** portrait heroes tower (Jim's screenshot). Partly a review artifact (his browser is
  ~2000px wide; email column is ~600px), but still cap **lead ~480px / inline ~420px** max-width, centered.
  Do NOT crop (Outlook ignores object-fit; risks cutting faces). v2: store each hero's aspect ratio at
  backfill time -> orientation-aware widths (portrait narrower, landscape wider).
- **Second CTA** after the lead story or the stat (mid-email button lifts clicks).

### Structure
- Single-story layout is now the default. Keep the code able to do a short "feature + mini-cards" variant
  later, but Jim wants single-story now. (Which format for which audience is really a Layer-2 editorial-
  calendar decision.)

## Other open threads
- **No Mailchimp draft was created this session** — the newsletter was `--dry-run` only (local HTML +
  Draft row id 5 in masi_db). To review in Mailchimp, run `draft_newsletter` WITHOUT `--dry-run`
  (creates a draft campaign, status save, never sends). Jim asked "where is the draft"; answered.
- **Video reels:** Jim wants pattern 1 (poster image + play-button linking to the IG reel). No
  iframe/embed works in email; Mailchimp native video block = YouTube/Vimeo only. Deferred to after copy v2.
- **Team:** fix the 10 Airtable links; then re-run `backfill_story_heroes --story <id> --force` for those.
- **Editorial Campaign Calendar** (Layer-2, designed-not-built) and Jim's original **"second big question"**
  (never got to) both still bookmarked.

## Run / verify
```
cd "backend/Masi Web Main" && source venv/bin/activate
DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising            # 41 tests, all green
python manage.py draft_newsletter --count 1 --dry-run --cta-text "..." --cta-url "..."  # single-story dry run
# Draft.objects.latest('id').draft_body holds the composed HTML; heroes are public GCS URLs.
```
GOOGLE_CREDENTIALS + ANTHROPIC_API_KEY + MAILCHIMP_* live in backend `.env`. Codex build path unchanged
(SQLite-verify; Claude runs live) — see prior handoff.

## Suggested skills for next session
- `superpowers:brainstorming` only if the single-story-with-stats shape needs pinning; it is largely
  decided above, so likely go straight to `superpowers:test-driven-development` for the copy/template changes.
- `superpowers:verification-before-completion` + a live `--dry-run` render to judge each change (Jim is a
  pixel-perfectionist; iterate on the rendered HTML).
- `dataviz` is NOT for newsletters (Jim: portal visuals stay out of emails); programme stats go in as copy.

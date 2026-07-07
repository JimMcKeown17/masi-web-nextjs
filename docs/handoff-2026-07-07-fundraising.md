# Handoff: Agentic Fundraising, session 2026-07-07

For a fresh agent continuing the fundraising build. Read this first, then the plan
(`_plans/agentic-fundraising-system.md`), the ADRs (`docs/adr/0001`..`0008`), and the glossary
(`CONTEXT.md`). This doc is the delta since those; it does not repeat them.

## What this session did

Went from "designed but zero code" to a working end-to-end tracer. Built and committed:

- **Layer 1 Spine** (backend `fundraising` Django app): 10 models + admin + migrations. Spec:
  `_plans/fundraising-spine-spec.md`. Committed on **backend** branch `feature/fundraising-spine`
  (commit `97541f1`).
- **Layer 2 Agent 1 "Content Pipe" v1**: Airtable Success Stories -> `ContentStory` mirror ->
  Anthropic compose (reads the Voice Guide) -> `Draft` row -> Mailchimp draft campaign. Spec:
  `_plans/fundraising-e2e-tracer-spec.md`.
- **Voice Guide** (`backend .../fundraising/voice/voice_guide.md`): distilled from Jim's 22 real
  samples (11 donor emails, 11 newsletters) that live in Google Drive
  `Masinyusane/Fundraising/Voice/{donor-emails,newsletters}`. Hard rules: never an em dash,
  never an emoji (both read as AI-written to recipients; Jim's explicit rule).
- **Result**: two real Mailchimp draft campaigns exist in Jim's account (audience "All Donors",
  status `save`, 0 sent): web_id 9317461 "Meet three of Masi's youngest readers" and 9317462
  "From Sume Centre to Seoul...". Jim is reviewing them.

Design docs added this session: ADR 0008 (story photos), `docs/fundraising-photo-pipeline-setup.md`.
Frontend design specs committed in the worktree (commit `cc4ebcb`).

## Where the code lives (two repos)

- **Backend** (the system): `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/`,
  app `fundraising/`. Separate git repo, branch `feature/fundraising-spine`, one commit `97541f1`,
  not pushed. Run management commands from the backend dir with `venv/bin/python manage.py ...`.
- **Frontend worktree** (design docs, future `/operations/fundraising` UI):
  `frontend/worktrees/agentic-fundraising/`, branch `feature/agentic-fundraising`.

## How to run the pipe (Claude runs this live; see gotcha below)

From the backend dir, venv active. Local DB is Postgres `masi_db` (a snapshot; safe to experiment):

```
venv/bin/python manage.py migrate fundraising
venv/bin/python manage.py sync_airtable_success_stories --verbose   # Airtable -> ContentStory (92 stories)
venv/bin/python manage.py draft_newsletter --dry-run --n 1 --count 3 # compose only, inspect Draft.draft_body
venv/bin/python manage.py draft_newsletter --n 2 --count 3           # create 2 Mailchimp DRAFT campaigns
```

## Environment and infra notes

- Backend `.env` now has: `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID_ALL_DONORS`,
  `ANTHROPIC_API_KEY`, `AIRTABLE_MARKETING_BASE_ID=apprR44Rwh0vOXixg`,
  `AIRTABLE_SUCCESS_STORIES_TABLE_ID=tblO69wdduYkgKFRY` (Jim first put these in the frontend
  worktree `.env.local` by mistake; they were moved to the backend `.env`). Also
  `AIRTABLE_QUOTES_ABOUT_CHILDREN_TABLE_ID` is set but unused so far.
- `anthropic` is installed in the backend venv and added to `requirements.txt`. Model constant
  in `fundraising/services/compose.py` is `claude-sonnet-5` (verified it resolves).
- **Codex build path**: this session used `/codex:rescue` for all backend building. Two setup
  facts to remember: (1) Codex's sandbox is rooted at the frontend worktree, so it could not
  write the backend until Jim added `[sandbox_workspace_write] writable_roots=["/Users/jimmckeown/
  Development/Masi_Website_2026/backend/Masi Web Main"]` to `~/.codex/config.toml`. (2) Codex's
  sandbox cannot reach local Postgres or the network, so it verifies on SQLite
  (`DATABASE_URL=sqlite:///db.sqlite3 ... manage.py test fundraising`); the orchestrating Claude
  runs the live syncs and Mailchimp calls.

## Gotchas / decisions

- **Consent gate REMOVED** (Jim, 2026-07-07): the assembler no longer filters on `has_consent`.
  Consent forms are not tracked in the Airtable table (only 8 of 92 stories had one attached), so
  consent is assumed for all children/youth for now. Revisit: use "Social Media Published = Yes"
  as a cleared-for-use proxy, or track consent properly.
- **Story selection**: `draft_newsletter` selects `is_active=True`, excludes empty-narrative rows,
  orders by `date_published` desc `nulls_last` (undated empty stubs were sorting first in Postgres).
- **Never em dash, never emoji** in composed copy (enforced by the Voice Guide, verified in output).
- **DB discipline**: local `DATABASE_URL` is a Postgres snapshot; analyse prod read-only via
  `EXTERNAL_DATABASE_URL`. Never migrate/experiment against prod.
- Nothing is deployed. Backend branch not pushed; the fundraising tables exist only in local `masi_db`.

## Open items / next steps (rough priority)

1. **Hero photos (Jim calls this critical for removing friction).** ADR 0008 +
   `docs/fundraising-photo-pipeline-setup.md`. Jim's blocker checklist: enable the Drive API,
   share the top-level Drive photos folder with the GCS service account email. Then build the
   backfill command: Drive Link -> folder -> vision-pick one hero on thumbnails -> copy to GCS ->
   store `ContentStory.hero_image_url` (a new field to add). Newsletters then embed it.
   NB: Masi's Drive is under `mckeown.james@gmail.com`, GCS project under `jim.mckeown@masinyusane.org`;
   the service-account-email share bridges them.
2. **Jim had "a second big question"** he did not get to. Ask him.
3. Extract the inlined selects/logic in `draft_newsletter` into real Tool Belt functions
   (ADR 0006): `content.unused_stories`, `published_stats.pick`, `draft.create`, `mailchimp.*`.
4. Wire the self-improving loop (ADR 0007): capture `final_body` when Jim sends, run
   `edit_capture.classify`, feed the Voice Guide.
5. Grant Application Studio (Jim's favourite second agent, ADR 0005): Answer Library from ~20-40
   past proposals; live data slots already exist as PublishedStat.
6. `/operations/fundraising` UI (deferred at Increment 1; admin is the current surface).
7. Push/deploy decision for the backend branch when ready.

## Suggested skills for the next session

- `superpowers:brainstorming` before scoping a new capability (e.g. Grant Studio, the photo
  backfill) if the shape is not already pinned in a spec.
- `codex:rescue` for backend building (Codex is set up and sandbox-configured); remember the
  SQLite-verify / Claude-runs-live split above.
- `superpowers:verification-before-completion` and running the live pipe to confirm behaviour.
- `grill-with-docs` if refining the plan against CONTEXT.md and the ADRs.
- `frontend-design` when building the `/operations/fundraising` UI.

## Fast context recovery
Project memory `project_agentic_fundraising.md` was updated this session with the same facts.
The two Mailchimp drafts and the composed copy are the proof the pipe works; open them or re-run
the dry run to see current output.

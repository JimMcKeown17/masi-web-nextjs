---
name: masi-newsletter
description: The Masi Newsletter Studio, the primary authoring surface for Masinyusane donor newsletters (ADR 0009). Compose an issue from any source, an Airtable Success Story, photos plus a voice note or typed notes, an Instagram post Jim loves, or a stats-led brief, in Masi's voice and email template, ending with a spine Draft row and a Mailchimp draft. Use when Jim wants to draft a Masi newsletter or donor email, mentions a one-off, a voice note, repurposing an Instagram post, or a stats-led donor update.
---

# Masi Newsletter Studio

Compose donor-facing Masi newsletters with Jim in the loop. The kernel (Django
`fundraising` app) owns the guarantees: template chrome, voice and structure rules,
stats catalog, spine recording, draft-only Mailchimp writes. This skill is a thin
shell that composes those assets (docs/adr/0009 in the frontend repo).

Paths (Jim's machine):
- Backend: `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main`
  (override with `MASI_BACKEND_DIR`). Run backend commands from there with `venv/bin/python`.
- Editorial Layer (read ALL that apply before writing a word):
  `<backend>/fundraising/voice/voice_guide.md` (voice, hard rules),
  `<backend>/fundraising/voice/structure-<type>.md` (issue shape),
  `<backend>/fundraising/voice/qa_checklist.md` (pre-show check).
- Stats catalog (the ONLY permitted source of numbers beyond the source story):
  `GET https://masi-website-main.onrender.com/api/impact/published-stats/` (public JSON).

## Workflow: source, channel, type, draft, iterate, record

1. **Source.** Jim brings one of: an Airtable Success Story (look it up in local PG:
   `ContentStory` via `venv/bin/python manage.py shell`, it carries narrative, quote,
   school, and a hosted `hero_image_url`); photo file(s) plus a voice note or typed
   notes (transcribe audio, or ask for a transcript); an Instagram post (ask for the
   URL and the original asset, read the caption via the browser if needed); or a brief
   ("stats-led issue about X"). The FIRST photo is the lead unless a story hero exists.

2. **Channel.** Default and only built channel: newsletter (Mailchimp). If Jim asks for
   another channel artifact (LinkedIn post, social caption), draft text only and remind
   him socials are staff-posted, propose-only; do not invent new renderers.

3. **Type.** Infer which issue type fits and confirm in one line: child/youth story,
   results/impact update, campaign/appeal, or news/milestone. Read the matching
   `structure-<type>.md`. If that structure file does not exist yet, design the shape
   WITH Jim in-session, then write the new structure file to the Editorial Layer before
   drafting (that is how the system learns; keep it one page, in the style of
   `structure-story.md`).

4. **Draft.** Read the voice guide and structure file, then write the newsletter BODY
   as inline-styled HTML to `body.html`, following them exactly. Composition contract
   (mechanical, must match the template code):
   - Body only: no logo, donate button, social links, or lead photo (chrome adds them).
   - Non-lead photos embed inline, full width, as
     `<img src="FILENAME_OR_URL" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;margin:12px auto;border-radius:8px;">`
     (local filenames get rewritten to hosted URLs by the assemble script).
   - `<!--MID_CTA-->` marker only in longer issues, per the structure file; short
     single-story issues get no marker (one bottom button).
   - Stats: fetch the catalog first if the issue wants numbers; weave at most one or
     two, as sentences, per the structure file. Tell Jim which stat keys you used.
   - Charts: `<backend>/fundraising/voice/chart-library.json` holds curated, hosted,
     email-safe chart images. If one matches the story's programme, embed at most one
     (full-width img + its exact caption as a small gray line), per the structure file.
     Never screenshot or build a new chart for an issue; to add one to the library,
     host it under `fundraising/assets/charts/` on GCS and add a manifest entry with
     Jim's sign-off.
   - Run every line of `qa_checklist.md` against the draft and fix failures BEFORE
     showing Jim.

5. **Assemble and show.** From `<backend>` with its venv:
   ```bash
   venv/bin/python "<this-skill>/scripts/assemble_newsletter.py" \
     --photos "extra1.jpg" --lead-url "https://storage.googleapis.com/masi-website/fundraising/heroes/<id>.jpg" \
     --body-file body.html --cta-text "..." --cta-url "..." --out newsletter.html
   ```
   Use `--photos` for new files (first becomes lead if no `--lead-url`); use
   `--lead-url` when the story already has a GCS hero. Send Jim `newsletter.html`
   rendered, and iterate. Save the final render to the frontend repo's
   `docs/renders/YYYY-MM-DD-draft-<id>-<subject-slug>.html` (id from step 7) so Jim
   can reference it later.

6. **Iterate: classify the red pen.** For each piece of feedback decide: one-off edit
   (fix this draft only) or durable rule (should change every future draft). Write
   durable rules into `voice_guide.md` or the structure file immediately, tell Jim
   what you added, and apply it to the draft. Never leave a durable rule only in the
   conversation.

7. **Record (on Jim's explicit approval).** Every approved draft lands in the spine;
   there is no bypass:
   ```bash
   venv/bin/python manage.py record_and_draft \
     --subject "..." --body-file newsletter.html \
     --shell studio --source-type <airtable|voice_note|instagram|stats_brief> \
     [--story-ids <id> ...] [--no-mailchimp]
   ```
   This writes the Draft row and creates a Mailchimp draft campaign (status save,
   NEVER sends) in one transaction. Use `--no-mailchimp` only if Jim wants to paste
   the HTML himself; the Draft row is still required.

## Boundaries
- Never send email from anywhere; Mailchimp drafts only, and only via `record_and_draft`.
- Every number comes from the stats catalog or the source story. No exceptions.
- Voice and structure rules live in the Editorial Layer, never in this file. If a rule
  seems missing, add it there, not here.
- One-off photos upload to `gs://masi-website/fundraising/oneoff/`; curated story
  heroes stay under `heroes/`.

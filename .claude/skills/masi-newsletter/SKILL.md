---
name: masi-newsletter
description: Create a one-off Masinyusane donor newsletter from a photo and a voice note (or typed notes), in Masi's voice and email template, without going through Airtable or the fundraising system. Use when Jim wants to quickly draft a Masi newsletter or donor email for a story not yet entered in Airtable, or mentions a one-off newsletter, a voice note, or a quick email with a photo.
---

# Masi one-off newsletter

Produce an email-ready Masi donor newsletter from a photo (or a few) plus a short
story, when the story is not in Airtable yet. The copy is written in Masi's voice;
the photos are hosted on GCS and wrapped in the same email template the fundraising
system uses (logo header, lead photo, inline photos, donate button, social footer),
so a one-off looks identical to a system issue.

Paths (Jim's machine):
- Backend (reused code + `.env` with `GOOGLE_CREDENTIALS`): `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main` (override with `MASI_BACKEND_DIR`). Run the script with its venv: `venv/bin/python`.
- Canonical Voice Guide: `<backend>/fundraising/voice/voice_guide.md` — read it before writing.

## Workflow

1. **Gather inputs.** Ask for: the photo file(s) (the FIRST is the lead/header photo), and the story as either a voice-note audio file or typed notes/bullets. If given audio, transcribe it; if you cannot transcribe in this environment, ask Jim to paste a transcript or a few bullets.

2. **Read the Voice Guide** at `<backend>/fundraising/voice/voice_guide.md` and follow its hard rules.

3. **Write the newsletter BODY** as inline-styled HTML, in Masi's voice, and save it to `body.html`:
   - Greeting ("Dear Masi Friends & Family,"), the story from the notes/transcript, a brief donate ask, and a warm thank-you close with a monthly-donor P.S.
   - **Hard rules:** use ONLY the facts Jim gave (never invent numbers/names/outcomes); refer to any child or youth by FIRST NAME ONLY (never a surname); never an em dash; never an emoji.
   - Do NOT add a logo, donate button, social links, or the lead photo — the template adds those.
   - For any EXTRA photos (not the lead), embed them inline under the relevant paragraph as `<img src="EXACT_LOCAL_FILENAME.jpg" alt="" width="600" style="display:block;width:100%;max-width:560px;height:auto;margin:12px 0;border-radius:8px;">`. The script rewrites the filename to the hosted URL.

4. **Assemble** (from the backend dir, with its venv):

   ```bash
   cd "<backend>" && venv/bin/python \
     "<this-skill>/scripts/assemble_newsletter.py" \
     --photos "lead.jpg" "extra1.jpg" \
     --body-file body.html \
     --cta-text "Give the Gift of Reading" \
     --cta-url "https://masinyusane.org/donate" \
     --out newsletter.html
   ```
   The script optimizes each photo (~1600px JPEG), uploads to `gs://masi-website/fundraising/oneoff/`, and wraps the body in the Masi template. CTA text/url default to "Donate" -> the donate page if omitted.

5. **Show Jim** the rendered `newsletter.html` (send it to him to view) and iterate on the copy or CTA.

6. **Optional send.** To create a Mailchimp draft instead of hand-pasting, reuse the backend service in a `<backend>` `venv/bin/python manage.py shell`: `from fundraising.services import mailchimp; mailchimp.create_draft_campaign(subject, html, audience_id, title="[one-off] "+subject)` (draft only, never sends). Otherwise Jim pastes the HTML into a Mailchimp campaign.

## Notes
- The template, voice rules, and photo optimization are the same durable assets as the fundraising system; this skill just feeds ad-hoc content through them.
- One-off photos live under `fundraising/oneoff/` in the bucket (kept separate from curated story `heroes/`).

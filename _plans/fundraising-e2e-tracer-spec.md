# Fundraising E2E Tracer — Increment 2 build spec

The thinnest vertical slice that proves the whole pipe: **Airtable Success Stories -> `fundraising` spine -> Mailchimp draft campaign**, producing a couple of newsletter drafts Jim reviews in Mailchimp. This is Agent 1 (The Content Pipe) stripped to the studs (docs/adr/0003, 0004, 0005, 0006). Depends on Increment 1 (the Spine, esp. the `Draft` model).

Build in the BACKEND repo `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/` on the SAME branch `feature/fundraising-spine`. Same house conventions as the spine spec. Do NOT commit.

## Safety properties (why this is safe to run E2E early)
- The Mailchimp step creates a campaign in **draft status, never sends** (ADR 0003/0004). Worst case is a junk draft Jim deletes.
- Only stories **with consent** are used (Child's Consent Form attachment present).
- Numbers in the copy come **only** from the one provided PublishedStat + the stories' own text; the compose prompt forbids inventing statistics (ADR 0005 in spirit).

## Env (already set in backend `.env`)
`AIRTABLE_TOKEN`, `AIRTABLE_MARKETING_BASE_ID`, `AIRTABLE_SUCCESS_STORIES_TABLE_ID`, `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID_ALL_DONORS`, `ANTHROPIC_API_KEY`.

## Dependencies
- Add `anthropic` to `requirements.txt` (Anthropic Python SDK). Verify the current model id + minimal SDK call pattern against current Anthropic docs before finalizing (do not guess the model string).
- Mailchimp: use plain `requests` (already a dep) — no new SDK, consistent with the Airtable syncs.

---

## Piece 1 — `ContentStory` model (lean mirror; add to `fundraising/models.py`)

`db_table = 'fundraising_content_story'`, ordering `['-date_published']`, standalone `created_at`/`updated_at`, `__str__ -> self.title or self.headline or self.feature_name`.

Field mapping (Airtable field -> model field):
- `source_airtable_id` — CharField(50, unique, db_index) — the Airtable record id; upsert key
- Full Name of Feature -> `feature_name` — CharField(200, blank, default="")
- Title -> `title` — CharField(300, blank, default="")
- Headline -> `headline` — TextField(blank, default="")
- Story Descriptive / Narrative -> `narrative` — TextField(blank, default="")
- Quote -> `quote` — TextField(blank, default="")
- Stats -> `stats_text` — TextField(blank, default="")
- Category (multipleSelects) -> `category` — JSONField(null, blank)  # list[str]
- Child's School (multipleSelects) -> `school` — JSONField(null, blank)  # list[str]
- Date Published (date) -> `date_published` — DateField(null, blank)
- Attachments (multipleAttachments) -> `photo_urls` — JSONField(null, blank)  # list[{"url","filename"}] (see photo note)
- Child's Consent Form (multipleAttachments) -> `has_consent` — BooleanField(default=False)  # True iff >=1 attachment
- Google Drive Link (url) -> `drive_link` — CharField(500, blank, default="")
- Social Media Published (singleSelect) -> `social_published` — CharField(50, blank, default="")
- house soft-retirement: `is_active` — BooleanField(default=True); `last_seen_at` — DateTimeField(null, blank)

**Photo note:** Airtable attachment URLs expire (hours). Store them in `photo_urls` for later, but the tracer newsletter is **text-forward** (headline + narrative + quote + one stat) and does NOT embed Airtable-hosted images (they would 404 when Jim opens the draft later). Durable images (copy hero attachment to GCS via `default_storage`) are the immediate next enhancement, out of scope for this tracer.

Register `ContentStory` in `fundraising/admin.py` (`@admin.register`): `list_display=('title','feature_name','date_published','has_consent','is_active')`, `list_filter=('has_consent','is_active','social_published')`, `search_fields=('title','feature_name','headline')`.

Migration: `makemigrations fundraising` -> `0002_contentstory` (or similar). Then `migrate`.

---

## Piece 2 — `sync_airtable_success_stories` management command

Mirror the house pattern in `api/management/commands/sync_airtable_literacy_sessions_2026.py`:
- Read the three AIRTABLE_* env vars (token via `AIRTABLE_TOKEN`, fallback `AIRTABLE_API_KEY`).
- Paginate all records from the Success Stories table.
- `extract_row(record)` -> ContentStory kwargs:
  - `source_airtable_id = record['id']`
  - map the text fields directly; multipleSelects -> the raw list (JSON); date -> parse_date
  - `photo_urls` = `[{"url":a["url"],"filename":a.get("filename","")} for a in fields.get("Attachments",[])]`
  - `has_consent` = `len(fields.get("Child's Consent Form", [])) > 0`
- Bulk upsert keyed on `source_airtable_id` (fetch existing `.values('id','source_airtable_id')`, split create/update, `transaction.atomic()`, `batch_size=500`); set `last_seen_at = timezone.now()` and `is_active=True` on every upserted row.
- Log to `AirtableSyncLog` (`sync_type='success_stories'`): records_processed/created/updated, `mark_complete`.
- Flags `--dry-run`, `--verbose`.
- (Do NOT hard-retire unseen rows in the tracer; just upsert. Note it as a future guarded step.)

---

## Piece 3 — Mailchimp service (`fundraising/services/mailchimp.py`, plain `requests`)

- Server prefix = the part after `-` in `MAILCHIMP_API_KEY` (e.g. `us21`). Base URL `https://{prefix}.api.mailchimp.com/3.0`.
- Auth: HTTP Basic `requests` `auth=("anystring", MAILCHIMP_API_KEY)`.
- `create_draft_campaign(subject, html, audience_id, *, title, from_name="Masinyusane", reply_to="jim@masinyusane.org") -> dict`:
  1. `POST /campaigns` body `{"type":"regular","recipients":{"list_id":audience_id},"settings":{"subject_line":subject,"title":title,"from_name":from_name,"reply_to":reply_to}}` -> capture `id`, `web_id`.
  2. `PUT /campaigns/{id}/content` body `{"html":html}`.
  3. Return `{"campaign_id":id,"web_id":web_id,"edit_url":f"https://{prefix}.admin.mailchimp.com/campaigns/edit?id={web_id}"}`.
  - The campaign stays in draft/save status (we never call the send/schedule action).
  - Raise a clear error on non-2xx, surfacing Mailchimp's `detail` (e.g. unverified sender) so Jim can fix config.

---

## Piece 4 — Compose service (`fundraising/services/compose.py`, Anthropic SDK)

- `voice_guide.read()` helper: load `fundraising/voice/voice_guide.md` (a starter ships in Piece 6; later distilled from Jim's real samples + improved by the self-improving loop, ADR 0007).
- `compose_newsletter(stories, stat, voice_guide) -> {"subject": str, "html": str}`:
  - System prompt = the Voice Guide + hard rules: write a warm, donor-facing Masinyusane newsletter issue in this voice; use ONLY the facts in the provided stories and the single provided stat; **never invent numbers, names, or outcomes**; output clean inline-styled HTML suitable for an email (short paragraphs, a headline per story, the coach quote as a blockquote); end with a brief thank-you to donors.
  - User content = the N stories (headline, narrative, quote, feature_name, school, category) + the one stat (`value`, `label`, `source_system`, `as_of`).
  - Return `{subject, html}` — request a JSON object `{"subject":...,"html":...}` and parse it (fallback: if parsing fails, wrap the raw text as html and derive a subject).
  - Model: a current, capable Claude model (verify the exact id via current Anthropic docs); make it a module constant so it's easy to change.

---

## Piece 5 — `draft_newsletter` management command (the assembler = Agent 1 v1)

Composition over the Tool Belt (here inlined; later these become real Tool Belt fns):
1. Select stories: `ContentStory.objects.filter(is_active=True, has_consent=True).order_by('-date_published')[:count]` (default `count=3`). If fewer than 1 consented story exists, abort with a clear message.
2. Select one live stat: `from api.models import PublishedStat`; `PublishedStat.objects.filter(is_published=True)` picked by `--stat-key` if given else the first by `sort_order`. If none published, proceed with no stat (compose handles `stat=None`).
3. `compose_newsletter(...)` -> `{subject, html}`.
4. Create a `Draft`: `kind='newsletter_broadcast'`, `status='draft'`, `created_by_agent='newsletter_assembler'`, `subject`, `draft_body=html`.
5. `mailchimp.create_draft_campaign(subject, html, MAILCHIMP_AUDIENCE_ID_ALL_DONORS, title=f"[AI draft] {subject}")` -> store `external_ref = campaign_id` on the Draft; save.
6. Print the Mailchimp `edit_url` + the Draft id.
- Flags: `--count` (stories, default 3), `--stat-key`, `--dry-run` (compose + create the Draft row but skip Mailchimp), `--n` (make N drafts in one run, default 1 — Jim wants "a couple", so `--n 2` yields two distinct draft campaigns; vary the story window per draft, e.g. stories [0:count], [count:2*count]).

---

## Piece 6 — Voice Guide starter (`fundraising/voice/voice_guide.md`)

Ship a short starter so the pipe runs today (a provisional style spec: warm, specific, child/youth-centred, concrete over abstract, first-person-from-Jim, genuine gratitude to donors, short paragraphs, no jargon or fabricated numbers). Mark it clearly as PROVISIONAL — to be replaced by a version distilled from Jim's real newsletters/donor emails (dropped in Drive `Masinyusane/Fundraising/Voice/`) and then improved quarterly by the self-improving loop (ADR 0007). (Claude will author/replace this artifact; Codex just needs the file to exist and be read by `voice_guide.read()`.)

---

## Run & verify (Codex reports the output of each)
1. `venv/bin/python manage.py makemigrations fundraising && venv/bin/python manage.py migrate`
2. `venv/bin/python manage.py sync_airtable_success_stories --verbose` -> report ContentStory count + the AirtableSyncLog row (and how many have `has_consent=True`).
3. `venv/bin/python manage.py draft_newsletter --n 2 --count 3` -> report the 2 Draft ids + the 2 Mailchimp `edit_url`s.
4. `venv/bin/python manage.py check`.
- Do NOT commit.
- If Mailchimp rejects the sender (unverified `reply_to`/`from`), report the exact Mailchimp error so Jim can verify a sending domain/address; the draft-row creation must still succeed.

## Out of scope (later)
Durable GCS images; Content Use ledger + report-linkage fields; the other Airtable tables (Quotes About Children, etc.); tag-based audiences (USA/RSA timezone segments); turning the inlined selects into real Tool Belt functions; Gmail personal-send variant; the edit-capture/self-improving-loop classifier run.

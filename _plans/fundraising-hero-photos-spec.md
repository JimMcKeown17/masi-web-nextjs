# Fundraising Story Hero Photos — backfill build spec

Curate ONE hero photo per Success Story with a single vision pass, cache it on GCS, and store a
durable `ContentStory.hero_image_url`. Implements ADR 0008. This is Tool-Belt-level machinery for
Agent 1 (The Content Pipe): a hero is a property of a **story**, not an **issue**, so it is
independent of the (unbuilt) editorial calendar. Depends on the Spine + `ContentStory` (built) and
the photo-pipeline access setup (`docs/fundraising-photo-pipeline-setup.md`, all four steps verified
2026-07-08: Drive read + GCS write proven end-to-end as the service account).

Build in the BACKEND repo `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/`
on the SAME branch `feature/fundraising-spine`. Same house conventions as the spine / tracer specs.
Do NOT commit.

## Why this is safe to run
- Read-only against Google Drive (`drive.readonly` scope). Writes only to `gs://masi-website/fundraising/heroes/` and the local `masi_db` snapshot. Touches no donor, email, or Mailchimp surface.
- Idempotent: stories with a `hero_image_url` are skipped unless `--force`; the GCS key is stable per story so re-runs overwrite in place, never duplicate.
- Per-story try/except: one bad link never aborts the batch. Unusable links are skipped and reported, not fatal.

## Review decisions (2026-07-08, after Codex adversarial review)
- **No consent gate (deliberate, Jim).** Process all active, linked stories. `has_consent` is untracked (8 of 87), so gating on it kills the feature; the risk of publishing story photos (also embedded in donor newsletters) is accepted. Revisit lever: gate on `social_published == "Published"` (86 of 87) if child-photo exposure becomes a concern.
- **`is_active=True` gate: yes** (no-op today; future-proof; matches `draft_newsletter`).
- **Drive-root ancestry check: deferred.** The service account can only read the one shared "Masi Media" folder (verified), so a stray link is either in-scope or unreadable (a problem row). Revisit if more folders are shared with the SA.
- **Model-failure = problem, not success.** A single-candidate fallback stores (the only image, flagged amber); a multi-candidate fallback (model could not choose) is a problem row with NO upload/save, surfaced for a manual re-run.
- **Hero optimized for email (added after the first live run).** The first full run stored full-res originals (3-11 MB, one 10.7 MB PNG), too heavy for a donor email header. `optimize_for_email` now downscales the chosen hero to ~1600px JPEG (a few hundred KB; PNG normalized to JPEG) before upload; the winner is re-encoded, not stored raw.

## Verified input data (masi_db snapshot, 2026-07-08)
92 `ContentStory` rows; 87 have a `drive_link`. Shapes: **77 Drive folders** (flat, per-child, 1-7
images each, no subfolders), **8 single files** (7 images + **1 video/mp4** → yields no image),
**2 "search" URLs** (`/drive/search?q=…`, not addressable), **5 empty**. Zero Google Photos links
(a different API the SA cannot reach) — confirmed absent. So ~85 stories have a usable hero source;
~7 land in the Problems bucket.

## Env (already set in backend `.env`)
`GOOGLE_CREDENTIALS` (service-account JSON, single line), `GS_BUCKET_NAME="masi-website"`,
`ANTHROPIC_API_KEY`. Note: `settings.py` only wires django-storages GCS when `DEBUG=False`, so this
tool builds its **own explicit** Drive/GCS/Anthropic clients from env and does NOT use
`default_storage` — it must work with local `DEBUG=True`.

## Dependencies
- Add `google-api-python-client` to `requirements.txt` (installed in the venv already).
- `Pillow` (11.1.0), `google-cloud-storage` (via django-storages), `anthropic` are already deps — verified importable.
- Model id: reuse `compose.MODEL = "claude-sonnet-5"` (vision-capable; already resolves in this project).

---

## Piece 1 — `ContentStory.hero_image_url` field + migration

Add ONE field to `ContentStory` (`fundraising/models.py`):
- `hero_image_url = models.URLField(max_length=500, blank=True, default="")`

Nothing else is stored — the contact sheet is generated live at run time, not persisted (YAGNI; no
`hero_reason`/`hero_file_id` columns until a consumer needs them).

Admin: add `hero_image_url` presence to `ContentStory` `list_display` (e.g. a `has_hero` boolean
method) so the backfill's effect is visible in `/admin`.

Migration: `makemigrations fundraising` → `0003_contentstory_hero_image_url`. Then `migrate`.

---

## Piece 2 — `fundraising/services/photos.py` (pure, unit-testable)

Isolate all logic from the command, mirroring how `compose.py` isolates newsletter logic. Functions
take injected clients so tests can mock them.

**Client builders** (from env; explicit, not django-storages):
- `drive_client()` → `googleapiclient.discovery.build("drive","v3", credentials=…, cache_discovery=False)` with `drive.readonly` scope, creds from `service_account.Credentials.from_service_account_info(json.loads(GOOGLE_CREDENTIALS))`.
- `gcs_bucket()` → `google.cloud.storage.Client(project, credentials=…).bucket(GS_BUCKET_NAME)`, same creds.
- `anthropic_client()` → `anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)`.

**Link parsing:**
- `parse_drive_ref(url) -> (kind, id)` where kind ∈ `{"folder","file",None}`.
  - `/folders/<id>` → `("folder", id)`; `/file/d/<id>` or `?id=<id>`/`uc?id=<id>` → `("file", id)`; `/drive/search?…`, empty, or unrecognized → `(None, None)`.

**Candidate listing:**
- `list_candidate_images(drive, kind, id) -> [ {id,name,mimeType} ]`.
  - folder → `files().list(q=f"'{id}' in parents and trashed=false", fields="files(id,name,mimeType)")`; keep `mimeType` starting `image/`. If ZERO images but there ARE subfolders, recurse ONE level (defensive; rare per the data). Cap total candidates at ~15.
  - file → `files().get(fileId=id, fields="id,name,mimeType")`; return `[file]` iff image, else `[]` (this drops the 1 video).
  - `HttpError 404` → raise a typed `DriveAccessError` the command turns into a Problem row.

**Thumbnails + download:**
- `download_bytes(drive, file_id) -> bytes` via `files().get_media` + `MediaIoBaseDownload`.
- `downscale_jpeg(image_bytes, max_px=768, quality=80) -> bytes` via Pillow (`convert("RGB")`, `thumbnail((max_px,max_px))`, save JPEG). If Pillow cannot open (e.g. HEIC), raise `UnreadableImage`; the caller skips that candidate. (If HEIC turns out common in the live run, add `pillow-heif` — do not pre-optimize.)

**Hero selection:**
- `pick_hero(anthropic, candidates_with_thumbs, story_context) -> {chosen_index, reason, rejected:[{index,why}], fallback:bool}`. `story_context` = `{feature_name, headline, narrative[:600], category}` from the `ContentStory`, so the model can identify who the story is actually about.
  - 0 candidates → caller handles as Problem (never calls this).
  - 1 candidate → return `{chosen_index:0, reason:"only image in folder", rejected:[], fallback:True}` WITHOUT an API call.
  - ≥2 → one `messages.create(model=MODEL, max_tokens=800, ...)` call. Content = a LEADING text block with `story_context` ("this story is about …"); then, per candidate, a text label `Candidate <i>: <name>` + an image block `{"type":"image","source":{"type":"base64","media_type":"image/jpeg","data":<b64 thumb>}}`; then a final text block with the rubric and: *return ONLY JSON* `{"chosen_index":int,"reason":str,"rejected":[{"index":int,"why":str}]}`.
  - Parse defensively (reuse the `{`…`}` extraction pattern from `compose._parse_json_result`). Invalid JSON, missing key, or `chosen_index` out of range → `{chosen_index:0, …, fallback:True}` (never crash).

**Rubric (subject-aware — refines ADR 0008).** Masi is a two-birds programme (women's employment +
children's education), so a story's subject may be **a woman, a child, or a woman together with her
child(ren)** — not always a lone child. Using `story_context` to identify that subject, pick the
single strongest image that **features the story's actual subject** for a donor email header:
subject in sharp focus, warm, uncluttered background, landscape framing. A woman with her children
is an on-message subject, NOT a "group shot" to reject. Reject: blurry, duplicate,
cut-out-on-transparent, or incoherent crowd shots where no clear subject reads. (Later, the
editorial Campaign Calendar's meta-topic can bias this further — e.g. a youth-spotlight issue
prefers the woman — out of scope here.)

**Upload:**
- `upload_hero(bucket, story, image_bytes, mime) -> url`. Key `fundraising/heroes/<source_airtable_id>.<ext>` (ext from mime: jpg/png). `blob.upload_from_string(image_bytes, content_type=mime)`. Do NOT set a per-object ACL (the bucket serves objects publicly at the account level, same as site static images; setting an ACL can fail under uniform bucket-level access). Return `https://storage.googleapis.com/masi-website/<key>`.

---

## Piece 3 — `fundraising/management/commands/backfill_story_heroes.py`

Flags: `--force` (re-pick stories that already have a hero), `--limit N`, `--story <source_airtable_id>`
(single, for targeted re-runs), `--dry-run` (pick + emit sheet, no upload/save), `--report PATH`
(default `fundraising_hero_contact_sheet.html` in cwd).

Per selected story (skip those with `hero_image_url` unless `--force`):
1. `parse_drive_ref(story.drive_link)` → if `None` kind: Problem `"no usable link"` (search URL / empty).
2. `list_candidate_images` → if `[]`: Problem `"no images (video-only / empty folder)"`; on `DriveAccessError`: Problem `"drive 404 (link not under Masi Media or deleted)"`.
3. `download_bytes` each candidate ONCE; `downscale_jpeg` a copy for the vision thumb (skip unreadable candidates). Keep the full bytes for the winner.
4. `pick_hero` over the thumbs. If it returns `fallback=True` AND there was more than one candidate, the model could not choose: Problem `"model could not pick a hero; needs manual choice"` — do NOT upload or save. (A single-candidate fallback is fine and proceeds.)
5. Unless `--dry-run`: `optimize_for_email(chosen full bytes)` -> ~1600px JPEG (a few hundred KB; full-res originals are 3-11 MB, too heavy for email), `upload_hero(...)` as `image/jpeg`, set `story.hero_image_url`, `save(update_fields=["hero_image_url","updated_at"])`.
6. Append a result record (below) for the sheet.

Wrap steps 1-5 per story in try/except → unexpected errors become a Problem row (with the exception text), batch continues.

**Result record** (plain dict, consumed by the renderer):
`{story, status: "stored"|"dry"|"problem", fallback: bool, chosen_index, reason, hero_url,
candidates: [{name, thumb_b64, rejected_why|None}], problem_reason|None}`.
A `fallback` pick (single-candidate, or model-parse fallback) is still `status:"stored"` — the bool
just drives the amber "eyeball this" styling. `dry` is a would-store pick under `--dry-run`.

End: write the contact sheet via Piece 4; print a summary line
`stored=X (fallback=Y) problems=Z (dry-run: …)` and the report path.

---

## Piece 4 — `render_contact_sheet(records) -> html` (in a sibling `fundraising/services/photos_report.py`)

Pure function → self-contained HTML string (no external assets; thumbnails as base64 data URIs, the
same downscaled JPEGs from the vision step). Layout matches the approved mockup
(`scratchpad/hero_contact_sheet_mockup.html`): summary chips; one card per non-problem story with the
chosen thumb outlined + `HERO` badge + reason, rejects dimmed with their `why`; amber styling for
`fallback`; a Problems `<table>` at the end (story name, reason tag, truncated link). Theme-aware
(light/dark) per the mockup. The command writes it to `--report`.

---

## Piece 5 — Tests

**Unit (SQLite-safe, no network — Codex builds + verifies these):**
`DATABASE_URL=sqlite:///db.sqlite3 … manage.py test fundraising`
- `parse_drive_ref`: folder, `/file/d/`, `uc?id=`/`open?id=`, `/drive/search?q=`, empty, junk.
- `list_candidate_images` (mock Drive): folder mixed images+video → video filtered; folder of only-subfolders → one-level recurse; single image file → `[file]`; single video file → `[]`; 404 → `DriveAccessError`.
- `pick_hero` (mock Anthropic): valid JSON pick; malformed JSON → fallback index 0; out-of-range `chosen_index` → fallback; single candidate → no API call, `fallback=True`.
- `upload_hero` (mock bucket): asserts key `fundraising/heroes/<id>.jpg` and returned URL; no ACL call.
- `render_contact_sheet`: mixed records render without error; output contains a HERO badge and a Problems row.

**Live (orchestrating Claude runs; not Codex — Codex's sandbox has no network/DB):**
- `--dry-run --limit 5` first; open the sheet, sanity-check picks + thumbnails render.
- Full run; open the sheet; confirm one stored `hero_image_url` is **publicly fetchable** (HTTP 200 image) — proves the no-ACL public-serving assumption.
- Spot-check the Problems table matches the 7 known bad links.

---

## Out of scope (explicit)
- Embedding `hero_image_url` in `compose_newsletter` (one-line downstream follow-up).
- The nightly `--new-only` cron for new stories (the service is built to support it; not wired now).
- Staff hero-override via an Airtable field (ADR 0008 future refinement).
- The editorial Campaign Calendar (its own brainstorm/spec; a Layer-2 concern above this tool).

## Run
```
cd "backend/Masi Web Main" && source venv/bin/activate
python manage.py makemigrations fundraising && python manage.py migrate fundraising
python manage.py backfill_story_heroes --dry-run --limit 5   # inspect the sheet
python manage.py backfill_story_heroes                        # full backfill
python manage.py backfill_story_heroes --story <airtable_id> --force  # re-run one after an Airtable fix
```

# Story Hero Photos Backfill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Execution note:** this plan is built by **Codex** (Tasks 1-9, SQLite-verifiable); the orchestrating Claude runs the **live** Task 10 (Codex's sandbox has no network/DB).

**Goal:** Curate one hero photo per Success Story with a single subject-aware vision pass, cache it on GCS, and store a durable `ContentStory.hero_image_url`; emit a contact-sheet HTML for one-time human QA.

**Architecture:** A pure service module (`fundraising/services/photos.py`) does link parsing, Drive listing/download, thumbnail downscale, the Anthropic vision pick, and the GCS upload, all behind injected clients so tests mock them. A sibling `photos_report.py` renders the contact sheet. A management command (`backfill_story_heroes`) orchestrates per-story with per-story try/except, idempotency, and flags. Implements ADR 0008 (subject-aware refinement, 2026-07-08). Full design: `_plans/fundraising-hero-photos-spec.md`.

**Tech Stack:** Django 5.1, `google-api-python-client` (Drive v3, `drive.readonly`), `google-cloud-storage`, `Pillow`, `anthropic` (model `claude-sonnet-5`).

## Global Constraints

- Build in the BACKEND repo at `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/` (a separate git repo from this frontend worktree), on branch `feature/fundraising-spine`. Run management/test commands from that dir with the venv active. Commit per task on that branch. Do NOT push, do NOT commit to `main`.
- Explicit clients built from env (`GOOGLE_CREDENTIALS`, `GS_BUCKET_NAME`, `ANTHROPIC_API_KEY`); do NOT use django `default_storage` (the GCS backend is only wired when `DEBUG=False`, but this tool must work with local `DEBUG=True`).
- Model id is `claude-sonnet-5` (reuse `fundraising.services.compose.MODEL`). Do not hardcode a different string.
- GCS object key is exactly `fundraising/heroes/<source_airtable_id>.<ext>`; upload with the correct `content_type` and set **no per-object ACL** (bucket serves objects publicly at account level).
- No emoji anywhere in code, comments, or the contact sheet (Jim's rule).
- Tests are SQLite-safe and network-free (all clients mocked). Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising`.
- New tests append to `fundraising/tests.py` as new `TestCase`/`SimpleTestCase` classes (existing single-file convention; do not restructure into a package).

## Review decisions (2026-07-08, after Codex adversarial review)

- **Consent gate: intentionally NONE (Jim, 2026-07-08).** Process all active, linked stories. `has_consent` is untracked in Airtable (only 8 of 87 have a form), so gating on it kills the feature; Jim accepts the risk of publishing story photos (which are also embedded in donor newsletters). **Revisit lever if child-photo exposure becomes a concern:** gate on `social_published == "Published"` (86 of 87 today — photos Masi already made public on social).
- **`is_active` gate: yes.** Filter `is_active=True` (a no-op today since all 87 are active; correct for the future, and consistent with `draft_newsletter`).
- **Drive-root ancestry check: deferred (Jim, 2026-07-08).** The service account's read scope is the single shared "Masi Media" folder (verified 2026-07-08), so a stray `drive_link` either resolves in-scope (a legitimate Masi photo) or is unreadable and becomes a problem row. Revisit only if more folders get shared with the SA.
- **Model-failure handling: hardened (Finding 2, adopted).** A single-candidate fallback (the only image) is stored + flagged amber. A multi-candidate fallback means the model could not choose — that is a **problem row with no upload/save**, so it resurfaces for a manual re-run rather than publishing an arbitrary image counted as success.

## File Structure

- Modify `requirements.txt` — add `google-api-python-client`.
- Modify `fundraising/models.py` — add `ContentStory.hero_image_url`.
- Modify `fundraising/admin.py` — surface `has_hero`.
- Create `fundraising/migrations/0003_contentstory_hero_image_url.py` (generated).
- Create `fundraising/services/photos.py` — clients, parsing, Drive I/O, downscale, vision pick, upload; exceptions `DriveAccessError`, `UnreadableImage`.
- Create `fundraising/services/photos_report.py` — `render_contact_sheet(records) -> str`.
- Create `fundraising/management/commands/backfill_story_heroes.py` — orchestration + flags.
- Modify `fundraising/tests.py` — append test classes.

---

### Task 1: Schema — `hero_image_url` field, migration, admin, dependency

**Files:**
- Modify: `fundraising/models.py` (ContentStory, after `drive_link`)
- Modify: `fundraising/admin.py`
- Modify: `requirements.txt`
- Test: `fundraising/tests.py` (new `HeroImageFieldTests`)
- Generated: `fundraising/migrations/0003_contentstory_hero_image_url.py`

**Interfaces:**
- Produces: `ContentStory.hero_image_url` (str URLField, default `""`).

- [ ] **Step 1: Write the failing test** — append to `fundraising/tests.py`:

```python
from django.test import TestCase


class HeroImageFieldTests(TestCase):
    def test_hero_image_url_defaults_blank_and_is_settable(self):
        from fundraising.models import ContentStory
        s = ContentStory.objects.create(source_airtable_id="recHERO1")
        self.assertEqual(s.hero_image_url, "")
        s.hero_image_url = "https://storage.googleapis.com/masi-website/fundraising/heroes/recHERO1.jpg"
        s.save(update_fields=["hero_image_url"])
        s.refresh_from_db()
        self.assertTrue(s.hero_image_url.endswith("recHERO1.jpg"))
```

- [ ] **Step 2: Run test to verify it fails**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.HeroImageFieldTests -v2`
Expected: FAIL (`hero_image_url` is not a field / attribute error or migration mismatch).

- [ ] **Step 3: Add the field** — in `fundraising/models.py`, in `ContentStory` immediately after the `drive_link` line:

```python
    hero_image_url = models.URLField(max_length=500, blank=True, default="")
```

- [ ] **Step 4: Make the migration**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py makemigrations fundraising`
Expected: creates `0003_contentstory_hero_image_url.py` adding one field.

- [ ] **Step 5: Surface it in admin** — in `fundraising/admin.py`, on the `ContentStory` admin add a `has_hero` method and include it in `list_display` (adapt to the existing registration):

```python
    def has_hero(self, obj):
        return bool(obj.hero_image_url)
    has_hero.boolean = True
```

- [ ] **Step 6: Add the dependency** — append to `requirements.txt`:

```
google-api-python-client
```

- [ ] **Step 7: Run tests to verify pass**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.HeroImageFieldTests -v2`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add fundraising/models.py fundraising/admin.py fundraising/migrations/0003_contentstory_hero_image_url.py requirements.txt fundraising/tests.py
git commit -m "feat(fundraising): add ContentStory.hero_image_url + migration"
```

---

### Task 2: `parse_drive_ref` — link parsing

**Files:**
- Create: `fundraising/services/photos.py`
- Test: `fundraising/tests.py` (new `PhotosParseTests`)

**Interfaces:**
- Produces: `parse_drive_ref(url: str) -> tuple[str|None, str|None]` — `("folder"|"file", id)` or `(None, None)`.

- [ ] **Step 1: Write the failing test**

```python
from django.test import SimpleTestCase


class PhotosParseTests(SimpleTestCase):
    def test_parse_drive_ref_cases(self):
        from fundraising.services.photos import parse_drive_ref
        self.assertEqual(parse_drive_ref("https://drive.google.com/drive/folders/1AbC_x-y?usp=sharing"), ("folder", "1AbC_x-y"))
        self.assertEqual(parse_drive_ref("https://drive.google.com/file/d/11u5Du6/view"), ("file", "11u5Du6"))
        self.assertEqual(parse_drive_ref("https://drive.google.com/uc?id=99XyZ"), ("file", "99XyZ"))
        self.assertEqual(parse_drive_ref("https://drive.google.com/open?id=42Abc"), ("file", "42Abc"))
        self.assertEqual(parse_drive_ref("https://drive.google.com/drive/search?q=Usisipho"), (None, None))
        self.assertEqual(parse_drive_ref(""), (None, None))
        self.assertEqual(parse_drive_ref("not a url"), (None, None))
```

- [ ] **Step 2: Run test to verify it fails**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.PhotosParseTests -v2`
Expected: FAIL (`No module named fundraising.services.photos`).

- [ ] **Step 3: Create `fundraising/services/photos.py` with parsing**

```python
"""Story hero photo curation: Drive read -> vision pick -> GCS cache. See
_plans/fundraising-hero-photos-spec.md and ADR 0008."""
import base64
import io
import json
import os
import re

from fundraising.services.compose import MODEL


class DriveAccessError(Exception):
    """The service account cannot read a linked Drive item (404/403)."""


class UnreadableImage(Exception):
    """Pillow could not decode a candidate image (e.g. HEIC)."""


_FOLDER_RE = re.compile(r"/folders/([A-Za-z0-9_-]+)")
_FILE_RE = re.compile(r"/file/d/([A-Za-z0-9_-]+)")
_ID_QUERY_RE = re.compile(r"[?&]id=([A-Za-z0-9_-]+)")


def parse_drive_ref(url):
    """Return ("folder"|"file", id) or (None, None). Search URLs and empties
    are unaddressable -> (None, None)."""
    u = (url or "").strip()
    if not u:
        return (None, None)
    m = _FOLDER_RE.search(u)
    if m:
        return ("folder", m.group(1))
    m = _FILE_RE.search(u) or _ID_QUERY_RE.search(u)
    if m:
        return ("file", m.group(1))
    return (None, None)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.PhotosParseTests -v2`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add fundraising/services/photos.py fundraising/tests.py
git commit -m "feat(fundraising): parse_drive_ref for hero photos"
```

---

### Task 3: `list_candidate_images` — Drive listing with recurse + 404 mapping

**Files:**
- Modify: `fundraising/services/photos.py`
- Test: `fundraising/tests.py` (new `PhotosListTests`)

**Interfaces:**
- Consumes: `DriveAccessError`.
- Produces: `list_candidate_images(drive, kind: str, ref_id: str) -> list[dict]` where each dict is `{"id","name","mimeType"}`; images only; caps at 15.

- [ ] **Step 1: Write the failing test**

```python
from unittest import mock
from django.test import SimpleTestCase


class PhotosListTests(SimpleTestCase):
    def _drive_returning(self, listings):
        """listings: dict[parent_id] -> list of file dicts."""
        drive = mock.MagicMock()

        def files_list(q, fields, pageSize=None):
            parent = q.split("'")[1]
            req = mock.MagicMock()
            req.execute.return_value = {"files": listings.get(parent, [])}
            return req

        drive.files.return_value.list.side_effect = files_list
        return drive

    def test_folder_filters_non_images(self):
        from fundraising.services.photos import list_candidate_images
        drive = self._drive_returning({"F": [
            {"id": "a", "name": "a.jpg", "mimeType": "image/jpeg"},
            {"id": "v", "name": "v.mp4", "mimeType": "video/mp4"},
        ]})
        out = list_candidate_images(drive, "folder", "F")
        self.assertEqual([c["id"] for c in out], ["a"])

    def test_folder_recurses_one_level_when_no_images(self):
        from fundraising.services.photos import list_candidate_images
        drive = self._drive_returning({
            "F": [{"id": "sub", "name": "sub", "mimeType": "application/vnd.google-apps.folder"}],
            "sub": [{"id": "b", "name": "b.jpg", "mimeType": "image/jpeg"}],
        })
        out = list_candidate_images(drive, "folder", "F")
        self.assertEqual([c["id"] for c in out], ["b"])

    def test_single_image_file(self):
        from fundraising.services.photos import list_candidate_images
        drive = mock.MagicMock()
        drive.files.return_value.get.return_value.execute.return_value = {
            "id": "x", "name": "x.jpg", "mimeType": "image/jpeg"}
        self.assertEqual(len(list_candidate_images(drive, "file", "x")), 1)

    def test_single_video_file_yields_nothing(self):
        from fundraising.services.photos import list_candidate_images
        drive = mock.MagicMock()
        drive.files.return_value.get.return_value.execute.return_value = {
            "id": "x", "name": "x.mp4", "mimeType": "video/mp4"}
        self.assertEqual(list_candidate_images(drive, "file", "x"), [])

    def test_404_maps_to_drive_access_error(self):
        from googleapiclient.errors import HttpError
        from fundraising.services.photos import list_candidate_images, DriveAccessError
        resp = mock.MagicMock(); resp.status = 404
        drive = mock.MagicMock()
        drive.files.return_value.get.return_value.execute.side_effect = HttpError(resp, b"not found")
        with self.assertRaises(DriveAccessError):
            list_candidate_images(drive, "file", "x")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.PhotosListTests -v2`
Expected: FAIL (`list_candidate_images` not defined).

- [ ] **Step 3: Implement** — append to `fundraising/services/photos.py`:

```python
from googleapiclient.errors import HttpError

_FOLDER_MIME = "application/vnd.google-apps.folder"
_MAX_CANDIDATES = 15


def _list_children(drive, parent_id):
    req = drive.files().list(
        q=f"'{parent_id}' in parents and trashed=false",
        fields="files(id,name,mimeType)",
        pageSize=200,
    )
    return req.execute().get("files", [])


def _images(files):
    return [f for f in files if f.get("mimeType", "").startswith("image/")]


def list_candidate_images(drive, kind, ref_id):
    """Return up to _MAX_CANDIDATES image file dicts for a folder or file ref.
    Raises DriveAccessError on a 404/403 (link not shared / deleted)."""
    try:
        if kind == "file":
            meta = drive.files().get(
                fileId=ref_id, fields="id,name,mimeType"
            ).execute()
            return [meta] if meta.get("mimeType", "").startswith("image/") else []

        children = _list_children(drive, ref_id)
        imgs = _images(children)
        if not imgs:
            for sub in [c for c in children if c.get("mimeType") == _FOLDER_MIME]:
                imgs.extend(_images(_list_children(drive, sub["id"])))
                if len(imgs) >= _MAX_CANDIDATES:
                    break
        return imgs[:_MAX_CANDIDATES]
    except HttpError as e:
        status = getattr(getattr(e, "resp", None), "status", None)
        if status in (403, 404):
            raise DriveAccessError(str(e))
        raise
```

- [ ] **Step 4: Run test to verify it passes**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.PhotosListTests -v2`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add fundraising/services/photos.py fundraising/tests.py
git commit -m "feat(fundraising): list_candidate_images with recurse + 404 mapping"
```

---

### Task 4: `download_bytes` + `downscale_jpeg`

**Files:**
- Modify: `fundraising/services/photos.py`
- Test: `fundraising/tests.py` (new `PhotosDownscaleTests`)

**Interfaces:**
- Produces: `download_bytes(drive, file_id) -> bytes`; `downscale_jpeg(image_bytes, max_px=768, quality=80) -> bytes` (raises `UnreadableImage`).

- [ ] **Step 1: Write the failing test**

```python
import io
from unittest import mock
from django.test import SimpleTestCase


class PhotosDownscaleTests(SimpleTestCase):
    def _png_bytes(self, w, h):
        from PIL import Image
        buf = io.BytesIO()
        Image.new("RGB", (w, h), (120, 80, 40)).save(buf, format="PNG")
        return buf.getvalue()

    def test_downscale_returns_jpeg_within_max(self):
        from PIL import Image
        from fundraising.services.photos import downscale_jpeg
        out = downscale_jpeg(self._png_bytes(2000, 1500), max_px=768)
        img = Image.open(io.BytesIO(out))
        self.assertEqual(img.format, "JPEG")
        self.assertLessEqual(max(img.size), 768)

    def test_downscale_rejects_unreadable(self):
        from fundraising.services.photos import downscale_jpeg, UnreadableImage
        with self.assertRaises(UnreadableImage):
            downscale_jpeg(b"not an image")

    def test_download_bytes_uses_get_media(self):
        from fundraising.services.photos import download_bytes
        drive = mock.MagicMock()
        drive.files.return_value.get_media.return_value.execute.return_value = b"RAW"
        self.assertEqual(download_bytes(drive, "fid"), b"RAW")
        drive.files.return_value.get_media.assert_called_once_with(fileId="fid")
```

- [ ] **Step 2: Run test to verify it fails**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.PhotosDownscaleTests -v2`
Expected: FAIL (functions not defined).

- [ ] **Step 3: Implement** — append to `fundraising/services/photos.py`:

```python
from PIL import Image, UnidentifiedImageError


def download_bytes(drive, file_id):
    """Full file bytes. For media downloads, get_media().execute() returns the
    raw content directly."""
    return drive.files().get_media(fileId=file_id).execute()


def downscale_jpeg(image_bytes, max_px=768, quality=80):
    """Downscale to a max dimension and re-encode JPEG for the vision pass."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert("RGB")
    except (UnidentifiedImageError, OSError) as e:
        raise UnreadableImage(str(e))
    img.thumbnail((max_px, max_px))
    out = io.BytesIO()
    img.save(out, format="JPEG", quality=quality)
    return out.getvalue()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.PhotosDownscaleTests -v2`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add fundraising/services/photos.py fundraising/tests.py
git commit -m "feat(fundraising): download_bytes + downscale_jpeg"
```

---

### Task 5: `pick_hero` — subject-aware vision pick with fallbacks

**Files:**
- Modify: `fundraising/services/photos.py`
- Test: `fundraising/tests.py` (new `PickHeroTests`)

**Interfaces:**
- Produces: `pick_hero(anthropic_client, candidates, story_context) -> {"chosen_index":int,"reason":str,"rejected":list,"fallback":bool}`. `candidates` = list of `{"name","b64"}` (b64 = downscaled JPEG). `story_context` = `{"feature_name","headline","narrative","category"}`.

- [ ] **Step 1: Write the failing test**

```python
import json
from unittest import mock
from django.test import SimpleTestCase


def _resp(text):
    block = mock.MagicMock(); block.text = text
    r = mock.MagicMock(); r.content = [block]
    return r


class PickHeroTests(SimpleTestCase):
    ctx = {"feature_name": "Nomsa", "headline": "A mother graduates", "narrative": "Nomsa...", "category": ["Youth"]}

    def test_single_candidate_no_api_call(self):
        from fundraising.services.photos import pick_hero
        client = mock.MagicMock()
        out = pick_hero(client, [{"name": "a.jpg", "b64": "AAAA"}], self.ctx)
        self.assertEqual(out["chosen_index"], 0)
        self.assertTrue(out["fallback"])
        client.messages.create.assert_not_called()

    def test_valid_json_pick(self):
        from fundraising.services.photos import pick_hero
        client = mock.MagicMock()
        client.messages.create.return_value = _resp(
            '{"chosen_index":1,"reason":"woman in focus","rejected":[{"index":0,"why":"blurry"}]}')
        out = pick_hero(client, [{"name": "a", "b64": "AA"}, {"name": "b", "b64": "BB"}], self.ctx)
        self.assertEqual(out["chosen_index"], 1)
        self.assertFalse(out["fallback"])

    def test_malformed_json_falls_back(self):
        from fundraising.services.photos import pick_hero
        client = mock.MagicMock()
        client.messages.create.return_value = _resp("sorry, no json here")
        out = pick_hero(client, [{"name": "a", "b64": "AA"}, {"name": "b", "b64": "BB"}], self.ctx)
        self.assertEqual(out["chosen_index"], 0)
        self.assertTrue(out["fallback"])

    def test_out_of_range_index_falls_back(self):
        from fundraising.services.photos import pick_hero
        client = mock.MagicMock()
        client.messages.create.return_value = _resp('{"chosen_index":9,"reason":"x","rejected":[]}')
        out = pick_hero(client, [{"name": "a", "b64": "AA"}, {"name": "b", "b64": "BB"}], self.ctx)
        self.assertEqual(out["chosen_index"], 0)
        self.assertTrue(out["fallback"])
```

- [ ] **Step 2: Run test to verify it fails**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.PickHeroTests -v2`
Expected: FAIL (`pick_hero` not defined).

- [ ] **Step 3: Implement** — append to `fundraising/services/photos.py`:

```python
_RUBRIC = (
    "Masi is a two-birds programme: women's employment and children's education. "
    "A story's subject may be a woman, a child, or a woman together with her children. "
    "Using the story context, pick the single strongest image that features THIS story's "
    "subject for a donor email header: subject in sharp focus, warm, uncluttered background, "
    "landscape framing. A woman with her children is on-message, not a group shot to reject. "
    "Reject blurry, duplicate, cut-out-on-transparent, or incoherent crowd shots. "
    "Return ONLY JSON: {\"chosen_index\": int, \"reason\": str, "
    "\"rejected\": [{\"index\": int, \"why\": str}]}."
)


def _text_from_response(response):
    parts = []
    for block in getattr(response, "content", []):
        text = getattr(block, "text", None)
        if text:
            parts.append(text)
    return "\n".join(parts).strip()


def _extract_json(raw):
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        s, e = raw.find("{"), raw.rfind("}")
        if s == -1 or e <= s:
            return None
        try:
            return json.loads(raw[s:e + 1])
        except json.JSONDecodeError:
            return None


def _fallback(reason):
    return {"chosen_index": 0, "reason": reason, "rejected": [], "fallback": True}


def pick_hero(anthropic_client, candidates, story_context):
    """One vision call to choose the hero. Single candidate or any parse
    failure -> fallback to index 0 (never raises)."""
    if len(candidates) == 1:
        return _fallback("only image available")

    content = [{"type": "text", "text": "Story context: " + json.dumps(story_context, default=str)}]
    for i, c in enumerate(candidates):
        content.append({"type": "text", "text": f"Candidate {i}: {c['name']}"})
        content.append({
            "type": "image",
            "source": {"type": "base64", "media_type": "image/jpeg", "data": c["b64"]},
        })
    content.append({"type": "text", "text": _RUBRIC})

    response = anthropic_client.messages.create(
        model=MODEL,
        max_tokens=800,
        messages=[{"role": "user", "content": content}],
    )
    payload = _extract_json(_text_from_response(response))
    if not isinstance(payload, dict):
        return _fallback("model returned no parseable choice")
    idx = payload.get("chosen_index")
    if not isinstance(idx, int) or not (0 <= idx < len(candidates)):
        return _fallback("model returned an out-of-range choice")
    return {
        "chosen_index": idx,
        "reason": str(payload.get("reason", "")),
        "rejected": payload.get("rejected") or [],
        "fallback": False,
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.PickHeroTests -v2`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add fundraising/services/photos.py fundraising/tests.py
git commit -m "feat(fundraising): subject-aware pick_hero vision pass"
```

---

### Task 6: `upload_hero` + client builders

**Files:**
- Modify: `fundraising/services/photos.py`
- Test: `fundraising/tests.py` (new `UploadHeroTests`, `PhotoClientBuilderTests`)

**Interfaces:**
- Produces: `upload_hero(bucket, story, image_bytes, mime) -> str` (public URL). `drive_client()`, `gcs_bucket()`, `anthropic_client()` builders (raise `ValueError` when their env var is missing).

- [ ] **Step 1: Write the failing test**

```python
from unittest import mock
from django.test import SimpleTestCase


class UploadHeroTests(SimpleTestCase):
    def test_upload_uses_stable_key_and_no_acl(self):
        from fundraising.services.photos import upload_hero
        story = mock.MagicMock(source_airtable_id="recABC")
        bucket = mock.MagicMock()
        blob = bucket.blob.return_value
        url = upload_hero(bucket, story, b"JPEGDATA", "image/jpeg")
        bucket.blob.assert_called_once_with("fundraising/heroes/recABC.jpg")
        blob.upload_from_string.assert_called_once_with(b"JPEGDATA", content_type="image/jpeg")
        blob.make_public.assert_not_called()
        self.assertEqual(url, "https://storage.googleapis.com/masi-website/fundraising/heroes/recABC.jpg")

    def test_upload_png_extension(self):
        from fundraising.services.photos import upload_hero
        story = mock.MagicMock(source_airtable_id="recP")
        bucket = mock.MagicMock()
        upload_hero(bucket, story, b"X", "image/png")
        bucket.blob.assert_called_once_with("fundraising/heroes/recP.png")


class PhotoClientBuilderTests(SimpleTestCase):
    def test_anthropic_client_requires_key(self):
        from fundraising.services.photos import anthropic_client
        with mock.patch.dict("os.environ", {}, clear=True):
            with self.assertRaises(ValueError):
                anthropic_client()

    def test_gcs_bucket_requires_credentials(self):
        from fundraising.services.photos import gcs_bucket
        with mock.patch.dict("os.environ", {}, clear=True):
            with self.assertRaises(ValueError):
                gcs_bucket()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.UploadHeroTests fundraising.tests.PhotoClientBuilderTests -v2`
Expected: FAIL (functions not defined).

- [ ] **Step 3: Implement** — append to `fundraising/services/photos.py`:

```python
_BUCKET = os.environ.get("GS_BUCKET_NAME", "masi-website").strip('"')
_EXT = {"image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png"}


def _credentials():
    raw = os.environ.get("GOOGLE_CREDENTIALS", "")
    if not raw or raw == "{}":
        raise ValueError("GOOGLE_CREDENTIALS is not set")
    from google.oauth2 import service_account
    return service_account.Credentials.from_service_account_info(json.loads(raw))


def drive_client():
    from googleapiclient.discovery import build
    creds = _credentials().with_scopes(["https://www.googleapis.com/auth/drive.readonly"])
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def gcs_bucket():
    from google.cloud import storage
    creds = _credentials()
    return storage.Client(project=creds.project_id, credentials=creds).bucket(_BUCKET)


def anthropic_client():
    key = os.environ.get("ANTHROPIC_API_KEY")
    if not key:
        raise ValueError("ANTHROPIC_API_KEY is not set")
    import anthropic
    return anthropic.Anthropic(api_key=key)


def upload_hero(bucket, story, image_bytes, mime):
    ext = _EXT.get(mime, "jpg")
    key = f"fundraising/heroes/{story.source_airtable_id}.{ext}"
    blob = bucket.blob(key)
    blob.upload_from_string(image_bytes, content_type=mime)
    return f"https://storage.googleapis.com/{_BUCKET}/{key}"
```

Note: `service_account.Credentials` exposes `project_id` and `with_scopes`; `_credentials()` is scope-less so `gcs_bucket()` reuses it and `drive_client()` narrows to read-only.

- [ ] **Step 4: Run test to verify it passes**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.UploadHeroTests fundraising.tests.PhotoClientBuilderTests -v2`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add fundraising/services/photos.py fundraising/tests.py
git commit -m "feat(fundraising): upload_hero + Drive/GCS/Anthropic client builders"
```

---

### Task 7: `render_contact_sheet` — self-contained QA HTML

**Files:**
- Create: `fundraising/services/photos_report.py`
- Test: `fundraising/tests.py` (new `ContactSheetTests`)

**Interfaces:**
- Consumes: result records (see Task 8 for the exact dict shape).
- Produces: `render_contact_sheet(records: list[dict]) -> str` (full HTML document; thumbnails as `data:` URIs).

- [ ] **Step 1: Write the failing test**

```python
from django.test import SimpleTestCase


class ContactSheetTests(SimpleTestCase):
    def _records(self):
        return [
            {"title": "Nomsa Dlamini", "meta": "Youth - 2026", "status": "stored", "fallback": False,
             "chosen_index": 0, "reason": "woman in sharp focus",
             "hero_url": "https://storage.googleapis.com/masi-website/fundraising/heroes/rec1.jpg",
             "candidates": [{"name": "a.jpg", "b64": "AAAA", "rejected_why": None},
                            {"name": "b.jpg", "b64": "BBBB", "rejected_why": "blurry"}],
             "problem_reason": None},
            {"title": "Usisipho Mehlo", "meta": "", "status": "problem", "fallback": False,
             "chosen_index": None, "reason": "", "hero_url": None, "candidates": [],
             "problem_reason": "no usable link (search URL)"},
        ]

    def test_renders_hero_and_problem(self):
        from fundraising.services.photos_report import render_contact_sheet
        html = render_contact_sheet(self._records())
        self.assertIn("<html", html.lower())
        self.assertIn("Nomsa Dlamini", html)
        self.assertIn("HERO", html)
        self.assertIn("data:image/jpeg;base64,AAAA", html)
        self.assertIn("no usable link (search URL)", html)
        self.assertIn("1 stored", html)  # summary chip
```

- [ ] **Step 2: Run test to verify it fails**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.ContactSheetTests -v2`
Expected: FAIL (`No module named ...photos_report`).

- [ ] **Step 3: Implement `fundraising/services/photos_report.py`**

```python
"""Renders the one-time hero-photo QA contact sheet. Visual reference:
scratchpad hero_contact_sheet_mockup.html. Self-contained; thumbs are data URIs."""
import html as html_lib

_CSS = """
*{box-sizing:border-box}body{margin:0;background:#f6f7f9;color:#14181f;
font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.45}
@media(prefers-color-scheme:dark){body{background:#0e1116;color:#e8ebf0}
.card,.chip,table.problems{background:#161b22;border-color:#232a33}}
.wrap{max-width:1060px;margin:0 auto;padding:28px 20px 60px}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0 26px}
.chip{font-size:12px;padding:5px 11px;border-radius:999px;border:1px solid #e4e7ec;background:#fff}
.card{background:#fff;border:1px solid #e4e7ec;border-radius:14px;padding:18px;margin-bottom:16px}
.card.fallback{border-color:#e0a353}
.card h2{font-size:15.5px;margin:0 0 12px}
.row{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
figure{margin:0}.thumb{position:relative;aspect-ratio:4/3;border-radius:10px;overflow:hidden;border:1px solid #e4e7ec}
.thumb img{width:100%;height:100%;object-fit:cover}
.chosen .thumb{border:2px solid #1f7a4d;box-shadow:0 0 0 4px #e6f4ec}
.rejected .thumb{opacity:.5;filter:grayscale(.3)}
.badge{position:absolute;top:8px;left:8px;background:#1f7a4d;color:#fff;font-size:10px;font-weight:700;padding:3px 7px;border-radius:6px}
.rej{position:absolute;top:8px;left:8px;background:rgba(20,24,31,.72);color:#fff;font-size:10px;padding:3px 7px;border-radius:6px}
figcaption{font-size:11px;color:#626b7a;margin-top:6px}
.reason{margin-top:14px;padding:10px 12px;background:#e6f4ec;border-radius:9px;font-size:12.5px}
.fallback .reason{background:#fbeee2}
table.problems{width:100%;border-collapse:collapse;font-size:12.5px;background:#fff;border:1px solid #e4e7ec;border-radius:12px;overflow:hidden;margin-top:12px}
table.problems th,table.problems td{text-align:left;padding:10px 12px;border-bottom:1px solid #e4e7ec}
h3.section{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#626b7a;margin:34px 0 12px}
"""


def _esc(s):
    return html_lib.escape(str(s or ""))


def _story_card(rec):
    cls = "card fallback" if rec.get("fallback") else "card"
    figs = []
    for i, c in enumerate(rec["candidates"]):
        chosen = (i == rec.get("chosen_index"))
        fcls = "chosen" if chosen else "rejected"
        badge = '<span class="badge">HERO</span>' if chosen else (
            f'<span class="rej">{_esc(c["rejected_why"])}</span>' if c.get("rejected_why") else "")
        figs.append(
            f'<figure class="{fcls}"><div class="thumb">'
            f'<img src="data:image/jpeg;base64,{c["b64"]}" alt="">{badge}</div>'
            f'<figcaption>{_esc(c["name"])}</figcaption></figure>')
    label = "Auto-fallback" if rec.get("fallback") else "Chosen"
    return (
        f'<div class="{cls}"><h2>{_esc(rec["title"])} '
        f'<span style="color:#626b7a;font-size:12px;font-weight:400">{_esc(rec.get("meta"))}</span></h2>'
        f'<div class="row">{"".join(figs)}</div>'
        f'<div class="reason"><b>{label}:</b> {_esc(rec["reason"])}</div></div>')


def render_contact_sheet(records):
    stored = [r for r in records if r["status"] in ("stored", "dry")]
    fallback = [r for r in stored if r.get("fallback")]
    problems = [r for r in records if r["status"] == "problem"]
    chips = (f'<span class="chip">{len(stored)} stored</span>'
             f'<span class="chip">{len(fallback)} fallback</span>'
             f'<span class="chip">{len(problems)} problems</span>')
    cards = "".join(_story_card(r) for r in stored)
    prob_rows = "".join(
        f'<tr><td>{_esc(r["title"])}</td><td>{_esc(r["problem_reason"])}</td></tr>'
        for r in problems)
    prob = (f'<h3 class="section">Problems ({len(problems)} skipped)</h3>'
            f'<table class="problems"><thead><tr><th>Story</th><th>Reason</th></tr></thead>'
            f'<tbody>{prob_rows}</tbody></table>') if problems else ""
    return (
        f'<!doctype html><html lang="en"><head><meta charset="utf-8">'
        f'<meta name="viewport" content="width=device-width, initial-scale=1">'
        f'<title>Story Hero Contact Sheet</title><style>{_CSS}</style></head><body>'
        f'<div class="wrap"><h1 style="font-size:20px;margin:0 0 4px">Story Hero Contact Sheet</h1>'
        f'<div class="chips">{chips}</div>{cards}{prob}</div></body></html>')
```

- [ ] **Step 4: Run test to verify it passes**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.ContactSheetTests -v2`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add fundraising/services/photos_report.py fundraising/tests.py
git commit -m "feat(fundraising): render_contact_sheet QA HTML"
```

---

### Task 8: `backfill_story_heroes` command — orchestration

**Files:**
- Create: `fundraising/management/commands/backfill_story_heroes.py`
- Test: `fundraising/tests.py` (new `BackfillCommandTests`)

**Interfaces:**
- Consumes: everything in `photos.py` (via `from fundraising.services import photos, photos_report`), so tests patch `fundraising.services.photos.<fn>`.
- Result record dict (consumed by `render_contact_sheet`): `{"title","meta","status":"stored"|"dry"|"problem","fallback":bool,"chosen_index":int|None,"reason":str,"hero_url":str|None,"candidates":[{"name","b64","rejected_why"}],"problem_reason":str|None}`.

- [ ] **Step 1: Write the failing test**

```python
import os, tempfile
from unittest import mock
from django.test import TestCase
from django.core.management import call_command
from fundraising.models import ContentStory


class BackfillCommandTests(TestCase):
    def setUp(self):
        self.report = os.path.join(tempfile.mkdtemp(), "sheet.html")

    def _run(self, **kw):
        call_command("backfill_story_heroes", report=self.report, **kw)

    @mock.patch("fundraising.services.photos.upload_hero", return_value="https://storage.googleapis.com/masi-website/fundraising/heroes/recF.jpg")
    @mock.patch("fundraising.services.photos.pick_hero", return_value={"chosen_index": 0, "reason": "ok", "rejected": [], "fallback": False})
    @mock.patch("fundraising.services.photos.downscale_jpeg", return_value=b"THUMB")
    @mock.patch("fundraising.services.photos.download_bytes", return_value=b"RAW")
    @mock.patch("fundraising.services.photos.list_candidate_images", return_value=[{"id": "a", "name": "a.jpg", "mimeType": "image/jpeg"}])
    @mock.patch("fundraising.services.photos.gcs_bucket")
    @mock.patch("fundraising.services.photos.anthropic_client")
    @mock.patch("fundraising.services.photos.drive_client")
    def test_folder_story_gets_hero(self, *_):
        s = ContentStory.objects.create(source_airtable_id="recF", title="Nomsa",
            drive_link="https://drive.google.com/drive/folders/FID")
        self._run()
        s.refresh_from_db()
        self.assertTrue(s.hero_image_url.endswith("recF.jpg"))
        self.assertTrue(os.path.exists(self.report))

    @mock.patch("fundraising.services.photos.gcs_bucket")
    @mock.patch("fundraising.services.photos.anthropic_client")
    @mock.patch("fundraising.services.photos.drive_client")
    def test_search_url_is_a_problem_not_a_crash(self, *_):
        s = ContentStory.objects.create(source_airtable_id="recS", title="Usisipho",
            drive_link="https://drive.google.com/drive/search?q=Usisipho")
        self._run()
        s.refresh_from_db()
        self.assertEqual(s.hero_image_url, "")

    @mock.patch("fundraising.services.photos.upload_hero", return_value="https://x/recF.jpg")
    @mock.patch("fundraising.services.photos.pick_hero", return_value={"chosen_index": 0, "reason": "ok", "rejected": [], "fallback": False})
    @mock.patch("fundraising.services.photos.downscale_jpeg", return_value=b"T")
    @mock.patch("fundraising.services.photos.download_bytes", return_value=b"R")
    @mock.patch("fundraising.services.photos.list_candidate_images", return_value=[{"id": "a", "name": "a.jpg", "mimeType": "image/jpeg"}])
    @mock.patch("fundraising.services.photos.gcs_bucket")
    @mock.patch("fundraising.services.photos.anthropic_client")
    @mock.patch("fundraising.services.photos.drive_client")
    def test_dry_run_does_not_save(self, *_):
        s = ContentStory.objects.create(source_airtable_id="recF", title="Nomsa",
            drive_link="https://drive.google.com/drive/folders/FID")
        self._run(dry_run=True)
        s.refresh_from_db()
        self.assertEqual(s.hero_image_url, "")
        self.assertTrue(os.path.exists(self.report))

    @mock.patch("fundraising.services.photos.upload_hero")
    @mock.patch("fundraising.services.photos.pick_hero", return_value={"chosen_index": 0, "reason": "no parseable choice", "rejected": [], "fallback": True})
    @mock.patch("fundraising.services.photos.downscale_jpeg", return_value=b"T")
    @mock.patch("fundraising.services.photos.download_bytes", return_value=b"R")
    @mock.patch("fundraising.services.photos.list_candidate_images", return_value=[
        {"id": "a", "name": "a.jpg", "mimeType": "image/jpeg"},
        {"id": "b", "name": "b.jpg", "mimeType": "image/jpeg"}])
    @mock.patch("fundraising.services.photos.gcs_bucket")
    @mock.patch("fundraising.services.photos.anthropic_client")
    @mock.patch("fundraising.services.photos.drive_client")
    def test_multi_candidate_model_failure_is_problem_not_published(
            self, m_drive, m_anthropic, m_bucket, m_list, m_download, m_downscale, m_pick, m_upload):
        # Two images + a fallback pick means the model could not choose -> no upload, no save.
        s = ContentStory.objects.create(source_airtable_id="recM", title="Two Photos",
            drive_link="https://drive.google.com/drive/folders/FID")
        self._run()
        s.refresh_from_db()
        self.assertEqual(s.hero_image_url, "")
        m_upload.assert_not_called()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.BackfillCommandTests -v2`
Expected: FAIL (Unknown command `backfill_story_heroes`).

- [ ] **Step 3: Implement `fundraising/management/commands/backfill_story_heroes.py`**

```python
import base64

from django.core.management.base import BaseCommand

from fundraising.models import ContentStory
from fundraising.services import photos, photos_report


class Command(BaseCommand):
    help = "Curate one hero photo per Success Story and cache it on GCS (ADR 0008)."

    def add_arguments(self, parser):
        parser.add_argument("--force", action="store_true", help="Re-pick stories that already have a hero")
        parser.add_argument("--limit", type=int, default=None)
        parser.add_argument("--story", type=str, default=None, help="A single source_airtable_id")
        parser.add_argument("--dry-run", action="store_true", help="Pick and report, but do not upload or save")
        parser.add_argument("--report", type=str, default="fundraising_hero_contact_sheet.html")

    def handle(self, *args, **opts):
        dry = opts["dry_run"]
        # is_active gate per review (all 87 are active today; future-proof). No consent
        # gate by decision (Jim, 2026-07-08) - see "Review decisions" in the plan.
        qs = ContentStory.objects.filter(is_active=True).exclude(drive_link="").order_by("-date_published")
        if opts["story"]:
            qs = qs.filter(source_airtable_id=opts["story"])
        elif not opts["force"]:
            qs = qs.filter(hero_image_url="")
        if opts["limit"]:
            qs = qs[:opts["limit"]]

        drive = photos.drive_client()
        client = photos.anthropic_client()
        bucket = None if dry else photos.gcs_bucket()

        records, stored, fallback, problems = [], 0, 0, 0
        for story in qs:
            rec = self._process(story, drive, client, bucket, dry)
            records.append(rec)
            if rec["status"] == "problem":
                problems += 1
            else:
                stored += 1
                fallback += 1 if rec["fallback"] else 0

        html = photos_report.render_contact_sheet(records)
        with open(opts["report"], "w", encoding="utf-8") as fh:
            fh.write(html)
        self.stdout.write(self.style.SUCCESS(
            f"stored={stored} (fallback={fallback}) problems={problems}"
            f"{' [dry-run]' if dry else ''} -> {opts['report']}"))

    def _process(self, story, drive, client, bucket, dry):
        base = {"title": str(story), "meta": _meta(story), "fallback": False,
                "chosen_index": None, "reason": "", "hero_url": None,
                "candidates": [], "problem_reason": None}
        try:
            kind, ref_id = photos.parse_drive_ref(story.drive_link)
            if kind is None:
                return {**base, "status": "problem", "problem_reason": "no usable link (search URL or empty)"}
            try:
                candidates = photos.list_candidate_images(drive, kind, ref_id)
            except photos.DriveAccessError:
                return {**base, "status": "problem", "problem_reason": "drive 404 (not shared or deleted)"}
            if not candidates:
                return {**base, "status": "problem", "problem_reason": "no images (video-only or empty folder)"}

            thumbs, full = [], []
            for c in candidates:
                try:
                    raw = photos.download_bytes(drive, c["id"])
                    thumb = photos.downscale_jpeg(raw)
                except photos.UnreadableImage:
                    continue
                thumbs.append({"name": c["name"], "b64": base64.b64encode(thumb).decode()})
                full.append((raw, c.get("mimeType", "image/jpeg")))
            if not thumbs:
                return {**base, "status": "problem", "problem_reason": "no readable images"}

            context = {"feature_name": story.feature_name, "headline": story.headline,
                       "narrative": (story.narrative or "")[:600], "category": story.category}
            pick = photos.pick_hero(client, thumbs, context)
            # Multi-candidate fallback = the model could not choose. Do NOT publish an
            # arbitrary image; surface as a problem for a manual re-run. Only the
            # single-candidate fallback (the sole image) proceeds to store.
            if pick["fallback"] and len(thumbs) > 1:
                return {**base, "status": "problem",
                        "problem_reason": f"model could not pick a hero ({pick['reason']}); needs manual choice"}
            idx = pick["chosen_index"]
            raw, mime = full[idx]

            hero_url = None
            if not dry:
                hero_url = photos.upload_hero(bucket, story, raw, mime)
                story.hero_image_url = hero_url
                story.save(update_fields=["hero_image_url", "updated_at"])

            rej = {r.get("index"): r.get("why") for r in pick.get("rejected", []) if isinstance(r, dict)}
            cands = [{"name": t["name"], "b64": t["b64"],
                      "rejected_why": None if i == idx else rej.get(i)} for i, t in enumerate(thumbs)]
            return {**base, "status": "dry" if dry else "stored", "fallback": pick["fallback"],
                    "chosen_index": idx, "reason": pick["reason"], "hero_url": hero_url, "candidates": cands}
        except Exception as e:  # never abort the batch on one story
            return {**base, "status": "problem", "problem_reason": f"error: {e}"}


def _meta(story):
    parts = []
    if story.school:
        parts.append(", ".join(story.school) if isinstance(story.school, list) else str(story.school))
    if story.date_published:
        parts.append(str(story.date_published))
    return " - ".join(parts)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising.tests.BackfillCommandTests -v2`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the full fundraising suite**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising -v2`
Expected: PASS (all prior + new classes).

- [ ] **Step 6: Commit**

```bash
git add fundraising/management/commands/backfill_story_heroes.py fundraising/tests.py
git commit -m "feat(fundraising): backfill_story_heroes command"
```

---

### Task 9: Codex build verification gate (SQLite, no network)

**Files:** none (verification only).

- [ ] **Step 1: Full suite green on SQLite**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py test fundraising -v2`
Expected: all tests PASS, zero network calls (every Drive/GCS/Anthropic client is mocked).

- [ ] **Step 2: Migration check**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python manage.py makemigrations fundraising --check --dry-run`
Expected: `No changes detected` (0003 already captures the field).

- [ ] **Step 3: Import smoke check**

Run: `DATABASE_URL=sqlite:///db.sqlite3 python -c "import django,os;os.environ.setdefault('DJANGO_SETTINGS_MODULE','masi_website.settings');django.setup();from fundraising.services import photos, photos_report;print('imports ok')"`
Expected: `imports ok` (all libs resolve in the venv).

This is the boundary of Codex's work. Hand back to the orchestrating Claude for Task 10.

---

### Task 10: Live verification (orchestrating Claude only — NOT Codex)

Codex's sandbox has no network or Postgres, so the live pass is run by Claude against `masi_db` + real Drive/GCS/Anthropic with `GOOGLE_CREDENTIALS`/`ANTHROPIC_API_KEY` in the backend `.env`.

- [ ] **Step 1: Migrate the snapshot DB** — `python manage.py migrate fundraising` (default `DATABASE_URL`).
- [ ] **Step 2: Dry run a sample** — `python manage.py backfill_story_heroes --dry-run --limit 5`; open the report HTML; confirm real thumbnails render and the subject-aware picks look right (a woman story picks the woman, etc.).
- [ ] **Step 3: Full backfill** — `python manage.py backfill_story_heroes`; confirm summary `stored≈85 problems≈7`.
- [ ] **Step 4: Public-URL check** — `curl -sSI "$(one stored hero_image_url)"` returns `HTTP/2 200` with an `image/*` content-type (proves the no-ACL public-serving assumption).
- [ ] **Step 5: Problems audit** — confirm the Problems table lists the 2 search URLs, the 1 video, and the empties, matching the known 7.
- [ ] **Step 6: Send Jim the contact sheet** for his one-time QA pass; re-run any outliers with `--story <id> --force` after he fixes the Airtable link.

---

## Self-Review

- **Spec coverage:** field+migration (T1), parse (T2), list+recurse+404 (T3), download+downscale+HEIC (T4), subject-aware pick+fallbacks (T5), upload key/no-ACL + client builders (T6), contact sheet (T7), command+flags+idempotency+per-story safety (T8), SQLite gate (T9), live run incl. public-URL check (T10). All spec pieces mapped.
- **Placeholders:** none — every step carries real code or a concrete command + expected output.
- **Type consistency:** `pick_hero` returns `{chosen_index,reason,rejected,fallback}` consumed identically in T8; candidate dict `{name,b64}` produced in T8, consumed in T5/T7; record dict defined in T8 matches T7's reader; GCS key `fundraising/heroes/<id>.<ext>` identical in T6 and asserted in T6 tests.

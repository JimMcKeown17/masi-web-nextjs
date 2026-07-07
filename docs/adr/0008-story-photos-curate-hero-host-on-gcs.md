# Story photos: curate one hero per story, host it on GCS

Story photos live in per-child Google Drive folders, linked from the Airtable "Google Drive
Link" column on Success Stories. Newsletters must show a photo, but the system does not embed
Drive links: a Drive share link renders a preview page, not an image, and Airtable attachment
URLs expire. Instead, a curation step picks ONE hero photo per story with a single vision pass
(on downscaled thumbnails), copies it to Google Cloud Storage, and stores a durable
`hero_image_url` on `ContentStory`. Every newsletter embeds the cached GCS URL.

Access: the backend reads Drive through the existing Google Cloud service account (Drive API,
`drive.readonly` scope); the Drive photos folder is shared with the service account's email.
This works across accounts because a service account has its own identity, so it does not
matter that Masi's Drive lives under one Google account and GCS under another. The same
service account writes the hero to GCS. See `docs/fundraising-photo-pipeline-setup.md`.

Why: Drive links cannot go into email, and looking at every photo on every newsletter would be
slow and token-heavy. Curating one hero per story and caching it is the same "curate once,
reuse forever" pattern as the Voice Guide and PublishedStats: the expensive judgment is made a
single time and cached as a durable artifact, so the per-newsletter path stays cheap and
instant. It also removes staff friction: they keep dropping photos in the child's Drive folder
and pasting the link, exactly as they do today, and the agent does the curation by hand would
otherwise require.

Consequences: a one-time backfill vision pass over existing stories, then only new stories
cost anything (a few thumbnails each). A hero rubric governs selection (single child in sharp
focus, warm, uncluttered background, landscape framing for an email header; skip group-only,
blurry, duplicate, or cut-out-on-transparent shots). Selection quality depends on the rubric
plus model vision; a later refinement can let staff override by marking a hero in Airtable.

Considered: staff pick the hero in Airtable (zero AI cost, but adds the friction Jim wants
removed); embed Drive or Airtable URLs directly (not possible, not email-safe, they expire);
take the first image or a simple heuristic (low quality given how varied the raw photos are).

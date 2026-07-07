# Photo Pipeline Setup: Google Drive to GCS (cross-account)

Goal: let the backend read story photos from Masi's Google Drive (owned by
**mckeown.james@gmail.com**) and host the chosen hero photo on Masi's GCS bucket
(GCP project under **jim.mckeown@masinyusane.org**). One service account does both.

## Why the two different emails do not matter

A Google Cloud **service account** has its own identity, an email that looks like
`something@your-project-id.iam.gserviceaccount.com`. You grant it access to a Drive folder
by **sharing that folder with the service account's email**, exactly like sharing with a
person. The human owner of the Drive is irrelevant. So the backend uses one credential
(`GOOGLE_CREDENTIALS`, the service account key you already use for GCS) to both read Drive
and write GCS.

## One-time setup (about 5 minutes)

### 1. Find the service account email
Signed in as **jim.mckeown@masinyusane.org** (the GCS project owner):
- Google Cloud Console -> IAM & Admin -> Service Accounts.
- Find the service account whose key is in your backend `GOOGLE_CREDENTIALS`.
- Copy its email (ends in `.iam.gserviceaccount.com`).
- (Alternatively: open the `GOOGLE_CREDENTIALS` JSON and copy the `client_email` value.)

### 2. Enable the Google Drive API in that project
Same Console, same project:
- APIs & Services -> Library -> search "Google Drive API" -> Enable.
(The GCS API is already enabled since you write images there.)

### 3. Share the photos folder with the service account
Signed in as **mckeown.james@gmail.com** (the Drive owner):
- Open the **top-level folder** that contains all the per-child photo folders (the parent of
  "Dorothy Tomlinson Foundation", etc.). Share the highest level you can so you never have to
  share again per child.
- Click Share, paste the service account email from step 1, set role to **Viewer**, Send.
- No invitation acceptance is needed; service accounts auto-accept.

### 4. Confirm GCS write access (probably already done)
The same service account already writes site images to the bucket (`GS_BUCKET_NAME`, e.g.
`masi-website`). If not, grant it **Storage Object Admin** on that bucket in the GCS project.

## What the backend will do (no action from you)

- Add `google-api-python-client` to `requirements.txt`.
- Build the Drive client from `GOOGLE_CREDENTIALS` with the read-only Drive scope
  (`https://www.googleapis.com/auth/drive.readonly`).
- A management command (one-time backfill, then nightly for new stories) will, per story:
  1. Parse the Airtable "Google Drive Link" into a folder id (or a single file id).
  2. List the images in that folder via the Drive API.
  3. Pick ONE hero photo with a vision pass on downscaled thumbnails (curate once), against a
     rubric (single child, sharp focus, warm, uncluttered, landscape; skip group/blurry/cut-out).
  4. Download the hero and upload it to GCS, then store the durable GCS URL on the
     `ContentStory.hero_image_url` field.
- Newsletters embed the cached GCS URL. Zero per-issue vision or Drive cost after the backfill.

## Checklist for you
- [ ] Copy the service account email (step 1).
- [ ] Enable the Google Drive API (step 2).
- [ ] Share the top-level photos folder with the service account email as Viewer (step 3).
- [ ] Tell the next session the folder is shared, and it will build the backfill command.

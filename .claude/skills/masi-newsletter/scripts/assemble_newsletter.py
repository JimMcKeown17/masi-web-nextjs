#!/usr/bin/env python3
"""Assemble a one-off Masi newsletter.

Hosts the photo(s) on Masi's GCS bucket (optimized for email) and wraps a
Claude-written body in the SAME Masi email template the fundraising system uses,
so a quick one-off looks identical to a system-generated issue.

Reuses the backend's `email_template.render_email` and `photos` helpers (imported
without Django) so voice/layout never drift. Run with the BACKEND venv python:

  cd "<backend>" && venv/bin/python \
    .../assemble_newsletter.py \
    --photos lead.jpg extra1.jpg \
    --body-file body.html \
    --cta-text "Give the Gift of Reading" \
    --cta-url "https://masinyusane.org/donate" \
    --out newsletter.html

The FIRST photo is the lead (shown in the header); any others are referenced in
the body by their local filename (e.g. <img src="extra1.jpg">) and rewritten to
their hosted URL here.
"""
import argparse
import os
import sys
import time


def main():
    ap = argparse.ArgumentParser(description="Assemble a one-off Masi newsletter.")
    ap.add_argument("--photos", nargs="+", default=[],
                    help="Photo files to host; the FIRST is the lead (header) photo unless --lead-url is given.")
    ap.add_argument("--lead-url", default="",
                    help="Existing hosted lead photo URL (e.g. a GCS story hero); skips uploading a lead.")
    ap.add_argument("--body-file", required=True,
                    help="HTML body written in Masi voice (may reference extra photos by filename).")
    ap.add_argument("--cta-text", default=None, help='Donate button text (default "Donate").')
    ap.add_argument("--cta-url", default=None, help="Donate button URL (default the donate page).")
    ap.add_argument("--out", required=True, help="Output HTML file.")
    ap.add_argument("--prefix", default="fundraising/oneoff", help="GCS key prefix.")
    ap.add_argument("--backend",
                    default=os.environ.get("MASI_BACKEND_DIR",
                                           "/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main"),
                    help="Path to the Django backend (for reused code + .env GOOGLE_CREDENTIALS).")
    args = ap.parse_args()

    sys.path.insert(0, args.backend)
    from dotenv import load_dotenv
    load_dotenv(os.path.join(args.backend, ".env"))  # GOOGLE_CREDENTIALS for GCS

    from fundraising.services import photos
    from fundraising.services.email_template import render_email

    if not args.photos and not args.lead_url:
        ap.error("provide --photos and/or --lead-url")

    bucket_name = os.environ.get("GS_BUCKET_NAME", "masi-website").strip('"')
    bucket = photos.gcs_bucket() if args.photos else None
    stamp = int(time.time())

    url_by_filename = {}
    lead_url = args.lead_url
    for i, path in enumerate(args.photos):
        with open(path, "rb") as fh:
            optimized = photos.optimize_for_email(fh.read())  # ~1600px JPEG
        base = os.path.splitext(os.path.basename(path))[0].replace(" ", "-")
        key = f"{args.prefix}/{base}-{stamp}-{i}.jpg"
        bucket.blob(key).upload_from_string(optimized, content_type="image/jpeg")
        url = f"https://storage.googleapis.com/{bucket_name}/{key}"
        url_by_filename[os.path.basename(path)] = url
        if i == 0 and not lead_url:
            lead_url = url

    with open(args.body_file, encoding="utf-8") as fh:
        body = fh.read()
    # Rewrite any inline references to a local photo filename -> its hosted URL.
    for filename, url in url_by_filename.items():
        body = body.replace(filename, url)

    full_html = render_email(body, lead_url, args.cta_text, args.cta_url)
    with open(args.out, "w", encoding="utf-8") as fh:
        fh.write(full_html)

    print(f"lead photo: {lead_url}")
    for filename, url in url_by_filename.items():
        print(f"hosted: {filename} -> {url}")
    print(f"wrote: {args.out}")


if __name__ == "__main__":
    main()

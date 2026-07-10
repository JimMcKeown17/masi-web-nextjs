# Rendered newsletter drafts

Every composed issue, saved as the full email HTML for easy opening and reference.
Files are named `YYYY-MM-DD-draft-<spine id>-<subject slug>.html`; the spine `Draft`
row with that id (local masi_db) holds the same HTML plus source metadata.

Convention: the Newsletter Studio saves its rendered output here at the
assemble-and-show step; cron drafts get exported here when reviewed.

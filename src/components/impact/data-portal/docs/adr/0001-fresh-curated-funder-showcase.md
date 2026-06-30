# Impact Data Portal is a fresh, curated funder showcase — not an explorer

## Context

The current `/impact/data-portal` is a bare iframe to the Streamlit app (`data.masinyusane.org`), which is built for project managers and is "insanely complex for the average user." We want a native, on-brand portal for a different reader.

## Decision

Build the portal for a single persona — a **Funder Analyst** at a prospective institutional funder — and design it "rigorous but legible." Three coupled choices follow:

1. **Curated, not exploratory.** It shows a fixed set of **Headline Results** (outcomes and reach), never **Operational Metrics** (sessions, assessment counts, coach leaderboards, data-quality flags).
2. **Fresh, not interactive.** Numbers are recomputed from the live Postgres databases and stamped "as of", but the viewer generally cannot re-slice them. Interactivity is spent deliberately and sparingly (the Children view's per-child radar lookup), not as a general query engine.
3. **The Streamlit Deep-Dive is retained, not replaced.** Anyone wanting operational depth is linked out to it.

## Consequences

- The expensive "live query engine + per-school/grade/cohort filtering" is explicitly out of scope; the cheap, on-brand `published-stats`-style delivery (one cached payload) is reused, with its *source* changed from hand-typed literals to DB-derived aggregations.
- Headline figures must stop being hardcoded literals (e.g. 515 youth, the 74/54/30/27 control bars) — an analyst reads round hardcoded numbers as marketing. Deriving them from the DB is the work this unlocks.
- The portal must query two Postgres databases (Main Masi + the separate Zazi iZandi DB, server-side).

## Status

accepted (2026-06-18)

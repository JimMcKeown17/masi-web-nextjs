# Children view is curated and fully anonymized, not a browseable index

## Context

The Children view shows individual-child impact (the baseline→endline radar, "where change happened", cohort percentile) — the portal's one interactive surface. Unlike the Streamlit Deep-Dive, which is login-gated and masks names, this portal is on a public URL. Individual children's assessment records on a public page implicate POPIA (SA's Protection of Personal Information Act).

## Decision

The Children view presents a **small, deliberately curated set** of learners (an Impact Leaderboard of top improvers plus a few representative profiles), **fully anonymized** — pseudonymous ("Learner 0427"), grade and suburb-level context only, no names and no school-precise PII. It is **not** a searchable/browseable index of all children.

## Consequences

- A Funder Analyst gets proof the model works on real kids, interactively, without the governance liability of exposing the full child database.
- Full browseable exploration, if ever wanted, is additive later — but starts off the table by default.
- Backend must serve only de-identified learner records to this view.

## Status

accepted (2026-06-18)

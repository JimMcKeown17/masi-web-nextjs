# Headline Results are recomputed and verified server-side, not ported from Streamlit

## Context

The Streamlit Deep-Dive computes every metric in Python over CSV/parquet snapshots. The audit found (a) several headline numbers are hardcoded literals, (b) some baselines are hardcoded fallbacks (Grade R=2, G1=15, G2=37), and (c) at least two real bugs in the computation (an EGRA improvement-% referencing the wrong column; an operator-precedence error in literacy improvement %). The obvious shortcut is to reuse/port that Python.

## Decision

Every **Headline Result** is **recomputed from Postgres in a backend aggregation, reimplemented and verified** against known-good figures — never blind-ported from the Streamlit code. Each result is served with provenance (source, population/N, "as of" date, comparison group) and any comparability caveat (e.g. "3-month dose", "cross-sectional — not matched learners"). Caveats are first-class `MethodologyNote` disclosures, visible-but-collapsible, not buried fine print.

## Consequences

- This is the real engineering cost of the portal: a verified backend metric layer, not a UI reskin of Streamlit.
- Hardcoded literals and inherited bugs are eliminated by construction.
- Comparability rules are enforced in presentation (standardized scores across languages, never raw; cohort/dose labeled).
- Caveat presentation will be iterated during the build, not fully specified up front.

## Status

accepted (2026-06-18)

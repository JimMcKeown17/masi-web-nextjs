# Spec: One-time Zazi → Canonical Child Reconciliation

Date: 2026-06-18. Status: design approved (Jim). Companion to the audit `zazi-canonical-child-match-audit-2026-06-18.md`. This spec defines a **one-time** cleanup to find every Zazi iZandi child who received sessions but is missing from (or mis-linked in) the canonical Child Registry, and produce worklists Jim loads into Airtable manually.

## Goal & success criterion

- **Success = no child who received Zazi sessions is absent from the canonical Child Registry.** (Recall over precision — bias to over-include.)
- Deliver two human-actionable worklists (import, relink) Jim loads into Airtable.
- One-time. TeamPact is being retired; no repeatable engine, no schema/workflow overhaul.

## Why this is hard (constraints)

- **No date of birth** anywhere — `teampact_participants.born_at`/`year_born` are null for all 23,525; canonical has no birth field. The one deterministic dedupe/match key does not exist.
- **TeamPact has internal cross-year duplicates** — the same child can hold multiple `participant_id`s (it did not dedupe over ~2 years). So `participant_id` is *not* canonical; we keep the **most-recent** id per child.
- **School names are messy free-text** year-over-year → unusable as a match/dedupe key (context only).
- **Name is the only usable identity signal**, and it is messy → a perfect automated answer is impossible; output is a verified worklist.
- No code writes the Child Registry — it is populated manually. Mcodes are **assigned manually** by Jim.

## Method (mirrors staff's intended dedupe → VLOOKUP, instrumented)

Sources (read-only, prod): Zazi `teampact_participants` + `teampact_sessions_complete` (Frankfurt `RENDER_EXTERNAL_DB_URL`); Masi canonical participant-id set from the Airtable Child Registry `Teampact Participant ID` lookup; canonical names from prod `canonical_children`.

1. **Session-active filter.** Keep participants with `latest_session_date` present OR `total_attendance > 0` (≈17,113). Conservative — the must-not-miss set.
2. **Dedupe by token-sort name key.** key = lowercased, punctuation-stripped, whitespace-collapsed, **tokens sorted** (so "Buhle Mango" == "mango, buhle"). Cluster = one distinct child. Keep the **most-recent `participant_id`**: latest `latest_session_date`, tiebreak highest id.
3. **Classify each distinct child:**
   - `covered` — any id in the cluster is already linked in canonical (golden-key hit). No action.
   - `relink` — not covered, but the name key exists in canonical → child is present, id never imported. Action: attach most-recent id to that `child_uid`.
   - `import` — not covered, no name match → truly missing. Action: create a new record + manual Mcode + most-recent id.
4. **Near-match safety pass** (on `import` candidates): edit-distance / token-set fuzzy against canonical names; any close match is re-bucketed `review_possible_duplicate` (verify before creating, to avoid duplicate Mcodes).

## Outputs (CSVs in `docs/discovery/`)

- **Import list** — `participant_id` (most-recent), `firstname`, `lastname`, `gender`, `recent_school` (context), `suggested_mcode` (current max + running counter; Jim confirms/overrides), `latest_session_year`.
- **Relink list** — `participant_id` (most-recent), name, the canonical `child_uid` + `mcode` to attach to, plus the `review_possible_duplicate` rows from the near-match pass.

## Current sizing (token-sort dedupe; pre near-match pass)

15,721 distinct session children; **covered 14,529 (92.4%)**; relink 180; import 1,012; real gap **1,192 (7.6%)**. The near-match pass will move some of the 1,012 into review. Final numbers produced at run time.

## Caveats / verification

- Name-only matching has irreducible error without DOB: homonyms can false-match (over-link) and spelling variants can false-miss (over-import). Both lists are **high-recall starting points to spot-verify**, not blind-load. Recommend verifying a ~20-row sample of each bucket first.
- `suggested_mcode` is a convenience; Jim assigns the real Mcodes.

## Non-goals

No automated Airtable writes; no repeatable reconciliation service; no `participant_id → mcode` cross-app bridge; no canonical dedupe beyond what the worklists surface.

## Acceptance

Jim loads the import + relink lists into Airtable; a re-run of the same method then shows the session-active gap at ~0 (residual = verified non-children / genuine ambiguities).

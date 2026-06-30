# Zazi iZandi ↔ Canonical Child Match Audit

Date: 2026-06-18. Discovery artifact. Question (Jim): *does the canonical Masi children's database account for every Zazi iZandi child — is it a 100% match?*

**Answer: No.** Of the children who actually received Zazi sessions, ~85% are in canonical; the rest are part dedup-bookkeeping, part a genuine import gap. Details below.

## Sources compared (all read-only, prod)

- **Zazi side (the universe):** `teampact_participants` in the Zazi backend prod DB (`Zazi_iZandi_Website_2025`, reached via `RENDER_EXTERNAL_DB_URL`). 23,525 participants, one org (450), all active, none archived. `participant_id` is the TeamPact id (integer PK).
- **Session activity:** `teampact_sessions_complete` (110,591 sessions, 13,056 distinct participants, `program_name` = school).
- **Masi side (the link):** the Airtable Child Registry field `Teampact Participant ID` (a lookup → single-element list), which is what `sync_airtable_children` now maps into `CanonicalChild.participant_id`. 31,888 Airtable records (all valid: every one has Mcode + Child UID).
- **Canonical DB:** prod `canonical_children` = 31,894 rows (the local snapshot is stale at ~10,830 — ignore it).

## Counts

| | Value |
|---|---|
| Canonical children (prod `canonical_children`) | **31,894** |
| Airtable Child Registry records (all valid) | 31,888 |
| Children with a linked Teampact Participant ID | 22,512 (**71%**) — 22,505 distinct |
| Children with >1 participant id | 8 (negligible — scalar field is fine) |
| Duplicate links (2 canonical kids → same participant id) | 15 (minor cleanup) |

## The match

Universe Z = 23,525 Zazi participants. Masi-linked distinct = 22,505.

| | Count |
|---|---|
| Matched (in both) | 20,204 |
| Zazi NOT in canonical (gap) | **3,321 (14.1%)** |
| Masi link NOT in current Zazi (dangling) | 2,301 — churn (TeamPact keeps 0 archived; leavers drop off) + typos |

### Restricted to children who actually received sessions (the must-be-in-canonical set)

By participant-record signals (`latest_session_date`/`total_attendance`), 17,113 are session-active:

| Session-active children | Count |
|---|---|
| In canonical | 14,574 (**85.2%**) |
| Missing | **2,539 (14.8%)** |
| → name exists in canonical (dedup/relink) | 787 |
| → name not found (likely truly missing) | **1,752** |
| Missing with **no** sessions (low concern) | 782 |

(Using the actual `teampact_sessions_complete` table instead — 13,056 kids with a known school — the missing rate is 12.8% / 1,669. The two session-active definitions disagree by ~4,000; the sessions table may be a partial sync. Both land at ~13-15% missing.)

## Dedup hypothesis — partly right, not the whole story

Jim's theory: TeamPact didn't dedupe children across years (same child → two participant_ids); staff deduped in canonical, keeping the most recent id, so "missing" ids are old/superseded.

- **True for ~787** (name exists in canonical under another id → relink).
- **Not true for ~1,752**, and decisively: the missing span both years — **1,431 have 2025 sessions and 1,108 have 2026 (current-year) sessions.** If it were purely old-duplicate churn, missing would skew old. Current-year, session-active children are absent from canonical. Confirmed by Jim's manual spot-check (first missing kid had no canonical record).

## Root cause (as far as code can show)

- **No code writes the Child Registry** — `sync_airtable_children` only *reads* it. The registry is populated **manually by staff** (or Airtable automations). So this is a process gap, not a writer bug.
- **The gap is moderately concentrated by school:** 55 of 186 schools account for 80% of the missing. A handful look like whole-school/class omissions never entered into the registry:
  - Gelvandale Primary 83% (30/36), Sikhothina Primary 70% (26/37), Amanzi Primary 68% (15/22), Kayser Ngxwana Primary 64% (47/73), Samuel Nongogo Primary 64% (47/74).
- The remainder is broadly distributed at ~12-30% per school — consistent with entry lag on newer enrollments and unmatched transfers.

Interpretation: the manual entry process (a) missed some schools/classes entirely, and (b) lags across the board on recent enrollments. The mostly-missing schools above are the highest-value places to check first.

## Caveats

- Name matching is exact-normalized (lower/trim/collapse spaces, first+surname both orders). Spelling/word-order variants inflate "name not found", so **1,752 is an upper bound** on truly-missing; some belong in the relink bucket. Spot-check ~20 before bulk action.
- "Session-active" counts differ by source (participant-record fields vs the sessions table); treat ~13-15% as the missing range.

## Artifacts (this folder)

- `zazi-session-active-not-in-canonical-2026-06-18.csv` — all 2,539 session-active missing, bucketed (`dedup_relink_candidate` / `likely_missing`); `canonical_match_child_uid` gives the relink target for the 787.
- `zazi-likely-missing-import-2026-06-18.csv` — the 1,752 likely-missing subset.
- `zazi-gap-by-school-2026-06-18.csv` — per-school: session_kids, missing, likely_missing, missing_pct.

## Recommended actions

1. **Relink the 787** in Airtable using `canonical_match_child_uid`.
2. **Triage the 1,752** starting with the mostly-missing schools above; confirm whether those classes were never entered.
3. Clean up the 15 duplicate participant-id links.
4. This linking/import gap is the **gate on the grid's Zazi-inclusive unique-beneficiary count** (`_plans/site-programme-grid.md` Increment 2). The direct join works for the 86% matched; the dedup rollup will undercount Zazi reach by ~13-15% until the gap is closed.

# Zazi iZandi to Canonical Reconciliation: Status and Outstanding Work

Status as of 2026-06-30. Compiled from the discovery artifacts on the
`feature/agentic-fundraising` branch (`docs/discovery/`) plus the uncommitted
working notes. This is a one-time data reconciliation, not a feature.

## TL;DR

**Not complete.** The diagnosis is mature and the worklists exist, but no fixes
have been written back to any database yet. There are two separable problems
(school mapping and child mapping), staff are working the child side manually,
and several of Jim's questions are still open.

## The work splits into three problems

### 1. Masi-side schools missing a `school_uid` (small, quick)
15 Masi schools lack a `school_uid`, so they cannot join to 2026 session data.
- 3 already exist in the 2026 Airtable schools base with a uid but the link is
  broken (Lingelethu, Msobomvu Full Service, Stephen Mazungula, all Primary).
  Msobomvu is SCH-00323. Likely fix: the school sync should confirm/repair the
  uid on these records.
- 12 are not in the 2026 Airtable schools base (older school_id-only records),
  mostly ECD/preschools. Jim's read: these are real sites whose names differ
  slightly in Airtable (spelling variants causing apparent duplicates in the
  Postgres schools table), e.g. "Baby Daycare" vs "Baby Day Care", Kideo
  Learning Center, "Arise and Shine" vs "Rise and Shine", Ben Nyati.
- **Open:** a couple are exact-name matches (Nonkqubela, Emfundweni) yet still
  appear on the unmatched list. Root cause not yet established.

**Outstanding:** repair the 3 broken links; resolve the 12 (dedupe the spelling
variants or add the genuinely-new sites); explain the exact-match anomalies.

### 2. Zazi-side school name to `school_uid` mapping (mostly done)
The Zazi backend has no native `school_uid`. It identifies schools by free-text
`program_name` and relies on a name-based mapping (`sync_masi_identity`,
fuzzy threshold 90) into `api_schoolidentity2026`.

- Source of truth: the live table `sessions_2026` / model `TeampactSession2026`
  (NOT `teampact_sessions_complete`, which is stale at 2026-02-24).
- **State: 87 of 95 schools mapped (6,708 kids); 8 unmapped (584 kids, ~8%).**
- The top 5 unmapped are simple name-suffix misses and have known targets:
  Sapphire Road Primary -> SCH-00051, St Joseph's (RC) Primary -> SCH-00124,
  Ntyatyambo Primary -> SCH-00083, Jarvis Gqamlana Public Primary -> SCH-00049,
  Mzomtsha Primary -> SCH-00157. Mapping these 5 covers 524 of the 584 kids.
- Remaining 3: Malukhanye ECD (not in Masi, needs a School record), Masinyusane
  (an org/training entry, exclude from grid), Witterkleibosch (1 kid, likely a
  typo, verify).
- Root cause of the misses: Zazi names carry suffixes ("Road Primary School",
  "Public Primary School", "(RC) Primary School") that the suffix-strip + fuzzy
  match did not reduce to the short Masi names.

**Outstanding:** apply the 5 manual mappings (insert rows into ZZ
`api_schoolidentity2026` with `match_method='manual'`, or improve
`sync_masi_identity` suffix handling and re-run); create a School record for
Malukhanye ECD; verify Witterkleibosch.

### 3. Child-level canonical reconciliation (the big one, in progress by staff)
Question Jim asked: does canonical Masi account for every Zazi child? Answer: no.
Of children who actually received Zazi sessions, ~85% are in canonical.

Key numbers (prod, read-only, 2026-06-18 audit):
- Canonical children: 31,894. Airtable Child Registry records: 31,888 (all valid).
- Children with a linked Teampact Participant ID: 22,512 (71%).
- Session-active children: ~17,113. In canonical: 14,574 (85.2%).
  Missing: 2,539 (14.8%), split into:
  - ~787 whose name exists in canonical under another id -> relink (dedup).
  - ~1,752 name not found -> likely a genuine import gap (upper bound; some are
    spelling/word-order variants that belong in the relink bucket).
- The "missing" span both years: 1,431 have 2025 sessions, 1,108 have 2026
  (current-year) sessions. So it is not purely old-duplicate churn; current-year
  active children are genuinely absent from canonical.

Root cause: no code writes the Child Registry. It is populated manually by staff
(or Airtable automations), so this is a process gap, not a writer bug. The gap
is concentrated: 55 of 186 schools account for 80% of the missing, and a few
look like whole-school/class omissions (Gelvandale Primary 83%, Sikhothina 70%,
Amanzi 68%, Kayser Ngxwana 64%, Samuel Nongogo 64%).

**Outstanding:** relink the 787 using `canonical_match_child_uid`; triage the
1,752 starting with the mostly-missing schools; clean up the 15 duplicate
participant-id links; spot-check ~20 of the "name not found" before any bulk
action (some are variants, not truly missing).

## Why this matters (the consequence)
This linking/import gap gates the School Programme Grid's Zazi-inclusive unique
beneficiary count (Increment 2). The direct school join already works for the
~86% matched, but the deduped rollup will undercount Zazi reach by ~13-15% until
the gap is closed. The grid's per-school children counts you see live today come
from the Masi canonical database, so any child not yet entered there is not
counted, regardless of having Zazi sessions.

## Open questions still on the table (Jim, unanswered)
- Why are the exact-name-match schools (Nonkqubela, Emfundweni) on the unmatched
  list at all?
- Why not add back all of the "active-not-in-canonical" children? Is it because
  some are duplicates? (i.e. clarify exactly how the lists were bucketed.)

## Where the artifacts live
On `feature/zazi-reconciliation` once split out (currently on
`feature/agentic-fundraising`), under `docs/discovery/`:
- `zazi-canonical-child-match-audit-2026-06-18.md` (the full audit)
- `zazi-canonical-cleanup-spec-2026-06-18.md` (the spec)
- `zazi_reconcile.py` (regenerates all the worklists)
- `zazi-session-active-not-in-canonical-2026-06-18.csv` (2,539 missing, bucketed)
- `zazi-likely-missing-import-2026-06-18.csv` (the 1,752 subset)
- `zazi-gap-by-school-2026-06-18.csv` (per-school gap)
- `zazi-import-candidates-2026-06-18.csv`, `zazi-relink-2026-06-18.csv`
- `zazi-school-uid-mapping-2026-06-19.md` (the school mapping worklist, uncommitted)
- `documentation/notes_on_zz_recon.md` (the working Q&A, uncommitted)

## Verification note
All counts are read-only against prod. Name matching is exact-normalized, so
"name not found" is an upper bound on truly-missing. Treat ~13-15% as the
missing range; the two session-active definitions disagree by ~4,000, so the
sessions table may be a partial sync.

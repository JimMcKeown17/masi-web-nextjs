# Zazi school → Masi school_uid mapping worklist (2026-06-19)

The grid's Zazi per-school join needs every ZZ school (`program_name`) mapped to a
Masi `school_uid`. ZZ stores this in `api_schoolidentity2026` (built by
`sync_masi_identity` fuzzy-matching against Masi `/identity/export/`).

**Source of truth = the LIVE table `sessions_2026` (= model `TeampactSession2026`)**,
synced 2026-06-19 (latest session 2026-06-18): 95 schools, 7,077 children.
(NOT `teampact_sessions_complete` — that table is stale at 2026-02-24.)

Current state: **87 of 95 schools mapped (6,708 kids); 8 unmapped (584 kids, ~8%).**

## Unmapped 2026-active ZZ schools

| ZZ `program_name` | kids | resolution | Masi `school_uid` |
|---|---|---|---|
| Sapphire Road Primary School | 376 | map (exists in Masi as "Sapphire") | **SCH-00051** |
| St Joseph's (RC) Primary School | 72 | map (Masi "St Joseph'S") | **SCH-00124** |
| Ntyatyambo Primary School | 41 | map (Masi "Ntyatyambo") | **SCH-00083** |
| Jarvis Gqamlana Public Primary School | 34 | map (Masi "Jarvis Gqamlana") | **SCH-00049** |
| Mzomtsha Primary School | 1 | map (Masi "Mzomtsha") | **SCH-00157** |
| Malukhanye ECD | 17 | NOT in Masi — add a School record, or confirm the real name | — |
| Masinyusane | 42 | NOT a school (org/training entry) — exclude from grid | — |
| Witterkleibosch | 1 | 1 kid, likely a typo/stray — verify | — |

Mapping the top 5 covers **524 of the 584** unmapped kids. Root cause of the
misses: ZZ names carry suffixes ("Road Primary School", "Public Primary School",
"(RC) Primary School") that `sync_masi_identity`'s suffix-strip + fuzzy (threshold
90) didn't reduce to the short Masi names.

## How to apply

Either (a) insert manual rows into ZZ `api_schoolidentity2026`
(`program_name → school_uid`, `match_method='manual'`) for the 5, or (b) improve
`sync_masi_identity` suffix handling and re-run. (a) is the quick once-off.
Malukhanye ECD needs a Masi `School` record first (then it maps). Masinyusane +
Witterkleibosch are not real grid schools.

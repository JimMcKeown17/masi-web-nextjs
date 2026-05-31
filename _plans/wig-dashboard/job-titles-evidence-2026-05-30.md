# Youth job_title evidence (production, 2026-05-30)

`Youth.job_title` is FREE TEXT (not a model choice). Exact spelling / case / punctuation IS the cohort contract - pin these exact strings in `WIG_COHORTS`.

| job_title (exact) | active | total | note |
|---|---|---|---|
| Zazi Izandi Coach | 132 | 393 | spelled "Izandi", NOT "iZandi" |
| Literacy Coach | 121 | 591 | |
| ZZ ECD Coach | 25 | 60 | |
| Numeracy Coach | 24 | 34 | |
| 1000 Stories Youth | 17 | 135 | |
| EduTech Coach | 10 | 34 | |
| Practitioner | 8 | 9 | ECD? confirm |
| Literacy Coaches (ZZ) | 7 | 7 | parens are literal |
| Homework Coach | 2 | 3 | |
| Yeboneer | 0 | 396 | YeBo dormant - 0 active |
| Count Coach | 0 | 14 | 0 active |
| Assessor | 0 | 10 | |
| Sport & Arts Coach | 0 | 6 | |
| Yes Intern | 0 | 5 | |
| ECD Practitioner | 0 | 3 | 0 active |

## Proposed WIG_COHORTS (exact strings) - CONFIRM with team

- `zazi_izandi`: `["Zazi Izandi Coach", "Literacy Coaches (ZZ)"]`
- `core_literacy`: `["Literacy Coach"]` (+ Primary-School constraint? confirm)
- `ecd_literacy`: `["ZZ ECD Coach", "Practitioner", "ECD Practitioner"]` AND/OR school type in {ECD, ECDC} (is "Practitioner" an ECD role? confirm)
- `numeracy`: `["Numeracy Coach", "Count Coach"]` (Count Coach 0 active)
- `data_team`: n/a

Caveat: free text means new spellings can appear over time. The endpoint should LOG any active `job_title` not mapped to a cohort, so cohorts don't silently drift.

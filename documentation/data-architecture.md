# Masi Data Architecture (backends & data sources)

Status: living doc (progressive capture). Started 2026-05-31. Some flows below are OPEN QUESTIONS pending confirmation - do not treat as settled.

There are THREE data systems in play. Knowing which is authoritative for a given metric is essential - it is easy to query the wrong one.

## 1. Zazi iZandi backend
- Its own Django + Postgres on Render (separate from Masi).
- Repo: `/Users/jimmckeown/Development/Zazi_iZandi_Website_2025`
- Populated via cron from **Teampact** (the app staff use to capture daily session data).

## 2. Main Masi backend (`masi_database`)
- Django + Postgres on Render. This is the backend the Masi frontend (`NEXT_PUBLIC_API_URL`) talks to, and what the WIG dashboard is being built against.
- Populated via nightly Airtable sync crons (`sync_airtable_*`): e.g. `sync_airtable_literacy_sessions_2026`, `sync_airtable_numeracy_sessions_2026`.
- CONFIRMED (2026-05-31): `literacy_sessions_2026` = Masi **Core Literacy** only (98% "Literacy Coach", zero "Zazi Izandi Coach"); `numeracy_sessions_2026` = Numeracy. Zazi iZandi is NOT in this DB.
- Local dev = `localhost/masi_db` (a partial snapshot). Prod = `masi_database` on Render. Rule: analyse read-only against prod, experiment against local.

## 3. Airtable
- Staff-facing data entry (staff are comfortable here). E.g. youth HR / employment stats are entered in Airtable.
- MOST Airtable data is mapped into the Masi PG via crons, but NOT all. Known example: **2026 baseline assessments are still only in Airtable, not in PG.**
- Jim's preference: everything eventually in Postgres; crons bridge Airtable -> PG.

## Known gap / TODO
- **Airtable -> PG audit needed**: enumerate what lives in Airtable but is NOT synced to the Masi PG, so we know true coverage. (Owner: Jim.)

## RESOLVED (2026-05-31, prod-verified)
1. **Zazi iZandi source of truth = the Zazi backend** (`zazi_izandi_db`), NOT Masi PG. Masi `literacy_sessions_2026` is 98% "Literacy Coach" = Masi **Core Literacy**, with ZERO Zazi sessions. Zazi sessions are in Zazi `sessions_2026` (134,326 rows, Teampact-fed).
2. **The WIG dashboard MUST span two backends.** Zazi data is not in Masi PG and isn't synced there.
3. **Teampact = Zazi iZandi ONLY.** Core Literacy, Numeracy, ECD all follow Airtable -> Masi PG. (A Masi app is being built to replace the Airtable forms; a mobile app to replace Teampact.)
4. **Assessments:** non-Zazi programme assessments will land in Masi PG; Zazi baseline+midline live in the Zazi backend (`assessments_2026`, 13,603 rows; EGRA surveys 815/816/817/805).

## Zazi iZandi backend - inventory (prod `zazi_izandi_db`, read-only, 2026-05-31)
Connect read-only via `RENDER_EXTERNAL_DB_URL` in the Zazi repo `.env`. Local `.env` `DATABASE_URL` is sqlite (stale) - use prod. Repo apps: `api`, `assessments`, `dashboard`, `reporting`, `ai_assistant`, `whatsapp`, `scheduler` (likely already exposes dashboards/endpoints).
Key 2026 tables (better instrumented for Zazi WIG than any Masi proxy):
- `sessions_2026` (TeampactSession2026): 134,326. Fields incl. `session_started_at`, `user_name` (EA), `class_name`, `program_name`, `letters_taught`/`num_letters_taught`, `is_blending`, attendance metrics, `session_tag_*`, `is_flagged`.
- `assessments_2026` (Assessment2026): 13,603 - EGRA baseline (+midline/endline) per learner; `assessment_cells_2026` = cell detail.
- `mentor_visits_2026`: 99.
- `child_letter_alignment_2026`: 5,550 - supports "EAs teaching the correct letters / at the right level".
- `programme_targets`: 1 row, ALREADY encodes 2026 targets: dosage 2.5/day, on-track 80%, flag-resolution 70%, assessment-coverage 95%, mentor-coverage 30 days; programme 2026-02-02 -> 2026-11-30, teaching start 2026-03-09.
- Summary/cache tables (`school_summaries_2026`, `group_summaries_2026`, assessment/mentor-visit caches) -> Zazi backend likely already computes much of this.

## Zazi integration (DECIDED 2026-05-31): Masi backend aggregates
- The Masi backend exposes `/api/wig/*`; for the Zazi tile it calls the **Zazi backend's existing API** server-side and normalizes the result. Frontend only ever talks to the Masi backend.
- **Auth:** Zazi `/api/*` is guarded by `InternalAuthMiddleware` - a shared-secret `X-Internal-Auth` header matching `INTERNAL_API_SECRET`. The Masi backend holds the secret and sends the header on each call. (Secret stays server-side; no CORS; no browser exposure.)
- **Reusable Zazi endpoints** (already compute WIG metrics): `programme-overview/`, `ea-performance/` (computes `pct_eas_on_track` vs the 2.5 dosage target), `sessions-activity/`, `letter-alignment/`, `assessments-summary/`, `mentor-visits-summary/`, `schools-2026-summary/`, `ea-roster/`. Zazi's `programme_targets` row supplies the targets.
- Do NOT re-aggregate Zazi metrics from raw `sessions_2026`; consume the endpoints.

## Implication for WIG
- **Track A - Masi-PG tiles** (Core Literacy, Numeracy, ECD, Data team): read Masi PG directly. No external dependency - can start now.
- **Track B - Zazi tile:** Masi backend -> Zazi API via shared secret. Needs the Zazi `INTERNAL_API_SECRET` + base URL provisioned in the Masi backend env.

-- Manual ZZ->Masi school mappings (2026-06-19), per
-- docs/discovery/zazi-school-uid-mapping-2026-06-19.md.
-- Inserts 5 rows into ZZ api_schoolidentity2026 for 2026-active schools that
-- sync_masi_identity missed (long ZZ names vs short Masi names). Recovers ~524
-- unmapped Zazi children. Run dry (ROLLBACK) first, then flip to COMMIT.
-- Target DB: ZZ prod (RENDER_EXTERNAL_DB_URL).

BEGIN;

INSERT INTO api_schoolidentity2026 (program_name, school_uid, match_method, updated_at)
VALUES
  ('Sapphire Road Primary School',          'SCH-00051', 'manual', now()),
  ('St Joseph''s (RC) Primary School',      'SCH-00124', 'manual', now()),
  ('Ntyatyambo Primary School',             'SCH-00083', 'manual', now()),
  ('Jarvis Gqamlana Public Primary School', 'SCH-00049', 'manual', now()),
  ('Mzomtsha Primary School',               'SCH-00157', 'manual', now());

-- Verify: 5 new manual rows; recompute the live unmapped count (should drop to 3:
-- Malukhanye ECD, Masinyusane, Witterkleibosch).
SELECT 'manual_rows' AS check, count(*) AS n FROM api_schoolidentity2026 WHERE match_method='manual'
UNION ALL
SELECT 'unmapped_live_schools',
       count(*) FROM (
         SELECT s.program_name
         FROM (SELECT DISTINCT program_name FROM sessions_2026) s
         LEFT JOIN api_schoolidentity2026 i ON i.program_name = s.program_name
         WHERE i.school_uid IS NULL
       ) q;

COMMIT;  -- applied 2026-06-19

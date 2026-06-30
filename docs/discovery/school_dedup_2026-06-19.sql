-- One-time Masi PG schools dedup (2026-06-19).
-- 14 stale duplicate school rows (active, no school_uid) are merged into their
-- canonical SCH-XXXXX siblings: re-point every FK reference, then soft-retire the
-- stale row (is_active=false -- reversible, no hard delete). Mapping built from
-- explicit PKs (read-only verified), not name matching.
--
-- EXCLUDED: "School 70" (id 70, placeholder) -- has 5 mentor visits and no
-- canonical target; left for a manual decision.
--
-- Run dry (ROLLBACK) first to inspect, then flip the last line to COMMIT.

BEGIN;

CREATE TEMP TABLE school_dedup_map (stale_id int PRIMARY KEY, keep_id int) ON COMMIT DROP;
INSERT INTO school_dedup_map (stale_id, keep_id) VALUES
  (75, 220),  -- Baby Day Care             -> Baby Daycare             SCH-00218
  (61, 183),  -- Ben Nyathi                -> Ben Nyati                SCH-00203
  (76, 253),  -- Emfundweni EduCare        -> Emfundweni Pre-R Educare SCH-00213
  (79, 306),  -- Kideo Learning Center     -> Kideo Learning Centre    SCH-00222
  (1,  184),  -- Lingelethu                -> Lingelethu               SCH-00322
  (84, 260),  -- Lukhanyiso Pre-School     -> Lukhanyiso Pre School    SCH-00220
  (2,  103),  -- Msobomvu Full Service     -> Msobomvu Full Service    SCH-00323
  (56, 128),  -- Nceduluntu Edu-care (ECD) -> Nceduluntu Edu-care      SCH-00293
  (85, 30),   -- Nonkqubela Pre-School     -> Nonkqubela               SCH-00315
  (47, 291),  -- Rise and Shine            -> Arise and Shine          SCH-00256
  (42, 269),  -- Siyabulela (ECD)          -> Siyabulela               SCH-00092
  (90, 327),  -- Sophakama DayCare         -> Sophakama Pre-School     SCH-00219
  (3,  226),  -- Stephen Mazungula         -> Stephen Mazungula        SCH-00050
  (93, 293);  -- Thandabantwana Pre-School -> Thandabantwana Daycare   SCH-00217

UPDATE api_youth t                SET school_id = m.keep_id       FROM school_dedup_map m WHERE t.school_id = m.stale_id;
UPDATE api_mentorvisit t          SET school_id = m.keep_id       FROM school_dedup_map m WHERE t.school_id = m.stale_id;
UPDATE api_numeracyvisit t        SET school_id = m.keep_id       FROM school_dedup_map m WHERE t.school_id = m.stale_id;
UPDATE api_yebovisit t            SET school_id = m.keep_id       FROM school_dedup_map m WHERE t.school_id = m.stale_id;
UPDATE api_thousandstoriesvisit t SET school_id = m.keep_id       FROM school_dedup_map m WHERE t.school_id = m.stale_id;
UPDATE api_session t              SET school_id = m.keep_id       FROM school_dedup_map m WHERE t.school_id = m.stale_id;
UPDATE api_child t                SET school_id = m.keep_id       FROM school_dedup_map m WHERE t.school_id = m.stale_id;
UPDATE literacy_sessions_2026 t   SET school_id = m.keep_id       FROM school_dedup_map m WHERE t.school_id = m.stale_id;
UPDATE numeracy_sessions_2026 t   SET school_id = m.keep_id       FROM school_dedup_map m WHERE t.school_id = m.stale_id;
UPDATE api_schoolclosure t        SET scope_school_id = m.keep_id FROM school_dedup_map m WHERE t.scope_school_id = m.stale_id;

UPDATE api_school SET is_active = false, last_updated = now()
WHERE id IN (SELECT stale_id FROM school_dedup_map);

-- Verification: refs_left_* must all be 0; deactivated_stale must be 14;
-- active_missing_uid_remaining should be 1 (just School 70, intentionally excluded).
SELECT 'refs_left_youth'              AS check, count(*) AS n FROM api_youth              WHERE school_id       IN (SELECT stale_id FROM school_dedup_map)
UNION ALL SELECT 'refs_left_mentorv',           count(*)    FROM api_mentorvisit          WHERE school_id       IN (SELECT stale_id FROM school_dedup_map)
UNION ALL SELECT 'refs_left_numv',              count(*)    FROM api_numeracyvisit        WHERE school_id       IN (SELECT stale_id FROM school_dedup_map)
UNION ALL SELECT 'refs_left_yebov',             count(*)    FROM api_yebovisit            WHERE school_id       IN (SELECT stale_id FROM school_dedup_map)
UNION ALL SELECT 'refs_left_storiesv',          count(*)    FROM api_thousandstoriesvisit WHERE school_id       IN (SELECT stale_id FROM school_dedup_map)
UNION ALL SELECT 'deactivated_stale',           count(*)    FROM api_school               WHERE NOT is_active AND id IN (SELECT stale_id FROM school_dedup_map)
UNION ALL SELECT 'active_missing_uid_remaining',count(*)    FROM api_school               WHERE is_active AND (school_uid IS NULL OR school_uid='');

COMMIT;  -- applied 2026-06-19

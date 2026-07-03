# Literacy WIG Outcomes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Core Literacy and ECD Literacy hero WIG rings to real 2026 assessment data via a new fail-closed `/api/wig/outcomes/` endpoint.

**Architecture:** A new Django module computes term-keyed outcome percentages from `literacy_assessments_2026` + `on_the_programme_2026`, reusing the parquet exporter's dedupe policy (extracted to a shared module) and sync-health gates. The Next.js WIG board fetches it as a fourth parallel call and renders a live accent-fill ring with a target tick, or explicit unavailable/awaiting states.

**Tech Stack:** Django 5 + DRF (backend), Next.js 15 + React 19 + SWR (frontend).

**Spec:** `_plans/wig-dashboard/2026-07-02-literacy-wig-outcomes-design.md` (read it first).

## Global Constraints

- TWO git repos. Backend: `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main` (run git + manage.py from there, venv via `venv/bin/python`). Frontend: `/Users/jimmckeown/Development/Masi_Website_2026/frontend/masi-website` (run git + pnpm from there).
- Backend tests: `venv/bin/python manage.py test <module> -v 2` from the backend dir. Frontend has NO unit-test runner: gates are `pnpm lint` + `pnpm build` + browser E2E.
- Local Postgres (`DATABASE_URL` -> localhost/masi_db) for all dev/tests. NEVER point `DATABASE_URL` at prod.
- Outcome values are fractions 0..1 (frontend formats as %). Programme keys: `core_literacy`, `ecd_literacy`. Terms: `Jan` < `Jun` < `Nov`.
- Metric rules (decided, do not change): Grade 1 `read_words >= 16` target 0.5; PreR `letter_sounds >= 20` target 0.75; assessed-only denominator; cohort grade = `normalize_grade(roster.grade or assessment.grade)`.
- Fail-closed: sync-log problems, >48h-old syncs, or any dedupe exception -> `available: false`, never numbers.
- No emojis anywhere. Commit messages: no co-author lines, imperative mood.

---

### Task 1: Shared dedupe module (backend)

**Files:**
- Create: `api/literacy_2026_dedupe.py`
- Modify: `api/management/commands/export_literacy_2026_parquet.py`
- Test: existing `api/tests_export_literacy_2026.py` must stay green

**Interfaces:**
- Produces: `SKILL_MODEL_FIELDS: dict[str, str]`, `assessment_row(a) -> dict`, `pick_winner(group) -> dict`, `dedupe(assessments) -> (winners: dict[(child_uid, term), dict], exceptions: list[dict])`. Exception dicts: `{"key": (uid, term), "reason": "unresolved_tie" | "duplicate_more_complete_rejected", "winner": str, "n": int}`.

- [ ] **Step 1: Create `api/literacy_2026_dedupe.py`**

Move (verbatim, minus the leading underscore functions' bodies which are unchanged) `SKILL_MODEL_FIELDS`, `_status_rank`, `_completeness`, `_recency_ordinal`, `_winner_key`, `pick_winner`, `dedupe` out of `export_literacy_2026_parquet.py`, and add `assessment_row`:

```python
"""Duplicate-resolution policy for 2026 literacy assessments, shared by the
parquet exporter (export_literacy_2026_parquet) and the WIG outcomes service
(wig_outcomes) so both surfaces publish identical numbers.

Rows are plain dicts (see assessment_row). Winner policy: duplicate_status
('Single'/'Unique' best, 'Duplicate' worst), then completeness, then recency,
then record id. Exceptions (unresolved ties, Duplicate-more-complete rejects)
are returned for the caller to fail closed on.
"""
from .literacy_2026_grades import SKILLS

SKILL_MODEL_FIELDS = {
    "Letter Sounds": "letter_sounds", "Story Comprehension": "story_comprehension",
    "Listen First Sound": "listen_first_sound", "Listen Words": "listen_words",
    "Writing Letters": "writing_letters", "Read Words": "read_words",
    "Read Sentences": "read_sentences", "Read Story": "read_story",
    "Write CVCs": "write_cvcs", "Write Sentences": "write_sentences",
    "Write Story": "write_story",
}


def assessment_row(a):
    """LiteracyAssessment2026 instance -> the dict shape dedupe operates on."""
    return dict(
        child_uid=a.child_uid, year=a.year, term=a.term, grade=a.grade, language=a.language,
        total=a.total, duplicate_status=a.duplicate_status, source_airtable_id=a.source_airtable_id,
        source_created_time=a.source_created_time, source_modified_time=a.source_modified_time,
        scores={skill: getattr(a, field) for skill, field in SKILL_MODEL_FIELDS.items()},
    )


def _status_rank(a):
    # Verified live vocabulary (Task 3 dry-run): 'Single'/'Duplicate'/'Not June 2026'.
    # 'Single' is the confirmed-unique value; the plan's 'Unique' is kept for compatibility.
    s = (a.get("duplicate_status") or "").strip().lower()
    if s in ("unique", "single"):
        return 0
    return 2 if s == "duplicate" else 1


def _completeness(a):
    return sum(1 for s in SKILLS if a["scores"].get(s) is not None)


def _recency_ordinal(a):
    t = a.get("source_modified_time") or a.get("source_created_time")
    return t.timestamp() if t is not None else 0.0


def _winner_key(a):
    # Lower is better; negatives so more-complete / more-recent sort first.
    return (_status_rank(a), -_completeness(a), -_recency_ordinal(a), str(a["source_airtable_id"]))


def pick_winner(group):
    return min(group, key=_winner_key)


def dedupe(assessments):
    """Group by (child_uid, term); pick one winner per group. Returns (winners, exceptions).

    An exception is 'unresolved_tie' when the top two rows are identical on every criterion
    except record id (a genuine tie), or 'duplicate_more_complete_rejected' when a Duplicate-
    flagged row was more complete than the chosen winner (surfaced for human review).
    """
    groups = {}
    for a in assessments:
        groups.setdefault((a["child_uid"], a["term"]), []).append(a)
    winners, exceptions = {}, []
    for key, group in groups.items():
        winner = pick_winner(group)
        winners[key] = winner
        if len(group) > 1:
            ranks = sorted(_winner_key(a) for a in group)
            if ranks[0][:3] == ranks[1][:3]:
                exceptions.append({"key": key, "reason": "unresolved_tie",
                                   "winner": winner["source_airtable_id"], "n": len(group)})
            if any((a.get("duplicate_status") or "").strip().lower() == "duplicate"
                   and _completeness(a) > _completeness(winner) for a in group):
                exceptions.append({"key": key, "reason": "duplicate_more_complete_rejected",
                                   "winner": winner["source_airtable_id"], "n": len(group)})
    return winners, exceptions
```

- [ ] **Step 2: Rewire the export command**

In `export_literacy_2026_parquet.py`: delete the moved definitions (`SKILL_MODEL_FIELDS`, `_status_rank`, `_completeness`, `_recency_ordinal`, `_winner_key`, `pick_winner`, `dedupe`) and import them instead (keeps old import paths like `from api.management.commands.export_literacy_2026_parquet import pick_winner` working, since imported names are module attributes):

```python
from api.literacy_2026_dedupe import SKILL_MODEL_FIELDS, assessment_row, dedupe, pick_winner
```

Replace the assessment-dict loop in `handle()`:

```python
        qs = LiteracyAssessment2026.objects.filter(year=2026, term__in=["Jan", "Jun"], is_active=True)
        assessments = [assessment_row(a) for a in qs]
```

(`_winner_key` etc. are only used inside the shared module now. `SKILLS`/`normalize_grade`/`grade_is_fallback` imports stay — `build_wide_frame` still uses them.)

- [ ] **Step 3: Run the existing export + grades tests**

Run: `venv/bin/python manage.py test api.tests_export_literacy_2026 api.tests_literacy_2026_grades -v 2`
Expected: all PASS (extraction is behavior-preserving).

- [ ] **Step 4: Dry-run the exporter as a smoke test**

Run: `venv/bin/python manage.py export_literacy_2026_parquet --dry-run`
Expected: same "Rows: ... | dup_exceptions: ..." summary as before, exit 0.

- [ ] **Step 5: Commit (backend repo)**

```bash
git add api/literacy_2026_dedupe.py api/management/commands/export_literacy_2026_parquet.py
git commit -m "refactor: extract shared 2026 literacy dedupe policy module"
```

---

### Task 2: Source-health gate (backend, TDD)

**Files:**
- Create: `api/wig_outcomes.py` (gate only in this task)
- Test: create `api/tests_wig_outcomes.py`

**Interfaces:**
- Produces: `check_sources(now) -> (ok: bool, note: str | None)`; constants `REQUIRED_SYNCS`, `MAX_SYNC_AGE_HOURS = 48`, `TERM_ORDER = ("Jan", "Jun", "Nov")`, `OUTCOME_DEFS`.

- [ ] **Step 1: Write the failing tests**

Create `api/tests_wig_outcomes.py`:

```python
"""Tests for the literacy WIG outcome measures (api/wig_outcomes.py)."""
from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from api.models import AirtableSyncLog, LiteracyAssessment2026, OnTheProgramme2026
from api.wig_outcomes import REQUIRED_SYNCS, check_sources

_seq = {"n": 0}


def make_logs(hours_ago=1, success=True, details=None, only=None):
    """Create a sync log per required sync type (or `only` a subset)."""
    for sync_type in (only or REQUIRED_SYNCS):
        AirtableSyncLog.objects.create(
            sync_type=sync_type, success=success,
            completed_at=timezone.now() - timedelta(hours=hours_ago),
            details=details,
        )


def roster(uid, grade="Grade 1", on_programme=True, active=True):
    _seq["n"] += 1
    return OnTheProgramme2026.objects.create(
        source_airtable_id=f"rec-r{_seq['n']}", child_uid=uid,
        on_the_programme=on_programme, grade=grade, is_active=active)


def assess(uid, term="Jun", read_words=None, letter_sounds=None, grade=None,
           duplicate_status="Single", year=2026, active=True):
    _seq["n"] += 1
    return LiteracyAssessment2026.objects.create(
        source_airtable_id=f"rec-a{_seq['n']}", child_uid=uid, year=year, term=term,
        grade=grade, read_words=read_words, letter_sounds=letter_sounds,
        duplicate_status=duplicate_status, is_active=active)


class CheckSourcesTests(TestCase):
    """Fail-closed source gate: exporter's _assert_synced rules + 48h dead-cron age."""

    def test_no_logs_fails(self):
        ok, note = check_sources(timezone.now())
        self.assertFalse(ok)
        self.assertIn("literacy_assessments_2026", note)

    def test_failed_latest_sync_fails(self):
        make_logs(success=False)
        ok, note = check_sources(timezone.now())
        self.assertFalse(ok)
        self.assertIn("failed", note)

    def test_newer_failed_sync_not_masked_by_older_success(self):
        make_logs(hours_ago=5, success=True)
        make_logs(hours_ago=1, success=False, only=("literacy_assessments_2026",))
        ok, _ = check_sources(timezone.now())
        self.assertFalse(ok)

    def test_flagged_details_fail(self):
        make_logs(details={"retire_skipped": 2})
        ok, note = check_sources(timezone.now())
        self.assertFalse(ok)
        self.assertIn("flagged", note)

    def test_stale_sync_fails(self):
        make_logs(hours_ago=72)
        ok, note = check_sources(timezone.now())
        self.assertFalse(ok)
        self.assertIn("48", note)

    def test_one_fresh_one_stale_fails(self):
        make_logs(hours_ago=1, only=("literacy_assessments_2026",))
        make_logs(hours_ago=72, only=("on_the_programme_2026",))
        ok, _ = check_sources(timezone.now())
        self.assertFalse(ok)

    def test_healthy_logs_pass(self):
        make_logs(hours_ago=1)
        ok, note = check_sources(timezone.now())
        self.assertTrue(ok)
        self.assertIsNone(note)
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `venv/bin/python manage.py test api.tests_wig_outcomes -v 2`
Expected: FAIL with `ModuleNotFoundError: No module named 'api.wig_outcomes'`

- [ ] **Step 3: Create `api/wig_outcomes.py` with the gate**

```python
"""Outcome (lag) measures for the WIG hero rings: Core Literacy + ECD Literacy.

Term-keyed (Jan/Jun/Nov) over literacy_assessments_2026 + on_the_programme_2026,
unlike the weekly lead measures in wig_metrics.py. Fail-closed: any source-health,
staleness, or dedupe-exception problem returns available=False rather than a
number the parquet export (export_literacy_2026_parquet) would refuse to ship.
"""
from datetime import timedelta

from django.utils import timezone

from .literacy_2026_dedupe import assessment_row, dedupe
from .literacy_2026_grades import grade_is_fallback, normalize_grade
from .models import AirtableSyncLog, LiteracyAssessment2026, OnTheProgramme2026

REQUIRED_SYNCS = ("literacy_assessments_2026", "on_the_programme_2026")
MAX_SYNC_AGE_HOURS = 48  # two missed nightly runs = dead cron
TERM_ORDER = ("Jan", "Jun", "Nov")

OUTCOME_DEFS = {
    "core_literacy": {"grade": "Grade 1", "skill": "Read Words", "threshold": 16.0,
                      "label": "Grade 1 on-roster children with Read Words >= 16"},
    "ecd_literacy": {"grade": "PreR", "skill": "Letter Sounds", "threshold": 20.0,
                     "label": "PreR on-roster children with Letter Sounds >= 20"},
}


def check_sources(now):
    """(ok, note): the exporter's _assert_synced rules + a 48h dead-cron age gate."""
    for sync_type in REQUIRED_SYNCS:
        last = (AirtableSyncLog.objects.filter(sync_type=sync_type)
                .order_by('-started_at').first())
        if last is None or not last.success or last.completed_at is None:
            return False, f"latest '{sync_type}' sync is missing, incomplete, or failed"
        details = last.details or {}
        if details.get('retire_skipped') or details.get('dup_uid_skipped'):
            return False, f"latest '{sync_type}' sync flagged retire/duplicate skips"
        if last.completed_at < now - timedelta(hours=MAX_SYNC_AGE_HOURS):
            return False, f"latest '{sync_type}' sync is older than {MAX_SYNC_AGE_HOURS}h"
    return True, None
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `venv/bin/python manage.py test api.tests_wig_outcomes -v 2`
Expected: 7 tests PASS

- [ ] **Step 5: Commit (backend repo)**

```bash
git add api/wig_outcomes.py api/tests_wig_outcomes.py
git commit -m "feat: fail-closed source-health gate for WIG literacy outcomes"
```

---

### Task 3: Outcome computation (backend, TDD)

**Files:**
- Modify: `api/wig_outcomes.py`
- Test: `api/tests_wig_outcomes.py` (append)

**Interfaces:**
- Consumes: Task 1 `assessment_row`/`dedupe`; Task 2 `check_sources`/`OUTCOME_DEFS`.
- Produces: `build_outcomes(now=None) -> dict` with keys `available: bool`, `source_note: str | None`, `outcomes: dict[str, dict | None]`, `data_as_of: str`. Each non-null outcome: `value, numerator, denominator, term, cohort_total, baseline (same stat shape or None), calculation_note`.

- [ ] **Step 1: Write the failing tests (append to `api/tests_wig_outcomes.py`)**

Add `build_outcomes` to the existing import from `api.wig_outcomes`, then:

```python
class OutcomeComputationTests(TestCase):
    def setUp(self):
        make_logs()

    def test_healthy_logs_no_rows_available_with_null_outcomes(self):
        payload = build_outcomes()
        self.assertTrue(payload["available"])
        self.assertIsNone(payload["outcomes"]["core_literacy"])
        self.assertIsNone(payload["outcomes"]["ecd_literacy"])

    def test_threshold_boundary_exactly_16_passes(self):
        roster("CH-1")
        assess("CH-1", read_words=16.0)
        out = build_outcomes()["outcomes"]["core_literacy"]
        self.assertEqual(out["value"], 1.0)
        self.assertEqual((out["numerator"], out["denominator"]), (1, 1))
        self.assertEqual(out["term"], "Jun")

    def test_below_threshold_fails(self):
        roster("CH-1")
        assess("CH-1", read_words=15.9)
        out = build_outcomes()["outcomes"]["core_literacy"]
        self.assertEqual(out["value"], 0.0)

    def test_null_score_excluded_from_denominator(self):
        roster("CH-1"); roster("CH-2")
        assess("CH-1", read_words=20.0)
        assess("CH-2", read_words=None, letter_sounds=5.0)  # assessed, but no Read Words
        out = build_outcomes()["outcomes"]["core_literacy"]
        self.assertEqual(out["denominator"], 1)

    def test_off_roster_child_excluded(self):
        roster("CH-1")
        assess("CH-1", read_words=20.0)
        assess("CH-99", read_words=20.0, grade="Grade 1")  # not on roster
        out = build_outcomes()["outcomes"]["core_literacy"]
        self.assertEqual(out["denominator"], 1)

    def test_inactive_or_off_programme_roster_rows_excluded(self):
        roster("CH-1")
        roster("CH-2", on_programme=False)
        roster("CH-3", active=False)
        assess("CH-1", read_words=20.0)
        assess("CH-2", read_words=20.0)
        assess("CH-3", read_words=20.0)
        out = build_outcomes()["outcomes"]["core_literacy"]
        self.assertEqual(out["denominator"], 1)
        self.assertEqual(out["cohort_total"], 1)

    def test_latest_term_jun_over_jan_with_baseline(self):
        roster("CH-1")
        assess("CH-1", term="Jan", read_words=10.0)
        assess("CH-1", term="Jun", read_words=20.0)
        out = build_outcomes()["outcomes"]["core_literacy"]
        self.assertEqual(out["term"], "Jun")
        self.assertEqual(out["value"], 1.0)
        self.assertEqual(out["baseline"]["term"], "Jan")
        self.assertEqual(out["baseline"]["value"], 0.0)

    def test_nov_over_jun(self):
        roster("CH-1")
        assess("CH-1", term="Jun", read_words=10.0)
        assess("CH-1", term="Nov", read_words=20.0)
        out = build_outcomes()["outcomes"]["core_literacy"]
        self.assertEqual(out["term"], "Nov")

    def test_only_jan_data_has_no_baseline_field(self):
        roster("CH-1")
        assess("CH-1", term="Jan", read_words=20.0)
        out = build_outcomes()["outcomes"]["core_literacy"]
        self.assertEqual(out["term"], "Jan")
        self.assertIsNone(out["baseline"])

    def test_cohort_total_counts_unassessed_roster_children(self):
        roster("CH-1"); roster("CH-2"); roster("CH-3")
        assess("CH-1", read_words=20.0)
        out = build_outcomes()["outcomes"]["core_literacy"]
        self.assertEqual(out["cohort_total"], 3)
        self.assertEqual(out["denominator"], 1)

    def test_ecd_uses_letter_sounds_threshold_20(self):
        roster("CH-1", grade="PreR")
        assess("CH-1", letter_sounds=20.0)
        out = build_outcomes()["outcomes"]["ecd_literacy"]
        self.assertEqual(out["value"], 1.0)

    def test_prior_year_rows_ignored(self):
        roster("CH-1")
        assess("CH-1", read_words=20.0, year=2025)
        self.assertIsNone(build_outcomes()["outcomes"]["core_literacy"])


class DedupeFailClosedTests(TestCase):
    def setUp(self):
        make_logs()
        roster("CH-1")

    def test_duplicate_row_cannot_flip_child_to_passing(self):
        assess("CH-1", read_words=10.0, duplicate_status="Single")
        assess("CH-1", read_words=30.0, duplicate_status="Duplicate")
        payload = build_outcomes()
        self.assertTrue(payload["available"])  # equal completeness: no exception
        self.assertEqual(payload["outcomes"]["core_literacy"]["value"], 0.0)

    def test_duplicate_more_complete_fails_closed(self):
        assess("CH-1", read_words=10.0, duplicate_status="Single")
        assess("CH-1", read_words=30.0, letter_sounds=5.0, duplicate_status="Duplicate")
        payload = build_outcomes()
        self.assertFalse(payload["available"])
        self.assertIn("dedupe", payload["source_note"])

    def test_unresolved_tie_fails_closed(self):
        assess("CH-1", read_words=10.0, duplicate_status="Single")
        assess("CH-1", read_words=30.0, duplicate_status="Single")
        payload = build_outcomes()
        self.assertFalse(payload["available"])


class GradeCohortTests(TestCase):
    def setUp(self):
        make_logs()

    def test_roster_grade_wins_over_assessment_grade(self):
        roster("CH-1", grade="Grade 1")
        assess("CH-1", read_words=20.0, letter_sounds=20.0, grade="PreR")
        payload = build_outcomes()["outcomes"]
        self.assertEqual(payload["core_literacy"]["denominator"], 1)
        self.assertIsNone(payload["ecd_literacy"])

    def test_alias_roster_grade_normalized(self):
        roster("CH-1", grade="gr 1")
        assess("CH-1", read_words=20.0)
        self.assertEqual(build_outcomes()["outcomes"]["core_literacy"]["denominator"], 1)

    def test_missing_roster_grade_falls_back_to_assessment_grade(self):
        roster("CH-1", grade=None)
        assess("CH-1", read_words=20.0, grade="Grade 1")
        self.assertEqual(build_outcomes()["outcomes"]["core_literacy"]["denominator"], 1)

    def test_fallback_grade_lands_in_prer_and_is_counted(self):
        roster("CH-1", grade="Little Stars Centre")
        assess("CH-1", letter_sounds=20.0)
        out = build_outcomes()["outcomes"]["ecd_literacy"]
        self.assertEqual(out["denominator"], 1)
        self.assertIn("1 grade fallback", out["calculation_note"])
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `venv/bin/python manage.py test api.tests_wig_outcomes -v 2`
Expected: `ImportError: cannot import name 'build_outcomes'`

- [ ] **Step 3: Implement in `api/wig_outcomes.py` (append below `check_sources`)**

```python
def _term_stat(cohort_uids, winners, term, skill, threshold):
    """Assessed-only stats for one term, or None if nobody has the skill scored."""
    num = den = 0
    for uid in cohort_uids:
        row = winners.get((uid, term))
        score = row['scores'].get(skill) if row else None
        if score is None:
            continue
        den += 1
        if score >= threshold:
            num += 1
    if den == 0:
        return None
    return {'value': num / den, 'numerator': num, 'denominator': den, 'term': term}


def _child_grades(roster_grades, winners):
    """Cohort grade per child: normalize_grade(roster grade or winner-row grade),
    the exporter's roster-first rule. Returns (grades, fallback_uids)."""
    grades, fallbacks = {}, set()
    for uid, roster_grade in roster_grades.items():
        raw = roster_grade
        if not raw:
            for term in reversed(TERM_ORDER):
                row = winners.get((uid, term))
                if row and row.get('grade'):
                    raw = row['grade']
                    break
        if grade_is_fallback(raw):
            fallbacks.add(uid)
        grades[uid] = normalize_grade(raw)
    return grades, fallbacks


def _programme_outcome(defn, grades, fallback_uids, winners):
    cohort = [uid for uid, g in grades.items() if g == defn['grade']]
    stats = {term: _term_stat(cohort, winners, term, defn['skill'], defn['threshold'])
             for term in TERM_ORDER}
    latest = None
    for term in TERM_ORDER:
        if stats[term] is not None:
            latest = term
    if latest is None:
        return None
    result = dict(stats[latest])
    result['cohort_total'] = len(cohort)
    result['baseline'] = stats['Jan'] if latest != 'Jan' else None
    n_fallback = sum(1 for uid in cohort if uid in fallback_uids)
    result['calculation_note'] = f"{defn['label']}; {n_fallback} grade fallback(s) in cohort"
    return result


def build_outcomes(now=None):
    """The /api/wig/outcomes/ payload. Fail-closed on source health and dedupe."""
    now = now or timezone.now()

    def unavailable(note):
        return {'available': False, 'source_note': note, 'outcomes': {},
                'data_as_of': now.isoformat()}

    ok, note = check_sources(now)
    if not ok:
        return unavailable(note)

    roster_grades = {
        r.child_uid: r.grade
        for r in OnTheProgramme2026.objects.filter(is_active=True, on_the_programme=True)
    }
    rows = [assessment_row(a) for a in LiteracyAssessment2026.objects.filter(
        year=2026, is_active=True, term__in=TERM_ORDER, child_uid__in=roster_grades.keys())]
    winners, exceptions = dedupe(rows)
    if exceptions:
        return unavailable(
            f"{len(exceptions)} dedupe exception(s) need review before outcomes publish")

    grades, fallback_uids = _child_grades(roster_grades, winners)
    outcomes = {key: _programme_outcome(defn, grades, fallback_uids, winners)
                for key, defn in OUTCOME_DEFS.items()}
    return {'available': True, 'source_note': None, 'outcomes': outcomes,
            'data_as_of': now.isoformat()}
```

- [ ] **Step 4: Run the full outcome test module**

Run: `venv/bin/python manage.py test api.tests_wig_outcomes -v 2`
Expected: all 26 tests PASS

- [ ] **Step 5: Commit (backend repo)**

```bash
git add api/wig_outcomes.py api/tests_wig_outcomes.py
git commit -m "feat: literacy WIG outcome computation (Grade 1 read words, PreR letter sounds)"
```

---

### Task 4: Endpoint view + route (backend)

**Files:**
- Modify: `api/views/wig.py`, `api/views/__init__.py`, `api/urls.py`
- Test: `api/tests_wig_outcomes.py` (append)

**Interfaces:**
- Produces: `GET /api/wig/outcomes/` returning `build_outcomes()`, guarded by `IsAdminOrProjectManager` + `SessionAuthentication`/`ClerkAuthentication` (same as the other WIG views).

- [ ] **Step 1: Write the failing test (append to `api/tests_wig_outcomes.py`)**

```python
from rest_framework.test import APIRequestFactory


class OutcomeEndpointTests(TestCase):
    def test_anonymous_request_rejected(self):
        from api.views import wig_outcomes as wig_outcomes_view
        req = APIRequestFactory().get('/api/wig/outcomes/')
        resp = wig_outcomes_view(req)
        self.assertIn(resp.status_code, (401, 403))
```

Run: `venv/bin/python manage.py test api.tests_wig_outcomes.OutcomeEndpointTests -v 2`
Expected: FAIL with `ImportError: cannot import name 'wig_outcomes'`

- [ ] **Step 2: Add the view**

Append to `api/views/wig.py`:

```python
@api_view(['GET'])
@authentication_classes(AUTH_CLASSES)
@permission_classes(PERM_CLASSES)
def wig_outcomes(request):
    """Term-keyed outcome (lag) measures behind the literacy hero WIG rings."""
    from ..wig_outcomes import build_outcomes
    return Response(build_outcomes(timezone.now()))
```

In `api/views/__init__.py` line 20, extend the import:

```python
from .wig import wig_lead_measures, wig_data_quality, wig_zazi, wig_detail, wig_outcomes
```

and add `'wig_outcomes',` to `__all__` next to the other wig entries.

In `api/urls.py` after the `wig/detail/` line:

```python
    path('wig/outcomes/', views.wig_outcomes, name='wig_outcomes'),
```

- [ ] **Step 3: Run the tests**

Run: `venv/bin/python manage.py test api.tests_wig_outcomes api.tests_wig -v 2`
Expected: all PASS (including the untouched wig suite)

- [ ] **Step 4: Commit (backend repo)**

```bash
git add api/views/wig.py api/views/__init__.py api/urls.py api/tests_wig_outcomes.py
git commit -m "feat: /api/wig/outcomes/ endpoint for literacy hero WIG rings"
```

---

### Task 5: Frontend types, fetcher, config targets, provider

**Files:**
- Modify: `src/lib/types/wig.ts`, `src/lib/api/wig.ts`, `src/lib/wig/config.ts`, `src/components/wig/WigDataProvider.tsx`

**Interfaces:**
- Produces: `WigOutcome`, `OutcomeTermStat`, `OutcomesPayload` types; `getWigOutcomes(token)`; `TERM_LABELS`; `wig.target` on the two literacy programmes; `data.outcomes: OutcomesPayload` on the WIG context.

- [ ] **Step 1: Types — append to `src/lib/types/wig.ts`** (below `ZaziPayload`), and widen `ProgrammeConfig.wig`:

```typescript
// --- Outcome (lag) measures for hero WIG rings (GET /api/wig/outcomes/) ---

export interface OutcomeTermStat {
  value: number; // fraction 0..1
  numerator: number;
  denominator: number;
  term: string; // "Jan" | "Jun" | "Nov"
}

export interface WigOutcome extends OutcomeTermStat {
  cohort_total: number; // full grade cohort on the roster (assessed or not)
  baseline: OutcomeTermStat | null;
  calculation_note?: string;
}

export interface OutcomesPayload {
  available: boolean;
  source_note: string | null;
  outcomes: Record<string, WigOutcome | null>;
  data_as_of?: string;
}
```

Change the `wig` field of `ProgrammeConfig`:

```typescript
  wig: { statement: string; awaitingLabel: string; target?: number };
```

- [ ] **Step 2: Fetcher — append to `src/lib/api/wig.ts`** (add `OutcomesPayload` to the type import):

```typescript
export function getWigOutcomes(token: string) {
  return getJson<OutcomesPayload>("/wig/outcomes/", token);
}
```

- [ ] **Step 3: Config — in `src/lib/wig/config.ts`**, add targets and term labels.

In the `core_literacy` programme: `wig: { statement: ..., awaitingLabel: ..., target: 0.5 }`.
In `ecd_literacy`: `target: 0.75`. Then export near the slug helpers:

```typescript
// Assessment term -> display label for the hero WIG ring.
export const TERM_LABELS: Record<string, string> = {
  Jan: "Baseline (Jan)",
  Jun: "Midline (Jun)",
  Nov: "Endline (Nov)",
};
```

- [ ] **Step 4: Provider — `src/components/wig/WigDataProvider.tsx`**

Add `getWigOutcomes` to the api import and `OutcomesPayload` to the type import. Add `outcomes: OutcomesPayload;` to `WigData`. Replace the fetch block:

```typescript
    const emptyZazi: ZaziPayload = { available: {}, measures: {} };
    // A failed outcomes call must read as unavailable, never as "awaiting".
    const emptyOutcomes: OutcomesPayload = {
      available: false,
      source_note: "outcomes request failed",
      outcomes: {},
    };
    const [lead, dq, zazi, outcomes] = await Promise.all([
      getWigLeadMeasures(token, period),
      getWigDataQuality(token),
      getWigZazi(token).catch(() => emptyZazi),
      getWigOutcomes(token).catch(() => emptyOutcomes),
    ]);
    return {
      measures: { ...lead.measures, ...dq.measures, ...zazi.measures },
      window: lead.window,
      zaziAvailable: zazi.available,
      outcomes,
    };
```

- [ ] **Step 5: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors (HeroWig does not consume `outcomes` yet; unused-var lint on the provider should not fire since `outcomes` is returned).

- [ ] **Step 6: Commit (frontend repo)**

```bash
git add src/lib/types/wig.ts src/lib/api/wig.ts src/lib/wig/config.ts src/components/wig/WigDataProvider.tsx
git commit -m "Add WIG outcomes payload: types, fetcher, targets, provider fetch"
```

---

### Task 6: HeroWig live ring + states

**Files:**
- Modify: `src/components/wig/ProgrammeView.tsx`, `src/app/operations/wig/[programme]/page.tsx`

**Interfaces:**
- Consumes: `OutcomesPayload`, `WigOutcome`, `TERM_LABELS`, `programme.wig.target` from Task 5.
- Produces: `ProgrammeView` accepts a new required prop `outcomes: OutcomesPayload`.

- [ ] **Step 1: Rewrite `HeroWig` in `ProgrammeView.tsx`**

Add imports: `TERM_LABELS` from `@/lib/wig/config`; `OutcomesPayload`, `WigOutcome` to the type import. Replace the whole `HeroWig` function with:

```tsx
// Live hero ring: scale is 0-100% of children passing, filled in the programme
// accent, with a tick at the year-end target. No RAG judgment here: a lag
// measure below target mid-year is expected.
function HeroLiveRing({
  outcome,
  target,
  accent,
}: {
  outcome: WigOutcome;
  target: number;
  accent: string;
}) {
  const R = 108;
  const C = 2 * Math.PI * R;
  const fill = Math.max(0, Math.min(outcome.value, 1));
  const tickAngle = (target * 360 - 90) * (Math.PI / 180);
  const tick = {
    x1: 120 + (R - 9) * Math.cos(tickAngle),
    y1: 120 + (R - 9) * Math.sin(tickAngle),
    x2: 120 + (R + 9) * Math.cos(tickAngle),
    y2: 120 + (R + 9) * Math.sin(tickAngle),
  };
  return (
    <div className="relative w-[240px] h-[240px]">
      <svg width={240} height={240} className="block">
        <circle cx={120} cy={120} r={R} fill="none" stroke="#f0f0f2" strokeWidth={7} />
        <circle
          cx={120}
          cy={120}
          r={R}
          fill="none"
          stroke={accent}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - fill)}
          transform="rotate(-90 120 120)"
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
        <line {...tick} stroke="#1c1c1e" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-[54px] font-semibold tracking-tight leading-none"
          style={{ color: accent }}
        >
          {Math.round(outcome.value * 100)}%
        </span>
        <span className="text-[12px] text-muted-foreground mt-2">
          {TERM_LABELS[outcome.term] ?? outcome.term}
        </span>
      </div>
    </div>
  );
}

function HeroWig({
  programme,
  outcomes,
}: {
  programme: ProgrammeConfig;
  outcomes: OutcomesPayload;
}) {
  const accent = programme.accent ?? "#0a84ff";
  const target = programme.wig.target;
  const wired = target !== undefined; // programme has a data-backed outcome
  const unavailable = wired && !outcomes.available;
  const outcome = wired && outcomes.available ? outcomes.outcomes[programme.key] ?? null : null;

  return (
    <div className="flex flex-col items-center text-center shrink-0 lg:w-[320px]">
      {outcome && target !== undefined ? (
        <HeroLiveRing outcome={outcome} target={target} accent={accent} />
      ) : (
        <div className="relative w-[240px] h-[240px]">
          <svg width={240} height={240} className="block">
            <circle cx={120} cy={120} r={108} fill="none" stroke="#f0f0f2" strokeWidth={7} />
            <circle
              cx={120}
              cy={120}
              r={108}
              fill="none"
              stroke="#e5e5ea"
              strokeWidth={7}
              strokeDasharray="4 8"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[54px] font-light text-[#c7c7cc] leading-none">–</span>
            <span className="text-[12px] text-muted-foreground mt-2 max-w-[150px]">
              {unavailable ? "assessment data unavailable" : "outcome value lands at assessment"}
            </span>
          </div>
        </div>
      )}
      <div
        className="text-[10px] font-bold tracking-[0.12em] uppercase mt-5"
        style={{ color: accent }}
      >
        Wildly Important Goal
      </div>
      <div className="text-[18px] font-semibold leading-[1.35] mt-2 tracking-tight max-w-[320px]">
        {programme.wig.statement}
      </div>
      {outcome && target !== undefined ? (
        <div className="flex flex-col items-center gap-1 mt-3">
          <span className="text-[11px] text-muted-foreground">
            target {Math.round(target * 100)}%
            {outcome.baseline && (
              <>
                {" · "}
                {TERM_LABELS[outcome.baseline.term] ?? outcome.baseline.term}:{" "}
                {Math.round(outcome.baseline.value * 100)}%
              </>
            )}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {outcome.numerator}/{outcome.denominator} passing · {outcome.denominator} of{" "}
            {outcome.cohort_total} assessed
          </span>
        </div>
      ) : (
        <span
          className="inline-block text-[11px] text-muted-foreground bg-[#f5f5f7] rounded-full px-2.5 py-1 mt-3"
          title={unavailable ? outcomes.source_note ?? undefined : undefined}
        >
          {unavailable ? "Assessment data unavailable" : programme.wig.awaitingLabel}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Thread the prop through `ProgrammeView`**

Add `outcomes: OutcomesPayload;` to `ProgrammeView`'s props (both the type and destructuring) and change the hero call to `<HeroWig programme={programme} outcomes={outcomes} />`.

- [ ] **Step 3: Pass it from the programme page**

In `src/app/operations/wig/[programme]/page.tsx`, add `outcomes={data.outcomes}` to the `<ProgrammeView ...>` props.

- [ ] **Step 4: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 5: Commit (frontend repo)**

```bash
git add src/components/wig/ProgrammeView.tsx "src/app/operations/wig/[programme]/page.tsx"
git commit -m "Render live literacy hero WIG rings with target tick and unavailable state"
```

---

### Task 7: Overview rollup card + docs

**Files:**
- Modify: `src/components/wig/ProgrammeRollupCard.tsx`, `src/app/operations/wig/page.tsx`, `documentation/api-endpoints.md`

**Interfaces:**
- Consumes: `OutcomesPayload`, `TERM_LABELS`, `wig.target` from Task 5.
- Produces: `ProgrammeRollupCard` accepts a new required prop `outcomes: OutcomesPayload`.

- [ ] **Step 1: Update `ProgrammeRollupCard.tsx`**

Add `TERM_LABELS` to the config import and `OutcomesPayload` to the type import. Add `outcomes: OutcomesPayload;` to the props (type + destructuring). Above the `return`, derive:

```tsx
  const target = programme.wig.target;
  const wired = target !== undefined;
  const outcome = wired && outcomes.available ? outcomes.outcomes[programme.key] ?? null : null;
  const outcomeUnavailable = wired && !outcomes.available;
```

Replace the trailing status span (the one currently showing `zaziDown ? "backend unavailable" : programme.wig.awaitingLabel`) with:

```tsx
        <span className="ml-auto text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
          {outcome
            ? `${Math.round(outcome.value * 100)}% · ${TERM_LABELS[outcome.term] ?? outcome.term}`
            : zaziDown
              ? "backend unavailable"
              : outcomeUnavailable
                ? "assessment data unavailable"
                : programme.wig.awaitingLabel}
        </span>
```

- [ ] **Step 2: Pass the prop from the overview page**

In `src/app/operations/wig/page.tsx`, add `outcomes={data.outcomes}` to `<ProgrammeRollupCard ...>`.

- [ ] **Step 3: Document the endpoint**

In `documentation/api-endpoints.md`, next to the other `/wig/*` entries, add (match the file's existing entry format):

```markdown
### GET /api/wig/outcomes/
Term-keyed outcome (lag) measures for the literacy hero WIG rings (ADMIN/PM only).
Returns `{available, source_note, outcomes: {core_literacy, ecd_literacy}, data_as_of}`;
each outcome has value/numerator/denominator/cohort_total/term/baseline. Fail-closed:
sync-log problems, syncs older than 48h, or dedupe exceptions return available=false.
```

- [ ] **Step 4: Lint + build**

Run: `pnpm lint && pnpm build`
Expected: no errors.

- [ ] **Step 5: Commit (frontend repo)**

```bash
git add src/components/wig/ProgrammeRollupCard.tsx src/app/operations/wig/page.tsx documentation/api-endpoints.md
git commit -m "Show live literacy outcome on overview rollup cards; document outcomes endpoint"
```

---

### Task 8: Ops — populate production (manual, Jim)

No code. Prod tables are empty; the endpoint correctly reports unavailable until this runs.

- [ ] **Step 1:** On Render (backend service + cron service), set env vars: `AIRTABLE_LITERACY_ASSESSMENTS_2026_BASE_ID`, `AIRTABLE_LITERACY_ASSESSMENTS_2026_TABLE_ID`, `AIRTABLE_ON_THE_PROGRAMME_2026_BASE_ID`, `AIRTABLE_ON_THE_PROGRAMME_2026_TABLE_ID` (copy values from local backend `.env`).
- [ ] **Step 2:** Add to the nightly cron, after the existing session syncs: `python manage.py sync_airtable_on_the_programme_2026 && python manage.py sync_airtable_literacy_assessments_2026`.
- [ ] **Step 3:** Trigger one manual cron run (or run both commands in a Render shell).
- [ ] **Step 4:** Verify from the backend dir (read-only prod check):

```bash
PROD_URL=$(grep -E '^EXTERNAL_DATABASE_URL=' .env | head -1 | cut -d= -f2- | tr -d '"')
/opt/homebrew/opt/libpq/bin/psql "$PROD_URL" -c "SELECT (SELECT COUNT(*) FROM literacy_assessments_2026) AS assessments, (SELECT COUNT(*) FROM on_the_programme_2026) AS roster;"
```

Expected: assessments in the thousands, roster ~1,388.

---

### Task 9: E2E verification (browser + cross-check vs Streamlit rules)

- [ ] **Step 1: Refresh local data so the 48h gate passes** (backend dir; needs the Airtable env vars in `.env`):

Run: `venv/bin/python manage.py sync_airtable_on_the_programme_2026 && venv/bin/python manage.py sync_airtable_literacy_assessments_2026`
Expected: both report success in output.

- [ ] **Step 2: Print the computed payload**

Run: `venv/bin/python manage.py shell -c "import json; from api.wig_outcomes import build_outcomes; print(json.dumps(build_outcomes(), indent=2))"`
Expected: `available: true`, both outcomes non-null, `term: "Jun"`, values near 0.23 (core) and 0.23 (ecd).

- [ ] **Step 3: Cross-check against the parquet (same dedupe + grade rules as Streamlit)**

Run from the backend dir:

```bash
venv/bin/python - <<'EOF'
import pandas as pd
df = pd.read_parquet("/Users/jimmckeown/Development/Masi_Data_Site/masi_data_streamlit/data/parquet/raw/2026_literacy_midline.parquet")
g1 = df[df["Grade"] == "Grade 1"]["June - Read Words"].dropna()
pre = df[df["Grade"] == "PreR"]["June - Letter Sounds"].dropna()
print("core:", len(g1), round((g1 >= 16).mean(), 4))
print("ecd:", len(pre), round((pre >= 20).mean(), 4))
EOF
```

Expected: n and fraction match Step 2's denominator/value for each programme (regenerate the parquet with `venv/bin/python manage.py export_literacy_2026_parquet` first if it predates the latest sync).

- [ ] **Step 4: Browser check (live rings)**

Run backend `venv/bin/python manage.py runserver 8000` and frontend `pnpm dev`. Sign in as an ADMIN/PM user, visit `/operations/wig/core-literacy` and `/operations/wig/ecd-literacy`.
Expected: accent-filled hero ring with %, "Midline (Jun)" label, black target tick at 50%/75%, baseline line ("Baseline (Jan): 3%"-ish), passing/assessed counts. Overview `/operations/wig` cards show "23% · Midline (Jun)"-style chips on the two literacy cards; Zazi/Numeracy/Data Team cards unchanged.

- [ ] **Step 5: Failure-state check (unavailable, not awaiting)**

Insert a failing latest sync log locally, reload the page, then remove it:

```bash
venv/bin/python manage.py shell -c "from api.models import AirtableSyncLog; AirtableSyncLog.objects.create(sync_type='literacy_assessments_2026', success=False)"
# reload /operations/wig/core-literacy -> hero shows dashed ring + 'Assessment data unavailable'
venv/bin/python manage.py shell -c "from api.models import AirtableSyncLog; AirtableSyncLog.objects.filter(sync_type='literacy_assessments_2026', success=False, completed_at__isnull=True).delete()"
```

Expected: with the failing log, both literacy heroes and rollup chips show the unavailable state (grey, not awaiting); after deletion they return to live rings.

- [ ] **Step 6: Full regression**

Run: `venv/bin/python manage.py test api -v 1` (backend) and `pnpm build` (frontend).
Expected: all backend tests pass; build clean.

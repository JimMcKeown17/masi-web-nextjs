# Zazi iZandi WIG Outcomes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Zazi iZandi Primary (three mini-rings) and ECD hero WIG rings to real 2026 assessment benchmarks served by a new Zazi backend endpoint, merged into Masi's `/api/wig/outcomes/` as a kind-discriminated payload.

**Architecture:** A pure metric module on the Zazi backend computes %-at-benchmark per grade from `assessments_2026` (reusing `latest_per_phase` dedupe and `cohorts_2026.classify`), exposed at `GET /api/wig-outcomes/` behind the existing internal-auth middleware. Masi live-fetches it (5s timeout) inside `build_outcomes()` and emits per-programme union entries; the frontend routes `HeroWig` by `kind`.

**Tech Stack:** Django (two backends), Next.js 15 + React 19 (frontend).

**Spec:** `_plans/wig-dashboard/2026-07-03-zazi-wig-outcomes-design.md` (read it first).

## Global Constraints

- THREE repos, each its own git:
  - Zazi backend: `/Users/jimmckeown/Development/Zazi_iZandi_Website_2025` (commit on main; tests: `venv/bin/python manage.py test <module> -v 2` from that dir — check for `venv/`; if absent use the interpreter the repo's README/scripts use).
  - Masi backend: `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main` (commit on main; tests same pattern).
  - Frontend: `/Users/jimmckeown/Development/Masi_Website_2026/frontend/masi-website` (branch `feature/zazi-wig-outcomes`; gates `pnpm lint && pnpm build`).
- Metric rules (decided, do not change): passing = `letters_total_correct >= threshold`; NULL score counts as NOT passing (in denominator); Primary = treatment+SEF only via `classify` (control AND 'other' excluded); primary dedupe = `latest_per_phase`; grade backfill from baseline; ECD = raw rows BOTH phases, no dedupe, surveys 805/891. Thresholds/targets: Gr R 20/0.67, Gr 1 40/0.67, Gr 2 55/0.40, ECD 20/0.75. Terms `baseline` < `midline` only.
- Masi merge: fetch error/timeout/malformed -> both Zazi keys `{kind:'unavailable', note:'Zazi backend unreachable'}`; NO as_of staleness gate; literacy gate failure must NOT blank Zazi entries.
- Deploy-order safety: `single` keeps all flat fields; frontend treats missing `kind` as `'single'`.
- No emojis; commit messages imperative, no co-author lines.

---

### Task 1: Zazi metric module (TDD)

**Files:**
- Create: `api/wig_outcomes_2026.py` (Zazi repo)
- Test: create `api/tests_wig_outcomes_2026.py` (Zazi repo)

**Interfaces:**
- Consumes: `latest_per_phase(rows)` from `api/programmatic_impact_2026.py` (row dicts with `participant_id`, `assessment_type`, `response_date`, `data_refresh_timestamp`, `response_id`); `classify(name, treatment, sef, control)` + `CONTROL_SCHOOLS` from `api/cohorts_2026.py`; `TREATMENT_SCHOOLS`, `SEF_SCHOOLS` from `api.views`; `Assessment2026` model.
- Produces: `build_wig_outcomes() -> dict` (the endpoint payload: `{generated_at, as_of, programmes: {zazi_izandi, zazi_izandi_ecd}}`); pure helpers `backfill_grades(rows)`, `phase_stat(rows, threshold)`, `primary_programme(rows, treatment, sef)`, `ecd_programme(rows)`.

- [ ] **Step 1: Write the failing tests**

Create `api/tests_wig_outcomes_2026.py`:

```python
"""Tests for the WIG outcome benchmarks served to the Masi scoreboard.

Pure-function tests use SimpleTestCase (no DB); build_wig_outcomes gets one
ORM round-trip test. Run: python manage.py test api.tests_wig_outcomes_2026
"""
from datetime import date, datetime, timezone as dt_tz

from django.test import SimpleTestCase, TestCase

from api.wig_outcomes_2026 import (
    backfill_grades, build_wig_outcomes, ecd_programme, phase_stat, primary_programme,
)

TREATMENT = {"TREAT PRIMARY SCHOOL"}
SEF = {"SEF PRIMARY SCHOOL"}

_seq = {"n": 0}


def row(school="Treat Primary School", grade="Grade 1", phase="midline",
        letters=None, pid="P1", language="isiXhosa", survey_id=880,
        response_date=None, refresh=None):
    _seq["n"] += 1
    return {
        "response_id": f"r{_seq['n']}", "participant_id": pid, "grade": grade,
        "language": language, "program_name": school, "assessment_type": phase,
        "letters_total_correct": letters,
        "response_date": response_date or date(2026, 6, 1),
        "data_refresh_timestamp": refresh or datetime(2026, 6, 2, tzinfo=dt_tz.utc),
        "survey_id": survey_id,
    }


class PhaseStatTests(SimpleTestCase):
    def test_null_score_counts_as_not_passing_in_denominator(self):
        rows = [row(letters=40.0), row(letters=None, pid="P2")]
        stat = phase_stat(rows, 40.0)
        self.assertEqual((stat["numerator"], stat["denominator"]), (1, 2))

    def test_boundary_passes(self):
        stat = phase_stat([row(letters=40.0)], 40.0)
        self.assertEqual(stat["value"], 1.0)

    def test_below_boundary_fails(self):
        stat = phase_stat([row(letters=39.9)], 40.0)
        self.assertEqual(stat["value"], 0.0)

    def test_empty_returns_none(self):
        self.assertIsNone(phase_stat([], 40.0))


class PrimaryProgrammeTests(SimpleTestCase):
    def test_control_and_other_schools_excluded(self):
        rows = [
            row(school="Treat Primary School", letters=40.0, pid="P1"),
            row(school="Pendla Primary School", letters=40.0, pid="P2"),   # control
            row(school="Nowhere Primary", letters=40.0, pid="P3"),         # other
        ]
        prog = primary_programme(rows, TREATMENT, SEF)
        g1 = next(m for m in prog["metrics"] if m["key"] == "grade_1")
        self.assertEqual(g1["denominator"], 1)

    def test_sef_included(self):
        rows = [row(school="SEF Primary School", letters=40.0)]
        prog = primary_programme(rows, TREATMENT, SEF)
        g1 = next(m for m in prog["metrics"] if m["key"] == "grade_1")
        self.assertEqual(g1["denominator"], 1)

    def test_dedupe_latest_row_wins(self):
        older = row(letters=40.0, response_date=date(2026, 5, 1))
        newer = row(letters=10.0, response_date=date(2026, 6, 1))
        prog = primary_programme([older, newer], TREATMENT, SEF)
        g1 = next(m for m in prog["metrics"] if m["key"] == "grade_1")
        self.assertEqual((g1["numerator"], g1["denominator"]), (0, 1))

    def test_thresholds_per_grade(self):
        rows = [
            row(grade="Grade R", letters=20.0, pid="R1"),
            row(grade="Grade 1", letters=40.0, pid="O1"),
            row(grade="Grade 2", letters=54.9, pid="T1"),
        ]
        prog = primary_programme(rows, TREATMENT, SEF)
        vals = {m["key"]: m["value"] for m in prog["metrics"]}
        self.assertEqual(vals, {"grade_r": 1.0, "grade_1": 1.0, "grade_2": 0.0})

    def test_term_midline_over_baseline_with_baseline_context(self):
        rows = [
            row(phase="baseline", letters=10.0, response_date=date(2026, 2, 1)),
            row(phase="midline", letters=40.0, response_date=date(2026, 6, 1)),
        ]
        prog = primary_programme(rows, TREATMENT, SEF)
        self.assertEqual(prog["term"], "midline")
        g1 = next(m for m in prog["metrics"] if m["key"] == "grade_1")
        self.assertEqual(g1["value"], 1.0)
        self.assertEqual(g1["baseline"]["value"], 0.0)

    def test_baseline_only_data_selects_baseline_with_null_baseline_context(self):
        prog = primary_programme([row(phase="baseline", letters=40.0)], TREATMENT, SEF)
        self.assertEqual(prog["term"], "baseline")
        g1 = next(m for m in prog["metrics"] if m["key"] == "grade_1")
        self.assertIsNone(g1["baseline"])

    def test_endline_rows_ignored(self):
        rows = [row(phase="midline", letters=10.0),
                row(phase="endline", letters=40.0, response_date=date(2026, 11, 1))]
        prog = primary_programme(rows, TREATMENT, SEF)
        self.assertEqual(prog["term"], "midline")
        g1 = next(m for m in prog["metrics"] if m["key"] == "grade_1")
        self.assertEqual(g1["value"], 0.0)

    def test_no_rows_returns_none(self):
        self.assertIsNone(primary_programme([], TREATMENT, SEF))

    def test_grade_backfilled_from_baseline(self):
        rows = [
            row(phase="baseline", grade="Grade 1", letters=10.0),
            row(phase="midline", grade="", letters=40.0),
        ]
        prog = primary_programme(rows, TREATMENT, SEF)
        g1 = next(m for m in prog["metrics"] if m["key"] == "grade_1")
        self.assertEqual((g1["numerator"], g1["denominator"]), (1, 1))


class EcdProgrammeTests(SimpleTestCase):
    def test_raw_rows_both_phases_no_dedupe(self):
        rows = [
            row(survey_id=891, phase="midline", letters=20.0, pid="E1", language="ECD", grade="PreR"),
            row(survey_id=891, phase="midline", letters=5.0, pid="E1", language="ECD", grade="PreR"),
        ]
        prog = ecd_programme(rows)
        m = prog["metrics"][0]
        self.assertEqual((m["numerator"], m["denominator"]), (1, 2))

    def test_baseline_rows_without_pid_counted(self):
        rows = [row(survey_id=805, phase="baseline", letters=20.0, pid="", language="ECD", grade="PreR")]
        prog = ecd_programme(rows)
        self.assertEqual(prog["term"], "baseline")
        self.assertEqual(prog["metrics"][0]["denominator"], 1)

    def test_threshold_20(self):
        rows = [row(survey_id=891, phase="midline", letters=19.9, pid="E1", language="ECD")]
        self.assertEqual(ecd_programme(rows)["metrics"][0]["value"], 0.0)


class BuildWigOutcomesTests(TestCase):
    def test_orm_roundtrip_and_as_of(self):
        from api.models import Assessment2026
        Assessment2026.objects.create(
            response_id="a1", survey_id=880, participant_id="P1", grade="Grade 1",
            language="isiXhosa", program_name="Aaron Gqadu Primary School",
            assessment_type="midline", letters_total_correct=40.0,
            response_date=datetime(2026, 6, 1, tzinfo=dt_tz.utc),
            data_refresh_timestamp=datetime(2026, 6, 2, tzinfo=dt_tz.utc),
        )
        payload = build_wig_outcomes()
        self.assertIn("zazi_izandi", payload["programmes"])
        self.assertIsNotNone(payload["as_of"])
```

NOTE for the implementer: `Aaron Gqadu Primary School` must classify as
treatment or sef for the ORM test — check `TREATMENT_SCHOOLS`/`SEF_SCHOOLS`
in `api/views.py:458-510`; if it is not in either set, use a school name that
IS in `TREATMENT_SCHOOLS` (any entry verbatim). Also verify the exact
`Assessment2026.objects.create` kwargs against the model (api/models.py:799);
`response_date` may be a DateField (pass `date(...)`) — adjust the fixture to
the real field types.

- [ ] **Step 2: Run to verify failure**

Run (Zazi repo): `venv/bin/python manage.py test api.tests_wig_outcomes_2026 -v 2`
Expected: `ModuleNotFoundError: No module named 'api.wig_outcomes_2026'`

- [ ] **Step 3: Create `api/wig_outcomes_2026.py`**

```python
"""WIG outcome (lag) benchmarks for the Masi scoreboard.

Parity contract = the ZZ Data Site midline pages: latest row per participant
per phase (primary, via programmatic_impact_2026.latest_per_phase), raw rows
both phases for ECD (its helper refuses to dedupe midline only), null scores
count as NOT passing, passing = letters_total_correct >= threshold, grade
backfill from baseline. Grade 2 (55) and ECD (20) thresholds are WIG
definitions (2026-07-03) with no site slider equivalent. Terms baseline <
midline; endline is enabled together with the site pages.
"""
from django.utils import timezone

from .cohorts_2026 import CONTROL_SCHOOLS, classify
from .programmatic_impact_2026 import latest_per_phase

PHASES = ("baseline", "midline")
PRIMARY_LANGUAGES = ("isiXhosa", "English", "Afrikaans")
ECD_SURVEY_IDS = (805, 891)

PRIMARY_METRICS = (
    {"key": "grade_r", "label": "Gr R", "grade": "Grade R", "threshold": 20.0, "target": 0.67},
    {"key": "grade_1", "label": "Gr 1", "grade": "Grade 1", "threshold": 40.0, "target": 0.67},
    {"key": "grade_2", "label": "Gr 2", "grade": "Grade 2", "threshold": 55.0, "target": 0.40},
)
ECD_METRIC = {"key": "letter_sounds", "label": "Letter sounds", "threshold": 20.0, "target": 0.75}


def _phase(r):
    return (r.get("assessment_type") or "").strip().lower()


def backfill_grades(rows):
    """ZZ site rule: a row with a blank grade inherits the participant's
    baseline grade (mutates rows in place)."""
    baseline_grade = {}
    for r in rows:
        pid = (r.get("participant_id") or "").strip()
        grade = (r.get("grade") or "").strip()
        if _phase(r) == "baseline" and pid and grade:
            baseline_grade[pid] = grade
    for r in rows:
        if not (r.get("grade") or "").strip():
            pid = (r.get("participant_id") or "").strip()
            if pid in baseline_grade:
                r["grade"] = baseline_grade[pid]


def phase_stat(rows, threshold):
    """Cross-sectional stat over the given rows; None if empty. A null
    letters_total_correct is in the denominator but never the numerator."""
    if not rows:
        return None
    num = sum(1 for r in rows
              if r.get("letters_total_correct") is not None
              and r["letters_total_correct"] >= threshold)
    return {"value": num / len(rows), "numerator": num, "denominator": len(rows)}


def _select_term(rows_by_phase):
    for term in reversed(PHASES):
        if rows_by_phase.get(term):
            return term
    return None


def _metrics_payload(rows_by_phase, term, metric_defs, grade_filter):
    metrics = []
    for m in metric_defs:
        current = [r for r in rows_by_phase.get(term, []) if grade_filter(r, m)]
        base = ([r for r in rows_by_phase.get("baseline", []) if grade_filter(r, m)]
                if term != "baseline" else [])
        stat = phase_stat(current, m["threshold"]) or {"value": None, "numerator": None, "denominator": None}
        metrics.append({
            "key": m["key"], "label": m["label"], "threshold": m["threshold"],
            "target": m["target"], **stat,
            "baseline": phase_stat(base, m["threshold"]),
        })
    return metrics


def primary_programme(rows, treatment, sef):
    """Treatment+SEF primary rows -> {'term', 'metrics'} or None."""
    rows = [r for r in rows
            if r.get("language") in PRIMARY_LANGUAGES
            and classify(r.get("program_name"), treatment, sef, CONTROL_SCHOOLS) in ("treatment", "sef")]
    backfill_grades(rows)
    deduped = [r for r in latest_per_phase(rows) if _phase(r) in PHASES]
    rows_by_phase = {p: [r for r in deduped if _phase(r) == p] for p in PHASES}
    term = _select_term(rows_by_phase)
    if term is None:
        return None
    grade_filter = lambda r, m: (r.get("grade") or "").strip() == m["grade"]
    return {"term": term, "metrics": _metrics_payload(rows_by_phase, term, PRIMARY_METRICS, grade_filter)}


def ecd_programme(rows):
    """ECD survey rows, raw (no dedupe, both phases) -> {'term','metrics'} or None."""
    rows = [r for r in rows if r.get("survey_id") in ECD_SURVEY_IDS and _phase(r) in PHASES]
    rows_by_phase = {p: [r for r in rows if _phase(r) == p] for p in PHASES}
    term = _select_term(rows_by_phase)
    if term is None:
        return None
    return {"term": term,
            "metrics": _metrics_payload(rows_by_phase, term, (ECD_METRIC,), lambda r, m: True)}


FIELDS = ("response_id", "participant_id", "grade", "language", "program_name",
          "assessment_type", "letters_total_correct", "response_date",
          "data_refresh_timestamp", "survey_id")


def build_wig_outcomes():
    from .models import Assessment2026
    from .views import SEF_SCHOOLS, TREATMENT_SCHOOLS
    rows = list(Assessment2026.objects.filter(assessment_type__in=PHASES).values(*FIELDS))
    as_of = max((r["data_refresh_timestamp"] for r in rows
                 if r.get("data_refresh_timestamp")), default=None)
    return {
        "generated_at": timezone.now().isoformat(),
        "as_of": as_of.isoformat() if as_of else None,
        "programmes": {
            "zazi_izandi": primary_programme(rows, TREATMENT_SCHOOLS, SEF_SCHOOLS),
            "zazi_izandi_ecd": ecd_programme(rows),
        },
    }
```

NOTE: if importing `TREATMENT_SCHOOLS` from `api.views` inside
`build_wig_outcomes` creates a circular import when the view (Task 2) imports
this module, keep both imports function-local (as written) — that breaks the
cycle. Also verify `latest_per_phase` drops non-PHASES phases itself; the
explicit `_phase(r) in PHASES` filter above makes endline exclusion
independent of its internals.

- [ ] **Step 4: Run tests**

Run: `venv/bin/python manage.py test api.tests_wig_outcomes_2026 -v 2`
Expected: all 17 tests PASS.

- [ ] **Step 5: Commit (Zazi repo)**

```bash
git add api/wig_outcomes_2026.py api/tests_wig_outcomes_2026.py
git commit -m "feat: WIG outcome benchmarks module for the Masi scoreboard"
```

---

### Task 2: Zazi endpoint (view + route + auth tests)

**Files:**
- Modify: `api/views.py`, `api/urls.py` (Zazi repo)
- Test: `api/tests_wig_outcomes_2026.py` (append)

**Interfaces:**
- Produces: `GET /api/wig-outcomes/` returning `build_wig_outcomes()`, gated by the existing `InternalAuthMiddleware` (X-Internal-Auth), matching the style of `views.programmatic_impact_2026`.

- [ ] **Step 1: Write the failing tests (append)**

First READ `api/tests_middleware.py` to copy its auth-header/test-secret
conventions exactly (how it sets `INTERNAL_API_SECRET` and the header). Then
append, adapting the two marked lines to those conventions:

```python
from django.test import Client, override_settings


@override_settings(INTERNAL_API_SECRET="test-secret")   # adapt to tests_middleware convention
class WigOutcomesEndpointTests(TestCase):
    def test_rejected_without_internal_auth(self):
        resp = Client().get("/api/wig-outcomes/")
        self.assertIn(resp.status_code, (401, 403))

    def test_returns_payload_with_auth(self):
        resp = Client().get("/api/wig-outcomes/", HTTP_X_INTERNAL_AUTH="test-secret")
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertIn("programmes", body)
        self.assertIn("zazi_izandi", body["programmes"])
```

Run: `venv/bin/python manage.py test api.tests_wig_outcomes_2026.WigOutcomesEndpointTests -v 2`
Expected: FAIL (404 — route not registered).

- [ ] **Step 2: Add view + route**

In `api/views.py`, next to `programmatic_impact_2026` (~line 1351), add a view
in the SAME style as that view (same decorators and response class — read it
first and mirror it):

```python
@api_view(["GET"])
def wig_outcomes_2026(request):
    """WIG outcome benchmarks for the Masi scoreboard (lag measures)."""
    from .wig_outcomes_2026 import build_wig_outcomes
    return Response(build_wig_outcomes())
```

In `api/urls.py`, after the `programmatic-impact-2026` line:

```python
    path('wig-outcomes/', views.wig_outcomes_2026, name='wig-outcomes'),
```

- [ ] **Step 3: Run the whole module + smoke the payload**

Run: `venv/bin/python manage.py test api.tests_wig_outcomes_2026 -v 2` — all pass.
Run: `venv/bin/python manage.py shell -c "import json; from api.wig_outcomes_2026 import build_wig_outcomes; print(json.dumps(build_wig_outcomes(), indent=2, default=str)[:2000])"`
Expected: real payload against the local Zazi DB (record the Gr R / Gr 1 / Gr 2 / ECD values in the report for the E2E cross-check).

- [ ] **Step 4: Commit (Zazi repo)**

```bash
git add api/views.py api/urls.py api/tests_wig_outcomes_2026.py
git commit -m "feat: /api/wig-outcomes/ endpoint for the Masi WIG scoreboard"
```

---

### Task 3: Masi merge (fetch + kind union + tests)

**Files:**
- Modify: `api/zazi_client.py`, `api/wig_outcomes.py` (Masi repo)
- Test: `api/tests_wig_outcomes.py` (modify + append)

**Interfaces:**
- Consumes: Zazi payload from Task 2.
- Produces: `outcomes` map entries — literacy: existing dict + `"kind": "single"` (all flat fields kept); `zazi_izandi`: `{kind:'multi', term, as_of, metrics:[...]}`; `zazi_izandi_ecd`: `{kind:'single', value, numerator, denominator, term, baseline, target, calculation_note}` (no `cohort_total`); either Zazi key may be `{kind:'unavailable', note}` or `null`. Literacy-gate failure payloads still include Zazi entries.

- [ ] **Step 1: Failing tests first**

In `api/tests_wig_outcomes.py`: import `patch` from `unittest.mock` (top of
file if not present). Append:

```python
from unittest.mock import patch

ZAZI_PAYLOAD = {
    "generated_at": "2026-07-03T10:00:00+00:00", "as_of": "2026-07-02T22:00:00+00:00",
    "programmes": {
        "zazi_izandi": {"term": "midline", "metrics": [
            {"key": "grade_1", "label": "Gr 1", "threshold": 40.0, "target": 0.67,
             "value": 0.4, "numerator": 4, "denominator": 10,
             "baseline": {"value": 0.1, "numerator": 1, "denominator": 10}},
        ]},
        "zazi_izandi_ecd": {"term": "midline", "metrics": [
            {"key": "letter_sounds", "label": "Letter sounds", "threshold": 20.0,
             "target": 0.75, "value": 0.25, "numerator": 5, "denominator": 20,
             "baseline": None},
        ]},
    },
}


class ZaziMergeTests(TestCase):
    def setUp(self):
        make_logs()

    def test_literacy_entries_carry_kind_single_with_flat_fields(self):
        roster("CH-1")
        assess("CH-1", read_words=20.0)
        with patch("api.wig_outcomes.zazi_client.fetch_zazi_wig_outcomes",
                   return_value=ZAZI_PAYLOAD):
            out = build_outcomes()["outcomes"]["core_literacy"]
        self.assertEqual(out["kind"], "single")
        for field in ("value", "numerator", "denominator", "term", "cohort_total", "baseline"):
            self.assertIn(field, out)

    def test_zazi_multi_and_single_mapping(self):
        with patch("api.wig_outcomes.zazi_client.fetch_zazi_wig_outcomes",
                   return_value=ZAZI_PAYLOAD):
            outcomes = build_outcomes()["outcomes"]
        multi = outcomes["zazi_izandi"]
        self.assertEqual(multi["kind"], "multi")
        self.assertEqual(multi["metrics"][0]["target"], 0.67)
        single = outcomes["zazi_izandi_ecd"]
        self.assertEqual(single["kind"], "single")
        self.assertEqual(single["value"], 0.25)
        self.assertEqual(single["target"], 0.75)
        self.assertNotIn("cohort_total", single)

    def test_zazi_fetch_error_degrades_only_zazi(self):
        roster("CH-1")
        assess("CH-1", read_words=20.0)
        with patch("api.wig_outcomes.zazi_client.fetch_zazi_wig_outcomes",
                   side_effect=Exception("boom")):
            outcomes = build_outcomes()["outcomes"]
        self.assertEqual(outcomes["zazi_izandi"]["kind"], "unavailable")
        self.assertEqual(outcomes["zazi_izandi_ecd"]["kind"], "unavailable")
        self.assertEqual(outcomes["core_literacy"]["kind"], "single")

    def test_zazi_malformed_payload_degrades(self):
        with patch("api.wig_outcomes.zazi_client.fetch_zazi_wig_outcomes",
                   return_value={"nope": True}):
            outcomes = build_outcomes()["outcomes"]
        self.assertEqual(outcomes["zazi_izandi"]["kind"], "unavailable")

    def test_zazi_null_programme_stays_null(self):
        payload = {"as_of": None, "programmes": {"zazi_izandi": None, "zazi_izandi_ecd": None}}
        with patch("api.wig_outcomes.zazi_client.fetch_zazi_wig_outcomes",
                   return_value=payload):
            outcomes = build_outcomes()["outcomes"]
        self.assertIsNone(outcomes["zazi_izandi"])

    def test_literacy_gate_failure_still_includes_zazi(self):
        from api.models import AirtableSyncLog
        AirtableSyncLog.objects.all().delete()   # literacy sources unhealthy
        with patch("api.wig_outcomes.zazi_client.fetch_zazi_wig_outcomes",
                   return_value=ZAZI_PAYLOAD):
            payload = build_outcomes()
        self.assertFalse(payload["available"])
        self.assertEqual(payload["outcomes"]["zazi_izandi"]["kind"], "multi")
        self.assertNotIn("core_literacy", payload["outcomes"])
```

Existing tests that index `payload["outcomes"]` will now also see Zazi keys;
patch is NOT applied there, and a real network call must never happen in
tests — so Step 2's implementation must import `zazi_client` as a module
(`from . import zazi_client`) and the OLD tests must be updated by adding
`@patch("api.wig_outcomes.zazi_client.fetch_zazi_wig_outcomes", side_effect=Exception("no network in tests"))`
where needed OR (simpler, do this): in `setUp` of each existing TestCase add

```python
        p = patch("api.wig_outcomes.zazi_client.fetch_zazi_wig_outcomes",
                  side_effect=Exception("offline"))
        p.start()
        self.addCleanup(p.stop)
```

and update assertions that compare full `outcomes` dicts (e.g.
`test_healthy_logs_no_rows_available_with_null_outcomes`,
`test_unavailable_with_no_sync_logs` asserting `outcomes == {}`) to account
for the two Zazi keys now present as unavailable entries — change `{}`
assertions to check literacy keys are absent/None specifically.

Run: `venv/bin/python manage.py test api.tests_wig_outcomes -v 2`
Expected: new tests FAIL (AttributeError: no fetch_zazi_wig_outcomes).

- [ ] **Step 2: Implement**

`api/zazi_client.py` — append, following the existing `fetch_*` style:

```python
def fetch_zazi_wig_outcomes():
    """WIG outcome benchmarks (fast aggregate; fetched live, 5s timeout)."""
    base_url = os.environ.get('ZAZI_API_BASE_URL')
    secret = os.environ.get('ZAZI_INTERNAL_API_SECRET')
    resp = requests.get(
        f"{base_url}/api/wig-outcomes/",
        headers={'X-Internal-Auth': secret},
        timeout=5,
    )
    resp.raise_for_status()
    return resp.json()
```

(Read the existing helpers first — if they build headers/base URL via shared
module-level code, reuse that instead of duplicating.)

`api/wig_outcomes.py`:
1. Add `from . import zazi_client` to the imports.
2. In `_programme_outcome`, add `'kind': 'single'` to the result dict.
3. Add:

```python
ZAZI_PROGRAMME_KEYS = ('zazi_izandi', 'zazi_izandi_ecd')


def _zazi_single(prog, as_of):
    """Flatten a one-metric Zazi programme to the single-outcome shape."""
    m = prog['metrics'][0]
    return {
        'kind': 'single', 'value': m['value'], 'numerator': m['numerator'],
        'denominator': m['denominator'], 'term': prog['term'],
        'baseline': (dict(m['baseline'], term='baseline') if m.get('baseline') else None),
        'target': m['target'],
        'calculation_note': f"Zazi backend benchmark; data as of {as_of or 'unknown'}",
    }


def _zazi_outcomes():
    """Per-programme Zazi entries; any failure degrades ONLY the Zazi keys."""
    try:
        payload = zazi_client.fetch_zazi_wig_outcomes()
        programmes = payload['programmes']
        as_of = payload.get('as_of')
        result = {}
        for key in ZAZI_PROGRAMME_KEYS:
            prog = programmes.get(key) if isinstance(programmes, dict) else None
            if prog is None:
                result[key] = None
            elif key == 'zazi_izandi':
                result[key] = {'kind': 'multi', 'term': prog['term'],
                               'as_of': as_of, 'metrics': prog['metrics']}
            else:
                result[key] = _zazi_single(prog, as_of)
        return result
    except Exception:
        note = 'Zazi backend unreachable'
        return {key: {'kind': 'unavailable', 'note': note} for key in ZAZI_PROGRAMME_KEYS}
```

4. In `build_outcomes`: change the `unavailable()` helper to include Zazi
   (`'outcomes': _zazi_outcomes()` instead of `{}`), and in the healthy path
   merge `outcomes.update(_zazi_outcomes())` just before the return. Also add
   `term='Jan'` handling is unchanged — literacy code untouched otherwise.
5. The existing dedupe fail-closed return (dedupe exceptions) is also an
   `unavailable(...)` call, so it inherits the Zazi merge automatically.

- [ ] **Step 3: Run the full module + regression**

Run: `venv/bin/python manage.py test api.tests_wig_outcomes api.tests_wig -v 2`
Expected: all pass (old tests updated per Step 1's note).

- [ ] **Step 4: Commit (Masi repo)**

```bash
git add api/zazi_client.py api/wig_outcomes.py api/tests_wig_outcomes.py
git commit -m "feat: merge Zazi assessment benchmarks into WIG outcomes payload"
```

---

### Task 4: Frontend union types + multi-ring hero + rollup

**Files:**
- Modify: `src/lib/types/wig.ts`, `src/lib/wig/config.ts`, `src/components/wig/ProgrammeView.tsx`, `src/components/wig/ProgrammeRollupCard.tsx` (frontend repo, branch `feature/zazi-wig-outcomes`)

**Interfaces:**
- Consumes: Task 3's payload.
- Produces: `WigOutcomeSingle | WigOutcomeMulti | WigOutcomeUnavailable` union, `outcomeKind()` guard (missing kind -> 'single'), kind-routed `HeroWig`, `HeroMultiRing`, updated rollup chip.

- [ ] **Step 1: Types — replace the outcome types in `src/lib/types/wig.ts`**

Replace the existing `WigOutcome`/`OutcomesPayload` block with:

```typescript
// --- Outcome (lag) measures for hero WIG rings (GET /api/wig/outcomes/) ---

export interface OutcomeTermStat {
  value: number | null; // fraction 0..1 (null when the grade has no rows this term)
  numerator: number | null;
  denominator: number | null;
  term?: string;
}

export interface WigOutcomeSingle extends OutcomeTermStat {
  kind?: "single"; // absent on pre-migration payloads; treat missing as single
  term: string;
  cohort_total?: number; // Masi literacy only (no roster concept on Zazi side)
  baseline: OutcomeTermStat | null;
  target?: number; // Zazi supplies its own; literacy uses config
  calculation_note?: string;
}

export interface WigOutcomeMetric extends OutcomeTermStat {
  key: string;
  label: string;
  threshold: number;
  target: number;
  baseline: OutcomeTermStat | null;
}

export interface WigOutcomeMulti {
  kind: "multi";
  term: string;
  as_of?: string | null;
  metrics: WigOutcomeMetric[];
}

export interface WigOutcomeUnavailable {
  kind: "unavailable";
  note: string;
}

export type WigOutcomeEntry = WigOutcomeSingle | WigOutcomeMulti | WigOutcomeUnavailable;

// Missing `kind` (old backend) is a single outcome — deploy-order safety.
export function outcomeKind(o: WigOutcomeEntry): "single" | "multi" | "unavailable" {
  return o.kind ?? "single";
}

export interface OutcomesPayload {
  available: boolean;
  source_note: string | null;
  outcomes: Record<string, WigOutcomeEntry | null>;
  data_as_of?: string;
}
```

(`WigOutcome` was only imported by ProgrammeView/ProgrammeRollupCard — update
those imports in Steps 3-4. Keep everything else in the file unchanged.)

- [ ] **Step 2: `src/lib/wig/config.ts`** — extend TERM_LABELS:

```typescript
export const TERM_LABELS: Record<string, string> = {
  Jan: "Baseline (Jan)",
  Jun: "Midline (Jun)",
  Nov: "Endline (Nov)",
  baseline: "Baseline",
  midline: "Midline",
  endline: "Endline",
};
```

No `wig.target` for the Zazi programmes (targets ride in the payload).

- [ ] **Step 3: `ProgrammeView.tsx`** — kind routing + multi hero.

Update the type import to `{ OutcomesPayload, WigOutcomeSingle, WigOutcomeMulti, WigOutcomeMetric }` + `outcomeKind`. Keep `HeroLiveRing` as is, but change its prop type to `WigOutcomeSingle` and its target line: it already receives `target` as a prop — in `HeroWig` pass `outcome.target ?? programme.wig.target`.

Add below `HeroLiveRing`:

```tsx
// Compact ring for the multi-metric hero: same geometry at 110px.
function MiniOutcomeRing({ metric, accent }: { metric: WigOutcomeMetric; accent: string }) {
  const R = 48;
  const C = 2 * Math.PI * R;
  const fill = Math.max(0, Math.min(metric.value ?? 0, 1));
  const tickAngle = (metric.target * 360 - 90) * (Math.PI / 180);
  const tick = {
    x1: 55 + (R - 6) * Math.cos(tickAngle),
    y1: 55 + (R - 6) * Math.sin(tickAngle),
    x2: 55 + (R + 6) * Math.cos(tickAngle),
    y2: 55 + (R + 6) * Math.sin(tickAngle),
  };
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[110px] h-[110px]">
        <svg width={110} height={110} className="block">
          <circle cx={55} cy={55} r={R} fill="none" stroke="#f0f0f2" strokeWidth={5} />
          <circle
            cx={55} cy={55} r={R} fill="none" stroke={accent} strokeWidth={5}
            strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - fill)}
            transform="rotate(-90 55 55)" style={{ transition: "stroke-dashoffset .6s ease" }}
          />
          <line {...tick} stroke="#1c1c1e" strokeWidth={2} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[24px] font-semibold tracking-tight leading-none" style={{ color: accent }}>
            {metric.value === null ? "–" : `${Math.round(metric.value * 100)}%`}
          </span>
        </div>
      </div>
      <span className="text-[12px] font-medium mt-1.5">{metric.label}</span>
      <span className="text-[10.5px] text-muted-foreground">target {Math.round(metric.target * 100)}%</span>
    </div>
  );
}

function HeroMultiRings({ outcome, accent }: { outcome: WigOutcomeMulti; accent: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-4">
        {outcome.metrics.map((m) => (
          <MiniOutcomeRing key={m.key} metric={m} accent={accent} />
        ))}
      </div>
      <span className="text-[12px] text-muted-foreground mt-3">
        {TERM_LABELS[outcome.term] ?? outcome.term}
      </span>
    </div>
  );
}
```

Rework `HeroWig`'s decision logic (keeping the placeholder JSX and the
statement/pill blocks):

```tsx
function HeroWig({ programme, outcomes }: { programme: ProgrammeConfig; outcomes: OutcomesPayload }) {
  const accent = programme.accent ?? "#0a84ff";
  const entry = outcomes.outcomes[programme.key] ?? null;
  const kind = entry ? outcomeKind(entry) : null;
  // Literacy programmes (wig.target in config) are gated by the global
  // literacy source flag; Zazi failures arrive as explicit unavailable entries.
  const literacyWired = programme.wig.target !== undefined;
  const unavailable =
    kind === "unavailable" || (literacyWired && !outcomes.available && kind === null);
  const single = entry && kind === "single" ? (entry as WigOutcomeSingle) : null;
  const multi = entry && kind === "multi" ? (entry as WigOutcomeMulti) : null;
  const target = single ? single.target ?? programme.wig.target : undefined;
  ...
}
```

Render order: `multi` -> `<HeroMultiRings .../>`; `single && single.value != null && target !== undefined` -> `<HeroLiveRing outcome={single} target={target} accent={accent} />`; `unavailable` -> existing grey dashed block (note from `(entry as WigOutcomeUnavailable).note ?? outcomes.source_note`); else awaiting placeholder. Below the statement: single keeps the existing target/baseline/counts block; multi renders one line per metric:

```tsx
{multi && (
  <div className="flex flex-col items-center gap-0.5 mt-3">
    {multi.metrics.map((m) => (
      <span key={m.key} className="text-[11px] text-muted-foreground">
        {m.label}: {m.numerator ?? "–"}/{m.denominator ?? "–"} passing
        {m.baseline?.value != null && <> · baseline {Math.round(m.baseline.value * 100)}%</>}
      </span>
    ))}
  </div>
)}
```

- [ ] **Step 4: `ProgrammeRollupCard.tsx`** — chip routing. Replace the outcome derivation with:

```tsx
  const entry = outcomes.outcomes[programme.key] ?? null;
  const kind = entry ? outcomeKind(entry) : null;
  const single = entry && kind === "single" ? (entry as WigOutcomeSingle) : null;
  const g1 = entry && kind === "multi"
    ? (entry as WigOutcomeMulti).metrics.find((m) => m.key === "grade_1") ?? null
    : null;
  const literacyWired = programme.wig.target !== undefined;
  const outcomeUnavailable =
    kind === "unavailable" || (literacyWired && !outcomes.available && kind === null);
```

Chip text precedence: `single?.value != null` -> `` `${Math.round(single.value * 100)}% · ${TERM_LABELS[single.term] ?? single.term}` ``; `g1?.value != null` -> `` `Gr 1: ${Math.round(g1.value * 100)}% · ${TERM_LABELS[(entry as WigOutcomeMulti).term] ?? ""}` ``; then zaziDown / outcomeUnavailable / awaitingLabel as today.

- [ ] **Step 5: Gates + commit (frontend repo)**

Run: `pnpm lint && pnpm build` — no errors (2 pre-existing no-img-element warnings fine).

```bash
git add src/lib/types/wig.ts src/lib/wig/config.ts src/components/wig/ProgrammeView.tsx src/components/wig/ProgrammeRollupCard.tsx
git commit -m "Render Zazi WIG outcomes: kind-routed hero with three mini-rings"
```

---

### Task 5: Verification + deploy + E2E

- [ ] **Step 1: Zazi SQL cross-check (read-only, Zazi prod or local DB)**

Compare Task 2's shell payload against the ZZ Data Site's midline page for
Gr R (20) and Gr 1 (40) — values must match its "% at benchmark" for the
treatment+SEF cohorts combined. For Gr 2 (55) and ECD (20) there is no site
view: sanity-check by SQL against the same DB the shell used, e.g.

```sql
SELECT grade, COUNT(*) AS n,
       ROUND(100.0 * COUNT(*) FILTER (WHERE letters_total_correct >= 55) / COUNT(*), 1) AS pct
FROM assessments_2026 WHERE assessment_type = 'midline'
  AND language IN ('isiXhosa','English','Afrikaans') GROUP BY grade;
```

(SQL is dedupe/cohort-naive — expect close-not-exact; the module's unit tests
own exactness.)

- [ ] **Step 2: Deploy Zazi backend** — `git push` (Zazi repo, main). Verify Render deploy, then from the Masi backend dir:

```bash
venv/bin/python manage.py shell -c "from api.zazi_client import fetch_zazi_wig_outcomes; import json; print(json.dumps(fetch_zazi_wig_outcomes(), indent=2)[:1500])"
```

Expected: live payload from prod Zazi (Masi .env points ZAZI_API_BASE_URL at prod).

- [ ] **Step 3: Browser E2E** — Masi backend `runserver 8000` + `pnpm dev`, sign in as ADMIN:
- `/operations/wig/zazi-izandi`: three mini-rings with ticks at 67/67/40%, term label, per-grade counts lines; lead measures unchanged beside them.
- `/operations/wig/zazi-izandi-ecd`: single live ring, tick at 75%.
- `/operations/wig/core-literacy`: literacy hero UNCHANGED (regression).
- Overview: Zazi Primary chip "Gr 1: N% · Midline", ECD chip "N% · Midline".
- Failure state: set `ZAZI_API_BASE_URL=http://localhost:9` in the Masi shell env, restart runserver, reload -> both Zazi heroes show "Assessment data unavailable" while literacy heroes stay live; restore env after.

- [ ] **Step 4: Full regression** — Masi: `venv/bin/python manage.py test api -v 1` (expect all pass); Zazi: `venv/bin/python manage.py test api -v 1`; frontend `pnpm build`.

- [ ] **Step 5: Docs + merge + push**
- Masi `documentation/api-endpoints.md`: note that `/api/wig/outcomes/` now includes Zazi programmes (kind-discriminated entries).
- Merge `feature/zazi-wig-outcomes` to frontend main; push all three repos (ask Jim before pushing if not already authorized).

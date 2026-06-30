# Impact Data Portal

A funder-facing, on-brand Next.js portal that presents Masinyusane's headline programme results. It is the legible counterpart to the existing Streamlit deep-dive: rigorous enough for a funding analyst, stripped of operational noise. Replaces the bare iframe at `/impact/data-portal`.

## Audience & posture

**Funder Analyst**:
The portal's single design persona — an analyst at a prospective institutional funder (think Gates Foundation) evaluating whether to fund Masi. Wants *less* operational clutter but *more* rigor: control groups, sample sizes, baselines, national benchmarks. Design rule: "rigorous but legible."
_Avoid_: designing for "the average member of the public" (too shallow) or "our project managers" (that is the Deep-Dive's job).

**Deep-Dive**:
The existing Streamlit portal (`data.masinyusane.org`, `data.zazi-izandi.co.za`), built for project managers. Retained, not replaced — the new portal links out to it for anyone wanting operational detail.
_Avoid_: calling the new portal a "replacement"; it is a curated sibling.

## Language

**Programme**:
One of Masi's distinct interventions — **Zazi iZandi** (flagship isiXhosa early-grade literacy), **Core Literacy** (English TaRL reading), **Numeracy** (Yazi Amanani), **1000 Stories** (ECD read-aloud reach), **Community Jobs** (youth employment). The portal is *programme-primary*: the top-level axis of navigation.
_Avoid_: "project", "initiative".

**View**:
An analytical lens nested *inside* a Programme. The three lenses: **Programmatic** (aggregate — "did it work?"), **Site-Level** (by school/centre, incl. the map — "where?"), **Children** (individual-child impact explorer — "up close"). Not every Programme offers every View (the matrix is sparse — 1000 Stories has no Children view; **Zazi iZandi is single-metric (letters-correct-per-minute), so it has no multi-skill radar and thus no Children view** — the radar/Children view belongs to the multi-skill programmes, Core Literacy and Numeracy).
_Avoid_: "tab", "page" (a View is a lens, not a route); "Youth view" (see Flagged ambiguities).

**Headline Result**:
A programme outcome that answers "did it work?" or "how many were reached?" — the only class of metric the portal shows. Sourced fresh from Postgres, stamped with an "as of" date.
_Avoid_: "stat", "KPI" (too generic), "metric" (ambiguous with Operational Metric).

**Operational Metric**:
A delivery/activity/admin measure — sessions logged, assessments completed, days worked, coach-performance leaderboards, data-quality flags. **Deliberately excluded** from the portal; lives only in the Deep-Dive.
_Avoid_: surfacing these as if they were results — they measure effort, not outcomes.

**Dual-Impact**:
Masi's signature model: every Programme both *educates children* and *employs township youth* to do the educating. The portal leans hard into this — the youth-employment thread appears per-Programme as flavor and aggregates in the Community Jobs Programme.
_Avoid_: treating youth employment as a side-note; it is half the impact.

**Benchmark**:
A grade-specific grade-level threshold (e.g. 40 letter-sounds-per-minute for isiXhosa Grade 1) used to report the share of children "on grade level", always shown against the South African national average (the credibility anchor).
_Avoid_: an adjustable threshold slider in the public view — fix Benchmarks at their official values to prevent cherry-picking.

**Phase** (Baseline / Midline / Endline):
The assessment points across a year. Improvement is the headline and is always framed phase-over-phase.
_Avoid_: "test", "round".

**Reach**:
The count of children/youth touched by a Programme. Cross-programme **Total Reach** is a *de-duplicated estimate*, not a sum — literacy children are a subset of the 1000 Stories + EduTech reach, never added to it.
_Avoid_: presenting Total Reach as an additive sum of programme counts (double-counts).

**Fresh, not interactive**:
The portal's data posture — Headline Results are recomputed from the live Postgres databases (fresh) but the viewer generally cannot re-slice them (not interactive). Deliberate interactive pockets exist (the Children view's per-child radar lookup).
_Avoid_: conflating "fresh" with "a live query engine"; the two are independent axes.

## Relationships

- A **Programme** offers zero or more **Views** (sparse matrix).
- A **View** presents only **Headline Results**, never **Operational Metrics**.
- The **Children** view is the portal's one genuinely interactive surface — a *curated, fully anonymized* set of exemplar learners (POPIA), never a browseable index of all children.
- Every academic **Programme** carries a **Dual-Impact** youth-employment thread; **Community Jobs** is the Programme that aggregates that thread across all programmes.
- **Headline Results** are sourced fresh from two Postgres databases — the Main Masi DB (Core Literacy, Numeracy, 1000 Stories, Community Jobs) and the separate Zazi iZandi DB (queried server-side, the house pattern).
- A **Benchmark** result is always reported against the **South African national average**.

## Example dialogue

> **Dev:** "The Zazi page should show how many assessments the EAs completed this term, right?"
> **Domain expert:** "No — that's an **Operational Metric**. The **Funder Analyst** doesn't care how many assessments we ran; they care what share of Grade 1s crossed the **Benchmark** from **Baseline** to **Endline**. Assessment counts stay in the **Deep-Dive**."

> **Dev:** "For Total **Reach**, do I add the literacy children to the 1000 Stories children?"
> **Domain expert:** "Never add them — the literacy children are already inside the 1000 Stories reach. Total Reach is a de-duplicated estimate, not a sum."

## Flagged ambiguities

- **"Youth"** meant three different things in the Streamlit. Resolved: (1) *youth-performance monitoring* — how individual coaches are doing, so PMs can retrain underperformers — is an **Operational Metric**, dropped from this portal; (2) *youth-as-beneficiaries* — the **Dual-Impact** employment story — is kept, appearing per-Programme and aggregated as the **Community Jobs** Programme; (3) there is therefore **no "Youth view"** — the surviving per-Programme lenses are Programmatic, Site-Level, Children.
- **"Site" vs "School"** — a Site includes ECD centres, not only schools; the **Site-Level** view spans both.
- **"Live"** was used to mean both "current/fresh" and "viewer-filterable" — resolved into the **Fresh, not interactive** posture (two independent axes).
- **Zazi's headline metric is letters-correct-per-minute (LPM) only.** Words-per-minute / blending is *not* a Zazi headline (too few children on the blending track) — drop it from the portal. The radar belongs to the multi-skill programmes, not Zazi.

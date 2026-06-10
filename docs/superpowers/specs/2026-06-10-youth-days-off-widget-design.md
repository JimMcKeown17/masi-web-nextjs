# Youth "Days Off" Widget — inline absence capture in the youth detail sheet

**Date:** 2026-06-10
**Repos:** Masi frontend (`frontend/masi-website`) + Masi backend (`backend/Masi Web Main`)
**Status:** Approved (brainstorming) — Approach A.

## Problem

On `operations/youth-sessions`, a project manager scanning the Youth Activity
Heatmap sees a youth with a run of "None" days. Often the explanation is benign:
that coach was given the day off (vacation / funeral / sick). Today, recording
that requires leaving the page and going to `operations/closures` → Staff
absences → finding the youth in a picker. The PM wants to capture it **right
where they are** — in the youth detail sheet that opens when they click the row —
and see the heatmap correct itself.

This is the inline counterpart of the existing **Staff absences** tab on the
Closure Calendar, pre-scoped to the one clicked youth.

## Goal

In the `YouthDetailSheet`, an ADMIN / PROJECT MANAGER can:

1. Mark this youth off for a date range with a reason (and optional note).
2. See this youth's already-recorded absences in the current window, and delete
   any that were entered by mistake.

…and on either action the heatmap, the sheet's stats, the inactive panel, and the
summary all refresh, because the marked days stop counting as expected working days.

## What we reuse (no new machinery)

- **Endpoints (already deployed, power the closures page):**
  `POST /absences/bulk/` (`{youth_uids[], date_from, date_to, reason, note}` →
  `{created, updated}`), `DELETE /absences/<pk>/`.
- **Frontend client (already exists, `src/lib/api/closures.ts`):**
  `bulkCreateAbsences`, `deleteAbsence`. Types `AbsenceBulkBody`, `StaffAbsence`,
  `AbsenceReason` in `src/lib/types/closures.ts`.
- **Heatmap self-heals:** each heatmap cell renders "Off" from the `expected[]`
  array the backend computes from absences (`YouthActivityHeatmap.tsx:152`). We do
  not touch any cell — we revalidate the SWR caches and the closed/absent days
  reappear, denominator and all.

## Design

### Backend (Approach A) — surface the youth's absences in the detail payload

`api/views/youth_sessions.py`, `youth_sessions_detail` (≈line 534-613). After the
existing `open_days` computation, query this youth's absences in the same window
and add them to the response:

```python
absences = list(
    StaffAbsence.objects.filter(
        youth_uid=youth_uid,
        date__gte=daily_from,
        date__lte=daily_to,
    ).order_by('date').values('id', 'date', 'reason', 'note')
)
# ...in the Response payload:
'absences': [
    {'id': a['id'], 'date': str(a['date']), 'reason': a['reason'], 'note': a['note']}
    for a in absences
],
```

Window = the same `daily_from`/`daily_to` the detail endpoint already derives
(explicit `date_from`/`date_to` filters, else last 30 days). So the inline list
reflects the same window as the rest of the sheet. (An absence created outside the
current window is still saved; it just isn't listed until the window includes it —
matching the closures page's window-bounded table.)

Rationale for A over a separate `/absences/?youth_uid=` fetch: the sheet already
fetches per-youth detail; after a write we revalidate one cache and get the fresh
absence list **and** the recomputed denominator together, guaranteed consistent.

### Frontend — new `YouthDaysOffWidget`

**File:** `src/components/youth-sessions/YouthDaysOffWidget.tsx`
**Props:** `{ youthUid: string; youthName: string; absences: YouthAbsence[]; onChanged: () => void }`
(Form date inputs default to today and the PM adjusts them — same as the existing
`AbsenceForm`; the list of existing absences comes from `absences`. No window prop
needed.)

**Gating:** renders only if `useUser()?.role` is `ADMIN` or `PROJECT MANAGER`.
The youth-sessions page is reachable by MENTOR (`Navbar.tsx:161`
`hasProjectManagementAccess` includes MENTOR), but the absence endpoints are
ADMIN/PM-only — so a mentor must not see a form that 403s. (Server stays the real
gate; this is UX.)

**Layout** (placed in `YouthDetailSheet` immediately under the "Working days in
period" pill, ~line 159), styled to match the sheet's existing cards
(`rounded-xl border border-slate-200/50 … bg-slate-50/50`):

- Header row: "Days off" + a "Mark days off" disclosure button (form collapsed by
  default to keep the read-first sheet uncluttered).
- Existing absences (when `absences.length > 0`): compact rows — date · reason
  badge · note · trash button. Trash → `deleteAbsence(id)` → toast → `onChanged()`.
- Disclosure form (mirrors `AbsenceForm` on the closures page, youth fixed):
  From / To dates (default today), Reason `Select`
  (Vacation/Funeral/Sick/Other, default Vacation), optional Note, Save / Cancel.
  Save → `bulkCreateAbsences({ youth_uids: [youthUid], date_from, date_to, reason, note })`
  → toast `"{created} added, {updated} updated"` → collapse → `onChanged()`.
  Same client-side guards as the existing form (valid range required).

### Types

`src/lib/types/youth-sessions.ts`:

```ts
export interface YouthAbsence {
  id: number;
  date: string;
  reason: AbsenceReason;   // imported from ./closures
  note: string;
}
// YouthDetailResponse gains:  absences: YouthAbsence[];
```

### Refresh wiring (`onChanged`)

In `src/app/operations/youth-sessions/page.tsx`, pass an `onAbsenceChanged`
handler down through `YouthDetailSheet` to the widget:

```ts
const { mutate } = useSWRConfig();
const refreshYouthData = () =>
  mutate((key) => typeof key === 'string' &&
    (key.startsWith('youth-sessions-') || key.startsWith('youth-detail-')));
```

One call revalidates heatmap, detail, inactive, and summary — every cache whose
denominator the absence affects. The heatmap cell flips "None" → "Off"; the
sheet's Days Missed / Working-days numbers update.

## Components & boundaries

- `YouthDaysOffWidget` — owns the form + delete UI and the absence writes. Inputs:
  youth identity + its absences + window + an `onChanged` callback. Knows nothing
  about SWR keys. Independently understandable and testable.
- `YouthDetailSheet` — unchanged except it renders the widget and forwards
  `onAbsenceChanged` + the absence data it already receives in `data`.
- `page.tsx` — owns SWR keys; provides the one revalidation callback.
- Backend `youth_sessions_detail` — gains a read-only absence list; write paths
  untouched (reuse existing absence endpoints).

## Out of scope (YAGNI)

- No new endpoint; no `youth_uid` filter on `/absences/` (Approach A makes it
  unnecessary).
- No grouping of multi-day ranges into single rows (backend stores one row per
  date; list them per-date — group later only if it actually gets noisy).
- No school-closure authoring here — that stays on `operations/closures`. This
  widget is person-scoped absences only.

## Verification

- **Backend:** `youth_sessions_detail` returns `absences` for a youth with a known
  `StaffAbsence` in-window; empty list otherwise. `python manage.py test api`.
- **Frontend:** `pnpm build` + `pnpm lint` clean.
- **Manual (ADMIN/PM):** click a youth → Mark days off → pick a recent weekday →
  Save → that heatmap cell flips "None" → "Off", Days Missed drops, the absence
  appears in the widget list. Delete it → reverts everywhere.
- **Manual (non-PM / MENTOR):** widget does not render.

## Critical files

- Backend: `api/views/youth_sessions.py` (detail endpoint + `StaffAbsence` import).
- Frontend: `src/components/youth-sessions/YouthDaysOffWidget.tsx` (new),
  `src/components/youth-sessions/YouthDetailSheet.tsx`,
  `src/app/operations/youth-sessions/page.tsx`,
  `src/lib/types/youth-sessions.ts`.
  Reuse `src/lib/api/closures.ts`, `src/lib/types/closures.ts`,
  `src/components/providers/UserProvider`.

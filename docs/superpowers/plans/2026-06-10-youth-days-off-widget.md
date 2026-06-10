# Youth "Days Off" Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an ADMIN / PROJECT MANAGER mark the clicked youth off (vacation / funeral / sick / other) directly inside the youth detail sheet on `operations/youth-sessions`, and see the heatmap and stats correct themselves.

**Architecture:** Reuse the already-deployed `/absences/bulk/` and `DELETE /absences/<pk>/` endpoints and the `bulkCreateAbsences` / `deleteAbsence` client (`src/lib/api/closures.ts`). The only backend change is read-only: the `youth_sessions_detail` endpoint additionally returns the youth's in-window `StaffAbsence` rows so the widget can list and delete them. After any write, one `useSWRConfig().mutate(...)` call revalidates every `youth-sessions-*` / `youth-detail-*` cache, so "None" heatmap cells flip to "Off".

**Tech Stack:** Django REST Framework (backend), Next.js 15 / React 19 / SWR / shadcn-ui / Clerk (frontend).

**Spec:** `docs/superpowers/specs/2026-06-10-youth-days-off-widget-design.md`

**Repos & branches:**
- Frontend `frontend/masi-website` — already on branch `feature/youth-days-off-widget`.
- Backend `backend/Masi Web Main` — create branch `feature/youth-days-off-widget` before Task 1 (see Task 1 Step 0).

**No DB migration:** `StaffAbsence` already exists and is migrated. This feature adds no model fields.

---

## File Structure

**Backend (`backend/Masi Web Main`):**
- Modify `api/views/youth_sessions.py` — import `StaffAbsence`; add in-window absence list to the `youth_sessions_detail` response.
- Modify `api/tests.py` — add `TestYouthDetailAbsences`.

**Frontend (`frontend/masi-website`):**
- Modify `src/lib/types/youth-sessions.ts` — add `YouthAbsence`; add `absences` to `YouthDetailResponse`.
- Create `src/components/youth-sessions/YouthDaysOffWidget.tsx` — the gated form + existing-absence list (owns the absence writes; knows nothing about SWR keys).
- Modify `src/components/youth-sessions/YouthDetailSheet.tsx` — render the widget; accept and forward `onAbsenceChanged`.
- Modify `src/app/operations/youth-sessions/page.tsx` — provide the one `useSWRConfig().mutate(...)` revalidation callback.

---

## Task 1: Backend — return the youth's in-window absences from the detail endpoint

**Files:**
- Modify: `backend/Masi Web Main/api/views/youth_sessions.py` (imports near line 11-16; detail endpoint `youth_sessions_detail` lines 534-613)
- Test: `backend/Masi Web Main/api/tests.py`

- [ ] **Step 0: Ensure the backend repo is on a feature branch**

Run (from the backend repo root):
```bash
cd "backend/Masi Web Main"
git checkout -b feature/youth-days-off-widget 2>/dev/null || git checkout feature/youth-days-off-widget
git branch --show-current
```
Expected: prints `feature/youth-days-off-widget`.

- [ ] **Step 1: Write the failing test**

Add to the imports at the top of `api/tests.py` — change the existing `from api.models import (...)` block to include `StaffAbsence`, and add the `UserProfile` import (role lives in `core.models`):

```python
from api.models import (
    School, Youth, CanonicalChild,
    LiteracySession2026, NumeracySession2026,
    AirtableSyncLog, StaffAbsence,
)
from core.models import UserProfile
```

Append this test class to the end of `api/tests.py`. Note the absences list is
authorization-gated (ADMIN / PROJECT MANAGER only), so the positive test gives its
user an ADMIN `UserProfile`, and a third test proves a MENTOR is denied the data:

```python
class TestYouthDetailAbsences(TestCase):
    """youth_sessions_detail surfaces the youth's in-window StaffAbsence rows,
    but only to ADMIN / PROJECT MANAGER (absence reason/note is HR-sensitive)."""

    def setUp(self):
        self.user = User.objects.create_user(username='pm', password='x')
        UserProfile.objects.create(user=self.user, role='ADMIN')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.youth = Youth.objects.create(
            employee_id=1, first_names='Nomsa', last_name='Dlamini',
            youth_uid='YTH-0001',
        )

    def test_detail_returns_youth_absences_in_window(self):
        StaffAbsence.objects.create(
            youth_uid='YTH-0001', date=date(2026, 3, 3), reason='funeral', note='Family',
        )
        # Outside the queried window -- must NOT appear.
        StaffAbsence.objects.create(
            youth_uid='YTH-0001', date=date(2026, 1, 5), reason='sick',
        )
        resp = self.client.get(
            '/api/youth-sessions/youth-detail/YTH-0001/'
            '?date_from=2026-03-02&date_to=2026-03-06'
        )
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn('absences', data)
        self.assertEqual(len(data['absences']), 1)
        row = data['absences'][0]
        self.assertEqual(row['date'], '2026-03-03')
        self.assertEqual(row['reason'], 'funeral')
        self.assertEqual(row['note'], 'Family')
        self.assertIn('id', row)

    def test_detail_absences_empty_when_none(self):
        resp = self.client.get(
            '/api/youth-sessions/youth-detail/YTH-0001/'
            '?date_from=2026-03-02&date_to=2026-03-06'
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['absences'], [])

    def test_detail_absences_hidden_from_mentor(self):
        # A MENTOR can reach this endpoint (IsAuthenticated) but must NOT see
        # absence reasons/notes -- the field returns empty for non-leadership.
        mentor = User.objects.create_user(username='mentor', password='x')
        UserProfile.objects.create(user=mentor, role='MENTOR')
        mentor_client = APIClient()
        mentor_client.force_authenticate(user=mentor)
        StaffAbsence.objects.create(
            youth_uid='YTH-0001', date=date(2026, 3, 3), reason='funeral', note='Family',
        )
        resp = mentor_client.get(
            '/api/youth-sessions/youth-detail/YTH-0001/'
            '?date_from=2026-03-02&date_to=2026-03-06'
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['absences'], [])
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
cd "backend/Masi Web Main" && source venv/bin/activate && python manage.py test api.tests.TestYouthDetailAbsences -v 2
```
Expected: FAIL — `KeyError: 'absences'` / `self.assertIn('absences', data)` fails (the field isn't in the response yet).

- [ ] **Step 3: Add the `StaffAbsence` and `WIG_ALLOWED_ROLES` imports**

In `api/views/youth_sessions.py`, change the models import block (lines 11-14) to add `StaffAbsence`:

```python
from ..models import (
    LiteracySession2026, NumeracySession2026,
    Youth, School, Mentor,
    StaffAbsence,
)
```

Then add the role-set import directly below the existing `from ..closures import ...`
line (line 16), so the gate reuses the single source of truth for "leadership":

```python
from ..permissions import WIG_ALLOWED_ROLES
```

- [ ] **Step 4: Build the absences list (role-gated) and add it to the response**

In `api/views/youth_sessions.py`, in `youth_sessions_detail`, immediately after the line:

```python
    total_working_days = len(open_days)
```

insert (absence reason/note is HR-sensitive — only ADMIN / PROJECT MANAGER may see
it; `getattr(..., 'profile', None)` returns `None` for profile-less users because
Django's reverse-OneToOne `RelatedObjectDoesNotExist` subclasses `AttributeError`):

```python
    profile = getattr(request.user, 'profile', None)
    can_manage_absences = bool(profile and profile.role in WIG_ALLOWED_ROLES)
    if can_manage_absences:
        absence_rows = (
            StaffAbsence.objects
            .filter(youth_uid=youth_uid, date__gte=daily_from, date__lte=daily_to)
            .order_by('date')
            .values('id', 'date', 'reason', 'note')
        )
        absences = [
            {'id': a['id'], 'date': str(a['date']), 'reason': a['reason'], 'note': a['note']}
            for a in absence_rows
        ]
    else:
        absences = []
```

Then add one line to the `return Response({...})` dict, after `'daily_sessions': daily_sessions,`:

```python
        'daily_sessions': daily_sessions,
        'absences': absences,
    })
```

- [ ] **Step 5: Run the test to verify it passes**

Run:
```bash
cd "backend/Masi Web Main" && source venv/bin/activate && python manage.py test api.tests.TestYouthDetailAbsences -v 2
```
Expected: PASS (2 tests OK).

- [ ] **Step 6: Run the full api test suite (no regressions)**

Run:
```bash
cd "backend/Masi Web Main" && source venv/bin/activate && python manage.py test api -v 1
```
Expected: OK (all tests pass).

- [ ] **Step 7: Commit (backend repo)**

```bash
cd "backend/Masi Web Main"
git add api/views/youth_sessions.py api/tests.py
git commit -m "$(cat <<'EOF'
Return youth in-window absences from youth_sessions_detail

Adds a read-only `absences` list (id/date/reason/note) for the youth in
the same window the detail endpoint already derives, so the youth-sessions
detail sheet can list and delete that youth's days off inline.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Frontend — types for the absences payload

**Files:**
- Modify: `frontend/masi-website/src/lib/types/youth-sessions.ts`

- [ ] **Step 1: Add the `YouthAbsence` type and extend `YouthDetailResponse`**

At the top of `src/lib/types/youth-sessions.ts`, add an import (the file currently has no imports — add this as the first line):

```ts
import type { AbsenceReason } from './closures';
```

Add a new interface just above `YouthDetailResponse` (after the `YouthDailySession` interface, line ~95):

```ts
export interface YouthAbsence {
  id: number;
  date: string; // ISO yyyy-mm-dd
  reason: AbsenceReason;
  note: string;
}
```

Add the `absences` field to `YouthDetailResponse` (after `daily_sessions`):

```ts
  daily_sessions: YouthDailySession[];
  absences: YouthAbsence[];
}
```

- [ ] **Step 2: Type-check passes**

Run:
```bash
cd frontend/masi-website && pnpm lint
```
Expected: no new errors from `youth-sessions.ts` (`AbsenceReason` resolves from `./closures`).

- [ ] **Step 3: Commit (frontend repo)**

```bash
cd frontend/masi-website
git add src/lib/types/youth-sessions.ts
git commit -m "$(cat <<'EOF'
Add YouthAbsence type and absences field to YouthDetailResponse

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Frontend — the `YouthDaysOffWidget` component

**Files:**
- Create: `frontend/masi-website/src/components/youth-sessions/YouthDaysOffWidget.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/youth-sessions/YouthDaysOffWidget.tsx` with exactly:

```tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Plus, Trash2, CalendarOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import { useUser } from '@/components/providers/UserProvider';
import { bulkCreateAbsences, deleteAbsence } from '@/lib/api/closures';
import type { AbsenceReason } from '@/lib/types/closures';
import type { YouthAbsence } from '@/lib/types/youth-sessions';

const ABSENCE_REASONS: { value: AbsenceReason; label: string }[] = [
  { value: 'vacation', label: 'Vacation' },
  { value: 'funeral', label: 'Funeral' },
  { value: 'sick', label: 'Sick' },
  { value: 'other', label: 'Other' },
];

// Local calendar date (YYYY-MM-DD), not UTC -- toISOString() would shift back a
// day in SAST (UTC+2) during early-morning hours.
function isoToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface YouthDaysOffWidgetProps {
  youthUid: string;
  youthName: string;
  absences: YouthAbsence[];
  onChanged: () => void;
}

export function YouthDaysOffWidget({
  youthUid,
  youthName,
  absences,
  onChanged,
}: YouthDaysOffWidgetProps) {
  const user = useUser();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'PROJECT MANAGER';

  const { getToken } = useAuth();
  const authToken = async () => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return token;
  };

  const [showForm, setShowForm] = useState(false);
  const [dateFrom, setDateFrom] = useState(isoToday());
  const [dateTo, setDateTo] = useState(isoToday());
  const [reason, setReason] = useState<AbsenceReason>('vacation');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Write actions are ADMIN/PM-only; mentors can reach this page but not these
  // endpoints, so don't show them a form that would 403.
  if (!canEdit) return null;

  const rows = absences ?? [];

  const save = async () => {
    if (!dateFrom || !dateTo || dateTo < dateFrom) {
      toast.error('Pick a valid date range.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await bulkCreateAbsences(await authToken(), {
        youth_uids: [youthUid],
        date_from: dateFrom,
        date_to: dateTo,
        reason,
        note,
      });
      toast.success(`Saved: ${res.created} added, ${res.updated} updated.`);
      setNote('');
      setShowForm(false);
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save.');
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteAbsence(await authToken(), id);
      toast.success('Day off removed.');
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to remove.');
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarOff className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">Days off</span>
        </div>
        {!showForm && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Mark days off
          </Button>
        )}
      </div>

      {rows.length > 0 && (
        <ul className="space-y-1">
          {rows.map((a) => (
            <li key={a.id} className="flex items-center gap-2 text-xs">
              <span className="tabular-nums text-slate-700 dark:text-slate-300">{a.date}</span>
              <Badge variant="secondary" className="capitalize">
                {a.reason}
              </Badge>
              {a.note && <span className="truncate text-slate-400">{a.note}</span>}
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-6 w-6"
                onClick={() => remove(a.id)}
                aria-label="Remove day off"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="space-y-3 border-t border-slate-200/50 dark:border-slate-700/50 pt-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mark weekdays off for {youthName} so they aren&apos;t flagged inactive or counted in
            their denominator.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="dayoff-from" className="text-xs">From</Label>
              <Input
                id="dayoff-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dayoff-to" className="text-xs">To</Label>
              <Input
                id="dayoff-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-8"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as AbsenceReason)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ABSENCE_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="dayoff-note" className="text-xs">Note (optional)</Label>
              <Input
                id="dayoff-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-8"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="h-8" onClick={save} disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Lint the new component**

Run:
```bash
cd frontend/masi-website && pnpm lint
```
Expected: no errors. (The component isn't rendered yet — Task 4 wires it in.)

- [ ] **Step 3: Commit (frontend repo)**

```bash
cd frontend/masi-website
git add src/components/youth-sessions/YouthDaysOffWidget.tsx
git commit -m "$(cat <<'EOF'
Add YouthDaysOffWidget for inline absence capture

ADMIN/PM-only widget: collapsible "mark days off" form (youth pre-bound)
plus a list of the youth's existing absences with delete. Reuses the
bulkCreateAbsences / deleteAbsence client.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Frontend — render the widget inside `YouthDetailSheet`

**Files:**
- Modify: `frontend/masi-website/src/components/youth-sessions/YouthDetailSheet.tsx`

- [ ] **Step 1: Import the widget and extend the props**

In `YouthDetailSheet.tsx`, add the import (next to the existing imports, after line 15):

```tsx
import { YouthDaysOffWidget } from '@/components/youth-sessions/YouthDaysOffWidget';
```

Change the `YouthDetailSheetProps` interface (lines 19-24) to add `onAbsenceChanged`:

```tsx
interface YouthDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: YouthDetailResponse | null;
  isLoading: boolean;
  onAbsenceChanged: () => void;
}
```

Change the component signature (line 26) to destructure it:

```tsx
export function YouthDetailSheet({ open, onOpenChange, data, isLoading, onAbsenceChanged }: YouthDetailSheetProps) {
```

- [ ] **Step 2: Render the widget under the working-days pill**

In `YouthDetailSheet.tsx`, immediately after the "Working days summary" block (the closing `</div>` on line 159, before the `{/* Daily sessions chart */}` comment), insert:

```tsx
              {/* Inline days-off capture (ADMIN/PM only; self-hides otherwise) */}
              <YouthDaysOffWidget
                youthUid={data.youth_uid}
                youthName={data.full_name}
                absences={data.absences}
                onChanged={onAbsenceChanged}
              />
```

- [ ] **Step 3: Lint**

Run:
```bash
cd frontend/masi-website && pnpm lint
```
Expected: an error/warning that `YouthDetailSheet` is now called without the required `onAbsenceChanged` prop in `page.tsx` may appear at build time (Task 5 fixes it). Lint itself should pass for this file.

- [ ] **Step 4: Commit (frontend repo)**

```bash
cd frontend/masi-website
git add src/components/youth-sessions/YouthDetailSheet.tsx
git commit -m "$(cat <<'EOF'
Render YouthDaysOffWidget in the youth detail sheet

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Frontend — wire the revalidation callback on the page

**Files:**
- Modify: `frontend/masi-website/src/app/operations/youth-sessions/page.tsx`

- [ ] **Step 1: Import `useSWRConfig`**

In `page.tsx`, change the SWR import (line 5) from:

```tsx
import useSWR from 'swr';
```

to:

```tsx
import useSWR, { useSWRConfig } from 'swr';
```

- [ ] **Step 2: Add the revalidation callback**

In `page.tsx`, inside the component, just after `const { getToken } = useAuth();` (line 31), add:

```tsx
  const { mutate } = useSWRConfig();
  // Absence writes change the denominator across heatmap, detail, inactive, and
  // summary -- revalidate every youth-sessions cache so "None" cells flip to "Off".
  const refreshYouthData = useCallback(() => {
    mutate(
      (key) =>
        typeof key === 'string' &&
        (key.startsWith('youth-sessions-') || key.startsWith('youth-detail-')),
    );
  }, [mutate]);
```

(`useCallback` is already imported on line 3.)

- [ ] **Step 3: Pass the callback to the sheet**

In `page.tsx`, update the `<YouthDetailSheet ... />` render (lines 293-298) to add the prop:

```tsx
        <YouthDetailSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          data={youthDetail || null}
          isLoading={detailLoading}
          onAbsenceChanged={refreshYouthData}
        />
```

- [ ] **Step 4: Lint + build**

Run:
```bash
cd frontend/masi-website && pnpm lint && pnpm build
```
Expected: lint clean; `pnpm build` succeeds with no type errors (the required `onAbsenceChanged` prop is now supplied).

- [ ] **Step 5: Commit (frontend repo)**

```bash
cd frontend/masi-website
git add src/app/operations/youth-sessions/page.tsx
git commit -m "$(cat <<'EOF'
Revalidate youth-sessions caches after an absence write

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Manual verification

- [ ] **Step 1: Backend full suite green**

```bash
cd "backend/Masi Web Main" && source venv/bin/activate && python manage.py test api -v 1
```
Expected: OK.

- [ ] **Step 2: Frontend build + lint green**

```bash
cd frontend/masi-website && pnpm lint && pnpm build
```
Expected: both succeed.

- [ ] **Step 3: Manual smoke (requires both servers + an ADMIN/PM Clerk login)**

Backend: `cd "backend/Masi Web Main" && ./scripts/start.sh`
Frontend: `cd frontend/masi-website && pnpm dev`

As ADMIN/PM, open `localhost:3000/operations/youth-sessions`:
1. Click a youth row → sheet opens; the "Days off" section shows under "Working days in period".
2. Click "Mark days off" → pick a weekday range, reason, optional note → Save.
   **Pick a date within the last ~10 working days** — the heatmap default window is
   ~10 working days back (`youth_sessions.py` heatmap view), narrower than the
   detail sheet's 30-day window. A date older than that is saved correctly and
   updates the sheet's counts, but its heatmap column won't be on screen to flip.
3. Confirm: toast success; the absence appears in the widget list; the matching heatmap cell flips "None" → "Off"; "Days Missed" / "Working days in period" update.
4. Click the trash icon on the new absence → it disappears and the heatmap cell reverts.
5. Log in as a MENTOR / VIEWER → the "Days off" widget does not render, **and** the
   detail API returns `absences: []` for that user (server-side authorization, not
   just a hidden widget).

---

## Codex adversarial review (2026-06-10) — folded in

- **[HIGH] fixed:** `youth_sessions_detail` is only `IsAuthenticated`, so the new
  absence reason/note (HR-sensitive) would leak to MENTOR/VIEWER. Task 1 Step 4 now
  authorization-gates the `absences` list to `WIG_ALLOWED_ROLES`; Task 1 Step 1 adds
  a MENTOR test asserting `absences: []`.
- **[LOW] noted:** heatmap default window (~10 working days) is narrower than the
  detail window (30 days); Task 6 Step 3 tells the tester to pick an in-window date.
- All other items passed (SWR matcher, server-side write/delete gating, no-school
  youth, type contracts, `force_authenticate`, insertion anchors).

## Self-Review (completed during planning)

- **Spec coverage:** Backend `absences` payload (role-gated) → Task 1. Widget (form + list + delete + gating) → Task 3. Placement in sheet → Task 4. SWR revalidation fan-out → Task 5. Types → Task 2. Verification → Task 6. All spec sections covered.
- **Placeholder scan:** none — every step has concrete code/commands.
- **Type consistency:** `YouthAbsence` (Task 2) is consumed identically in Task 3 (`absences: YouthAbsence[]`) and Task 4 (`absences={data.absences}`). `AbsenceReason` is imported from `./closures` in both the type file and the widget. `bulkCreateAbsences` body matches `AbsenceBulkBody` (`youth_uids`, `date_from`, `date_to`, `reason`, `note`). `onAbsenceChanged` prop name matches between Task 4 (interface) and Task 5 (call site). Backend `'absences'` key matches the test assertions and the frontend field name.

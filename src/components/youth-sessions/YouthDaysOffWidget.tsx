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

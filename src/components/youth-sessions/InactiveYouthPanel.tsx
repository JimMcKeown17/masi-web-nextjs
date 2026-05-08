'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { InactiveYouthResponse } from '@/lib/types/youth-sessions';

interface InactiveYouthPanelProps {
  data: InactiveYouthResponse;
  onYouthClick: (youthUid: string) => void;
  onDaysChange: (days: number) => void;
  activeDays: number;
}

function getSeverity(workingDaysInactive: number | null): { color: string; badgeVariant: string } {
  if (workingDaysInactive === null || workingDaysInactive >= 3) {
    return { color: 'text-red-700 dark:text-red-400', badgeVariant: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400' };
  }
  if (workingDaysInactive >= 2) {
    return { color: 'text-amber-700 dark:text-amber-400', badgeVariant: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' };
  }
  return { color: 'text-yellow-700 dark:text-yellow-400', badgeVariant: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400' };
}

export function InactiveYouthPanel({ data, onYouthClick, onDaysChange, activeDays }: InactiveYouthPanelProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '400ms', animationFillMode: 'backwards' }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Inactive Youth
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Active youth with no sessions in the selected period
          </p>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3].map((d) => (
            <Button
              key={d}
              variant={activeDays === d ? 'default' : 'outline'}
              size="sm"
              className={`rounded-lg text-xs h-8 ${
                activeDays === d
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
              onClick={() => onDaysChange(d)}
            >
              {d}+ days
            </Button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-red-200/40 dark:border-red-900/30 bg-gradient-to-br from-red-50/30 to-white dark:from-red-950/10 dark:to-slate-900/80 backdrop-blur-xl shadow-sm">
        {data.inactive_youth.length === 0 ? (
          <div className="p-8 text-center text-emerald-600 dark:text-emerald-400 font-medium">
            All youth are active -- no one inactive for {activeDays}+ working days.
          </div>
        ) : (
          <div className="divide-y divide-red-100 dark:divide-red-900/20">
            {data.inactive_youth.map((youth) => {
              const severity = getSeverity(youth.working_days_inactive);
              const badgeText = youth.working_days_inactive === null
                ? 'Never'
                : `${youth.working_days_inactive}wd`;
              const badgeTitle = youth.calendar_days_inactive !== null
                ? `${youth.calendar_days_inactive} calendar days since last session`
                : 'No session ever recorded';
              return (
                <div
                  key={youth.youth_uid}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-red-50/30 dark:hover:bg-red-950/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onYouthClick(youth.youth_uid)}
                      className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm truncate block"
                    >
                      {youth.full_name}
                    </button>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span>{youth.mentor_name}</span>
                      <span className="hidden sm:inline">{youth.school_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Last session</div>
                      <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {youth.last_session_date || 'Never'}
                      </div>
                    </div>
                    <Badge
                      title={badgeTitle}
                      className={`${severity.badgeVariant} text-xs font-medium rounded-lg px-2.5 py-1`}
                    >
                      {badgeText}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import type { YouthSessionFreshness } from '@/lib/types/youth-sessions';


const SAST_DATE_TIME = new Intl.DateTimeFormat('en-ZA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Africa/Johannesburg',
});


function formatSast(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${SAST_DATE_TIME.format(date)} SAST`;
}


interface SessionFreshnessBannerProps {
  freshness?: YouthSessionFreshness;
  error?: Error;
  isLoading: boolean;
}


export function SessionFreshnessBanner({
  freshness,
  error,
  isLoading,
}: SessionFreshnessBannerProps) {
  const lastSync = formatSast(freshness?.last_successful_sync ?? null);

  let tone = 'neutral';
  let message = 'Checking session data freshness…';
  let detail: string | null = null;
  let Icon = Clock3;

  if (error) {
    tone = 'warning';
    Icon = TriangleAlert;
    message = 'Unable to verify when session data was last synced.';
    detail = 'Treat the dashboard as potentially stale until freshness can be verified.';
  } else if (!isLoading && freshness) {
    if (freshness.status === 'fresh') {
      tone = 'fresh';
      Icon = CheckCircle2;
      message = lastSync
        ? `Session data last synced: ${lastSync}`
        : 'Session data is current.';
      detail = `Automatic updates are expected every ${freshness.cadence_minutes} minutes.`;
    } else if (freshness.status === 'syncing') {
      tone = 'syncing';
      Icon = RefreshCw;
      message = 'A session data update is currently running.';
      detail = lastSync ? `Last successful sync: ${lastSync}` : null;
    } else if (freshness.status === 'failed') {
      tone = 'danger';
      Icon = AlertCircle;
      message = 'Session data may be outdated because the latest import failed.';
      detail = lastSync ? `Last successful sync: ${lastSync}` : 'No successful sync is recorded.';
    } else if (freshness.status === 'never') {
      tone = 'danger';
      Icon = AlertCircle;
      message = 'Session data freshness cannot be established.';
      detail = 'At least one required session feed has never completed successfully.';
    } else {
      tone = 'warning';
      Icon = TriangleAlert;
      message = 'Session data is stale and may not reflect recent staff activity.';
      detail = lastSync
        ? `Last successful sync: ${lastSync}`
        : `No successful sync within the ${freshness.stale_after_minutes}-minute freshness window.`;
    }
  }

  const isWarning = tone === 'warning' || tone === 'danger';

  return (
    <div
      role={isWarning ? 'alert' : 'status'}
      aria-live={isWarning ? 'assertive' : 'polite'}
      className={cn(
        'flex max-w-3xl items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        tone === 'neutral' && 'border-slate-200/70 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300',
        tone === 'fresh' && 'border-emerald-200/80 bg-emerald-50/80 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-100',
        tone === 'syncing' && 'border-blue-200/80 bg-blue-50/80 text-blue-900 dark:border-blue-900/70 dark:bg-blue-950/30 dark:text-blue-100',
        tone === 'warning' && 'border-amber-300 bg-amber-50 text-amber-950 shadow-sm dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100',
        tone === 'danger' && 'border-red-300 bg-red-50 text-red-950 shadow-sm dark:border-red-800 dark:bg-red-950/40 dark:text-red-100',
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn(
          'mt-0.5 h-5 w-5 shrink-0',
          tone === 'syncing' && 'animate-spin',
        )}
      />
      <div className="min-w-0">
        <p className="font-medium leading-5">{message}</p>
        {detail ? <p className="mt-0.5 text-xs leading-5 opacity-80">{detail}</p> : null}
      </div>
    </div>
  );
}

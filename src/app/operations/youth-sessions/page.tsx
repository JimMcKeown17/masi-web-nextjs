'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import useSWR, { useSWRConfig } from 'swr';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';

import { YouthSessionsFilterBar } from '@/components/youth-sessions/YouthSessionsFilterBar';
import { SummaryStats } from '@/components/youth-sessions/SummaryStats';
import { DailyActivityChart } from '@/components/youth-sessions/DailyActivityChart';
import { YouthActivityHeatmap } from '@/components/youth-sessions/YouthActivityHeatmap';
import { InactiveYouthPanel } from '@/components/youth-sessions/InactiveYouthPanel';
import { SchoolCoverageGrid } from '@/components/youth-sessions/SchoolCoverageGrid';
import { YouthDetailSheet } from '@/components/youth-sessions/YouthDetailSheet';
import { SessionFreshnessBanner } from '@/components/youth-sessions/SessionFreshnessBanner';

import {
  getYouthSessionsSummary,
  getDailyActivity,
  getYouthHeatmap,
  getInactiveYouth,
  getSchoolCoverage,
  getYouthDetail,
  getLookups,
  getYouthSessionFreshness,
} from '@/lib/api/youth-sessions';

import type { YouthSessionsFilters } from '@/lib/types/youth-sessions';


const FRESHNESS_KEY = 'youth-sessions-freshness';
const FRESHNESS_POLL_INTERVAL_MS = 60_000;


function isYouthSessionDataKey(key: unknown): key is string {
  return (
    typeof key === 'string' &&
    key !== FRESHNESS_KEY &&
    (key.startsWith('youth-sessions-') || key.startsWith('youth-detail-'))
  );
}

export default function YouthSessionsDashboardPage() {
  const { getToken } = useAuth();
  const { mutate } = useSWRConfig();
  const previousFreshnessVersion = useRef<string | null>(null);

  // Absence writes change the denominator across heatmap, detail, inactive, and
  // summary -- revalidate every youth-sessions cache so "None" cells flip to "Off".
  const refreshYouthData = useCallback(() => {
    void mutate(isYouthSessionDataKey);
  }, [mutate]);

  const [filters, setFilters] = useState<YouthSessionsFilters>({
    programme: 'all',
  });
  const [inactiveDays, setInactiveDays] = useState(2);
  const [selectedYouthUid, setSelectedYouthUid] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const updateFilters = useCallback((partial: Partial<YouthSessionsFilters>) => {
    setFilters(prev => ({ ...prev, ...partial }));
  }, []);

  const handleYouthClick = useCallback((youthUid: string) => {
    setSelectedYouthUid(youthUid);
    setSheetOpen(true);
  }, []);

  // Build SWR keys — summary uses non-date filters only (it computes its own time windows)
  const filterKey = JSON.stringify(filters);
  const summaryFilterKey = JSON.stringify({
    programme: filters.programme,
    youth_uid: filters.youth_uid,
    school_uid: filters.school_uid,
    mentor_id: filters.mentor_id,
  });

  // Poll only the tiny control-plane resource. When either importer records a
  // new successful version, invalidate the heavier dashboard queries once.
  const {
    data: freshness,
    error: freshnessError,
    isLoading: freshnessLoading,
  } = useSWR(
    FRESHNESS_KEY,
    async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return getYouthSessionFreshness(token);
    },
    {
      refreshInterval: FRESHNESS_POLL_INTERVAL_MS,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateOnFocus: true,
    },
  );

  useEffect(() => {
    const nextVersion = freshness?.version;
    if (!nextVersion) return;

    const previousVersion = previousFreshnessVersion.current;
    previousFreshnessVersion.current = nextVersion;
    if (previousVersion && previousVersion !== nextVersion) {
      void mutate(isYouthSessionDataKey);
    }
  }, [freshness?.version, mutate]);

  // Lookups (no filters needed)
  const { data: lookups, error: lookupsError } = useSWR(
    'youth-sessions-lookups',
    async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return getLookups(token);
    }
  );

  // Summary — exclude date filters so it always shows live operational status
  const summaryFilters: YouthSessionsFilters = {
    programme: filters.programme,
    youth_uid: filters.youth_uid,
    school_uid: filters.school_uid,
    mentor_id: filters.mentor_id,
  };
  const { data: summary, error: summaryError, isLoading: summaryLoading } = useSWR(
    `youth-sessions-summary-${summaryFilterKey}`,
    async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return getYouthSessionsSummary(token, summaryFilters);
    }
  );

  // Daily activity
  const { data: dailyActivity, error: dailyError, isLoading: dailyLoading } = useSWR(
    `youth-sessions-daily-${filterKey}`,
    async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return getDailyActivity(token, filters);
    }
  );

  // Heatmap
  const { data: heatmap, error: heatmapError, isLoading: heatmapLoading } = useSWR(
    `youth-sessions-heatmap-${filterKey}`,
    async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return getYouthHeatmap(token, filters);
    }
  );

  // Inactive youth
  const { data: inactive, error: inactiveError, isLoading: inactiveLoading } = useSWR(
    `youth-sessions-inactive-${filterKey}-${inactiveDays}`,
    async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return getInactiveYouth(token, { ...filters, days: inactiveDays });
    }
  );

  // School coverage
  const { data: coverage, error: coverageError, isLoading: coverageLoading } = useSWR(
    `youth-sessions-coverage-${filterKey}`,
    async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return getSchoolCoverage(token, filters);
    }
  );

  // Youth detail (only when sheet is open) — include date filters in the SWR key
  // and forward them to the API so the sheet reflects the selected window.
  const detailKey = selectedYouthUid && sheetOpen
    ? `youth-detail-${selectedYouthUid}-${filters.date_from ?? ''}-${filters.date_to ?? ''}`
    : null;
  const { data: youthDetail, isLoading: detailLoading } = useSWR(
    detailKey,
    async () => {
      const token = await getToken();
      if (!token || !selectedYouthUid) throw new Error('Not authenticated');
      return getYouthDetail(token, selectedYouthUid, {
        date_from: filters.date_from,
        date_to: filters.date_to,
      });
    }
  );

  // Error state — check lookupsError before the !lookups skeleton so a lookups
  // failure doesn't leave the page stuck on the loading state forever.
  const anyError = lookupsError || summaryError || dailyError || heatmapError || inactiveError || coverageError;
  if (lookupsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="space-y-4 mb-12">
            <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Youth Sessions Dashboard
            </h1>
          </div>
          <Alert variant="destructive" className="max-w-2xl border-red-200/50 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 backdrop-blur-sm rounded-2xl">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              Failed to load dashboard data. Please try again.
              <div className="mt-3 text-sm font-mono text-red-800 dark:text-red-300 bg-red-100/50 dark:bg-red-900/20 p-3 rounded-lg">
                {lookupsError?.message}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Loading state (waiting for lookups)
  if (!lookups) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="space-y-3 mb-12">
            <Skeleton className="h-10 w-96 rounded-xl bg-gradient-to-r from-slate-200/60 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-700/60" />
            <Skeleton className="h-5 w-80 rounded-lg bg-gradient-to-r from-slate-200/40 to-slate-100/40 dark:from-slate-800/40 dark:to-slate-700/40" />
          </div>
          <Skeleton className="h-32 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (anyError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="space-y-4 mb-12">
            <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Youth Sessions Dashboard
            </h1>
          </div>
          <Alert variant="destructive" className="max-w-2xl border-red-200/50 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 backdrop-blur-sm rounded-2xl">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              Failed to load dashboard data. Please try again.
              <div className="mt-3 text-sm font-mono text-red-800 dark:text-red-300 bg-red-100/50 dark:bg-red-900/20 p-3 rounded-lg">
                {anyError?.message}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
        {/* Header */}
        <div className="space-y-4 mb-10">
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Youth Sessions Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Monitor session activity, spot inactive youth, and track school coverage
          </p>
          <SessionFreshnessBanner
            freshness={freshness}
            error={freshnessError}
            isLoading={freshnessLoading}
          />
          <div className="flex items-start gap-2 mt-2 px-4 py-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 max-w-2xl">
            <Info className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Currently showing Literacy Coaches and Numeracy Coaches only. Zazi iZandi, ZZ ECD, 1000 Stories, EduTech, and other job titles will be added in the next version.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <YouthSessionsFilterBar
            filters={filters}
            lookups={lookups}
            onFiltersChange={updateFilters}
          />
        </div>

        {/* Dashboard Content */}
        <div className="space-y-10">
          {/* Summary Stats */}
          {summaryLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          ) : summary ? (
            <SummaryStats summary={summary} />
          ) : null}

          {/* Daily Activity Chart - Hidden on mobile */}
          <div className="hidden md:block">
            {dailyLoading ? (
              <Skeleton className="h-[460px] rounded-2xl" />
            ) : dailyActivity ? (
              <DailyActivityChart data={dailyActivity} />
            ) : null}
          </div>

          {/* Youth Activity Heatmap */}
          {heatmapLoading ? (
            <Skeleton className="h-[500px] rounded-2xl" />
          ) : heatmap ? (
            <YouthActivityHeatmap data={heatmap} onYouthClick={handleYouthClick} />
          ) : null}

          {/* Inactive Youth + School Coverage side by side on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              {inactiveLoading ? (
                <Skeleton className="h-[400px] rounded-2xl" />
              ) : inactive ? (
                <InactiveYouthPanel
                  data={inactive}
                  onYouthClick={handleYouthClick}
                  onDaysChange={setInactiveDays}
                  activeDays={inactiveDays}
                />
              ) : null}
            </div>
            <div>
              {coverageLoading ? (
                <Skeleton className="h-[400px] rounded-2xl" />
              ) : coverage ? (
                <SchoolCoverageGrid data={coverage} />
              ) : null}
            </div>
          </div>
        </div>

        {/* Youth Detail Sheet */}
        <YouthDetailSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          data={youthDetail || null}
          isLoading={detailLoading}
          onAbsenceChanged={refreshYouthData}
        />
      </div>
    </div>
  );
}

'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import useSWR from 'swr';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

import { YouthSessionsFilterBar } from '@/components/youth-sessions/YouthSessionsFilterBar';
import { SummaryStats } from '@/components/youth-sessions/SummaryStats';
import { DailyActivityChart } from '@/components/youth-sessions/DailyActivityChart';
import { YouthActivityHeatmap } from '@/components/youth-sessions/YouthActivityHeatmap';
import { InactiveYouthPanel } from '@/components/youth-sessions/InactiveYouthPanel';
import { SchoolCoverageGrid } from '@/components/youth-sessions/SchoolCoverageGrid';
import { YouthDetailSheet } from '@/components/youth-sessions/YouthDetailSheet';

import {
  getYouthSessionsSummary,
  getDailyActivity,
  getYouthHeatmap,
  getInactiveYouth,
  getSchoolCoverage,
  getYouthDetail,
  getLookups,
} from '@/lib/api/youth-sessions';

import type { YouthSessionsFilters } from '@/lib/types/youth-sessions';

export default function YouthSessionsDashboardPage() {
  const { getToken } = useAuth();

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

  // Build SWR key from filters
  const filterKey = JSON.stringify(filters);

  // Lookups (no filters needed)
  const { data: lookups, error: lookupsError } = useSWR(
    'youth-sessions-lookups',
    async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return getLookups(token);
    }
  );

  // Summary
  const { data: summary, error: summaryError, isLoading: summaryLoading } = useSWR(
    `youth-sessions-summary-${filterKey}`,
    async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return getYouthSessionsSummary(token, filters);
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

  // Youth detail (only when sheet is open)
  const { data: youthDetail, isLoading: detailLoading } = useSWR(
    selectedYouthUid && sheetOpen ? `youth-detail-${selectedYouthUid}` : null,
    async () => {
      const token = await getToken();
      if (!token || !selectedYouthUid) throw new Error('Not authenticated');
      return getYouthDetail(token, selectedYouthUid);
    }
  );

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

  // Error state
  const anyError = lookupsError || summaryError || dailyError || heatmapError || inactiveError || coverageError;
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
        />
      </div>
    </div>
  );
}

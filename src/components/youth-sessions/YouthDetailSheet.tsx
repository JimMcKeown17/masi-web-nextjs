'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Calendar, Users, TrendingDown } from 'lucide-react';
import type { YouthDetailResponse } from '@/lib/types/youth-sessions';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface YouthDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: YouthDetailResponse | null;
  isLoading: boolean;
}

export function YouthDetailSheet({ open, onOpenChange, data, isLoading }: YouthDetailSheetProps) {
  const chartData = useMemo(() => {
    if (!data) return null;
    const isDark = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const dates = data.daily_sessions.map(d => d.date);
    return {
      traces: [
        {
          x: dates,
          y: data.daily_sessions.map(d => d.literacy),
          type: 'bar' as const,
          name: 'Literacy',
          marker: { color: isDark ? '#60a5fa' : '#3b82f6' },
        },
        {
          x: dates,
          y: data.daily_sessions.map(d => d.numeracy),
          type: 'bar' as const,
          name: 'Numeracy',
          marker: { color: isDark ? '#a78bfa' : '#8b5cf6' },
        },
      ],
      layout: {
        barmode: 'stack' as const,
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)',
        font: { family: 'system-ui', size: 11, color: isDark ? '#94a3b8' : '#64748b' },
        xaxis: { gridcolor: isDark ? 'rgba(51,65,85,0.3)' : 'rgba(226,232,240,0.5)' },
        yaxis: {
          title: { text: 'Sessions', font: { size: 11 } },
          gridcolor: isDark ? 'rgba(51,65,85,0.3)' : 'rgba(226,232,240,0.5)',
        },
        margin: { l: 40, r: 15, t: 10, b: 50 },
        legend: {
          orientation: 'h' as const,
          y: -0.3,
          xanchor: 'center' as const,
          x: 0.5,
          font: { size: 11 },
        },
        hovermode: 'closest' as const,
      },
    };
  }, [data]);

  const miniStats = data ? [
    { label: 'Total Sessions', value: data.total_sessions, icon: Activity, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'This Month', value: data.total_sessions_this_month, icon: Calendar, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Avg/Day', value: data.avg_sessions_per_day.toFixed(1), icon: TrendingDown, color: 'text-violet-600 dark:text-violet-400' },
    { label: 'Days Missed', value: data.days_with_no_sessions, icon: TrendingDown, color: 'text-red-600 dark:text-red-400' },
    { label: 'Children', value: data.children_worked_with, icon: Users, color: 'text-orange-600 dark:text-orange-400' },
  ] : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <SheetTitle className="text-xl">
            {isLoading ? <Skeleton className="h-7 w-48" /> : data?.full_name || 'Youth Detail'}
          </SheetTitle>
          <SheetDescription className="space-y-1">
            {isLoading ? (
              <Skeleton className="h-4 w-64" />
            ) : data ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                    {data.youth_uid}
                  </Badge>
                  <span className="text-sm">{data.mentor_name}</span>
                  <span className="text-sm text-slate-400">at</span>
                  <span className="text-sm">{data.school_name}</span>
                </div>
                {data.start_date && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Started{' '}
                      {new Date(data.start_date + 'T00:00:00').toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </>
            ) : null}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 pt-5">
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-48 rounded-xl" />
          </div>
        ) : data ? (
          <div className="space-y-5 pt-5">
              {/* Mini stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {miniStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                        <span className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</span>
                      </div>
                      <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums">
                        {stat.value}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Working days summary */}
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30">
                <span className="text-sm text-slate-600 dark:text-slate-400">Working days in period</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {data.total_working_days - data.days_with_no_sessions} active / {data.total_working_days} total
                </span>
              </div>

              {/* Daily sessions chart */}
              {chartData && (
                <div className="rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-800/30 p-3">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Daily Sessions (Last 30 Days)
                  </h3>
                  <Plot
                    data={chartData.traces}
                    layout={chartData.layout}
                    config={{ displayModeBar: false, responsive: true }}
                    style={{ width: '100%', height: '250px' }}
                    useResizeHandler
                  />
                </div>
              )}
            </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { YouthHeatmapResponse } from '@/lib/types/youth-sessions';

interface YouthActivityHeatmapProps {
  data: YouthHeatmapResponse;
  onYouthClick: (youthUid: string) => void;
}

type SortField = 'full_name' | 'total_active_days' | 'total_sessions';
type SortDir = 'asc' | 'desc';

function getCellStyle(count: number): string {
  if (count === 0) return 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400';
  if (count <= 2) return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400';
  return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400';
}

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.toLocaleDateString('en-ZA', { weekday: 'short' });
  const num = d.getDate();
  return `${day} ${num}`;
}

export function YouthActivityHeatmap({ data, onYouthClick }: YouthActivityHeatmapProps) {
  const [sortField, setSortField] = useState<SortField>('total_active_days');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir(field === 'full_name' ? 'asc' : 'asc');
    }
  };

  const reversedDates = useMemo(() => [...data.dates].reverse(), [data.dates]);

  const sorted = useMemo(() => {
    return [...data.youth]
      .sort((a, b) => {
        const mul = sortDir === 'asc' ? 1 : -1;
        if (sortField === 'full_name') return mul * a.full_name.localeCompare(b.full_name);
        return mul * ((a[sortField] as number) - (b[sortField] as number));
      })
      .map(y => ({ ...y, daily_counts: [...y.daily_counts].reverse() }));
  }, [data.youth, sortField, sortDir]);

  if (data.youth.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        No youth data available for the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Youth Activity Heatmap
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Daily session counts per youth -- click a name to view details
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th
                  className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-left font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 min-w-[180px]"
                  onClick={() => toggleSort('full_name')}
                >
                  <span className="flex items-center gap-1">
                    Youth Name
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th className="px-3 py-3 text-left font-medium text-slate-500 dark:text-slate-400 text-xs min-w-[100px]">
                  Mentor
                </th>
                {reversedDates.map(d => (
                  <th key={d} className="px-2 py-3 text-center font-medium text-slate-500 dark:text-slate-400 text-xs min-w-[55px]">
                    {formatDateHeader(d)}
                  </th>
                ))}
                <th
                  className="px-3 py-3 text-center font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 min-w-[80px]"
                  onClick={() => toggleSort('total_active_days')}
                >
                  <span className="flex items-center justify-center gap-1 text-xs">
                    Active Days
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
                <th
                  className="px-3 py-3 text-center font-medium text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 min-w-[70px]"
                  onClick={() => toggleSort('total_sessions')}
                >
                  <span className="flex items-center justify-center gap-1 text-xs">
                    Total
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((youth, i) => (
                <tr
                  key={youth.youth_uid}
                  className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                    i % 2 === 0 ? '' : 'bg-slate-25 dark:bg-slate-900/30'
                  }`}
                >
                  <td className="sticky left-0 z-10 bg-inherit px-4 py-2">
                    <button
                      onClick={() => onYouthClick(youth.youth_uid)}
                      className="text-left font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate max-w-[170px] block"
                    >
                      {youth.full_name}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                    {youth.mentor_name}
                  </td>
                  {youth.daily_counts.map((count, ci) => {
                    const cellDate = reversedDates[ci];
                    const beforeStart = youth.start_date && cellDate < youth.start_date;
                    return (
                      <td key={ci} className="px-1 py-1.5 text-center">
                        {beforeStart ? (
                          <div className="inline-flex items-center justify-center w-10 h-7 rounded-md text-xs font-medium bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600">
                            N/A
                          </div>
                        ) : (
                          <div className={`
                            inline-flex items-center justify-center w-10 h-7 rounded-md text-xs font-medium
                            ${getCellStyle(count)}
                            transition-all duration-200
                          `}>
                            {count === 0 ? 'None' : count}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-500"
                          style={{ width: `${data.dates.length > 0 ? (youth.total_active_days / data.dates.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                        {youth.total_active_days}/{data.dates.length}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
                    {youth.total_sessions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

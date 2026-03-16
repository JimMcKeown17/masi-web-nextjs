'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { DailyActivityResponse } from '@/lib/types/youth-sessions';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface DailyActivityChartProps {
  data: DailyActivityResponse;
}

export function DailyActivityChart({ data }: DailyActivityChartProps) {
  const { chartData, layout, totalSessions } = useMemo(() => {
    const isDark = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const dates = data.data.map(d => d.date);
    const total = data.data.reduce((sum, d) => sum + d.total, 0);

    const traces = [
      {
        x: dates,
        y: data.data.map(d => d.primary_school),
        type: 'bar' as const,
        name: 'Primary School',
        marker: { color: isDark ? '#60a5fa' : '#3b82f6' },
        hovertemplate: '<b>Primary School</b><br>Date: %{x}<br>Sessions: %{y}<extra></extra>',
      },
      {
        x: dates,
        y: data.data.map(d => d.ecd),
        type: 'bar' as const,
        name: 'ECD',
        marker: { color: isDark ? '#93c5fd' : '#93c5fd' },
        hovertemplate: '<b>ECD</b><br>Date: %{x}<br>Sessions: %{y}<extra></extra>',
      },
      {
        x: dates,
        y: data.data.map(d => d.other),
        type: 'bar' as const,
        name: 'Other',
        marker: { color: isDark ? '#cbd5e1' : '#94a3b8' },
        hovertemplate: '<b>Other</b><br>Date: %{x}<br>Sessions: %{y}<extra></extra>',
      },
    ];

    const chartLayout = {
      barmode: 'stack' as const,
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: {
        family: 'system-ui, -apple-system, sans-serif',
        size: 12,
        color: isDark ? '#94a3b8' : '#64748b',
      },
      xaxis: {
        title: { text: 'Date', font: { size: 13, color: isDark ? '#cbd5e1' : '#475569' } },
        gridcolor: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.5)',
      },
      yaxis: {
        title: { text: 'Sessions', font: { size: 13, color: isDark ? '#cbd5e1' : '#475569' } },
        gridcolor: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.5)',
      },
      margin: { l: 60, r: 30, t: 20, b: 70 },
      legend: {
        orientation: 'h' as const,
        yanchor: 'bottom' as const,
        y: -0.25,
        xanchor: 'center' as const,
        x: 0.5,
        font: { size: 12, color: isDark ? '#cbd5e1' : '#475569' },
      },
      hovermode: 'closest' as const,
      hoverlabel: {
        bgcolor: isDark ? '#1e293b' : '#ffffff',
        bordercolor: isDark ? '#334155' : '#e2e8f0',
        font: { family: 'system-ui', size: 13, color: isDark ? '#f1f5f9' : '#1e293b' },
      },
    };

    return { chartData: traces, layout: chartLayout, totalSessions: total };
  }, [data]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms', animationFillMode: 'backwards' }}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Daily Session Activity
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Sessions by school type over time
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-900/40 border border-slate-200/50 dark:border-slate-700/50">
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total</div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {totalSessions.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white via-white to-slate-50/30 dark:from-slate-800/40 dark:via-slate-800/40 dark:to-slate-900/40 backdrop-blur-sm shadow-sm">
        <div className="p-4">
          <Plot
            data={chartData}
            layout={layout}
            config={{
              displayModeBar: true,
              displaylogo: false,
              responsive: true,
              modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
            }}
            style={{ width: '100%', height: '400px' }}
            useResizeHandler
          />
        </div>
      </div>
    </div>
  );
}

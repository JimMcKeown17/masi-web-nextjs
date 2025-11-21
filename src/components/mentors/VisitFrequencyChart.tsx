// components/mentors/VisitFrequencyChart.tsx
'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { BookOpen, Megaphone, Sparkles, Calculator } from 'lucide-react';
import type { VisitFrequencyResponse } from '@/lib/types';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface VisitFrequencyChartProps {
  data: VisitFrequencyResponse;
}

interface ProgramConfig {
  id: 'literacy' | 'yebo' | 'stories' | 'numeracy';
  label: string;
  dataKey: 'literacy_visits' | 'yebo_visits' | 'stories_visits' | 'numeracy_visits';
  color: string;
  colorDark: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  description: string;
}

const programs: ProgramConfig[] = [
  {
    id: 'literacy',
    label: 'Masi Literacy',
    dataKey: 'literacy_visits',
    color: '#3b82f6',
    colorDark: '#60a5fa',
    icon: BookOpen,
    iconBg: 'bg-blue-50 dark:bg-blue-950/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'Core literacy program',
  },
  {
    id: 'yebo',
    label: 'Yebo',
    dataKey: 'yebo_visits',
    color: '#ec4899',
    colorDark: '#f472b6',
    icon: Megaphone,
    iconBg: 'bg-pink-50 dark:bg-pink-950/30',
    iconColor: 'text-pink-600 dark:text-pink-400',
    borderColor: 'border-pink-200 dark:border-pink-800',
    description: 'Youth empowerment',
  },
  {
    id: 'stories',
    label: '1000 Stories',
    dataKey: 'stories_visits',
    color: '#14b8a6',
    colorDark: '#2dd4bf',
    icon: Sparkles,
    iconBg: 'bg-teal-50 dark:bg-teal-950/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
    borderColor: 'border-teal-200 dark:border-teal-800',
    description: 'Story-based learning',
  },
  {
    id: 'numeracy',
    label: 'Numeracy',
    dataKey: 'numeracy_visits',
    color: '#8b5cf6',
    colorDark: '#a78bfa',
    icon: Calculator,
    iconBg: 'bg-violet-50 dark:bg-violet-950/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-200 dark:border-violet-800',
    description: 'Math skills development',
  },
];

export function VisitFrequencyChart({ data }: VisitFrequencyChartProps) {
  const [selectedPrograms, setSelectedPrograms] = useState<Set<string>>(
    new Set(programs.map(p => p.id))
  );

  const toggleProgram = (programId: string) => {
    setSelectedPrograms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(programId)) {
        // Don't allow deselecting all programs
        if (newSet.size > 1) {
          newSet.delete(programId);
        }
      } else {
        newSet.add(programId);
      }
      return newSet;
    });
  };

  const selectAllPrograms = () => {
    setSelectedPrograms(new Set(programs.map(p => p.id)));
  };

  const chartData = useMemo(() => {
    const isDark = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    return programs
      .filter(program => selectedPrograms.has(program.id))
      .map(program => ({
        x: data.data.map(d => d.time_period),
        y: data.data.map(d => d[program.dataKey]),
        type: 'bar' as const,
        name: program.label,
        marker: {
          color: isDark ? program.colorDark : program.color,
          line: {
            width: 0,
          },
        },
        hovertemplate: `<b>${program.label}</b><br>` +
          'Period: %{x}<br>' +
          'Visits: %{y}<br>' +
          '<extra></extra>',
      }));
  }, [data, selectedPrograms]);

  const totalVisitsInView = useMemo(() => {
    return data.data.reduce((sum, period) => {
      return sum + programs
        .filter(p => selectedPrograms.has(p.id))
        .reduce((pSum, program) => pSum + period[program.dataKey], 0);
    }, 0);
  }, [data, selectedPrograms]);

  const layout = useMemo(() => {
    const isDark = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
      barmode: 'group' as const,
      plot_bgcolor: 'rgba(0,0,0,0)',
      paper_bgcolor: 'rgba(0,0,0,0)',
      font: {
        family: 'system-ui, -apple-system, sans-serif',
        size: 12,
        color: isDark ? '#94a3b8' : '#64748b',
      },
      xaxis: {
        title: {
          text: 'Time Period',
          font: {
            size: 13,
            color: isDark ? '#cbd5e1' : '#475569',
            weight: 500,
          },
        },
        gridcolor: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.5)',
        tickfont: {
          color: isDark ? '#94a3b8' : '#64748b',
        },
      },
      yaxis: {
        title: {
          text: 'Number of Visits',
          font: {
            size: 13,
            color: isDark ? '#cbd5e1' : '#475569',
            weight: 500,
          },
        },
        gridcolor: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.5)',
        tickfont: {
          color: isDark ? '#94a3b8' : '#64748b',
        },
      },
      margin: {
        l: 60,
        r: 40,
        t: 40,
        b: 80,
      },
      legend: {
        orientation: 'h' as const,
        yanchor: 'bottom' as const,
        y: -0.3,
        xanchor: 'center' as const,
        x: 0.5,
        font: {
          size: 12,
          color: isDark ? '#cbd5e1' : '#475569',
        },
      },
      hovermode: 'closest' as const,
      hoverlabel: {
        bgcolor: isDark ? '#1e293b' : '#ffffff',
        bordercolor: isDark ? '#334155' : '#e2e8f0',
        font: {
          family: 'system-ui, -apple-system, sans-serif',
          size: 13,
          color: isDark ? '#f1f5f9' : '#1e293b',
        },
      },
    };
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '300ms', animationFillMode: 'backwards' }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Visit Frequency Over Time
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track mentor visit patterns across programs
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/40 dark:to-slate-900/40 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Visits</div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-white tabular-nums">
              {totalVisitsInView.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Program Filter Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Filter by Program
          </h3>
          <button
            onClick={selectAllPrograms}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
          >
            Select All
          </button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {programs.map((program, index) => {
            const isSelected = selectedPrograms.has(program.id);
            const Icon = program.icon;
            
            return (
              <button
                key={program.id}
                onClick={() => toggleProgram(program.id)}
                className={`
                  group relative overflow-hidden rounded-xl border transition-all duration-300
                  ${isSelected 
                    ? `${program.borderColor} bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900/50 shadow-sm`
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/20 opacity-50 hover:opacity-70'
                  }
                  hover:scale-[1.02] active:scale-[0.98]
                  animate-in fade-in slide-in-from-bottom-2
                `}
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className={`absolute top-0 left-0 right-0 h-1 ${program.iconBg}`} />
                )}
                
                <div className="relative p-4 flex items-center gap-3">
                  {/* Icon */}
                  <div className={`
                    inline-flex items-center justify-center w-10 h-10 rounded-lg
                    ${isSelected ? `${program.iconBg} ${program.iconColor}` : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600'}
                    transition-all duration-300
                    ${isSelected ? 'group-hover:scale-110' : 'group-hover:scale-105'}
                  `}>
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>

                  {/* Label */}
                  <div className="flex-1 text-left">
                    <div className={`
                      text-sm font-medium transition-colors duration-200
                      ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}
                    `}>
                      {program.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      {program.description}
                    </div>
                  </div>

                  {/* Checkmark */}
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                    ${isSelected 
                      ? `${program.borderColor} bg-gradient-to-br ${program.iconBg}` 
                      : 'border-slate-300 dark:border-slate-600'
                    }
                  `}>
                    {isSelected && (
                      <svg className={`w-3 h-3 ${program.iconColor}`} viewBox="0 0 12 12" fill="none">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white via-white to-slate-50/30 dark:from-slate-800/40 dark:via-slate-800/40 dark:to-slate-900/40 backdrop-blur-sm shadow-sm">
        <div className="p-6">
          {chartData.length > 0 ? (
            <Plot
              data={chartData}
              layout={layout}
              config={{
                displayModeBar: true,
                displaylogo: false,
                responsive: true,
                modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
              }}
              style={{ width: '100%', height: '500px' }}
              useResizeHandler={true}
            />
          ) : (
            <div className="flex items-center justify-center h-[500px] text-slate-500 dark:text-slate-400">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">No programs selected</p>
                <p className="text-sm">Select at least one program to view data</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

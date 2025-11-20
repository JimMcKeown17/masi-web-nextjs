// components/mentors/ProgramBreakdown.tsx
'use client';

import { DashboardSummary } from '@/lib/types';
import { BookOpen, Users, Library, Calculator, TrendingUp } from 'lucide-react';

interface ProgramBreakdownProps {
  summary: DashboardSummary;
}

export function ProgramBreakdown({ summary }: ProgramBreakdownProps) {
  const programs = [
    {
      name: 'Masi Literacy',
      visits: summary.literacy_visits,
      recentVisits: summary.literacy_recent_visits,
      icon: BookOpen,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-950/30',
      gradient: 'from-blue-500/5 via-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:via-blue-500/10 dark:to-cyan-500/10',
      borderColor: 'border-blue-200/40 dark:border-blue-800/40',
      accentColor: 'bg-blue-500 dark:bg-blue-400',
    },
    {
      name: 'Yebo',
      visits: summary.yebo_visits,
      recentVisits: summary.yebo_recent_visits,
      icon: Users,
      iconColor: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-950/30',
      gradient: 'from-rose-500/5 via-rose-500/5 to-pink-500/5 dark:from-rose-500/10 dark:via-rose-500/10 dark:to-pink-500/10',
      borderColor: 'border-rose-200/40 dark:border-rose-800/40',
      accentColor: 'bg-rose-500 dark:bg-rose-400',
    },
    {
      name: '1000 Stories',
      visits: summary.stories_visits,
      recentVisits: summary.stories_recent_visits,
      icon: Library,
      iconColor: 'text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-50 dark:bg-teal-950/30',
      gradient: 'from-teal-500/5 via-teal-500/5 to-emerald-500/5 dark:from-teal-500/10 dark:via-teal-500/10 dark:to-emerald-500/10',
      borderColor: 'border-teal-200/40 dark:border-teal-800/40',
      accentColor: 'bg-teal-500 dark:bg-teal-400',
    },
    {
      name: 'Numeracy',
      visits: summary.numeracy_visits,
      recentVisits: summary.numeracy_recent_visits,
      icon: Calculator,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/30',
      gradient: 'from-amber-500/5 via-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:via-amber-500/10 dark:to-orange-500/10',
      borderColor: 'border-amber-200/40 dark:border-amber-800/40',
      accentColor: 'bg-amber-500 dark:bg-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Program Breakdown
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Visit statistics by program type
          </p>
        </div>
      </div>

      {/* Program Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {programs.map((program, index) => {
          const Icon = program.icon;
          const recentPercentage = program.visits > 0 
            ? ((program.recentVisits / program.visits) * 100).toFixed(0)
            : 0;

          return (
            <div
              key={program.name}
              className={`
                group relative overflow-hidden rounded-2xl border ${program.borderColor}
                bg-gradient-to-br ${program.gradient}
                backdrop-blur-sm transition-all duration-500 ease-out
                hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-200/20 dark:hover:shadow-slate-900/40
                animate-in fade-in slide-in-from-bottom-4
              `}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative p-6">
                {/* Icon and Name */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    inline-flex items-center justify-center w-10 h-10 rounded-lg
                    ${program.iconBg} ${program.iconColor}
                    transition-all duration-500 group-hover:scale-110
                  `}>
                    <Icon className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <div className={`
                    w-1.5 h-1.5 rounded-full ${program.accentColor}
                    transition-all duration-500 group-hover:scale-150
                  `} />
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  {/* Total Visits */}
                  <div>
                    <div className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
                      {program.visits.toLocaleString()}
                    </div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
                      {program.name}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Last 30 Days
                      </span>
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                          {program.recentVisits}
                        </span>
                      </div>
                    </div>
                    {/* Progress indicator */}
                    <div className="mt-2 h-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${program.accentColor} transition-all duration-700 ease-out`}
                        style={{ 
                          width: `${Math.min(Number(recentPercentage), 100)}%`,
                          transitionDelay: `${index * 100 + 200}ms`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
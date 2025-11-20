// components/mentors/DashboardStats.tsx
'use client';

import { DashboardSummary } from '@/lib/types';
import { TrendingUp, Calendar, School, Star } from 'lucide-react';

interface DashboardStatsProps {
  summary: DashboardSummary;
}

export function DashboardStats({ summary }: DashboardStatsProps) {
  const stats = [
    {
      label: 'Total Visits',
      sublabel: 'All Programs',
      value: summary.total_visits.toLocaleString(),
      icon: TrendingUp,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-950/30',
      gradient: 'from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10',
      borderColor: 'border-blue-200/30 dark:border-blue-800/30',
    },
    {
      label: 'Recent Visits',
      sublabel: 'Last 30 Days',
      value: summary.recent_visits.toLocaleString(),
      icon: Calendar,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
      gradient: 'from-emerald-500/5 to-green-500/5 dark:from-emerald-500/10 dark:to-green-500/10',
      borderColor: 'border-emerald-200/30 dark:border-emerald-800/30',
    },
    {
      label: 'Schools',
      sublabel: 'Active Locations',
      value: summary.schools_visited.toLocaleString(),
      icon: School,
      iconColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-50 dark:bg-orange-950/30',
      gradient: 'from-orange-500/5 to-amber-500/5 dark:from-orange-500/10 dark:to-amber-500/10',
      borderColor: 'border-orange-200/30 dark:border-orange-800/30',
    },
    {
      label: 'Quality Rating',
      sublabel: 'Average Score',
      value: summary.avg_quality.toFixed(1),
      icon: Star,
      iconColor: 'text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-50 dark:bg-violet-950/30',
      gradient: 'from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10',
      borderColor: 'border-violet-200/30 dark:border-violet-800/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`
              group relative overflow-hidden rounded-2xl border ${stat.borderColor}
              bg-gradient-to-br ${stat.gradient}
              backdrop-blur-sm transition-all duration-500 ease-out
              hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-slate-900/40
              animate-in fade-in slide-in-from-bottom-4
            `}
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
          >
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative p-6 space-y-4">
              {/* Icon */}
              <div className={`
                inline-flex items-center justify-center w-12 h-12 rounded-xl
                ${stat.iconBg} ${stat.iconColor}
                transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3
              `}>
                <Icon className="w-6 h-6" strokeWidth={2.5} />
              </div>

              {/* Value */}
              <div className="space-y-1">
                <div className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
                  {stat.value}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {stat.label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    {stat.sublabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom accent line */}
            <div className={`
              absolute bottom-0 left-0 right-0 h-0.5 ${stat.iconBg}
              transform origin-left scale-x-0 group-hover:scale-x-100
              transition-transform duration-500 ease-out
            `} />
          </div>
        );
      })}
    </div>
  );
}
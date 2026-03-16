'use client';

import { Activity, Users, AlertTriangle, School, TrendingUp } from 'lucide-react';
import type { YouthSessionsSummary } from '@/lib/types/youth-sessions';

interface SummaryStatsProps {
  summary: YouthSessionsSummary;
}

export function SummaryStats({ summary }: SummaryStatsProps) {
  const stats = [
    {
      label: 'Sessions Today',
      value: summary.total_sessions_today.toLocaleString(),
      sublabel: `${summary.total_sessions_this_week.toLocaleString()} this week`,
      icon: Activity,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-950/30',
      gradient: 'from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10',
      borderColor: 'border-blue-200/30 dark:border-blue-800/30',
    },
    {
      label: 'Active Youth Today',
      value: summary.active_youth_today.toLocaleString(),
      sublabel: `of ${summary.total_active_youth} total`,
      icon: Users,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
      gradient: 'from-emerald-500/5 to-green-500/5 dark:from-emerald-500/10 dark:to-green-500/10',
      borderColor: 'border-emerald-200/30 dark:border-emerald-800/30',
    },
    {
      label: 'Inactive Youth',
      value: summary.inactive_youth_2_days.toLocaleString(),
      sublabel: 'no sessions in 2+ days',
      icon: AlertTriangle,
      iconColor: 'text-red-600 dark:text-red-400',
      iconBg: 'bg-red-50 dark:bg-red-950/30',
      gradient: 'from-red-500/5 to-rose-500/5 dark:from-red-500/10 dark:to-rose-500/10',
      borderColor: 'border-red-200/30 dark:border-red-800/30',
      pulse: summary.inactive_youth_2_days > 0,
    },
    {
      label: 'Schools Covered Today',
      value: summary.schools_covered_today.toLocaleString(),
      sublabel: `of ${summary.total_schools} total`,
      icon: School,
      iconColor: 'text-orange-600 dark:text-orange-400',
      iconBg: 'bg-orange-50 dark:bg-orange-950/30',
      gradient: 'from-orange-500/5 to-amber-500/5 dark:from-orange-500/10 dark:to-amber-500/10',
      borderColor: 'border-orange-200/30 dark:border-orange-800/30',
    },
    {
      label: 'Avg Sessions/Youth',
      value: summary.avg_sessions_per_youth_this_week.toFixed(1),
      sublabel: 'this week',
      icon: TrendingUp,
      iconColor: 'text-violet-600 dark:text-violet-400',
      iconBg: 'bg-violet-50 dark:bg-violet-950/30',
      gradient: 'from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/10',
      borderColor: 'border-violet-200/30 dark:border-violet-800/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
              ${'pulse' in stat && stat.pulse ? 'ring-2 ring-red-400/30 dark:ring-red-500/20' : ''}
            `}
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'backwards' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative p-4 flex flex-col gap-3">
              <div className={`
                inline-flex items-center justify-center w-10 h-10 rounded-xl
                ${stat.iconBg} ${stat.iconColor}
                transition-transform duration-500 group-hover:scale-110
              `}>
                <Icon className="w-5 h-5" strokeWidth={2.5} />
              </div>

              <div className="space-y-0.5">
                <div className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white tabular-nums">
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

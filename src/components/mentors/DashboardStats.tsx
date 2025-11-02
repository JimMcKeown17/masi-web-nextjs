// components/mentors/DashboardStats.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardSummary } from '@/lib/types';
import { TrendingUp, Calendar, School, Star } from 'lucide-react';

interface DashboardStatsProps {
  summary: DashboardSummary;
}

export function DashboardStats({ summary }: DashboardStatsProps) {
  const stats = [
    {
      label: 'Total Visits (All Programs)',
      value: summary.total_visits,
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Visits in Last 30 Days',
      value: summary.recent_visits,
      icon: Calendar,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Schools Visited',
      value: summary.schools_visited,
      icon: School,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      label: 'Avg. Quality Rating',
      value: summary.avg_quality.toFixed(1),
      icon: Star,
      gradient: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${stat.gradient} p-6 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-8 w-8 opacity-80" />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
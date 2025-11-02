// components/mentors/ProgramBreakdown.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardSummary } from '@/lib/types';
import { BookOpen, Users, Library, Calculator } from 'lucide-react';

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
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Yebo',
      visits: summary.yebo_visits,
      recentVisits: summary.yebo_recent_visits,
      icon: Users,
      gradient: 'from-red-500 to-pink-500',
    },
    {
      name: '1000 Stories',
      visits: summary.stories_visits,
      recentVisits: summary.stories_recent_visits,
      icon: Library,
      gradient: 'from-teal-500 to-green-500',
    },
    {
      name: 'Numeracy',
      visits: summary.numeracy_visits,
      recentVisits: summary.numeracy_recent_visits,
      icon: Calculator,
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {programs.map((program) => {
        const Icon = program.icon;
        return (
          <Card key={program.name} className="overflow-hidden">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${program.gradient} p-6 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-6 w-6 opacity-80" />
                </div>
                <div className="text-2xl font-bold mb-1">{program.visits}</div>
                <div className="text-sm font-medium mb-1">{program.name} Visits</div>
                <div className="text-xs opacity-90">
                  {program.recentVisits} in last 30 days
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
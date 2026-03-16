'use client';

import { Calendar, School as SchoolIcon, User as UserIcon, Users, BookOpen } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { LookupsResponse, YouthSessionsFilters } from '@/lib/types/youth-sessions';

interface YouthSessionsFilterBarProps {
  filters: YouthSessionsFilters;
  lookups: LookupsResponse;
  onFiltersChange: (filters: Partial<YouthSessionsFilters>) => void;
}

const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' },
  { label: 'Last 7 Days', value: 'last_7' },
  { label: 'This Month', value: 'this_month' },
  { label: 'YTD', value: 'ytd' },
] as const;

function getDateRange(preset: string): { date_from: string; date_to: string } {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const to = fmt(today);

  switch (preset) {
    case 'today':
      return { date_from: to, date_to: to };
    case 'this_week': {
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
      return { date_from: fmt(monday), date_to: to };
    }
    case 'last_7': {
      const d = new Date(today);
      d.setDate(today.getDate() - 7);
      return { date_from: fmt(d), date_to: to };
    }
    case 'this_month': {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      return { date_from: fmt(d), date_to: to };
    }
    case 'ytd': {
      const d = new Date(today.getFullYear(), 0, 1);
      return { date_from: fmt(d), date_to: to };
    }
    default:
      return { date_from: '', date_to: to };
  }
}

export function YouthSessionsFilterBar({ filters, lookups, onFiltersChange }: YouthSessionsFilterBarProps) {
  const activePreset = DATE_PRESETS.find(p => {
    const range = getDateRange(p.value);
    return range.date_from === filters.date_from && range.date_to === filters.date_to;
  })?.value || '';

  return (
    <div className="
      relative rounded-2xl border border-slate-200/60 dark:border-slate-800/60
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
      p-6 shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50
      transition-all duration-300
    ">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-slate-50/30 dark:from-slate-800/20 dark:to-slate-900/10 rounded-2xl pointer-events-none" />

      <div className="relative space-y-5">
        {/* Date presets + Programme toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Period</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant={activePreset === preset.value ? 'default' : 'outline'}
                size="sm"
                className={`rounded-lg text-xs h-8 ${
                  activePreset === preset.value
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => onFiltersChange(getDateRange(preset.value))}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <div className="flex gap-1">
              {(['all', 'literacy', 'numeracy'] as const).map((prog) => (
                <Button
                  key={prog}
                  variant={filters.programme === prog ? 'default' : 'outline'}
                  size="sm"
                  className={`rounded-lg text-xs h-8 capitalize ${
                    filters.programme === prog
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => onFiltersChange({ programme: prog })}
                >
                  {prog}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Youth */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Users className="w-4 h-4 text-slate-400" />
              Youth
            </label>
            <Select
              value={filters.youth_uid || 'all'}
              onValueChange={(v) => onFiltersChange({ youth_uid: v === 'all' ? '' : v })}
            >
              <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                <SelectValue placeholder="All Youth" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-60">
                <SelectItem value="all" className="rounded-lg">All Youth</SelectItem>
                {lookups.youth.map((y) => (
                  <SelectItem key={y.youth_uid} value={y.youth_uid} className="rounded-lg">
                    {y.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* School */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <SchoolIcon className="w-4 h-4 text-slate-400" />
              School
            </label>
            <Select
              value={filters.school_uid || 'all'}
              onValueChange={(v) => onFiltersChange({ school_uid: v === 'all' ? '' : v })}
            >
              <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-60">
                <SelectItem value="all" className="rounded-lg">All Schools</SelectItem>
                {lookups.schools.map((s) => (
                  <SelectItem key={s.school_uid} value={s.school_uid} className="rounded-lg">
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mentor */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <UserIcon className="w-4 h-4 text-slate-400" />
              Mentor
            </label>
            <Select
              value={filters.mentor_id || 'all'}
              onValueChange={(v) => onFiltersChange({ mentor_id: v === 'all' ? '' : v })}
            >
              <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50">
                <SelectValue placeholder="All Mentors" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-60">
                <SelectItem value="all" className="rounded-lg">All Mentors</SelectItem>
                {lookups.mentors.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()} className="rounded-lg">
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

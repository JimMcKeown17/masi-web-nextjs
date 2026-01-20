// components/mentors/FilterBar.tsx
'use client';

import { School, User } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, School as SchoolIcon, User as UserIcon } from 'lucide-react';

interface FilterBarProps {
  timeFilter: string;
  schoolFilter: string;
  mentorFilter: string;
  schools: School[];
  mentors: User[];
  onTimeFilterChange: (value: string) => void;
  onSchoolFilterChange: (value: string) => void;
  onMentorFilterChange: (value: string) => void;
}

export function FilterBar({
  timeFilter,
  schoolFilter,
  mentorFilter,
  schools,
  mentors,
  onTimeFilterChange,
  onSchoolFilterChange,
  onMentorFilterChange,
}: FilterBarProps) {
  return (
    <div className="
      relative rounded-2xl border border-slate-200/60 dark:border-slate-800/60
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
      p-6 shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50
      transition-all duration-300
    ">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-slate-50/30 dark:from-slate-800/20 dark:to-slate-900/10 rounded-2xl pointer-events-none" />
      
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Time Filter */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            Time Period
          </label>
          <Select value={timeFilter} onValueChange={onTimeFilterChange}>
            <SelectTrigger className="
              h-11 rounded-xl border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-800/50
              hover:border-slate-300 dark:hover:border-slate-600
              focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700
              transition-all duration-200
            ">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
              <SelectItem value="all" className="rounded-lg">All Time</SelectItem>
              <SelectItem value="7days" className="rounded-lg">Last 7 Days</SelectItem>
              <SelectItem value="30days" className="rounded-lg">Last 30 Days</SelectItem>
              <SelectItem value="90days" className="rounded-lg">Last 90 Days</SelectItem>
              <SelectItem value="thisyear" className="rounded-lg">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* School Filter */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <SchoolIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            School
          </label>
          <Select 
            value={schoolFilter || "all"} 
            onValueChange={(value) => onSchoolFilterChange(value === "all" ? "" : value)}
          >
            <SelectTrigger className="
              h-11 rounded-xl border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-800/50
              hover:border-slate-300 dark:hover:border-slate-600
              focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700
              transition-all duration-200
            ">
              <SelectValue placeholder="All Schools" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
              <SelectItem value="all" className="rounded-lg">All Schools</SelectItem>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id.toString()} className="rounded-lg">
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mentor Filter */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <UserIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            Mentor
          </label>
          <Select 
            value={mentorFilter || "all"} 
            onValueChange={(value) => onMentorFilterChange(value === "all" ? "" : value)}
          >
            <SelectTrigger className="
              h-11 rounded-xl border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-800/50
              hover:border-slate-300 dark:hover:border-slate-600
              focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700
              transition-all duration-200
            ">
              <SelectValue placeholder="All Mentors" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700">
              <SelectItem value="all" className="rounded-lg">All Mentors</SelectItem>
              {mentors.map((mentor) => (
                <SelectItem key={mentor.id} value={mentor.id.toString()} className="rounded-lg">
                  {mentor.first_name} {mentor.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
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
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FilterBarProps {
  timeFilter: string;
  schoolFilter: string;
  mentorFilter: string;
  schools: School[];
  mentors: User[];
  onTimeFilterChange: (value: string) => void;
  onSchoolFilterChange: (value: string) => void;
  onMentorFilterChange: (value: string) => void;
  onAddNewVisit?: () => void;
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
  onAddNewVisit,
}: FilterBarProps) {
  return (
    <div className="bg-muted/50 p-4 rounded-lg mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Time Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Time Period</label>
          <Select value={timeFilter} onValueChange={onTimeFilterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="thisyear">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* School Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">School</label>
          <Select value={schoolFilter || "all"} onValueChange={(value) => onSchoolFilterChange(value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Schools" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Schools</SelectItem>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id.toString()}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mentor Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Mentor</label>
          <Select value={mentorFilter || "all"} onValueChange={(value) => onMentorFilterChange(value === "all" ? "" : value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Mentors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Mentors</SelectItem>
              {mentors.map((mentor) => (
                <SelectItem key={mentor.id} value={mentor.id.toString()}>
                  {mentor.first_name} {mentor.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add New Visit Button */}
        <div className="space-y-2">
          <label className="text-sm font-medium opacity-0">Action</label>
          <Button onClick={onAddNewVisit} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add New Visit
          </Button>
        </div>
      </div>
    </div>
  );
}
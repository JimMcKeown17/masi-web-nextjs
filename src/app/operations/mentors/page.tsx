// app/operations/mentors/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import useSWR from 'swr';
import { FilterBar } from '@/components/mentors/FilterBar';
import { DashboardStats } from '@/components/mentors/DashboardStats';
import { ProgramBreakdown } from '@/components/mentors/ProgramBreakdown';
import { getSchools, getMentors, getDashboardSummary } from '@/lib/api/mentors';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function MentorDashboardPage() {
  const { getToken } = useAuth();
  const [timeFilter, setTimeFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [mentorFilter, setMentorFilter] = useState('');

  // Fetcher function for SWR
  const fetcher = async (url: string) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    
    // Parse the URL to determine which API function to call
    if (url.includes('schools')) {
      return getSchools(token);
    }
    if (url.includes('mentors-list')) {
      return getMentors(token);
    }
    if (url.includes('summary')) {
      return getDashboardSummary(token, {
        time_filter: timeFilter as any,
        school: schoolFilter,
        mentor: mentorFilter,
      });
    }
    
    throw new Error('Unknown URL');
  };

  // Fetch data with SWR
  const { data: schools, error: schoolsError } = useSWR('/api/schools', fetcher);
  const { data: mentors, error: mentorsError } = useSWR('/api/mentors-list', fetcher);
  const { 
    data: summary, 
    error: summaryError,
    isLoading: summaryLoading 
  } = useSWR(
    `/api/summary?time=${timeFilter}&school=${schoolFilter}&mentor=${mentorFilter}`,
    fetcher
  );

  // Loading state
  if (!schools || !mentors) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Mentor Visit Dashboard</h1>
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (schoolsError || mentorsError || summaryError) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Mentor Visit Dashboard</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try again.
            {summaryError && <div className="mt-2 text-xs">{summaryError.message}</div>}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Mentor Visit Dashboard</h1>

      {/* Filter Bar */}
      <FilterBar
        timeFilter={timeFilter}
        schoolFilter={schoolFilter}
        mentorFilter={mentorFilter}
        schools={schools}
        mentors={mentors}
        onTimeFilterChange={setTimeFilter}
        onSchoolFilterChange={setSchoolFilter}
        onMentorFilterChange={setMentorFilter}
        onAddNewVisit={() => {
          // TODO: Navigate to add visit page or open modal
          console.log('Add new visit');
        }}
      />

      {/* Dashboard Stats */}
      {summaryLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      ) : summary ? (
        <>
          <DashboardStats summary={summary} />
          <ProgramBreakdown summary={summary} />
        </>
      ) : null}

      {/* TODO: Add charts and tables */}
      <div className="text-center text-muted-foreground py-12">
        Charts and tables coming next...
      </div>
    </div>
  );
}
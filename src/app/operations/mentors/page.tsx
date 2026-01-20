// app/operations/mentors/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import useSWR, { mutate } from 'swr';
import { FilterBar } from '@/components/mentors/FilterBar';
import { DashboardStats } from '@/components/mentors/DashboardStats';
import { ProgramBreakdown } from '@/components/mentors/ProgramBreakdown';
import { VisitFrequencyChart } from '@/components/mentors/VisitFrequencyChart';
import { MentorVisitFormDialog } from '@/components/mentors/MentorVisitFormDialog';
import { getSchools, getMentors, getDashboardSummary, getVisitFrequency } from '@/lib/api/mentors';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Plus } from 'lucide-react';

export default function MentorDashboardPage() {
  const { getToken } = useAuth();
  const [timeFilter, setTimeFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [mentorFilter, setMentorFilter] = useState('');
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

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
        time_filter: timeFilter as '7days' | '30days' | '90days' | 'thisyear' | 'all',
        school: schoolFilter,
        mentor: mentorFilter,
      });
    }
    
    throw new Error('Unknown URL');
  };

  // Fetcher for visit frequency
  const frequencyFetcher = async () => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');

    return getVisitFrequency(token, {
      time_filter: timeFilter as '7days' | '30days' | '90days' | 'thisyear' | 'all',
      school: schoolFilter,
      mentor: mentorFilter,
    });
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
  const {
    data: visitFrequency,
    error: frequencyError,
    isLoading: frequencyLoading
  } = useSWR(
    `/api/visit-frequency?time=${timeFilter}&school=${schoolFilter}&mentor=${mentorFilter}`,
    frequencyFetcher
  );

  // Loading state
  if (!schools || !mentors) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
          {/* Header Skeleton */}
          <div className="space-y-3 mb-12">
            <Skeleton className="h-10 w-80 rounded-xl bg-gradient-to-r from-slate-200/60 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-700/60" />
            <Skeleton className="h-5 w-96 rounded-lg bg-gradient-to-r from-slate-200/40 to-slate-100/40 dark:from-slate-800/40 dark:to-slate-700/40" />
          </div>
          
          {/* Filter Skeleton */}
          <Skeleton className="h-24 w-full rounded-2xl mb-10 bg-gradient-to-r from-slate-200/60 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-700/60" />
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[...Array(4)].map((_, i) => (
              <Skeleton 
                key={i} 
                className="h-40 rounded-2xl bg-gradient-to-br from-slate-200/60 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-700/60"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          
          {/* Program Breakdown Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton 
                key={i} 
                className="h-36 rounded-2xl bg-gradient-to-br from-slate-200/60 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-700/60"
                style={{ animationDelay: `${(i + 4) * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (schoolsError || mentorsError || summaryError || frequencyError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="space-y-4 mb-12">
            <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Mentor Visit Dashboard
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Real-time insights and analytics
            </p>
          </div>
          
          <Alert 
            variant="destructive" 
            className="max-w-2xl border-red-200/50 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 backdrop-blur-sm rounded-2xl"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-base">
              Failed to load dashboard data. Please try again.
              {(summaryError || frequencyError) && (
                <div className="mt-3 text-sm font-mono text-red-800 dark:text-red-300 bg-red-100/50 dark:bg-red-900/20 p-3 rounded-lg">
                  {summaryError?.message || frequencyError?.message}
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
        {/* Header Section */}
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Mentor Visit Dashboard
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Real-time insights and analytics across all programs
          </p>
        </div>

        {/* Add New Visit Button Section */}
        <div className="mb-6">
          <div className="
            relative rounded-2xl border border-slate-200/60 dark:border-slate-800/60
            bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
            p-6 shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50
            transition-all duration-300
          ">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-slate-50/30 dark:from-slate-800/20 dark:to-slate-900/10 rounded-2xl pointer-events-none" />
            <div className="relative flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  Record a New Visit
                </h3>
                <p className="hidden md:block text-sm text-slate-600 dark:text-slate-400">
                  Add a new mentor visit to track program progress
                </p>
              </div>
              <Button
                onClick={() => setIsFormDialogOpen(true)}
                className="
                  h-11 rounded-xl px-6
                  bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-50
                  text-white dark:text-slate-900
                  hover:from-slate-800 hover:to-slate-700 dark:hover:from-white dark:hover:to-slate-100
                  shadow-md shadow-slate-900/10 dark:shadow-slate-100/10
                  hover:shadow-lg hover:shadow-slate-900/20 dark:hover:shadow-slate-100/20
                  border-0
                  transition-all duration-300
                  font-medium
                  group
                "
              >
                <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                Add New Visit
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-10">
          <FilterBar
            timeFilter={timeFilter}
            schoolFilter={schoolFilter}
            mentorFilter={mentorFilter}
            schools={schools}
            mentors={mentors}
            onTimeFilterChange={setTimeFilter}
            onSchoolFilterChange={setSchoolFilter}
            onMentorFilterChange={setMentorFilter}
          />
        </div>

        {/* Dashboard Content */}
        {summaryLoading ? (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="h-40 rounded-2xl bg-gradient-to-br from-slate-200/60 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-700/60"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="h-36 rounded-2xl bg-gradient-to-br from-slate-200/60 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-700/60"
                  style={{ animationDelay: `${(i + 4) * 100}ms` }}
                />
              ))}
            </div>
          </div>
        ) : summary ? (
          <div className="space-y-10">
            <DashboardStats summary={summary} />
            <ProgramBreakdown summary={summary} />
            
            {/* Visit Frequency Chart - Hidden on mobile */}
            <div className="hidden md:block">
              {frequencyLoading ? (
                <Skeleton className="h-[700px] rounded-2xl bg-gradient-to-br from-slate-200/60 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-700/60" />
              ) : visitFrequency ? (
                <VisitFrequencyChart data={visitFrequency} />
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Visit Form Dialog */}
        {schools && (
          <MentorVisitFormDialog
            open={isFormDialogOpen}
            onOpenChange={setIsFormDialogOpen}
            schools={schools}
            onSuccess={() => {
              // Refresh dashboard data after successful submission
              mutate(`/api/summary?time=${timeFilter}&school=${schoolFilter}&mentor=${mentorFilter}`);
              mutate(`/api/visit-frequency?time=${timeFilter}&school=${schoolFilter}&mentor=${mentorFilter}`);
            }}
          />
        )}
      </div>
    </div>
  );
}
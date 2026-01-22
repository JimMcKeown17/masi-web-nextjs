// components/mentors/RecentVisitsTable.tsx
'use client';

import { RecentVisit } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface RecentVisitsTableProps {
  visits: RecentVisit[];
}

// Map program types to badge colors
const programColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  literacy: 'default',
  yebo: 'secondary',
  stories: 'outline',
  numeracy: 'destructive',
};

// Format date to be more readable
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format quality rating with visual indicator
function QualityRating({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="text-slate-400 text-sm">N/A</span>;
  }

  // Color based on rating
  let colorClass = 'text-slate-600';
  if (rating >= 8) {
    colorClass = 'text-green-600 dark:text-green-400 font-semibold';
  } else if (rating >= 6) {
    colorClass = 'text-yellow-600 dark:text-yellow-400 font-medium';
  } else if (rating >= 4) {
    colorClass = 'text-orange-600 dark:text-orange-400 font-medium';
  } else {
    colorClass = 'text-red-600 dark:text-red-400 font-semibold';
  }

  return (
    <span className={`${colorClass} text-sm`}>
      {rating}/10
    </span>
  );
}

export function RecentVisitsTable({ visits }: RecentVisitsTableProps) {
  if (visits.length === 0) {
    return (
      <div className="
        relative rounded-2xl border border-slate-200/60 dark:border-slate-800/60
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
        p-12 text-center
      ">
        <p className="text-slate-600 dark:text-slate-400">
          No visits found for the selected filters.
        </p>
      </div>
    );
  }

  return (
    <div className="
      relative rounded-2xl border border-slate-200/60 dark:border-slate-800/60
      bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
      shadow-sm shadow-slate-200/50 dark:shadow-slate-900/50
      overflow-hidden
    ">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-slate-50/30 dark:from-slate-800/20 dark:to-slate-900/10 rounded-2xl pointer-events-none" />

      {/* Table header */}
      <div className="relative px-6 py-4 border-b border-slate-200/60 dark:border-slate-800/60">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Recent Visits
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Latest {visits.length} visit{visits.length !== 1 ? 's' : ''} across all programs
        </p>
      </div>

      {/* Scrollable table container */}
      <div className="relative overflow-auto max-h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-sm z-10">
            <TableRow className="hover:bg-transparent border-slate-200/60 dark:border-slate-700/60">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                Program
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                School
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                Mentor
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                Visit Date
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                Quality
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 min-w-[200px]">
                Comments
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visits.map((visit) => (
              <TableRow
                key={visit.id}
                className="
                  border-slate-200/40 dark:border-slate-800/40
                  hover:bg-slate-50/50 dark:hover:bg-slate-800/30
                  transition-colors duration-150
                "
              >
                <TableCell>
                  <Badge
                    variant={programColors[visit.program_type] || 'default'}
                    className="font-medium"
                  >
                    {visit.program_name}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300">
                  {visit.school_name}
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300">
                  {visit.mentor_name}
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {formatDate(visit.visit_date)}
                </TableCell>
                <TableCell className="text-center">
                  <QualityRating rating={visit.session_quality} />
                </TableCell>
                <TableCell className="text-slate-600 dark:text-slate-400 text-sm max-w-[300px]">
                  {visit.comments ? (
                    <div className="line-clamp-2" title={visit.comments}>
                      {visit.comments}
                    </div>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 italic">
                      No comments
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

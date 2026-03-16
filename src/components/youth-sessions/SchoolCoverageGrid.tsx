'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { School, CheckCircle, XCircle } from 'lucide-react';
import type { SchoolCoverageResponse } from '@/lib/types/youth-sessions';

interface SchoolCoverageGridProps {
  data: SchoolCoverageResponse;
}

export function SchoolCoverageGrid({ data }: SchoolCoverageGridProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '500ms', animationFillMode: 'backwards' }}>
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <School className="w-6 h-6 text-orange-500" />
          School Coverage
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Schools with and without sessions in the selected period
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm">
        <Tabs defaultValue="covered" className="w-full">
          <div className="border-b border-slate-200 dark:border-slate-700 px-4 pt-3">
            <TabsList className="bg-transparent h-auto p-0 gap-4">
              <TabsTrigger
                value="covered"
                className="data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 rounded-none px-1 pb-2.5 pt-1 font-medium text-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Covered ({data.covered.length})
              </TabsTrigger>
              <TabsTrigger
                value="uncovered"
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-500 data-[state=active]:text-red-700 dark:data-[state=active]:text-red-400 rounded-none px-1 pb-2.5 pt-1 font-medium text-sm bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Uncovered ({data.uncovered.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="covered" className="m-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 max-h-[400px] overflow-y-auto">
              {data.covered.map((school) => (
                <div
                  key={school.school_uid}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-950/10"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {school.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{school.type}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs rounded-lg">
                      {school.session_count} sessions
                    </Badge>
                  </div>
                </div>
              ))}
              {data.covered.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-500 dark:text-slate-400">
                  No schools covered in this period.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="uncovered" className="m-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 max-h-[400px] overflow-y-auto">
              {data.uncovered.map((school) => (
                <div
                  key={school.school_uid}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-red-100 dark:border-red-900/20 bg-red-50/20 dark:bg-red-950/10"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {school.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{school.type}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Last session</div>
                    <div className="text-xs font-medium text-red-600 dark:text-red-400">
                      {school.last_session_date || 'Never'}
                    </div>
                  </div>
                </div>
              ))}
              {data.uncovered.length === 0 && (
                <div className="col-span-full py-8 text-center text-emerald-600 dark:text-emerald-400">
                  All schools are covered in this period.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

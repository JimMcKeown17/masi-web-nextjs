'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import useSWR from 'swr';
import { getEtlStatus, getEtlPreview } from '@/lib/api/preview';
import type { EtlStatusResponse, EtlPreviewResponse } from '@/lib/api/preview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const TABLE_TABS = [
  { value: 'schools', label: 'Schools' },
  { value: 'youth', label: 'Youth' },
  { value: 'children', label: 'Children' },
  { value: 'staff', label: 'Staff' },
  { value: 'literacy-2026', label: 'Literacy 2026' },
  { value: 'numeracy-2026', label: 'Numeracy 2026' },
] as const;

// Column configs per table for the sample rows table
const TABLE_COLUMNS: Record<string, { key: string; label: string }[]> = {
  schools: [
    { key: 'school_uid', label: 'UID' },
    { key: 'name', label: 'Name' },
    { key: 'suburb', label: 'Suburb' },
    { key: 'school_number', label: '#' },
  ],
  youth: [
    { key: 'youth_uid', label: 'UID' },
    { key: 'full_name', label: 'Name' },
    { key: 'employee_id', label: 'Emp ID' },
    { key: 'employment_status', label: 'Status' },
    { key: 'job_title', label: 'Title' },
  ],
  children: [
    { key: 'child_uid', label: 'UID' },
    { key: 'full_name', label: 'Name' },
    { key: 'mcode', label: 'MCode' },
    { key: 'gender', label: 'Gender' },
    { key: 'school_2025', label: 'School 2025' },
    { key: 'grade_2025', label: 'Grade 2025' },
  ],
  staff: [
    { key: 'employee_number', label: '#' },
    { key: 'name', label: 'Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'email', label: 'Email' },
  ],
  'literacy-2026': [
    { key: 'session_date', label: 'Date' },
    { key: 'youth_uid', label: 'Youth UID' },
    { key: 'youth_name', label: 'Youth' },
    { key: 'school_uid', label: 'School UID' },
    { key: 'school_name', label: 'School' },
    { key: 'child_uid_1', label: 'Child 1 UID' },
    { key: 'child_1_name', label: 'Child 1' },
    { key: 'sounds_covered_clean', label: 'Sounds' },
    { key: 'blending_level', label: 'Blending' },
  ],
  'numeracy-2026': [
    { key: 'session_date', label: 'Date' },
    { key: 'youth_uid', label: 'Youth UID' },
    { key: 'youth_name', label: 'Youth' },
    { key: 'school_uid', label: 'School UID' },
    { key: 'school_name', label: 'School' },
    { key: 'children_count', label: 'Children' },
    { key: 'group_count_level', label: 'Count Level' },
    { key: 'group_number_recognition', label: 'Number Rec.' },
  ],
};

function formatSyncTime(iso: string | null): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function OrphanStatsBar({ stats }: { stats: Record<string, number> }) {
  // Group stats into pairs: resolved/orphaned
  const fields = Object.keys(stats)
    .filter((k) => k.endsWith('_resolved'))
    .map((k) => k.replace('_resolved', ''));

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {fields.map((field) => {
        const resolved = stats[`${field}_resolved`] || 0;
        const orphaned = stats[`${field}_orphaned`] || 0;
        const total = resolved + orphaned;
        const pct = total > 0 ? Math.round((resolved / total) * 100) : 0;
        return (
          <div key={field} className="flex items-center gap-2">
            <span className="text-sm font-medium capitalize">{field.replace('_', ' ')}:</span>
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {resolved}/{total} ({pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function EtlPreviewPage() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('schools');

  const statusFetcher = async () => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    return getEtlStatus(token);
  };

  const previewFetcher = async (key: string) => {
    const token = await getToken();
    if (!token) throw new Error('Not authenticated');
    const tableName = key.split('/').pop()!;
    return getEtlPreview(token, tableName);
  };

  const { data: status, error: statusError, isLoading: statusLoading } =
    useSWR<EtlStatusResponse>('etl-status', statusFetcher);

  const { data: preview, error: previewError, isLoading: previewLoading } =
    useSWR<EtlPreviewResponse>(`etl-preview/${activeTab}`, previewFetcher);

  const columns = TABLE_COLUMNS[activeTab] || [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">ETL Data Preview</h1>

      {/* Status cards */}
      {statusError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Failed to load ETL status.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {statusLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : status?.tables.map((t) => (
              <Card key={t.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {t.name.replace('-', ' ')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{t.record_count.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Synced: {formatSyncTime(t.last_sync)}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Table tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          {TABLE_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABLE_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            {previewError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to load preview data.</AlertDescription>
              </Alert>
            )}

            {previewLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : preview ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline">
                    {preview.record_count.toLocaleString()} records
                  </Badge>
                </div>

                {preview.orphan_stats && Object.keys(preview.orphan_stats).length > 0 && (
                  <OrphanStatsBar stats={preview.orphan_stats} />
                )}

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((col) => (
                          <TableHead key={col.key}>{col.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.sample_rows.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                            No data
                          </TableCell>
                        </TableRow>
                      ) : (
                        preview.sample_rows.map((row, i) => (
                          <TableRow key={i}>
                            {columns.map((col) => (
                              <TableCell key={col.key} className="text-sm">
                                {row[col.key] != null ? String(row[col.key]) : (
                                  <span className="text-muted-foreground">--</span>
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : null}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

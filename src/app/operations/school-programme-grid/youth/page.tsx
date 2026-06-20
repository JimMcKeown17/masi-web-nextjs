"use client";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { YouthGrid } from "@/components/school-programme/YouthGrid";
import { LeadershipBoard } from "@/components/school-programme/LeadershipBoard";
import {
  YearSelect,
  EmptyState,
  GridFilters,
  applyFilters,
  NoMatches,
} from "@/components/school-programme/shared";
import { useGrid } from "@/components/school-programme/useGrid";

export default function YouthStaffingPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [siteType, setSiteType] = useState("all");
  const [programme, setProgramme] = useState("all");
  const { data, error, isLoading, onCellEdit, onCellAdd, onCellRemove } = useGrid(year);

  const filtered = useMemo(
    () => (data ? applyFilters(data.schools, siteType, programme) : []),
    [data, siteType, programme],
  );

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Youth staffing</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Active vs planned youth per school &times; programme. <strong>Planned</strong> is typed
            by management as contracts are signed; <strong>active</strong> refreshes nightly. Colour
            shows the gap, so vacancies and over-hires surface at a glance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <GridFilters
            programmes={data?.programmes ?? []}
            siteType={siteType}
            setSiteType={setSiteType}
            programme={programme}
            setProgramme={setProgramme}
          />
          <YearSelect year={year} setYear={setYear} />
        </div>
      </header>

      {isLoading && <Skeleton className="h-96 w-full rounded-lg" />}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      )}
      {data &&
        (data.schools.length === 0 ? (
          <EmptyState year={year} />
        ) : filtered.length === 0 ? (
          <NoMatches />
        ) : (
          <>
            <LeadershipBoard grid={{ ...data, schools: filtered }} />
            <div className="mt-6">
              <Legend />
            </div>
            <YouthGrid
              grid={{ ...data, schools: filtered }}
              canEdit
              onCellEdit={onCellEdit}
              onCellAdd={onCellAdd}
              onCellRemove={onCellRemove}
            />
            <Roster roster={data.roster} />
          </>
        ))}
    </div>
  );
}

function Legend() {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
      <span>Each cell: active / planned.</span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-emerald-100" /> on target
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-amber-100" /> over-hire
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-red-100" /> vacancy
      </span>
    </div>
  );
}

function Roster({ roster }: { roster: Record<string, number> }) {
  const entries = Object.entries(roster);
  if (entries.length === 0) return null;
  return (
    <div className="mt-6 max-w-md rounded-lg border p-4">
      <h2 className="text-sm font-semibold">Site-unassigned youth (off-grid)</h2>
      <p className="mb-2 text-xs text-muted-foreground">
        Roam all programmes / no fixed school. Count in org youth totals, occupy no grid cell.
      </p>
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([title, count]) => (
            <tr key={title} className="border-t">
              <td className="py-1.5">{title}</td>
              <td className="py-1.5 text-right font-medium tabular-nums">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

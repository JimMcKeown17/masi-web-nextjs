"use client";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChildrenGrid } from "@/components/school-programme/ChildrenGrid";
import {
  YearSelect,
  EmptyState,
  GridFilters,
  applyFilters,
  NoMatches,
} from "@/components/school-programme/shared";
import { useGrid } from "@/components/school-programme/useGrid";

export default function ChildrenServedPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [siteType, setSiteType] = useState("all");
  const [programme, setProgramme] = useState("all");
  const { data, error, isLoading, onCellEdit, onStatsEdit, onCellAdd, onCellRemove } =
    useGrid(year);

  const filtered = useMemo(
    () => (data ? applyFilters(data.schools, siteType, programme) : []),
    [data, siteType, programme],
  );

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Children served</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Distinct children per school &times; programme. Grey cells compute nightly;
            dashed cells are typed by management. Leads with <strong>Unique</strong> (deduped
            children); <strong>Total</strong> sums every programme column.
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

      <Legend />

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
          <ChildrenGrid
            grid={{ ...data, schools: filtered }}
            canEdit
            onCellEdit={onCellEdit}
            onStatsEdit={onStatsEdit}
            onCellAdd={onCellAdd}
            onCellRemove={onCellRemove}
          />
        ))}
    </div>
  );
}

function Legend() {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded bg-muted ring-1 ring-border" /> computed (read-only)
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-3 w-4 border-b border-dashed border-muted-foreground/60" /> manual
        (click to edit)
      </span>
    </div>
  );
}

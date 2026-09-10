"use client";
import type { FinanceRunMetadata, FinanceRunStatus } from "@/lib/types/finance-runs";

export function FinanceRunSelector({ year, showYear = true, status, selectedId, selectedRun, runs, currentId, disabled, onYearChange, onStatusChange, onRunChange }: {
  year: number; showYear?: boolean; status: FinanceRunStatus | ""; selectedId: string;
  selectedRun?: FinanceRunMetadata; runs: FinanceRunMetadata[]; currentId?: string; disabled?: boolean;
  onYearChange: (year: number) => void; onStatusChange: (status: FinanceRunStatus | "") => void; onRunChange: (id: string) => void;
}) {
  const options = selectedRun && !runs.some((run) => run.id === selectedRun.id) ? [selectedRun, ...runs] : runs;
  const inputClass = "mt-1 w-full rounded-md border bg-background p-2 text-sm";
  return (
    <section aria-label="Browse finance runs" className="space-y-3">
      <div className={showYear ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "grid gap-4"}>
        {showYear ? <label>Accounting year
          <input type="number" min={1} max={32767} value={year} className={inputClass} onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isInteger(next) && next >= 1 && next <= 32767) onYearChange(next);
          }} />
        </label> : null}
        <label>Import status
          <select value={status} disabled={disabled} className={inputClass} onChange={(event) => onStatusChange(event.target.value as FinanceRunStatus | "")}>
            <option value="">All statuses</option>
            {(["candidate", "approved", "superseded", "failed"] as const).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>Import
          <select aria-label="Import" value={selectedId} disabled={disabled} className={inputClass} onChange={(event) => onRunChange(event.target.value)}>
            <option value="">Select an import</option>
            {selectedId && !options.some((run) => run.id === selectedId) ? <option value={selectedId}>Selected run (loading)</option> : null}
            {options.map((run) => <option key={run.id} value={run.id}>{run.id === currentId ? "Current approved" : run.status}: {run.source_name} ({run.id})</option>)}
          </select>
        </label>
      </div>
      <p className="text-sm text-muted-foreground">The dashboard uses the approved import. New imports await review and approval.</p>
    </section>
  );
}

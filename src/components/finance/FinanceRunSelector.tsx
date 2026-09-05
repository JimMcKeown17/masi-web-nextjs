"use client";
import type { FinanceRunMetadata, FinanceRunStatus } from "@/lib/types/finance-runs";

export function FinanceRunSelector({ year, status, selectedId, selectedRun, runs, currentId, disabled, onYearChange, onStatusChange, onRunChange }: {
  year: number; status: FinanceRunStatus | ""; selectedId: string;
  selectedRun?: FinanceRunMetadata; runs: FinanceRunMetadata[]; currentId?: string; disabled?: boolean;
  onYearChange: (year: number) => void; onStatusChange: (status: FinanceRunStatus | "") => void; onRunChange: (id: string) => void;
}) {
  const options = selectedRun && !runs.some((run) => run.id === selectedRun.id) ? [selectedRun, ...runs] : runs;
  const inputClass = "mt-1 w-full rounded-md border bg-background p-2 text-sm";
  return (
    <section aria-label="Browse finance runs" className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label>Accounting year
          <input type="number" min={1} max={32767} value={year} disabled={disabled} className={inputClass} onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isInteger(next) && next >= 1 && next <= 32767) onYearChange(next);
          }} />
        </label>
        <label>Run status
          <select value={status} disabled={disabled} className={inputClass} onChange={(event) => onStatusChange(event.target.value as FinanceRunStatus | "")}>
            <option value="">All statuses</option>
            {(["candidate", "approved", "superseded", "failed"] as const).map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label>Run
          <select value={selectedId} disabled={disabled} className={inputClass} onChange={(event) => onRunChange(event.target.value)}>
            <option value="">Select a run</option>
            {selectedId && !options.some((run) => run.id === selectedId) ? <option value={selectedId}>Selected run (loading)</option> : null}
            {options.map((run) => <option key={run.id} value={run.id}>{run.id === currentId ? "Current approved" : run.status}: {run.source_name} ({run.id})</option>)}
          </select>
        </label>
      </div>
      <p className="text-sm text-muted-foreground">Reader figures use only the current approved run. Candidates and failed runs are visible to every publisher for review.</p>
    </section>
  );
}

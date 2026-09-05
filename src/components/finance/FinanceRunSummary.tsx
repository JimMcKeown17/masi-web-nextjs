"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FinanceRun, FinanceRunAction, FinanceRunFinding } from "@/lib/types/finance-runs";

export function FinanceRunSummary({ run, currentId, currentRun, disabled, onAction }: {
  run: FinanceRun; currentId?: string; currentRun?: FinanceRun; disabled?: boolean; onAction: (action: FinanceRunAction) => void;
}) {
  const groups = new Map<string, FinanceRunFinding[]>();
  for (const severity of ["error", "warn", "info"]) {
    for (const inScope of [true, false]) {
      const findings = (run.payload?.findings ?? []).filter((finding) => finding.severity === severity && finding.in_scope_year === inScope);
      if (findings.length) groups.set(`${severity} · ${inScope ? "In" : "Outside"} ${run.accounting_year}`, findings);
    }
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-3 font-serif text-2xl">Run summary <Badge variant="outline">{run.id === currentId ? "Current approved" : run.status}</Badge></CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="break-all text-sm">Run: {run.id}</p>
        <div className="grid gap-6 md:grid-cols-2">
          <SourceFacts title={`${run.status === "candidate" ? "Candidate" : "Selected run"} source`} run={run} />
          {currentRun ? <SourceFacts title="Current approved source" run={currentRun} /> : <p className="text-sm text-muted-foreground">Current approved source details unavailable.</p>}
        </div>
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries({ Producer: `${run.manifest.producer.name} ${run.producer_version ?? "unknown (imported)"}`, Schema: run.schema_version,
            "Parse duration": `${run.parse_duration_ms} ms`, "Total duration": `${run.total_duration_ms} ms`,
            "Peak Python allocation": `${run.peak_memory_bytes} bytes`, "Ledger rows": run.fact_row_count,
            Allocations: run.allocation_count, Findings: run.finding_count, "In-scope errors": run.in_scope_error_count,
          }).map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd>{value}</dd></div>)}
        </dl>
        {run.schema_version === "1.0.0" ? <p>Imported snapshot: ledger facts and original producer version are unavailable.</p> : null}
        {run.failure ? <div role="alert" className="rounded-md border p-4"><strong>Failed run: {run.failure.code}</strong><p>{run.failure.phase}: {run.failure.message}</p><p>This run cannot be approved.</p></div> : null}
        <section aria-label="Findings" className="space-y-4">
          <h3 className="font-semibold">Findings</h3>
          {groups.size === 0 ? <p>{run.status === "failed" ? "Findings unavailable because processing failed." : "No findings."}</p> : null}
          {[...groups].map(([label, findings]) => <div key={label} className="rounded-md border p-4">
            <h4 className="font-medium">{label} ({findings.length})</h4>
            <ul className="mt-2 space-y-3">{findings.map((finding, index) => <li key={index} className="break-words text-sm">
              <Badge variant="outline">{finding.code}</Badge> {finding.message}
              {finding.sheet_row != null ? <span> (row {finding.sheet_row})</span> : null}
              {finding.source != null ? <div className="text-muted-foreground">Source: {typeof finding.source === "string" ? finding.source : JSON.stringify(finding.source)}</div> : null}
            </li>)}</ul>
          </div>)}
        </section>
        <div className="flex flex-wrap gap-3">
          {run.allowed_actions.includes("approve") && (run.status === "candidate" || run.status === "superseded") ? <Button disabled={disabled} onClick={() => onAction("approve")}>{run.status === "superseded" ? "Re-approve" : "Approve"}</Button> : null}
          {run.allowed_actions.includes("demote") && run.id === currentId && run.status === "approved" && run.previous_approved ? <Button variant="outline" disabled={disabled} onClick={() => onAction("demote")}>Demote</Button> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function SourceFacts({ title, run }: { title: string; run: FinanceRun }) {
  return <section className="min-w-0 space-y-1 text-sm"><h3 className="font-semibold">{title}</h3>
    <p className="break-words">Name: {run.source_name}</p><p>Date: {run.source_date}</p>
    <p className="break-all">SHA-256: {run.source_sha256}</p><p>Size: {run.source_size_bytes} bytes</p>
    <p>Client modified: {run.manifest.source.client_modified_at ?? "Unavailable"}</p><p>Uploaded: {run.uploaded_at}</p>
    <p>Approved: {run.approved_at ?? "Not approved"}</p>
  </section>;
}

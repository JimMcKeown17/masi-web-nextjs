"use client";

import {useAuth} from "@clerk/nextjs";
import {useUser} from "@/components/providers/UserProvider";
import {canAccessFinance} from "@/lib/finance/access";
import { FinanceBudgets } from "@/components/finance/FinanceBudgetsPage";
import { FinanceExportButtons } from "@/components/finance/FinanceExportButtons";
import { useState } from "react";

import { HygienePanel } from "@/components/finance/HygienePanel";
import { ProvenanceStrip } from "@/components/finance/ProvenanceStrip";
import { useFinanceSnapshot } from "@/components/finance/useFinanceSnapshot";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinanceFixPage() {
  const {userId}=useAuth();const user=useUser();
  if(!userId||!canAccessFinance(user?.capabilities))return <p role="alert">Finance read access is required.</p>;
  return <FinanceFixSession key={userId}/>;
}
function FinanceFixSession() {
  const [kind,setKind]=useState("funders");
  const [year,setYear]=useState(new Date().getFullYear());
  return <div className="space-y-4"><div className="flex flex-wrap gap-4"><label>Finding kind<select className="ml-2 rounded border bg-background p-2" value={kind} onChange={event=>setKind(event.target.value)}><option value="funders">Funders</option><option value="budgets">Budgets</option></select></label><label>Accounting year<input className="ml-2 rounded border bg-background p-2" type="number" min={1} max={32767} value={year} onChange={event=>{const n=Number(event.target.value);if(Number.isInteger(n)&&n>0&&n<=32767)setYear(n);}}/></label></div>{kind==="budgets" ? <FinanceBudgets key={`${kind}:${year}`} findingsOnly year={year}/> : <FundersFix key={`${kind}:${year}`} year={year}/>}</div>;
}
function FundersFix({year}:{year:number}) {
  const [severity,setSeverity]=useState("");
  const [includeOutOfScope, setIncludeOutOfScope] = useState(false);
  const { data, error, isLoading } = useFinanceSnapshot(year);
  const findings=(data?.snapshot.findings??[]).filter(f=>(!severity||f.severity===severity)&&(includeOutOfScope||f.in_scope_year));

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Fix</h1>
          <p className="text-sm text-muted-foreground">
            Workbook findings that need review. The default view is limited to the accounting year.
          </p>
        </div>
        {data ? (
          <Button
            type="button"
            variant="outline"
            aria-pressed={includeOutOfScope}
            onClick={() => setIncludeOutOfScope((current) => !current)}
          >
            {includeOutOfScope ? `Show ${data.accounting_year} only` : "Include historical findings"}
          </Button>
        ) : null}
      </header>

      {isLoading ? <Skeleton className="h-64 w-full rounded-xl" aria-label="Loading finance snapshot" /> : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      ) : null}
      {data ? (
        <>
          <ProvenanceStrip response={data} />
          <label>Severity<select className="ml-2 rounded border bg-background p-2" value={severity} onChange={event=>setSeverity(event.target.value)}><option value="">All severities</option>{["error","warn","info"].map(value=><option key={value}>{value}</option>)}</select></label>
          <FinanceExportButtons name="funder-findings" rows={[["Kind","Year","Severity","Scope","Code","Message","Contract","Line","Row","Amount","Amount in year"],...findings.map(f=>["funders",String(year),f.severity,f.in_scope_year?"In year":"Outside year",f.code,f.message,f.contract_id??"",f.line_id??"",String(f.sheet_row??""),f.amount??"unavailable",f.amount_in_year??"unavailable"])]}/>

          <HygienePanel
            findings={findings}
            accountingYear={data.accounting_year}
            includeOutOfScope={includeOutOfScope}
          />
        </>
      ) : null}
    </div>
  );
}

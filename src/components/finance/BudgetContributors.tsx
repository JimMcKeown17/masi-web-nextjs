"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import { useUser } from "@/components/providers/UserProvider";
import { canAccessFinance } from "@/lib/finance/access";
import {
  financeRunsCacheKey,
  financePageCursor,
  getFinanceRunRows,
  exportFinanceRunRows,
} from "@/lib/api/finance-runs";
import { downloadFinanceBlob } from "@/lib/finance/export";
import { formatRand } from "@/lib/finance/money";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { BudgetLine } from "@/lib/types/finance-budgets";
export function BudgetContributors({
  line,
  runId,
  year,
}: {
  line: BudgetLine;
  runId: string;
  year: number;
}) {
  const { userId, getToken } = useAuth();
  const user = useUser();
  if (!userId || !canAccessFinance(user?.capabilities))
    return <p role="alert">Finance read access is required.</p>;
  return (
    <ContributorsSession
      key={`${userId}:${runId}:${year}:${line.id}`}
      line={line}
      runId={runId}
      year={year}
      userId={userId}
      getToken={getToken}
    />
  );
}
function ContributorsSession({
  line,
  runId,
  year,
  userId,
  getToken,
}: {
  line: BudgetLine;
  runId: string;
  year: number;
  userId: string;
  getToken: () => Promise<string | null>;
}) {
  const [cursor, setCursor] = useState<string>();
  const [ordering, setOrdering] = useState("date");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const active = useRef(true);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const bc = String(line.bc);
  async function token() {
    const value = await getToken();
    if (!value || !active.current)
      throw new Error("Session changed. Sign in again.");
    return value;
  }
  const result = useSWR(
    financeRunsCacheKey(
      userId,
      `rows:budgets:${runId}:${year}:${JSON.stringify(bc)}:${ordering}:${cursor ?? ""}`,
    ),
    async () => getFinanceRunRows(await token(), runId, { year, bc, cursor, ordering }),
  );
  async function download(format: "csv" | "xlsx") {
    setExporting(true);
    setExportError("");
    try {
      const blob = await exportFinanceRunRows(
        await token(),
        runId,
        { year, bc, ordering },
        format,
      );
      if (active.current)
        downloadFinanceBlob(blob, `budget-contributors-${runId}.${format}`);
    } catch {
      if (active.current)
        setExportError("Contributor export failed. Retry the download.");
    } finally {
      if (active.current) setExporting(false);
    }
  }
  return (
    <section className="min-w-0 space-y-5" aria-label="Budget contributors">
      <h2 className="sr-only">Contributors for {line.label}</h2>
      <div className="grid grid-cols-1 gap-3 rounded-lg bg-muted/50 p-4 min-[420px]:grid-cols-3">
        {(
          [
            ["Annual budget", line.budget],
            ["Actual expenditure", line.actual],
            ["Projected expenditure", line.projected],
          ] as const
        ).map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 break-words text-lg font-medium tabular-nums">
              {formatRand(value, "Unavailable")}
            </p>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Full ledger amounts before budget share. Applied share:{" "}
        <strong className="font-medium text-foreground">
          {line.actual_share}
        </strong>
        . BC: {bc}. The line's actual expenditure above includes its applied
        share; expense rows below show the original full amounts.
      </p>
      {result.isLoading ? <p role="status">Loading contributors…</p> : null}
      {result.error ? (
        <p role="alert">
          Could not load contributors.{" "}
          <Button onClick={() => void result.mutate()}>
            Retry contributors
          </Button>
        </p>
      ) : null}
      {result.data && !result.error ? (
        <>
          <details className="rounded-md border p-3 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium">
              Expense source details
            </summary>
            <p className="mt-2 break-all">
              Pinned ledger: {result.data.ledger_run_id}. Management Accounts
              SHA-256: {result.data.management_accounts_sha256}
            </p>
          </details>
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  "Date",
                  "Description",
                  "Full amount",
                  "Paid by",
                  "Category 1",
                  "Category 2",
                  "Category 3",
                  "BC",
                  "Source row",
                ].map((h,index) => {
                  const field = ["date","description","amount","paid_by","category_1","category_2","category_3","bc","sheet_row"][index];
                  const selected = ordering.replace(/^-/, "") === field;
                  return <TableHead key={h} aria-sort={selected ? ordering.startsWith("-") ? "descending" : "ascending" : "none"}>
                    <button type="button" className="inline-flex items-center gap-1 rounded py-2 text-left hover:text-foreground focus-visible:outline-2" onClick={() => {
                      setCursor(undefined);
                      setOrdering(selected && !ordering.startsWith("-") ? `-${field}` : field);
                    }}>{h}<span aria-hidden="true">{selected ? ordering.startsWith("-") ? "↓" : "↑" : "↕"}</span></button>
                  </TableHead>;
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.data.results.map((row) => (
                <TableRow key={row.row_key}>
                  {[
                    row.date,
                    row.description,
                    formatRand(row.amount),
                    row.paid_by,
                    row.category_1,
                    row.category_2,
                    row.category_3,
                    row.bc,
                    row.sheet_row,
                  ].map((cell, i) => (
                    <TableCell
                      className={
                        i === 2
                          ? "text-right tabular-nums"
                          : "max-w-64 whitespace-normal"
                      }
                      key={i}
                    >
                      {cell ?? ""}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {result.data.results.length === 0 ? (
            <p>No contributors for this BC and year.</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!result.data.previous}
              onClick={() =>
                setCursor(financePageCursor(result.data!.previous))
              }
            >
              Previous contributors
            </Button>
            <Button
              disabled={!result.data.next}
              onClick={() => setCursor(financePageCursor(result.data!.next))}
            >
              Next contributors
            </Button>
          </div>
        </>
      ) : null}
      <p className="text-xs text-muted-foreground">These exports include staff salary information where present.</p>
      <div className="flex flex-wrap gap-2">
        {(["csv", "xlsx"] as const).map((format) => (
          <Button
            key={format}
            variant="outline"
            disabled={exporting || Boolean(result.error) || !result.data}
            onClick={() => void download(format)}
          >
            Download contributors {format.toUpperCase()}
          </Button>
        ))}
      </div>
      {exportError ? <p role="alert">{exportError}</p> : null}
    </section>
  );
}

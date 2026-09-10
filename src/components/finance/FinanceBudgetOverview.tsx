"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";
import type {
  BudgetHierarchy,
  BudgetInsights,
  BudgetLine,
  BudgetNode,
  BudgetPayload,
} from "@/lib/types/finance-budgets";
import type {
  FinanceCurrent,
  FinanceRunManifest,
} from "@/lib/types/finance-runs";
import { formatRand } from "@/lib/finance/money";
import { financeCurrentMessage } from "@/lib/finance/currentMessage";
import { BudgetContributors } from "./BudgetContributors";
import { BudgetOrganisationOutlook } from "./BudgetOrganisationOutlook";
import { BudgetSpendingComposition } from "./BudgetSpendingComposition";
import { BudgetVarianceComparison } from "./BudgetVarianceComparison";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

function varianceLabel(value: string | null) {
  if (value === null) return "Projection unavailable";
  if (/^-?0\.0+$/.test(value)) return "On budget";
  return value.startsWith("-")
    ? "Projected under budget"
    : "Projected over budget";
}

function Variance({ row, metric }: { row: BudgetNode; metric: "variance_all" | "variance_masi" }) {
  const value = row[metric];
  if (metric === "variance_masi" && "wf" in row && (row as BudgetLine).wf?.toUpperCase() === "X") return <p className="text-right text-xs text-muted-foreground">Excluded from Masi comparison</p>;
  const tone =
    value === null || /^-?0\.0+$/.test(value)
      ? "text-muted-foreground"
      : value.startsWith("-")
        ? "text-[#1D4ED8] dark:text-blue-300"
        : "text-[#C81E3C] dark:text-rose-300";
  return (
    <div className={`text-right ${tone}`}>
      <p className="font-semibold tabular-nums">
        {formatRand(value, "Unavailable")}
      </p>
      <p className="text-xs">{varianceLabel(value)}</p>
    </div>
  );
}

function Amount({
  row,
  metric,
}: {
  row: BudgetNode;
  metric: "projected" | "budget";
}) {
  return (
    <div className="tabular-nums">
      <p>{formatRand(row[metric], "Unavailable")}</p>
      {row[metric] === null && "known_subtotals" in row ? (
        <p className="text-xs text-muted-foreground">
          Known subtotal:{" "}
          {formatRand(
            (row as BudgetHierarchy).known_subtotals[metric],
            "Unavailable",
          )}
        </p>
      ) : null}
    </div>
  );
}

export function FinanceBudgetOverview({
  payload,
  manifest,
  runId,
  compatibility,
  insights,
}: {
  payload: BudgetPayload;
  manifest: FinanceRunManifest;
  runId: string;
  compatibility?: FinanceCurrent;
  insights?: BudgetInsights | null;
}) {
  const [metric, setMetric] = useState<"variance_all" | "variance_masi">("variance_masi");
  const missingActuals = payload.lines.filter(line => line.actual === null);
  const formulaFindings = payload.findings.filter(finding => finding.code === "BUDGET_ROLLUP_FORMULA_MISMATCH");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<BudgetLine>();
  const departmentTrigger = useRef<HTMLElement | null>(null);
  const expenseTrigger = useRef<HTMLButtonElement | null>(null);
  const departmentHeading = useRef<HTMLHeadingElement | null>(null);
  useLayoutEffect(() => {
    if (expanded) departmentHeading.current?.focus();
  }, [expanded]);
  const boundInsights =
    insights?.version === "1.0.0" &&
    insights.run_id === runId &&
    insights.accounting_year === manifest.accounting_year &&
    insights.sheet_as_of === payload.projection.sheet_as_of &&
    manifest.dependencies.some(
      (dependency) => dependency.run_id === insights.ledger_run_id,
    )
      ? insights
      : undefined;
  const departments = payload.hierarchy.filter((row) => row.parent_id === null);
  function exploreDepartment(department: BudgetHierarchy) {
    departmentTrigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setSelectedLine(undefined);
    if (expanded === department.id) departmentHeading.current?.focus();
    else setExpanded(department.id);
  }

  return (
    <Sheet
      open={Boolean(selectedLine)}
      onOpenChange={(open) => {
        if (!open) setSelectedLine(undefined);
      }}
    >
      <section
        aria-label="Projected expenditure overview"
        className="space-y-4"
      >
        <BudgetOrganisationOutlook
          insights={boundInsights}
          unbudgetedCount={payload.summary.orphan_count}
        />
        <p className="text-xs text-muted-foreground">Approved budget: {manifest.source.date} · Management Accounts: {manifest.dependencies[0]?.source_date ?? "See source details"}</p>
        {compatibility && !compatibility.compatible ? (
          <p
            role="status"
            className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm"
          >
            {financeCurrentMessage(compatibility)}
          </p>
        ) : null}
        {missingActuals.length > 0 ? <details className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium">{missingActuals.length} budget {missingActuals.length === 1 ? "line needs" : "lines need"} expense codes to complete the all-funds forecast</summary>
          <p className="mt-3 text-muted-foreground">These lines cannot be matched to Management Accounts. Add the correct BC code in column E, then refresh and approve the budget. A missing link is different from a linked line with no spending.</p>
          <ul className="mt-3 space-y-2">{missingActuals.map(line => <li key={line.id}><strong>{line.label}</strong> · {manifest.accounting_year} Budget!E{line.sheet_row}{line.wf?.toUpperCase() === "X" ? <span className="block text-xs text-muted-foreground">Excluded from the Masi comparison, so it does not block the Masi variance.</span> : null}</li>)}</ul>
        </details> : null}
        <div className="rounded-xl border bg-card p-3 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-serif text-2xl">Projected over / underspend</h2>
              <p className="mt-1 text-xs text-muted-foreground">{metric === "variance_masi" ? "Masi comparison · Column N · Excludes WF-marked projects" : "All funds · Column M · Includes every budget line"}</p>
            </div>
            <label className="text-xs text-muted-foreground">Compare <select aria-label="Variance basis" className="ml-2 rounded-md border bg-background p-2 text-foreground" value={metric} onChange={event => setMetric(event.target.value as typeof metric)}><option value="variance_masi">Masi</option><option value="variance_all">All funds</option></select></label>
          </div>
          <BudgetVarianceComparison departments={departments} metric={metric} onSelect={exploreDepartment} />
          <p className="mt-3 border-t pt-3 text-xs text-muted-foreground">Based on the workbook’s reporting date: {payload.projection.sheet_as_of} (cell L1).</p>
        </div>
        {formulaFindings.length > 0 ? <details className="rounded-lg border px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium">{formulaFindings.length} workbook variance formulas differ from the budget rules</summary>
          <p className="mt-3 text-muted-foreground">The website adds the budget lines using the workbook’s hierarchy and WF markers. These cells select different lines or contain typed overrides, so their spreadsheet totals may differ. A typed zero may be intentional; review its meaning before replacing it. They do not cause the missing expense links above.</p>
          <ul className="mt-3 space-y-2">{formulaFindings.map((finding,index) => <li key={index}>{finding.source_cells.join(", ")}</li>)}</ul>
        </details> : null}
        {expanded ? (
          <div className="overflow-hidden rounded-xl border bg-card">
            <div
              className="hidden grid-cols-[minmax(0,1.3fr)_1fr_1fr_1.1fr] gap-4 border-b bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid"
              aria-hidden="true"
            >
              <span>Department</span>
              <span>Projected year-end</span>
              <span>Annual budget</span>
              <span className="text-right">Projected over / under</span>
            </div>
            {departments
              .filter((department) => department.id === expanded)
              .map((department) => {
                const isExpanded = expanded === department.id;
                const lines = payload.lines.filter((line) =>
                  department.line_ids.includes(line.id),
                );
                return (
                  <div key={department.id} className="border-b last:border-b-0">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={`overview-department-${department.id}`}
                      onClick={() => {
                        setExpanded(isExpanded ? null : department.id);
                        if (isExpanded) departmentTrigger.current?.focus();
                        setSelectedLine(undefined);
                      }}
                      className="grid w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1D4ED8] sm:px-5 md:grid-cols-[minmax(0,1.3fr)_1fr_1fr_1.1fr] md:items-center md:gap-4"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        {isExpanded ? (
                          <ChevronDown
                            className="size-4 shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronRight
                            className="size-4 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        {department.label}
                      </span>
                      <div>
                        <span className="text-xs text-muted-foreground md:sr-only">
                          Projected year-end
                        </span>
                        <Amount row={department} metric="projected" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground md:sr-only">
                          Annual budget
                        </span>
                        <Amount row={department} metric="budget" />
                      </div>
                      <Variance row={department} metric={metric} />
                    </button>
                    {isExpanded ? (
                      <div
                        id={`overview-department-${department.id}`}
                        className="border-t bg-muted/15 px-4 py-3 sm:px-5"
                      >
                        <h3
                          ref={departmentHeading}
                          tabIndex={-1}
                          className="mb-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
                        >
                          {department.label}: budget lines
                        </h3>
                        <p className="mb-3 text-xs text-muted-foreground">
                          Select a line to inspect its source expenses. Amounts
                          and projections follow the approved workbook
                          calculation.
                        </p>
                        {lines.map((line) => (
                          <div
                            key={line.id}
                            className="grid gap-2 border-t py-3 md:grid-cols-[minmax(0,1.3fr)_1fr_1fr_1.1fr] md:items-center md:gap-4"
                          >
                            <div>
                              <p className="font-medium">{line.label}</p>
                              {line.bc !== null ? (
                                <button
                                  type="button"
                                  className="mt-1 inline-flex items-center gap-1 text-sm text-[#1D4ED8] underline-offset-4 hover:underline focus-visible:outline-2 dark:text-blue-300"
                                  onClick={(event) => {
                                    expenseTrigger.current =
                                      event.currentTarget;
                                    setSelectedLine(line);
                                  }}
                                >
                                  View expenses for {line.label}
                                  <ArrowUpRight
                                    aria-hidden="true"
                                    className="size-3"
                                  />
                                </button>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  No ledger binding
                                </p>
                              )}
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground md:sr-only">
                                Projected year-end
                              </span>
                              <Amount row={line} metric="projected" />
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground md:sr-only">
                                Annual budget
                              </span>
                              <Amount row={line} metric="budget" />
                            </div>
                            <Variance row={line} metric={metric} />
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            {departments.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">
                No departments are available in this approved budget.
              </p>
            ) : null}
          </div>
        ) : null}
        <SheetContent
          className="w-full overflow-y-auto motion-reduce:animate-none motion-reduce:transition-none sm:max-w-4xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            expenseTrigger.current?.focus();
          }}
        >
          <SheetHeader className="border-b px-5 pb-5 pr-12 pt-6">
            <SheetTitle className="font-serif text-2xl">
              {selectedLine?.label ?? "Budget expenses"}
            </SheetTitle>
            <SheetDescription>
              Actual expenditure behind this budget line, from its pinned
              Management Accounts source.
            </SheetDescription>
          </SheetHeader>
          {selectedLine ? (
            <div className="px-5 pb-6">
              <BudgetContributors
                key={`${runId}:${selectedLine.id}`}
                line={selectedLine}
                runId={runId}
                year={manifest.accounting_year}
              />
            </div>
          ) : null}
        </SheetContent>
        {boundInsights ? (
          <BudgetSpendingComposition
            composition={boundInsights.composition}
            departments={departments}
            onSelect={exploreDepartment}
          />
        ) : null}
        <details className="rounded-lg border px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium">
            Calculation and source details
          </summary>
          <div className="mt-3 space-y-2 break-words text-muted-foreground">
            <p>
              Each line follows the workbook: Calc B uses its budget; Y
              annualises expenditure over 11 months; other lines use 12. The
              calculation uses month {payload.projection.month_count} from the
              sheet’s as-of date.
            </p>
            <p>
              Positive variance is projected overspend. Masi uses column N and excludes WF X lines; All funds uses column M. All amounts are the
              approved calculation, including its rounding. Incomplete figures
              are never treated as zero.
            </p>
            <p>Expected income is the workbook’s Expected Value forecast, including its typed overrides and saved formula results. It is imported with this budget. {boundInsights?.outlook?.income_source ? `Income total: ${boundInsights.outlook.income_source}.` : ""}</p>
            <p>
              Budget source: {manifest.source.name} · {manifest.source.date}
            </p>
            <p className="break-all">Budget run: {runId}</p>
            <p className="break-all">
              Budget source SHA-256: {manifest.source.sha256}
            </p>
            {manifest.dependencies.map((dependency, index) => (
              <div key={index}>
                <p className="break-all">Pinned ledger: {dependency.run_id}</p>
                <p>
                  {dependency.source_name} · {dependency.source_date}
                </p>
                <p className="break-all">
                  Management Accounts SHA-256: {dependency.source_sha256}
                </p>
              </div>
            ))}
          </div>
        </details>
      </section>
    </Sheet>
  );
}

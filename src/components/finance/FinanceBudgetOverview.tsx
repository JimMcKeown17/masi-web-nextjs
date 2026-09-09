"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";
import type {
  BudgetHierarchy,
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

function Variance({ row }: { row: BudgetNode }) {
  const value = row.variance_all;
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
}: {
  payload: BudgetPayload;
  manifest: FinanceRunManifest;
  runId: string;
  compatibility?: FinanceCurrent;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<BudgetLine>();
  const departmentTrigger = useRef<HTMLElement | null>(null);
  const expenseTrigger = useRef<HTMLButtonElement | null>(null);
  const departmentHeading = useRef<HTMLHeadingElement | null>(null);
  useLayoutEffect(() => {
    if (expanded) departmentHeading.current?.focus();
  }, [expanded]);
  const departments = payload.hierarchy.filter((row) => row.parent_id === null);

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
        <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Year-end outlook · All funds
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl">
              Where spending is heading
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Compare department projections, then open the lines behind them.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Sheet as of {payload.projection.sheet_as_of}
          </p>
        </div>
        {compatibility && !compatibility.compatible ? (
          <p
            role="status"
            className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm"
          >
            {financeCurrentMessage(compatibility)}
          </p>
        ) : null}
        {!payload.summary.complete ? (
          <p role="status" className="text-sm text-muted-foreground">
            Some budget figures are incomplete. Unavailable totals stay
            unavailable; known subtotals are labelled separately.
          </p>
        ) : null}
        <div className="rounded-xl border bg-card p-3 sm:p-4">
          <BudgetVarianceComparison
            departments={departments}
            metric="variance_all"
            onSelect={(department) => {
              departmentTrigger.current =
                document.activeElement instanceof HTMLElement
                  ? document.activeElement
                  : null;
              setExpanded(department.id);
              setSelectedLine(undefined);
            }}
          />
        </div>
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
                      <Variance row={department} />
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
                            <Variance row={line} />
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
        <details className="rounded-lg border px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium">
            Projection basis and source details
          </summary>
          <div className="mt-3 space-y-2 break-words text-muted-foreground">
            <p>
              Each line follows the workbook: Calc B uses its budget; Y
              annualises expenditure over 11 months; other lines use 12. The
              calculation uses month {payload.projection.month_count} from the
              sheet’s as-of date.
            </p>
            <p>
              Positive variance is projected overspend. All amounts are the
              approved calculation, including its rounding. Incomplete figures
              are never treated as zero.
            </p>
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

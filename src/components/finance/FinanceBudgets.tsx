"use client";
import type {
  FinanceCurrent,
  FinanceRunManifest,
} from "@/lib/types/finance-runs";
import { BudgetContributors } from "./BudgetContributors";
import { FinanceExportButtons } from "./FinanceExportButtons";
import { ArrowUpRight, ChevronDown, ChevronRight, CircleHelp, TriangleAlert } from "lucide-react";
import { financeCurrentMessage } from "@/lib/finance/currentMessage";
import { useRef, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BudgetVarianceComparison } from "./BudgetVarianceComparison";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPercent, formatRand } from "@/lib/finance/money";
import type {
  BudgetHierarchy,
  BudgetLine,
  BudgetMetric,
  BudgetNode,
  BudgetPayload,
} from "@/lib/types/finance-budgets";

const METRICS: [BudgetMetric, string][] = [
  ["budget", "Budget"],
  ["actual", "Actual"],
  ["projected", "Projected"],
  ["variance_all", "All Funds variance"],
  ["variance_masi", "Masi variance"],
];
const COMPLETENESS_LABELS: Record<string, string> = {
  budget_unavailable: "Budget unavailable",
  actual_unavailable: "Actual unavailable",
  wf_excluded: "Excluded by WF",
  budget_incomplete: "Budget incomplete",
  actual_incomplete: "Actual incomplete",
  projected_incomplete: "Projected amount incomplete",
  variance_all_incomplete: "All Funds variance incomplete",
  variance_masi_incomplete: "Masi variance incomplete",
};
function valueLabel(row: BudgetNode, metric: BudgetMetric) {
  const fallback =
    "known_subtotals" in row
      ? "unavailable (incomplete)"
      : metric === "budget"
        ? "budget not set"
        : metric === "actual"
          ? "actual unavailable"
          : metric === "variance_masi" &&
              row.completeness_reasons.includes("wf_excluded")
            ? "excluded by WF"
            : "unavailable";
  return formatRand(row[metric], fallback);
}
export function varianceTone(value: string | null) {
  if (value === null) return "";
  if (Number(value) >= 30000) return "bg-red-50 font-semibold text-[#C81E3C] dark:bg-red-950/40 dark:text-red-300";
  if (Number(value) <= -30000) return "bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
  return "";
}
export function variancePercent(row: BudgetNode) {
  if (row.variance_masi === null) return row.completeness_reasons.includes("wf_excluded") ? "Excluded" : "Unavailable";
  if (row.budget === null) return "Budget not set";
  if (Number(row.budget) === 0) return "No budget";
  const result = formatPercent(row.variance_masi, String(Math.abs(Number(row.budget))));
  return Number(row.variance_masi) > 0 ? `+${result}` : result ?? "Unavailable";
}
export function FinanceBudgetsView({
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
  const [selectedLine, setSelectedLine] = useState<BudgetLine>();
  const [department, setDepartment] = useState<BudgetHierarchy>();
  const [varianceMetric, setVarianceMetric] = useState<
    "variance_all" | "variance_masi"
  >("variance_masi");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const detailRef = useRef<HTMLHeadingElement>(null);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { hierarchy, lines, projection } = payload;
  const visible: (BudgetHierarchy | BudgetLine)[] = [];
  function visit(parent: string | null) {
    for (const row of [
      ...hierarchy.filter((n) => n.parent_id === parent),
      ...lines.filter((n) => n.parent_id === parent),
    ].sort((a, b) => a.sheet_row - b.sheet_row)) {
      const inDepartment =
        !department ||
        row.id === department.id ||
        ("line_ids" in row
          ? row.line_ids.some((id) => department.line_ids.includes(id))
          : department.line_ids.includes(row.id));
      if (
        inDepartment &&
        (!filter ||
          row.label.toLowerCase().includes(filter.toLowerCase()) ||
          ("line_ids" in row &&
            row.line_ids.some((id) =>
              lines.some(
                (line) =>
                  line.id === id &&
                  line.label.toLowerCase().includes(filter.toLowerCase()),
              ),
            )))
      )
        visible.push(row);
      if ("level" in row && (filter || expanded.has(row.id))) visit(row.id);
    }
  }
  visit(null);
  function basis(row: BudgetHierarchy | BudgetLine) {
    return (
      ("calc" in row
        ? `${row.calc?.toLowerCase() === "b" ? "budget used" : "linear projection"}. BC: ${row.bc ?? "unbound"}. Applied share: ${row.actual_share}. Contributors: ${row.ledger_row_count}. ${payload.lines_by_bc.some((group) => group.line_ids.includes(row.id) && group.line_ids.length > 1) ? "Shared BC. " : ""}`
        : "") +
      (row.complete
        ? "Complete"
        : row.completeness_reasons
            .map((reason) => COMPLETENESS_LABELS[reason] ?? reason)
            .join(", "))
    );
  }
  function needsReview(row: BudgetNode) {
    return row.completeness_reasons.some(reason => reason !== "wf_excluded") || payload.findings.some(finding =>
      (finding.line_id === row.id || finding.node_id === row.id) && finding.severity !== "info");
  }
  function displayValue(row: BudgetHierarchy | BudgetLine, key: BudgetMetric) {
    return (
      valueLabel(row, key) +
      ("known_subtotals" in row && row[key] === null
        ? `; Known subtotal: ${formatRand(row.known_subtotals[key])}`
        : "")
    );
  }
  const exportRows = [
    [
      "Department / Sub-department / Line",
      ...METRICS.map(([, label]) => label),
      "Masi variance %",
      "Calculation notes",
    ],
    ...visible.map((row) => [
      row.label,
      ...METRICS.map(([key]) => displayValue(row, key)),
      variancePercent(row),
      basis(row),
    ]),
  ];
  function exploreDepartment(row: BudgetHierarchy) {
    setDepartment(row);
    setFilter("");
    setExpanded(new Set([row.id]));
    detailRef.current?.focus();
  }
  return (
    <Sheet
      open={Boolean(selectedLine)}
      onOpenChange={(open) => {
        if (!open) setSelectedLine(undefined);
      }}
    >
      <section className="min-w-0 space-y-5" aria-label="Budget hierarchy">
        {compatibility && !compatibility.compatible ? (
          <p
            role="status"
            className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100"
          >
            {financeCurrentMessage(compatibility)}
          </p>
        ) : null}
        <section
          className="rounded-xl border bg-card p-4 sm:p-6"
          aria-labelledby="budget-variance-title"
        >
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="budget-variance-title" className="font-serif text-2xl">
                Projected over / underspend
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sheet as-of: {projection.sheet_as_of}. Month:{" "}
                {projection.month_count}.{" "}
                {payload.summary.complete ? "Complete" : "Incomplete"}.
              </p>
            </div>
            <label className="text-sm text-muted-foreground">
              Compare{" "}
              <select
                aria-label="Variance basis"
                value={varianceMetric}
                onChange={(event) =>
                  setVarianceMetric(event.target.value as typeof varianceMetric)
                }
                className="ml-2 rounded-md border bg-background px-3 py-2 text-foreground"
              >
                <option value="variance_masi">Masi variance · Column N</option>
                <option value="variance_all">All Funds variance · Column M</option>
              </select>
            </label>
          </div>
          <BudgetVarianceComparison
            departments={hierarchy.filter((row) => row.parent_id === null)}
            metric={varianceMetric}
            onSelect={exploreDepartment}
          />
          <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
            {varianceMetric === "variance_masi"
              ? "Masi variance applies the workbook's WF exclusions. It is not a measure of flexible funding."
              : "Projected expenditure minus budget. Blue indicates below budget, not a judgement that spending is on track."}{" "}
            Unavailable totals remain separate from known subtotals.
          </p>
        </section>
        <section
          className="min-w-0 rounded-xl border bg-card p-4 sm:p-6"
          aria-labelledby="budget-detail-title"
        >
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                ref={detailRef}
                tabIndex={-1}
                id="budget-detail-title"
                className="font-serif text-2xl focus-visible:outline-2 focus-visible:outline-[#1D4ED8]"
              >
                {department ? department.label : "Budget detail"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Open a department, then a category, to explore its budget lines and expenses.
              </p>
            </div>
            {department ? (
              <Button
                variant="outline"
                onClick={() => setDepartment(undefined)}
              >
                All departments
              </Button>
            ) : null}
          </div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <input
              aria-label="Filter budget rows"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:max-w-xs"
              placeholder="Find a budget line…"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
            <div className="space-y-1"><FinanceExportButtons rows={exportRows} name={`budgets-${runId}`} /><p className="text-xs text-muted-foreground">Shown rows only. Includes staff salary information.</p></div>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">Masi variance: red at R30,000 or more over; green at R30,000 or more under. Percentage compares Masi variance with the annual budget shown. Underspending may still need attention.</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 min-w-48 max-w-64 bg-card whitespace-normal">Department / Sub-department / Line</TableHead>
                {METRICS.map(([key, label]) => (
                  <TableHead key={key} className="text-right">{label}</TableHead>
                ))}
                <TableHead className="text-right" title="Masi variance divided by the annual budget shown on this row. Excluded lines have no percentage.">Masi variance %</TableHead>
                <TableHead><span className="sr-only">Expenses and calculation notes</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => (
                <TableRow
                  key={row.id}
                  className={
                    "level" in row
                      ? row.level === 1
                        ? "bg-blue-50 text-base font-semibold dark:bg-blue-950/50"
                        : "bg-slate-100 text-sm font-medium dark:bg-slate-800/70"
                      : "bg-white text-sm dark:bg-slate-950"
                  }
                >
                  <TableCell
                    className={`sticky left-0 z-10 min-w-48 max-w-64 bg-inherit whitespace-normal ${"level" in row ? (row.level === 1 ? "pl-2" : "pl-6") : "pl-12"}`}
                  >
                    {"level" in row ? (
                      <Button
                        variant="ghost"
                        className="h-auto max-w-full justify-start whitespace-normal text-left"
                        aria-expanded={Boolean(filter) || expanded.has(row.id)}
                        onClick={() =>
                          setExpanded((previous) => {
                            const next = new Set(previous);
                            if (next.has(row.id)) next.delete(row.id);
                            else next.add(row.id);
                            return next;
                          })
                        }
                      >
                        {!filter && !expanded.has(row.id) ? (
                          <ChevronRight
                            aria-hidden="true"
                            className="size-4 shrink-0"
                          />
                        ) : (
                          <ChevronDown
                            aria-hidden="true"
                            className="size-4 shrink-0"
                          />
                        )}
                        {row.label}
                      </Button>
                    ) : (
                      row.label
                    )}
                  </TableCell>
                  {METRICS.map(([key]) => (
                    <TableCell
                      className={`tabular-nums whitespace-nowrap text-right ${key === "variance_masi" ? varianceTone(row.variance_masi) : ""}`}
                      key={key}
                    >
                      {displayValue(row, key)}
                    </TableCell>
                  ))}
                  <TableCell className={`text-right tabular-nums whitespace-nowrap ${varianceTone(row.variance_masi)}`}>
                    {variancePercent(row)}
                  </TableCell>
                  <TableCell className="min-w-36 whitespace-normal">
                    {"bc" in row && row.bc !== null ? (
                      <button
                        type="button"
                        aria-label={`View expenses for ${row.label}`}
                        className="inline-flex items-center gap-1 rounded py-1 text-sm font-medium text-[#1D4ED8] hover:underline focus-visible:outline-2 dark:text-blue-300"
                        onClick={(event) => {
                          triggerRef.current = event.currentTarget;
                          setSelectedLine(row);
                        }}
                      >
                        View expenses <ArrowUpRight aria-hidden="true" className="size-4" />
                      </button>
                    ) : null}
                    <details className="mt-1 text-xs font-normal text-muted-foreground">
                      <summary aria-label={`Calculation notes for ${row.label}`} className="inline-flex min-h-8 min-w-8 cursor-pointer list-none items-center gap-1 rounded py-1 focus-visible:outline-2">
                        {needsReview(row) ? <><TriangleAlert aria-hidden="true" className="size-4 text-amber-700 dark:text-amber-300" />Review</> : <><CircleHelp aria-hidden="true" className="size-3.5" /><span className="sr-only">Calculation notes</span></>}
                      </summary>
                      <div className="mt-2 max-w-64 space-y-2">{basis(row)}
                        {payload.findings.filter(finding => finding.line_id === row.id || finding.node_id === row.id).map((finding,index) => <p key={index}>{finding.message}</p>)}
                      </div>
                    </details>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {visible.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              No budget rows match this filter.
            </p>
          ) : null}
        </section>
        <details className="rounded-xl border bg-card p-4 text-sm">
          <summary className="cursor-pointer font-medium">
            Budget source and calculation basis
          </summary>
          <div className="mt-3 space-y-2 text-muted-foreground">
            <p>
              Full ledger amounts before budget share. Shared BC contributors
              are shown in full; the explicit applied share belongs to each
              budget line.
            </p>
            {manifest.dependencies.map((dependency, index) => (
              <div className="break-all" key={index}>
                <p>Pinned ledger: {dependency.run_id}</p>
                <p>
                  {dependency.source_name} · {dependency.source_date}
                </p>
                <p>Management Accounts SHA-256: {dependency.source_sha256}</p>
              </div>
            ))}
            <p>
              Budget source: {manifest.source.name} · {manifest.source.date}
            </p>
            <p className="break-all">
              Budget source SHA-256: {manifest.source.sha256}
            </p>
            <p className="break-all">Budget run: {runId}</p>
          </div>
        </details>
        <SheetContent
          className="w-full overflow-y-auto motion-reduce:animate-none motion-reduce:transition-none sm:max-w-4xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            triggerRef.current?.focus();
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
      </section>
    </Sheet>
  );
}

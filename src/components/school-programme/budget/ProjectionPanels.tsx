import type { BudgetProjection } from "@/lib/types/youth-budget";
import { formatMonth, formatRand } from "./format";

function ProjectionPanel({
  label,
  description,
  projection,
  holidayPay,
}: {
  label: string;
  description: string;
  projection: BudgetProjection;
  holidayPay: number;
}) {
  return (
    <article className="min-w-0 overflow-hidden rounded-xl border bg-white">
      <div className="border-b border-[#1D4ED8]/15 bg-[#FAF7F2] px-5 py-4">
        <p className="text-xs uppercase tracking-[0.2em] text-[#1D4ED8]">
          {label}
        </p>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
      {projection.months.length === 0 ? (
        <div className="p-8 text-center text-sm text-muted-foreground">
          No projection months remain in this year.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2 font-medium">Month</th>
                <th className="px-3 py-2 text-right font-medium">School days</th>
                <th className="px-3 py-2 text-right font-medium">Gross</th>
                <th className="px-3 py-2 text-right font-medium">Subsidy relief</th>
                <th className="px-4 py-2 text-right font-medium">Nett</th>
              </tr>
            </thead>
            <tbody>
              {projection.months.map((row) => (
                <tr key={row.month} className="border-b last:border-0">
                  <td className="px-4 py-2.5 font-medium">
                    {formatMonth(row.month, "long")}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-gray-600">
                    {row.school_days}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-gray-600">
                    {formatRand(row.gross)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-[#1D4ED8]">
                    {formatRand(row.subsidy_relief)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                    {formatRand(row.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-end justify-between gap-4 border-t bg-[#14181D] px-5 py-4 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/60">
            Projection total
          </p>
          {holidayPay > 0 ? (
            <p className="mt-1 text-xs text-white/60">
              Includes {formatRand(holidayPay)} Holiday Pay
            </p>
          ) : null}
        </div>
        <p className="font-serif text-2xl tabular-nums">
          {formatRand(projection.total)}
        </p>
      </div>
    </article>
  );
}

export function ProjectionPanels({
  committed,
  atPlan,
  holidayPay,
}: {
  committed: BudgetProjection;
  atPlan: BudgetProjection;
  holidayPay: number;
}) {
  const hiringPlanCost = Math.max(0, atPlan.total - committed.total);

  return (
    <section>
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-[#1D4ED8]" />
          <span className="text-xs uppercase tracking-[0.25em] text-gray-500">
            Saved projections
          </span>
        </div>
        <h2 className="mt-2 font-serif text-3xl text-[#14181D]">
          Current team and <span className="italic text-[#1D4ED8]">full plan</span>
        </h2>
      </div>

      <div className="mb-4 rounded-lg border border-[#1D4ED8]/20 bg-[#1D4ED8]/5 px-4 py-3 text-center">
        <span className="text-xs uppercase tracking-[0.18em] text-gray-500">
          Cost of the remaining hiring plan &middot; {atPlan.open_posts} open posts
        </span>
        <strong className="ml-3 font-serif text-xl text-[#1D4ED8]">
          {formatRand(hiringPlanCost)}
        </strong>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ProjectionPanel
          label="A. Currently Employed Youth"
          description={`${committed.costed_youth} youth on payroll today, costed through the November horizon.`}
          projection={committed}
          holidayPay={holidayPay}
        />
        <ProjectionPanel
          label="B. At plan"
          description={`Those ${committed.costed_youth} youth plus ${atPlan.open_posts} open Planned Posts = ${atPlan.costed_youth} costed jobs.`}
          projection={atPlan}
          holidayPay={holidayPay}
        />
      </div>
    </section>
  );
}

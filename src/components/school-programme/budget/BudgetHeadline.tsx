import { cn } from "@/lib/utils";
import type { YouthBudgetSummary } from "@/lib/types/youth-budget";
import {
  formatBudgetDate,
  formatRand,
  verdictLanguage,
} from "./format";

function VerdictCard({
  label,
  cost,
  verdict,
  detail,
}: {
  label: string;
  cost: number;
  verdict: number;
  detail: string;
}) {
  const language = verdictLanguage(verdict);
  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-4",
        language.status === "over"
          ? "border-[#C81E3C]/30"
          : language.status === "under"
            ? "border-[#1D4ED8]/30"
            : "border-[#14181D]/20",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
        {label}
      </p>
      <p className="mt-2 font-serif text-2xl leading-tight text-[#14181D]">
        {language.phrase}
      </p>
      <p className="mt-1 text-sm text-gray-600">
        {formatRand(cost)} projected cost
      </p>
      <p className="mt-0.5 text-xs text-gray-500">{detail}</p>
    </div>
  );
}

export function BudgetHeadline({ summary }: { summary: YouthBudgetSummary }) {
  const available = summary.pots_total - summary.scenario.mentor_reserve;
  const atPlanLanguage = verdictLanguage(
    summary.projections.verdict_at_plan,
  );
  const activePotDates = Array.from(
    new Set(
      summary.pots
        .filter((pot) => pot.is_active && !pot.is_ringfenced)
        .map((pot) => pot.as_of),
    ),
  ).sort();
  const potDateProvenance =
    activePotDates.length === 0
      ? "No active core Funding Pot balances are recorded."
      : activePotDates.length === 1
        ? `Active core Funding Pot balances dated ${formatBudgetDate(activePotDates[0])}.`
        : `Core Funding Pot balance dates range from ${formatBudgetDate(
            activePotDates[0],
          )} to ${formatBudgetDate(activePotDates[activePotDates.length - 1])}.`;

  return (
    <section className="overflow-hidden rounded-xl border border-[#1D4ED8]/20 bg-[#FAF7F2]">
      <div className="h-1.5 bg-[#1D4ED8]" />
      <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-10 bg-[#1D4ED8]" />
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500">
              Saved team scenario
            </span>
          </div>
          <p className="text-sm font-medium text-gray-600">At-plan verdict</p>
          <h2
            className={cn(
              "mt-1 font-serif text-4xl leading-[1.05] md:text-5xl",
              atPlanLanguage.status === "over"
                ? "text-[#C81E3C]"
                : "text-[#1D4ED8]",
            )}
          >
            {atPlanLanguage.phrase}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600">
            {formatRand(summary.pots_total)} in active core Funding Pots, less
            a {formatRand(summary.scenario.mentor_reserve)} Mentor Reserve,
            leaves{" "}
            <strong className="text-[#14181D]">{formatRand(available)}</strong>{" "}
            available for core youth wages.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Core pots only; ringfenced funders are tracked separately below.{" "}
            {potDateProvenance} Projection as of{" "}
            {formatBudgetDate(summary.as_of)}.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <VerdictCard
            label="Currently employed"
            cost={summary.projections.committed.total}
            verdict={summary.projections.verdict_committed}
            detail={`${summary.projections.committed.costed_youth} youth costed`}
          />
          <VerdictCard
            label="At plan"
            cost={summary.projections.at_plan.total}
            verdict={summary.projections.verdict_at_plan}
            detail={`${summary.projections.at_plan.costed_youth} jobs incl. ${summary.projections.at_plan.open_posts} open posts`}
          />
        </div>
      </div>
    </section>
  );
}

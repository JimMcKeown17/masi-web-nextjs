import type {
  MonthlyYouthExpenditure,
  SpendForecast,
} from "@/lib/types/youth-budget";
import { buildExpenditureChartData } from "./expenditureChartData";
import { formatCompactRand, formatMonth, formatRand } from "./format";

export function ExpenditureChart({
  expenditure,
  forecast,
  live = false,
}: {
  expenditure: MonthlyYouthExpenditure[];
  forecast: SpendForecast;
  live?: boolean;
}) {
  const { bars, lastActualMonth } = buildExpenditureChartData(
    expenditure,
    forecast,
  );
  const hasActuals = lastActualMonth !== null;

  if (bars.length === 0) {
    return (
      <section className="rounded-xl border border-dashed p-10 text-center">
        <h2 className="font-serif text-2xl text-[#14181D]">
          Actual and projected spend
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No expenditure history or projection months are available.
        </p>
      </section>
    );
  }

  const maxValue = Math.max(...bars.map((bar) => bar.total), 1);
  const chartHeight = 154;
  const baseline = 190;
  const barWidth = 42;
  const step = 72;
  const startX = 56;
  const svgWidth = Math.max(760, startX + bars.length * step + 30);
  const barHeight = (value: number) =>
    Math.max(0, (value / maxValue) * chartHeight);
  const sourceMonths = forecast.mentor_estimate.source_actuals.map((row) =>
    formatMonth(row.month, "long"),
  );
  const sourceMonthLanguage =
    sourceMonths.length === 0
      ? "no mentor actuals are available yet"
      : sourceMonths.length === 1
        ? `${sourceMonths[0]} actuals`
        : sourceMonths.length === 2
          ? `${sourceMonths[0]} and ${sourceMonths[1]} actuals`
          : `${sourceMonths.slice(0, -1).join(", ")}, and ${sourceMonths.at(-1)} actuals`;
  const sourceAmountLanguage = forecast.mentor_estimate.source_actuals
    .map((row) => `${formatMonth(row.month, "long")} ${formatRand(row.amount)}`)
    .join(", ");

  return (
    <section className="rounded-xl border bg-white p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#1D4ED8]" />
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500">
              Spend timeline
            </span>
          </div>
          <h2 className="mt-2 font-serif text-3xl text-[#14181D]">
            Actual into <span className="italic text-[#1D4ED8]">projected</span>
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {hasActuals
              ? `Actual nett spend from January to ${formatMonth(lastActualMonth, "long")}, followed by the ${live ? "live what-if" : "saved"} currently-employed projection.`
              : `${live ? "Live what-if" : "Saved"} currently-employed projection.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 bg-[#1D4ED8]" /> Core
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 bg-[#14181D]" /> Mentor
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 bg-gray-400" /> Rural
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 border border-dashed border-[#1D4ED8] bg-[#1D4ED8]/5" />{" "}
            Projected
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          role="img"
          aria-label="Monthly youth expenditure from actual to projected"
          viewBox={`0 0 ${svgWidth} 258`}
          className="h-auto min-w-[760px]"
        >
          <defs>
            <pattern
              id="budget-projected-hatch"
              width="8"
              height="8"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="8" height="8" fill="#EFF6FF" />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="8"
                stroke="#1D4ED8"
                strokeOpacity="0.32"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          {[0, 0.5, 1].map((ratio) => {
            const y = baseline - ratio * chartHeight;
            return (
              <g key={ratio}>
                <line
                  x1={startX - 14}
                  y1={y}
                  x2={svgWidth - 18}
                  y2={y}
                  stroke="#14181D"
                  strokeOpacity={ratio === 0 ? 0.25 : 0.08}
                />
                <text
                  x={startX - 18}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-gray-500 text-[10px]"
                >
                  {formatCompactRand(maxValue * ratio)}
                </text>
              </g>
            );
          })}

          {bars.map((bar, index) => {
            const x = startX + index * step;
            const totalHeight = barHeight(bar.total);
            if (bar.kind === "projected") {
              const coreHeight = barHeight(bar.core);
              const mentorHeight = barHeight(bar.mentor);
              const ruralHeight = barHeight(bar.rural);
              const workingDates = bar.workingDates
                .map((value) =>
                  new Intl.DateTimeFormat("en-ZA", {
                    day: "numeric",
                    month: "short",
                  }).format(new Date(`${value}T00:00:00`)),
                )
                .join(", ");
              const accessibleLabel = `${formatMonth(bar.month, "long")} projected core ${formatRand(bar.core)}, mentor ${formatRand(bar.mentor)}, rural ${formatRand(bar.rural)}, total ${formatRand(bar.total)}. ${bar.workingDays} working days. Working dates: ${workingDates}.`;
              return (
                <g
                  key={`projected-${bar.month}`}
                  tabIndex={0}
                  aria-label={accessibleLabel}
                >
                  <title>{accessibleLabel}</title>
                  <rect
                    x={x}
                    y={baseline - coreHeight}
                    width={barWidth}
                    height={coreHeight}
                    rx="2"
                    fill="url(#budget-projected-hatch)"
                    stroke="#1D4ED8"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <rect
                    x={x}
                    y={baseline - coreHeight - mentorHeight}
                    width={barWidth}
                    height={mentorHeight}
                    fill="#E5E7EB"
                    stroke="#14181D"
                    strokeWidth="1.25"
                    strokeDasharray="4 3"
                  />
                  <rect
                    x={x}
                    y={baseline - coreHeight - mentorHeight - ruralHeight}
                    width={barWidth}
                    height={ruralHeight}
                    rx="2"
                    fill="#F3F4F6"
                    stroke="#9CA3AF"
                    strokeWidth="1.25"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(18, baseline - totalHeight - 8)}
                    textAnchor="middle"
                    className="fill-[#1D4ED8] text-[10px] font-medium"
                  >
                    {formatCompactRand(bar.core)} core
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={baseline + 21}
                    textAnchor="middle"
                    className="fill-gray-600 text-[11px]"
                  >
                    {formatMonth(bar.month)}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={baseline + 37}
                    textAnchor="middle"
                    className="fill-[#1D4ED8] text-[9px] uppercase"
                  >
                    Projected
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={baseline + 52}
                    textAnchor="middle"
                    className="fill-gray-500 text-[8px]"
                  >
                    {bar.workingDays} working days
                  </text>
                </g>
              );
            }

            const coreHeight = barHeight(bar.core);
            const mentorHeight = barHeight(bar.mentor);
            const ruralHeight = barHeight(bar.rural);
            return (
              <g key={`actual-${bar.month}`}>
                <rect
                  x={x}
                  y={baseline - coreHeight}
                  width={barWidth}
                  height={coreHeight}
                  rx="2"
                  fill="#1D4ED8"
                >
                  <title>{`${formatMonth(bar.month, "long")} core: ${formatRand(bar.core)}`}</title>
                </rect>
                <rect
                  x={x}
                  y={baseline - coreHeight - mentorHeight}
                  width={barWidth}
                  height={mentorHeight}
                  fill="#14181D"
                >
                  <title>{`Mentor: ${formatRand(bar.mentor)}`}</title>
                </rect>
                <rect
                  x={x}
                  y={baseline - coreHeight - mentorHeight - ruralHeight}
                  width={barWidth}
                  height={ruralHeight}
                  rx="2"
                  fill="#9CA3AF"
                >
                  <title>{`Rural: ${formatRand(bar.rural)}`}</title>
                </rect>
                <text
                  x={x + barWidth / 2}
                  y={Math.max(18, baseline - totalHeight - 8)}
                  textAnchor="middle"
                  className="fill-[#14181D] text-[10px] font-medium"
                >
                  {formatCompactRand(bar.total)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={baseline + 21}
                  textAnchor="middle"
                  className="fill-gray-600 text-[11px]"
                >
                  {formatMonth(bar.month)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={baseline + 37}
                  textAnchor="middle"
                  className="fill-gray-500 text-[9px] uppercase"
                >
                  Actual
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 rounded-lg border border-[#1D4ED8]/15 bg-[#1D4ED8]/5 px-4 py-3 text-xs leading-relaxed text-gray-600">
        <strong className="text-[#14181D]">Mentor estimate:</strong>{" "}
        {sourceMonths.length > 0 ? (
          <>
            {formatRand(forecast.mentor_estimate.monthly_amount)} per projected
            month, calculated as the average of {sourceMonthLanguage}. Mentor
            is a full monthly estimate for every projected month shown; the
            programme end date does not prorate it within a month. Source
            actuals: {sourceAmountLanguage}.
          </>
        ) : (
          <>
            No Mentor actuals are available, so the projected Mentor amount is
            currently {formatRand(0)}.
          </>
        )}
      </div>
    </section>
  );
}

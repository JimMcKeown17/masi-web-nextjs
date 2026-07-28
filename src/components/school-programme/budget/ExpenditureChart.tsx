import type {
  BudgetProjection,
  MonthlyYouthExpenditure,
} from "@/lib/types/youth-budget";
import { formatCompactRand, formatMonth, formatRand } from "./format";

interface ActualBar {
  kind: "actual";
  month: number;
  core: number;
  mentor: number;
  rural: number;
  total: number;
}

interface ProjectedBar {
  kind: "projected";
  month: number;
  total: number;
}

type ChartBar = ActualBar | ProjectedBar;

export function ExpenditureChart({
  expenditure,
  committed,
}: {
  expenditure: MonthlyYouthExpenditure[];
  committed: BudgetProjection;
}) {
  const actualByMonth = new Map(
    expenditure
      .filter((row) => row.month >= 1 && row.month <= 6)
      .map((row) => [row.month, row]),
  );
  const hasActuals = actualByMonth.size > 0;
  const projectedRows = committed.months.filter((row) => row.month >= 7);

  if (!hasActuals && projectedRows.length === 0) {
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

  const bars: ChartBar[] = [
    ...Array.from({ length: 6 }, (_, index): ActualBar => {
      const month = index + 1;
      const row = actualByMonth.get(month);
      const core = row?.core_amount ?? 0;
      const mentor = row?.mentor_amount ?? 0;
      const rural = row?.rural_amount ?? 0;
      return {
        kind: "actual",
        month,
        core,
        mentor,
        rural,
        total: core + mentor + rural,
      };
    }),
    ...projectedRows.map(
      (row): ProjectedBar => ({
        kind: "projected",
        month: row.month,
        total: row.net,
      }),
    ),
  ];
  const maxValue = Math.max(...bars.map((bar) => bar.total), 1);
  const chartHeight = 154;
  const baseline = 190;
  const barWidth = 42;
  const step = 72;
  const startX = 56;
  const svgWidth = Math.max(760, startX + bars.length * step + 30);
  const barHeight = (value: number) =>
    Math.max(0, (value / maxValue) * chartHeight);

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
            Actual nett spend from January to June, followed by the saved
            committed projection.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 bg-[#1D4ED8]" /> Core actual
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 bg-[#14181D]" /> Mentor actual
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 bg-gray-400" /> Rural actual
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
          viewBox={`0 0 ${svgWidth} 250`}
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
              return (
                <g key={`projected-${bar.month}`}>
                  <rect
                    x={x}
                    y={baseline - totalHeight}
                    width={barWidth}
                    height={totalHeight}
                    rx="2"
                    fill="url(#budget-projected-hatch)"
                    stroke="#1D4ED8"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  >
                    <title>
                      {formatMonth(bar.month, "long")} projected:{" "}
                      {formatRand(bar.total)}
                    </title>
                  </rect>
                  <text
                    x={x + barWidth / 2}
                    y={Math.max(18, baseline - totalHeight - 8)}
                    textAnchor="middle"
                    className="fill-[#1D4ED8] text-[10px] font-medium"
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
                    className="fill-[#1D4ED8] text-[9px] uppercase"
                  >
                    Projected
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
                  <title>
                    {formatMonth(bar.month, "long")} core:{" "}
                    {formatRand(bar.core)}
                  </title>
                </rect>
                <rect
                  x={x}
                  y={baseline - coreHeight - mentorHeight}
                  width={barWidth}
                  height={mentorHeight}
                  fill="#14181D"
                >
                  <title>Mentor: {formatRand(bar.mentor)}</title>
                </rect>
                <rect
                  x={x}
                  y={baseline - coreHeight - mentorHeight - ruralHeight}
                  width={barWidth}
                  height={ruralHeight}
                  rx="2"
                  fill="#9CA3AF"
                >
                  <title>Rural: {formatRand(bar.rural)}</title>
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
    </section>
  );
}

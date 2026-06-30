import { scaleBand, scaleLinear } from "@visx/scale";
import { Group } from "@visx/group";
import { Bar } from "@visx/shape";
import { Text } from "@visx/text";

// Ink & Signal bar-comparison chart, built on visx primitives. Pure SVG with a
// fixed viewBox and width:100% -> renders server-side and scales cleanly to 390px
// with no client measurement (no ParentSize, no ssr:false). Used across the
// portal for baseline->endline / cohort comparisons.

export type Tone = "brand" | "neutral" | "muted";

export interface BarDatum {
  sublabel?: string; // small label under the bar (e.g. "Baseline")
  value: number;
  valueText: string; // pre-formatted (e.g. "16.0%")
  tone?: Tone;
}

export interface BarGroup {
  label: string; // x-axis label under the group (e.g. "Treatment")
  bars: BarDatum[];
}

const VW = 560;
const VH = 360;
const M = { top: 48, right: 22, bottom: 58, left: 18 };

const INK = "#14181D";

function toneColor(tone: Tone | undefined, accent: string): string {
  if (tone === "brand") return accent;
  if (tone === "neutral") return "#94a3b8";
  return "#cbd5e1"; // muted
}

export function BarComparison({
  groups,
  max,
  accent = "#C81E3C",
  referenceLine,
  ariaLabel,
}: {
  groups: BarGroup[];
  max: number;
  accent?: string;
  referenceLine?: { value: number; label: string };
  ariaLabel: string;
}) {
  const innerW = VW - M.left - M.right;
  const innerH = VH - M.top - M.bottom;

  const groupScale = scaleBand<string>({
    domain: groups.map((g) => g.label),
    range: [0, innerW],
    padding: 0.3,
  });
  const maxBars = Math.max(...groups.map((g) => g.bars.length));
  const barScale = scaleBand<number>({
    domain: Array.from({ length: maxBars }, (_, i) => i),
    range: [0, groupScale.bandwidth()],
    padding: 0.18,
  });
  const yScale = scaleLinear<number>({ domain: [0, max], range: [innerH, 0] });

  const refY = referenceLine ? M.top + yScale(referenceLine.value) : 0;

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      width="100%"
      role="img"
      aria-label={ariaLabel}
      style={{ display: "block", overflow: "visible" }}
    >
      {/* Baseline axis rule */}
      <line x1={M.left} x2={VW - M.right} y1={M.top + innerH} y2={M.top + innerH} stroke="#e5e7eb" strokeWidth={1} />

      <Group>
        {groups.map((group) => {
          const gx = M.left + (groupScale(group.label) ?? 0);
          return (
            <Group key={group.label} left={gx}>
              {group.bars.map((bar, i) => {
                const bx = barScale(i) ?? 0;
                const bw = barScale.bandwidth();
                const by = M.top + yScale(bar.value);
                const bh = innerH - yScale(bar.value);
                return (
                  <Group key={i} left={bx}>
                    <Bar
                      x={0}
                      y={by}
                      width={bw}
                      height={Math.max(2, bh)}
                      rx={4}
                      fill={toneColor(bar.tone, accent)}
                    />
                    <Text
                      x={bw / 2}
                      y={by - 9}
                      textAnchor="middle"
                      fontSize={19}
                      fontWeight={600}
                      fill={bar.tone === "brand" ? accent : INK}
                      style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                    >
                      {bar.valueText}
                    </Text>
                    {bar.sublabel && (
                      <Text x={bw / 2} y={M.top + innerH + 17} textAnchor="middle" fontSize={12.5} fill="#94a3b8">
                        {bar.sublabel}
                      </Text>
                    )}
                  </Group>
                );
              })}
              <Text
                x={groupScale.bandwidth() / 2}
                y={M.top + innerH + 38}
                textAnchor="middle"
                fontSize={14}
                fontWeight={600}
                fill={INK}
              >
                {group.label}
              </Text>
            </Group>
          );
        })}
      </Group>

      {referenceLine && (
        <Group>
          <line
            x1={M.left}
            x2={VW - M.right}
            y1={refY}
            y2={refY}
            stroke={INK}
            strokeOpacity={0.5}
            strokeWidth={1}
            strokeDasharray="5 4"
          />
          <Text x={VW - M.right} y={refY - 7} textAnchor="end" fontSize={12.5} fontWeight={600} fill={INK}>
            {referenceLine.label}
          </Text>
        </Group>
      )}
    </svg>
  );
}

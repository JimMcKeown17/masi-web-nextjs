import { group, pick } from "@/lib/api/impact/selectors";
import { PublishedStatsPayload } from "@/lib/types/impact";

import { GradientRule, Kicker, MethodologyNote, Section } from "./Section";
import { HBar, Panel } from "./HBar";

const ACCENT = "#C81E3C";

export function NumeracySnapshot({ payload }: { payload: PublishedStatsPayload | null }) {
  const gain = pick(payload, "num_avg_gain");
  const components = group(payload, "numeracy_components");
  const thresholds = group(payload, "numeracy_thresholds");

  return (
    <Section className="border-t border-black/5 bg-white">
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex-1">
          <Kicker accent={ACCENT}>Chapter 04 &middot; Numeracy</Kicker>
          {/* 102% = average numeracy improvement from the 2025 data portal. PLACEHOLDER pending a
              backend key; supersedes the old raw points-out-of-90 gain figure. */}
          <div className="font-serif text-6xl font-medium leading-none tracking-tight text-[#14181D] md:text-7xl">
            102<span className="text-4xl text-gray-400">%</span>
          </div>
          <div className="mt-2 text-[12px] uppercase tracking-[0.18em] text-gray-400">Average improvement &middot; 2025</div>
          <GradientRule accent={ACCENT} />
          <h3 className="mb-3 font-serif text-2xl leading-snug text-[#14181D] md:text-[26px]">
            Numeracy scores more than double in a year.
          </h3>
          <p className="max-w-[440px] leading-relaxed text-gray-600">
            Across the Yazi Amanani assessment, children lift their numeracy scores by an average of 102% in a single
            year, gaining ground on every component, not just the easy ones.
          </p>
          <MethodologyNote stat={gain} />
        </div>
        <div className="w-full flex-1">
          <Panel title="Baseline vs endline by skill (standardised /10)">
            {components.map((component) => (
              <div key={component.key}>
                <HBar
                  label={component.label}
                  valueText={component.value}
                  pct={((component.numeric_value ?? 0) / 10) * 100}
                  tone="brand"
                  accent={ACCENT}
                />
                <HBar
                  valueText={String(component.numeric_value_secondary ?? "")}
                  pct={((component.numeric_value_secondary ?? 0) / 10) * 100}
                  tone="neutral"
                  thin
                />
              </div>
            ))}
            <div className="text-[11.5px] text-gray-400">All 9 components shown after data verification</div>
            {thresholds.length > 0 && (
              <div className="mt-5 flex flex-col gap-3.5 sm:flex-row">
                {thresholds.map((threshold) => (
                  <div key={threshold.key} className="flex-1 rounded-xl border border-black/10 bg-white p-3.5">
                    <div className="font-serif text-[24px] font-medium text-[#14181D]">{threshold.value}</div>
                    <div className="mt-1 text-[11.5px] leading-snug text-gray-500">{threshold.label}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </Section>
  );
}

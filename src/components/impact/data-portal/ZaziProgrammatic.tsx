import CountUp from "@/components/animations/count-up";
import { FadeUp } from "@/components/animations/FadeAnimations";
import { Section, Kicker, Accent, GradientRule } from "@/components/impact/dashboard/Section";
import { Panel } from "@/components/impact/dashboard/HBar";
import { ZaziProgrammaticPayload } from "@/lib/types/data-portal";

import { BarComparison } from "./BarComparison";
import { MethodologyNote } from "./MethodologyNote";

const ACCENT = "#C81E3C"; // Zazi iZandi = early-grade literacy = children -> crimson

const pctText = (v: number) => `${v.toFixed(1)}%`;
const SCALE_MAX = 30; // headroom above the 27% national reference line

export function ZaziProgrammatic({ payload }: { payload: ZaziProgrammaticPayload | null }) {
  if (!payload) {
    return (
      <Section className="bg-white">
        <Kicker accent={ACCENT}>Zazi iZandi &middot; Programmatic</Kicker>
        <p className="max-w-prose text-gray-600">
          The Zazi iZandi results are being recomputed and will be back shortly.
        </p>
      </Section>
    );
  }

  const { benchmark_lpm, national_average_pct, grade, as_of } = payload;
  const f1 = payload.results.g1_benchmark_movement;
  const f2 = payload.results.g1_treatment_vs_control;
  const multiple = f1.baseline_pct > 0 ? f1.midline_pct / f1.baseline_pct : 0;
  const treatmentEdge = +(f2.treatment.avg_gain - f2.control.avg_gain).toFixed(1);

  return (
    <>
      {/* Portal / view header */}
      <Section className="bg-[#0E1116] text-white">
        <FadeUp>
          <Kicker accent="#E72D4D" dark>
            Impact Data Portal &middot; {payload.programme}
          </Kicker>
          <h1 className="max-w-[18ch] font-serif text-4xl font-medium leading-[1.05] md:text-6xl">
            Teaching a township <Accent accent="#E72D4D">to read.</Accent>
          </h1>
          <p className="mt-5 max-w-[52ch] leading-relaxed text-white/70">
            The Programmatic view answers one question for a {grade} learner: did letter-sound knowledge actually move,
            baseline to midline, against the national bar and a matched control group? Every figure is recomputed from
            the assessment database and stamped with the date it was read.
          </p>
          <p className="mt-4 text-[12.5px] uppercase tracking-[0.2em] text-white/40">Data as of {as_of}</p>
        </FadeUp>
      </Section>

      {/* FLAGSHIP #1 — benchmark movement vs national average */}
      <Section className="bg-white">
        <FadeUp>
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
            <div className="flex-1">
              <Kicker accent={ACCENT}>Headline result &middot; {grade}</Kicker>
              <div className="font-serif text-6xl font-medium leading-none tracking-tight text-[#14181D] md:text-7xl">
                <CountUp to={multiple} decimals={0} suffix="x" className="text-[#C81E3C]" />{" "}
                <span className="text-4xl tracking-tight">more at the bar</span>
              </div>
              <GradientRule accent={ACCENT} />
              <h3 className="mb-3 font-serif text-2xl leading-snug text-[#14181D] md:text-[26px]">
                The share of {grade}s reading at the {benchmark_lpm}-letter benchmark went from {pctText(f1.baseline_pct)}{" "}
                to {pctText(f1.midline_pct)}.
              </h3>
              <p className="max-w-[440px] leading-relaxed text-gray-600">
                By midline, {pctText(f1.midline_pct)} of Masi-taught {grade} learners can sound at least {benchmark_lpm}{" "}
                letters a minute, the threshold for reading on track. They are closing on the {national_average_pct}%
                national year-end average while still mid-year.
              </p>
              <MethodologyNote
                source="Zazi iZandi assessment database (EGRA letter-sound task)"
                population={`Matched Masi-taught ${grade} learners (treatment + SEF), N=${f1.n}`}
                asOf={as_of}
                comparison={`South African national average: ${national_average_pct}% at ${benchmark_lpm} LPM by year-end`}
                caveat={`Benchmark = at or above ${benchmark_lpm} letters-correct-per-minute. Baseline to midline (same learners); midline collection ongoing. The ${national_average_pct}% national figure is a year-end mark shown against our mid-year midline.`}
              />
            </div>
            <div className="w-full flex-1">
              <Panel title={`% of ${grade} at the ${benchmark_lpm}-LPM benchmark`}>
                <BarComparison
                  ariaLabel={`Percentage of ${grade} learners at the ${benchmark_lpm} letters-per-minute benchmark, baseline ${pctText(f1.baseline_pct)} versus midline ${pctText(f1.midline_pct)}, against the ${national_average_pct} percent national average`}
                  accent={ACCENT}
                  max={SCALE_MAX}
                  referenceLine={{ value: national_average_pct, label: `SA average ${national_average_pct}%` }}
                  groups={[
                    { label: "Baseline", bars: [{ value: f1.baseline_pct, valueText: pctText(f1.baseline_pct), tone: "muted" }] },
                    { label: "Midline", bars: [{ value: f1.midline_pct, valueText: pctText(f1.midline_pct), tone: "brand" }] },
                  ]}
                />
                <div className="mt-3 text-[12.5px] text-gray-400">
                  Same one-minute EGRA letter task. Matched Masi-taught {grade} learners (N={f1.n}).
                </div>
              </Panel>
            </div>
          </div>
        </FadeUp>
      </Section>

      {/* FLAGSHIP #2 — treatment vs control (the credibility centrepiece) */}
      <Section className="bg-[#FAF7F2]">
        <FadeUp>
          <div className="flex flex-col items-center gap-12 lg:flex-row-reverse lg:gap-16">
            <div className="flex-1">
              <Kicker accent={ACCENT}>Is it the programme? &middot; Treatment vs control</Kicker>
              <div className="font-serif text-6xl font-medium leading-none tracking-tight text-[#14181D] md:text-7xl">
                <CountUp to={f2.treatment.avg_gain} decimals={1} prefix="+" className="text-[#C81E3C]" />{" "}
                <span className="text-4xl tracking-tight">letters, matched</span>
              </div>
              <GradientRule accent={ACCENT} />
              <h3 className="mb-3 font-serif text-2xl leading-snug text-[#14181D] md:text-[26px]">
                Taught {grade}s gained {f2.treatment.avg_gain.toFixed(1)} letters. A matched control group gained{" "}
                {f2.control.avg_gain.toFixed(1)}.
              </h3>
              <p className="max-w-[440px] leading-relaxed text-gray-600">
                Treatment learners started <em>behind</em> control at baseline ({pctText(f2.treatment.baseline_pct)} vs{" "}
                {pctText(f2.control.baseline_pct)} at the benchmark) and finished well ahead (
                {pctText(f2.treatment.midline_pct)} vs {pctText(f2.control.midline_pct)}). That {treatmentEdge}-letter edge
                over a comparable control group is the programme effect, not maturation.
              </p>
              <MethodologyNote
                source="Zazi iZandi assessment database (EGRA letter-sound task)"
                population={`Matched ${grade} learners: treatment N=${f2.treatment.n}, control N=${f2.control.n}, SEF N=${f2.sef.n}`}
                asOf={as_of}
                comparison="Pre-registered control schools (no Masi instruction)"
                caveat={`Same learners, baseline to midline. Cohort assigned by school. Benchmark = at or above ${benchmark_lpm} LPM.`}
              />
            </div>
            <div className="w-full flex-1">
              <Panel title={`${grade} at the ${benchmark_lpm}-LPM benchmark, by group`}>
                <BarComparison
                  ariaLabel={`Percentage of ${grade} learners at benchmark, baseline versus midline, for treatment and control groups`}
                  accent={ACCENT}
                  max={SCALE_MAX}
                  groups={[
                    {
                      label: "Treatment",
                      bars: [
                        { sublabel: "Baseline", value: f2.treatment.baseline_pct, valueText: pctText(f2.treatment.baseline_pct), tone: "muted" },
                        { sublabel: "Midline", value: f2.treatment.midline_pct, valueText: pctText(f2.treatment.midline_pct), tone: "brand" },
                      ],
                    },
                    {
                      label: "Control",
                      bars: [
                        { sublabel: "Baseline", value: f2.control.baseline_pct, valueText: pctText(f2.control.baseline_pct), tone: "muted" },
                        { sublabel: "Midline", value: f2.control.midline_pct, valueText: pctText(f2.control.midline_pct), tone: "neutral" },
                      ],
                    },
                  ]}
                />
                <div className="mt-3 flex gap-6">
                  <div>
                    <div className="font-serif text-2xl font-medium text-[#C81E3C]">+{f2.treatment.avg_gain.toFixed(1)}</div>
                    <div className="text-[11px] uppercase tracking-wider text-gray-400">Treatment gain</div>
                  </div>
                  <div>
                    <div className="font-serif text-2xl font-medium text-[#64748b]">+{f2.control.avg_gain.toFixed(1)}</div>
                    <div className="text-[11px] uppercase tracking-wider text-gray-400">Control gain</div>
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        </FadeUp>
      </Section>
    </>
  );
}

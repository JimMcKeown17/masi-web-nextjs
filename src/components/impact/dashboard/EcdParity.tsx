import { pick } from "@/lib/api/impact/selectors";
import { PublishedStatsPayload } from "@/lib/types/impact";

import { GradientRule, Kicker, MethodologyNote, Section } from "./Section";
import { Panel } from "./HBar";

const ACCENT = "#C81E3C";
const SCALE_MAX = 16; // letters correct per minute, headroom above Grade 1 (~15.4)

export function EcdParity({ payload }: { payload: PublishedStatsPayload | null }) {
  const masi = pick(payload, "ecd_masi_lcpm");
  const g1 = pick(payload, "ecd_g1_lcpm");
  // Control ECD and Grade R are not yet in the payload. PLACEHOLDER values (Masi, 2026-06-16),
  // pending a backend key + data-portal verification.
  const controlEcd = pick(payload, "ecd_control_ecd_lcpm");
  const gradeR = pick(payload, "ecd_gradeR_lcpm");

  const masiVal = masi?.numeric_value ?? 14.9;
  const masiText = masi?.value ?? "14.9";
  const g1Val = g1?.numeric_value ?? 15.4;
  const g1Text = g1?.value ?? "15.4";
  const controlEcdVal = controlEcd?.numeric_value ?? 1.0;
  const controlEcdText = controlEcd?.value ?? "1.0";
  const gradeRVal = gradeR?.numeric_value ?? 5.3;
  const gradeRText = gradeR?.value ?? "5.3";

  // Our red bar first, then the three unsupported comparison groups by age. The staircase
  // (1.0, 5.3, 15.4) shows Masi four-year-olds reading level with Grade 1, two years older.
  const bars = [
    { label: "Masi ECD", age: "ages 4-5", value: masiVal, text: masiText, brand: true },
    { label: "Control ECD", age: "ages 4-5", value: controlEcdVal, text: controlEcdText, brand: false },
    { label: "Grade R", age: "ages 5-6", value: gradeRVal, text: gradeRText, brand: false },
    { label: "Grade 1", age: "ages 6-7", value: g1Val, text: g1Text, brand: false },
  ];

  return (
    <Section className="bg-white">
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex-1">
          <Kicker accent={ACCENT}>Chapter 02 &middot; Early Childhood</Kicker>
          <div className="font-serif text-6xl font-medium leading-none tracking-tight text-[#14181D] md:text-7xl">
            <span className="text-[#C81E3C]">2</span> <span className="text-4xl tracking-tight">years ahead</span>
          </div>
          <GradientRule accent={ACCENT} />
          <h3 className="mb-3 font-serif text-2xl leading-snug text-[#14181D] md:text-[26px]">
            Our four- and five-year-olds read at Grade 1 level.
          </h3>
          <p className="max-w-[440px] leading-relaxed text-gray-600">
            Masinyusane four-year-olds sound letters as fast as Grade 1 learners two school years older, and lap their
            own age group, who are barely reading at all. They arrive at school as readers, before the crisis can start.
          </p>
          <MethodologyNote stat={masi} />
        </div>
        <div className="w-full flex-1">
          <Panel title="Letters correct per minute · June 2026">
            <div className="relative h-[230px]">
              {/* Dotted reference line at the Masi ECD height: the bar to its right (Grade 1) lands level. */}
              <div
                className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-[#C81E3C]/45"
                style={{ bottom: `${(masiVal / SCALE_MAX) * 100}%` }}
              />
              <div className="flex h-full items-end gap-3 sm:gap-4">
                {bars.map((bar) => (
                  <div key={bar.label} className="flex h-full flex-1 flex-col items-center justify-end">
                    <div
                      className="mb-1.5 font-serif text-[15px] font-medium"
                      style={{ color: bar.brand ? "#C81E3C" : "#64748b" }}
                    >
                      {bar.text}
                    </div>
                    <div
                      className="w-full max-w-[60px] rounded-t-md"
                      style={{
                        height: `${Math.max(2, (bar.value / SCALE_MAX) * 100)}%`,
                        backgroundColor: bar.brand ? "#C81E3C" : "#cbd5e1",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2.5 flex gap-3 sm:gap-4">
              {bars.map((bar) => (
                <div key={bar.label} className="flex-1 text-center leading-tight">
                  <div className="text-[12px] font-semibold text-[#14181D]">{bar.label}</div>
                  <div className="text-[10.5px] text-gray-400">{bar.age}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 inline-flex rounded-full border border-[#C81E3C]">
              <span className="rounded-full bg-white px-4 py-2 text-[13px] font-bold text-[#14181D]">
                Level with Grade 1, two years early
              </span>
            </div>
            <div className="mt-3 text-[12.5px] text-gray-400">
              Mid-year scores, June 2026. Same one-minute EGRA letter task. Masi ECD vs unsupported comparison groups by
              age.
            </div>
          </Panel>
        </div>
      </div>
    </Section>
  );
}

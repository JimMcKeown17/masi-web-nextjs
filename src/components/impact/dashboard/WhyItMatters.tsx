import { pick } from "@/lib/api/impact/selectors";
import { PublishedStatsPayload } from "@/lib/types/impact";

import { Accent, Kicker, Section } from "./Section";
import { IconArray } from "./IconArray";

// The page's "why" section. Frames the mission as reading-as-superpower plus
// numeracy, not letter sounds (letter sounds are the measurement, and are defined
// in the ClassroomLights footnote where they belong).
export function WhyItMatters({ payload }: { payload: PublishedStatsPayload | null }) {
  const pirls = pick(payload, "arg_pirls");

  return (
    <Section className="border-y border-black/5 bg-[#FAF7F2]">
      <Kicker>Why it matters</Kicker>
      <h2 className="max-w-[640px] font-serif text-3xl font-medium leading-[1.12] tracking-tight text-[#14181D] md:text-[40px]">
        South Africa&apos;s future is decided <Accent>before age eight.</Accent>
      </h2>

      <div className="mt-12 flex flex-col gap-10 md:flex-row md:items-center md:gap-16">
        <div className="md:w-[38%] md:shrink-0">
          <IconArray total={10} filled={8} filledVariant="light-shaded" emptyVariant="light-unlit" className="mb-4" />
          {pirls && (
            <>
              <div className="font-serif text-5xl font-medium tracking-tight text-[#14181D] md:text-[58px]">
                {pirls.value}
              </div>
              <p className="mt-2.5 max-w-[250px] text-[14.5px] leading-snug text-gray-600">{pirls.label}.</p>
              <div className="mt-2.5 text-[11.5px] text-gray-400">{pirls.source_system}</div>
            </>
          )}
        </div>
        <p className="max-w-[560px] text-lg leading-relaxed text-gray-700 md:text-xl">
          A child who can&apos;t read can&apos;t learn anything else. Not maths, not science, not a way
          out of poverty. Reading is the <Accent>superpower</Accent> that unlocks all the others.
        </p>
      </div>

      <p className="mt-12 max-w-[640px] font-serif text-2xl leading-snug text-[#14181D]">
        So we build the foundation: <Accent>literacy and numeracy, from age four.</Accent>
      </p>
      <p className="mt-3 text-[13px] text-gray-500">
        In every classroom we enter, twice as many children learn to read. Watch it happen below.
      </p>
    </Section>
  );
}

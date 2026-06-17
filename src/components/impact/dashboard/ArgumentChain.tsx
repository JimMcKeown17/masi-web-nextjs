import { pick } from "@/lib/api/impact/selectors";
import { PublishedStatsPayload } from "@/lib/types/impact";

import { Accent, Kicker, Section } from "./Section";
import { IconArray } from "./IconArray";

export function ArgumentChain({ payload }: { payload: PublishedStatsPayload | null }) {
  const pirls = pick(payload, "arg_pirls");
  const letters = pick(payload, "arg_letter_sounds");
  const corr = pick(payload, "arg_correlation");

  return (
    <Section className="border-y border-black/5 bg-[#FAF7F2]">
      <Kicker>Why letter sounds</Kicker>
      <h2 className="max-w-[640px] font-serif text-3xl font-medium leading-[1.12] tracking-tight text-[#14181D] md:text-[40px]">
        South Africa&apos;s reading crisis is decided <Accent>before age eight.</Accent>
      </h2>
      <div className="mt-12 flex flex-col gap-10 md:flex-row md:gap-0">
        <div className="md:flex-1 md:px-7 md:first:pl-0">
          <IconArray total={10} filled={8} filledVariant="light-shaded" emptyVariant="light-unlit" className="mb-4" />
          {pirls && (
            <>
              <div className="font-serif text-5xl font-medium tracking-tight text-[#14181D] md:text-[58px]">{pirls.value}</div>
              <p className="mt-2.5 max-w-[250px] text-[14.5px] leading-snug text-gray-600">{pirls.label}.</p>
              <div className="mt-2.5 text-[11.5px] text-gray-400">{pirls.source_system}</div>
            </>
          )}
        </div>
        <div className="md:flex-1 md:border-l md:border-black/10 md:px-7">
          <div className="font-serif text-5xl font-medium italic tracking-tight text-[#14181D] md:text-[58px]">Why?</div>
          {letters && (
            <>
              <p className="mt-3.5 max-w-[250px] text-[14.5px] leading-snug text-gray-600">
                <strong>
                  {letters.value} {letters.label}
                </strong>
                , and letter-sound fluency is the strongest single predictor of becoming a reader.
              </p>
              <div className="mt-2.5 text-[11.5px] text-gray-400">
                {letters.source_system}
                {corr ? `; internal correlation rho = ${corr.value}` : ""}
              </div>
            </>
          )}
        </div>
        <div className="md:flex-1 md:border-l md:border-black/10 md:px-7">
          <div className="font-serif text-5xl font-medium tracking-tight md:text-[58px]">
            <Accent>2x</Accent>
          </div>
          <p className="mt-2.5 max-w-[250px] text-[14.5px] leading-snug text-gray-600">
            We double the number of children reaching the letter-sound benchmark in every classroom we enter.
          </p>
          <div className="mt-2.5 text-[11.5px] text-gray-400">See it happen below</div>
        </div>
      </div>
      <p className="mt-11 font-serif text-2xl leading-snug text-[#14181D]">
        So we start at the foundation: <Accent>letter sounds, from age four.</Accent>
      </p>
    </Section>
  );
}

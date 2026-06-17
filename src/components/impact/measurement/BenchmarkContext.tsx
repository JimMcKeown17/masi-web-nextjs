import { pick } from "@/lib/api/impact/selectors";
import { PublishedStatsPayload } from "@/lib/types/impact";

import { Accent, GradientRule, Kicker, MethodologyNote, Section } from "../dashboard/Section";

// Context follows our results, never leads. The PIRLS anchor is store-backed; the
// surrounding framing is qualitative so we never publish an unverified number.
export function BenchmarkContext({ payload }: { payload: PublishedStatsPayload | null }) {
  const pirls = pick(payload, "arg_pirls");

  return (
    <Section className="border-t border-black/5 bg-white">
      <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
        <div className="flex-1">
          <Kicker>The starting line</Kicker>
          <h2 className="max-w-[520px] font-serif text-3xl font-medium tracking-tight text-[#14181D] md:text-[40px]">
            Most children start school <Accent>already behind.</Accent>
          </h2>
          <p className="mt-4 max-w-[480px] text-[17px] leading-relaxed text-gray-600">
            In the Eastern Cape communities we serve, children arrive at school with far less early exposure to letters
            and numbers than their peers elsewhere. Our benchmarks are set at grade level, the standard every child is
            entitled to reach.
          </p>
          <p className="mt-4 max-w-[480px] text-[15px] leading-relaxed text-gray-500">
            Numeracy results for South African children sit among the lowest measured internationally, and the COVID
            years set early learning back further still. This context shows the size of the challenge. The bar stays
            where children need it.
          </p>
        </div>
        {pirls && (
          <div className="w-full flex-1 lg:max-w-[420px]">
            <div className="rounded-2xl border border-gray-200 bg-[#FAF7F2] p-8">
              <div className="font-serif text-7xl font-medium leading-none tracking-tight text-[#14181D]">
                {pirls.value}
              </div>
              <GradientRule />
              <p className="text-[16px] leading-relaxed text-[#14181D]">{pirls.label}.</p>
              <div className="mt-2.5 text-[12.5px] text-gray-400">{pirls.source_system}</div>
              <MethodologyNote stat={pirls} />
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

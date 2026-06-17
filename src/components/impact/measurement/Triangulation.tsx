import { pick } from "@/lib/api/impact/selectors";
import { PublishedStatsPayload } from "@/lib/types/impact";

import { Kicker, MethodologyNote, Section } from "../dashboard/Section";

const METHODS = [
  { title: "Session logs", body: "What was taught, to whom, and how often." },
  { title: "Formal assessments", body: "What each child can actually do." },
  { title: "Mentor observations", body: "How well the lesson was delivered." },
];

// The page's single dark band, and its strongest proof: independent methods that
// agree are trustworthy methods. The 0.93 correlation is store-backed.
export function Triangulation({ payload }: { payload: PublishedStatsPayload | null }) {
  const corr = pick(payload, "arg_correlation") ?? pick(payload, "more_correlation");

  return (
    <Section className="bg-[#0E1116] text-white">
      <Kicker accent="#E72D4D" dark>
        Measurement validity
      </Kicker>
      <h2 className="max-w-[760px] font-serif text-3xl font-medium tracking-tight md:text-[40px]">
        Three signals, <span className="font-serif font-light italic text-[#E72D4D]">one truth.</span>
      </h2>
      <p className="mt-3.5 max-w-[640px] text-[17px] leading-relaxed text-white/70">
        No single number is trusted on its own. We triangulate the three streams against each other. When independent
        methods agree, we trust the result. When they diverge, we investigate before we publish.
      </p>
      <div className="mt-12 flex flex-col items-stretch gap-5 lg:flex-row lg:items-center lg:gap-6">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          {METHODS.map((method) => (
            <div key={method.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="text-[14px] font-bold text-white">{method.title}</div>
              <div className="mt-1.5 text-[13px] leading-relaxed text-white/55">{method.body}</div>
            </div>
          ))}
        </div>
        <div className="hidden shrink-0 text-2xl text-white/25 lg:block" aria-hidden="true">
          &rarr;
        </div>
        {corr && (
          <div className="flex-1 rounded-2xl border border-[#E72D4D]/30 bg-[#171C24] p-7">
            <div className="font-serif text-6xl font-medium leading-none tracking-tight text-white md:text-7xl">
              {corr.value}
            </div>
            <div className="mt-3.5 text-[14px] leading-relaxed text-white/70">
              Our two independent literacy methods, Letters Known and EGRA improvement, agree at a Spearman correlation
              of ρ = {corr.value}. Two different instruments, the same answer.
            </div>
            <MethodologyNote stat={corr} dark />
          </div>
        )}
      </div>
    </Section>
  );
}

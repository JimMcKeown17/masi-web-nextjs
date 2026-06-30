import { ArrowUpRight } from "lucide-react";

import { Accent, GradientRule, Kicker, Section } from "@/components/impact/dashboard/Section";

// On-brand placeholder for a programme whose Headline Results are not yet built
// into the portal. Honest, not a dead end: it says what will live here and links
// out to the Streamlit Deep-Dive for anyone wanting operational detail now
// (CONTEXT.md — the Deep-Dive is retained, not replaced).
export function ComingSoon({ programme, accent }: { programme: string; accent: string }) {
  return (
    <Section className="bg-white">
      <div className="flex min-h-[58vh] max-w-[58ch] flex-col justify-center">
        <Kicker accent={accent}>Impact Data Portal &middot; {programme}</Kicker>
        <h1 className="font-serif text-5xl font-medium leading-[1.05] text-[#14181D] md:text-6xl">
          Coming <Accent accent={accent}>soon.</Accent>
        </h1>
        <GradientRule accent={accent} />
        <p className="max-w-[48ch] leading-relaxed text-gray-600">
          The {programme} headline results are being prepared. This view will answer one question, did it work, with the
          outcomes that matter to a funder: baselines, control groups, sample sizes, and the national benchmark. Every
          figure will be recomputed fresh from the assessment database and stamped with the date it was read.
        </p>
        <a
          href="https://data.masinyusane.org"
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#14181D]"
        >
          <span className="border-b-2 pb-0.5" style={{ borderColor: accent }}>
            View the operational deep-dive
          </span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </Section>
  );
}

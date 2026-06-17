import { group } from "@/lib/api/impact/selectors";
import { PublishedStatsPayload } from "@/lib/types/impact";

import { Accent, Kicker, Section } from "./Section";

function formatMonthYear(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
}

export function HeroSection({ payload }: { payload: PublishedStatsPayload | null }) {
  const kpis = group(payload, "hero_kpis");
  const verified = formatMonthYear(payload?.verified_through ?? null);

  return (
    <Section className="bg-white">
      <Kicker>Our Impact in Data</Kicker>
      <h1 className="max-w-[880px] font-serif text-5xl font-medium leading-[1.05] tracking-tight text-[#14181D] md:text-6xl lg:text-[66px]">
        Children years ahead, <Accent>measured every day.</Accent>
      </h1>
      <p className="mt-6 max-w-[660px] text-lg leading-relaxed text-gray-600 md:text-[19px]">
        Children on Masinyusane programmes perform as much as two grade levels ahead of comparison groups, and a
        serious measurement system tracks every child, every session, every skill.
      </p>
      {kpis.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-x-14 gap-y-8">
          {kpis.map((kpi) => (
            <div key={kpi.key}>
              <div className="font-serif text-4xl font-medium tracking-tight text-[#14181D]">{kpi.value}</div>
              <div className="mt-1 text-[13px] text-gray-500">{kpi.label}</div>
            </div>
          ))}
        </div>
      )}
      {verified && (
        <div className="mt-9 flex items-center gap-2 text-[13px] text-gray-400">
          <span className="h-2 w-2 rounded-full bg-[#14181D]" />
          Figures verified {verified}
          <span aria-hidden="true">&middot;</span>
          <a href="#how-we-know" className="underline decoration-dotted underline-offset-2">
            How we count
          </a>
        </div>
      )}
    </Section>
  );
}

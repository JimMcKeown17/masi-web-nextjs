import { group } from "@/lib/api/impact/selectors";
import { PublishedStatsPayload } from "@/lib/types/impact";

import { Section } from "./Section";

export function MoreResults({ payload }: { payload: PublishedStatsPayload | null }) {
  const items = group(payload, "more_results");
  if (items.length === 0) return null;

  return (
    <Section className="border-t border-black/5 bg-white">
      <h3 className="mb-5 text-[15px] font-bold uppercase tracking-wider text-gray-500">More results</h3>
      <div className="flex flex-col gap-4 md:flex-row">
        {items.map((stat) => (
          <div key={stat.key} className="flex-1 rounded-xl border border-gray-200 p-[18px]">
            <div className="font-serif text-[24px] font-medium text-[#14181D]">{stat.value}</div>
            <div className="mt-1 text-[12.5px] leading-relaxed text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

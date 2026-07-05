import { FadeUp } from "@/components/animations/FadeAnimations";
import { DASHBOARDS } from "@/lib/data-map/config";
import { Eyebrow, RoleChip } from "./legend";

// Where the data lands: one card per dashboard, each declaring exactly what
// it reads. Freshness tells leadership how old the number on screen can be.

function FreshnessBadge({ value }: { value: string }) {
  return (
    <span className="rounded-full border border-gray-300 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-gray-500">
      {value}
    </span>
  );
}

export function DashboardGrid() {
  return (
    <section id="dashboards" className="bg-[#FAF7F2] py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeUp>
          <Eyebrow index="06" label="Where it lands" />
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            Nine places we
            <span className="italic font-light text-[#E72D4D]"> look.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-gray-600 text-lg leading-relaxed">
            Each card names what the page reads. If a number on one of these
            screens looks wrong, this is the map of where to start looking:
            follow the chips back to the tables above.
          </p>
        </FadeUp>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DASHBOARDS.map((d, i) => (
            <FadeUp key={d.name} delay={0.05 * i}>
              <div className="h-full rounded-lg border border-gray-200 bg-white p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-xl text-[#14181D]">
                    {d.name}
                  </h3>
                  <FreshnessBadge value={d.freshness} />
                </div>
                <code className="mt-0.5 font-mono text-[11px] text-gray-400">
                  {d.route}
                </code>
                <p className="mt-1 text-xs text-gray-500">
                  read by {d.audience}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {d.reads.map((r) => (
                    <RoleChip key={r.label} role={r.role} label={r.label} />
                  ))}
                </div>
                {d.note && (
                  <p className="mt-3 pt-3 border-t border-gray-100 text-xs leading-relaxed text-gray-500">
                    {d.note}
                  </p>
                )}
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

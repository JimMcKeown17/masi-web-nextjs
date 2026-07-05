import CountUp from "@/components/animations/count-up";
import { FadeUp } from "@/components/animations/FadeAnimations";
import { AS_OF, COUNTS } from "@/lib/data-map/config";
import { Eyebrow, RoleLegend } from "./legend";

const STATS: { value: number; label: string }[] = [
  { value: COUNTS.captureTools, label: "capture tools" },
  { value: 2, label: "canonical backends" },
  { value: COUNTS.canonical, label: "canonical entities" },
  { value: COUNTS.events, label: "event streams" },
  { value: COUNTS.dashboards, label: "dashboards" },
];

export function Hero() {
  return (
    <section className="bg-[#FAF7F2] pt-28 md:pt-36 pb-16 md:pb-20">
      <div className="container mx-auto px-4">
        <FadeUp>
          <Eyebrow index="i" label="Operations · The Data Map" />
          <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D] max-w-3xl">
            How our data is
            <br />
            <span className="italic font-light text-[#E72D4D]">wired.</span>
          </h1>
        </FadeUp>

        <FadeUp delay={0.1}>
          <p className="mt-6 max-w-2xl text-gray-600 text-lg leading-relaxed">
            Every school day, coaches, EAs, assessors and mentors capture
            thousands of moments across our schools. This page maps how those
            moments travel: from the tools where staff record them, into two
            Postgres backends where they are linked to the children, youth and
            schools they belong to, and out onto the dashboards we run the
            organisation with.
          </p>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-8 gap-y-6 max-w-3xl">
            {STATS.map((s) => (
              <div key={s.label}>
                <span className="font-serif block text-4xl md:text-5xl font-medium text-[#14181D]">
                  <CountUp to={s.value} />
                </span>
                <span className="mt-1 block text-sm text-gray-500">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
            <RoleLegend />
            <span className="text-xs text-gray-400">
              The three colours mean the same thing everywhere on this page.
              Reflects the system as of {AS_OF}.
            </span>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

import { Accent, Kicker, Section } from "../dashboard/Section";

const STAGES = [
  {
    tag: "Then",
    title: "Manual exports",
    body: "Early results were compiled by hand from field sheets and spreadsheets.",
  },
  {
    tag: null,
    title: "API integration",
    body: "Session data now flows directly from the field app into our own systems.",
  },
  {
    tag: null,
    title: "Relational database",
    body: "Children, schools, youth, sessions and assessments live in one connected store.",
  },
  {
    tag: "Now",
    title: "Nightly syncs",
    body: "Current-year data refreshes every night, powering the dashboards our team uses.",
  },
];

export function DataInfrastructure() {
  return (
    <Section className="bg-[#FAF7F2]">
      <Kicker>Built to scale</Kicker>
      <h2 className="max-w-[760px] font-serif text-3xl font-medium tracking-tight text-[#14181D] md:text-[40px]">
        From spreadsheets to a <Accent>live data system.</Accent>
      </h2>
      <p className="mt-3.5 max-w-[640px] text-[17px] leading-relaxed text-gray-600">
        The measurement system grew with the programme. Each step removed a manual handoff and a place for error to hide.
      </p>
      <div className="mt-12">
        {STAGES.map((stage, index) => (
          <div key={stage.title} className="flex gap-5">
            <div className="flex flex-col items-center">
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-[#E72D4D]" />
              {index < STAGES.length - 1 && <span className="w-px flex-1 bg-black/10" />}
            </div>
            <div className="pb-8">
              <div className="flex items-center gap-2.5">
                <span className="text-[15px] font-bold text-[#14181D]">{stage.title}</span>
                {stage.tag && (
                  <span className="rounded-full bg-[#14181D] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                    {stage.tag}
                  </span>
                )}
              </div>
              <p className="mt-1 max-w-[480px] text-[14px] leading-relaxed text-gray-600">{stage.body}</p>
            </div>
          </div>
        ))}
      </div>
      <details className="mt-2 rounded-xl border border-gray-200 bg-white p-5 text-[13.5px] text-gray-600">
        <summary className="cursor-pointer font-semibold text-[#14181D]">
          Technical note, for due-diligence readers
        </summary>
        <div className="mt-3 space-y-2.5 leading-relaxed">
          <p>
            Session data is resolved from the field app through a two-step group lookup, matching each logged group to
            its school and youth before any record is written.
          </p>
          <p>
            ECD baselines carry a known caveat: many four-year-olds start at or near zero, so early-year gains are read
            as movement off the floor rather than precise point differences.
          </p>
          <p>
            Headline comparisons are cross-sectional unless a matched baseline-to-endline cohort is stated. Matched
            analysis is used wherever the same children can be tracked across the full year.
          </p>
        </div>
      </details>
    </Section>
  );
}

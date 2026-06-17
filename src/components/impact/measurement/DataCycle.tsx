import { Accent, Kicker, Section } from "../dashboard/Section";

const STEPS = [
  { n: "01", title: "Collect", body: "Youth log every session from the field; assessments captured on device." },
  { n: "02", title: "Clean", body: "Nightly syncs validate and de-duplicate every record." },
  { n: "03", title: "Assess", body: "Baseline, midline and endline measure each child against benchmarks." },
  { n: "04", title: "Analyze", body: "Gains computed per child, school and cohort; outliers flagged." },
  { n: "05", title: "Coach", body: "Mentors act on the data in the classrooms that need it most." },
  { n: "06", title: "Adapt", body: "Programme design shifts: pacing, grouping, language, materials." },
  { n: "07", title: "Report", body: "Verified results flow to dashboards, donors and partners." },
];

export function DataCycle() {
  return (
    <Section className="border-t border-black/5 bg-white">
      <Kicker>From collection to action</Kicker>
      <h2 className="max-w-[820px] font-serif text-3xl font-medium tracking-tight text-[#14181D] md:text-[40px]">
        Our data runs the programme, <Accent>week by week.</Accent>
      </h2>
      <p className="mt-3.5 max-w-[640px] text-[17px] leading-relaxed text-gray-600">
        The same loop runs all year, turning yesterday&apos;s sessions into this week&apos;s coaching priorities.
      </p>
      <ol className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <li key={step.n} className="flex flex-col bg-white p-5">
            <span className="font-serif text-[15px] font-medium text-[#E72D4D]">{step.n}</span>
            <span className="mt-1 text-[15px] font-bold text-[#14181D]">{step.title}</span>
            <span className="mt-1.5 text-[13px] leading-relaxed text-gray-500">{step.body}</span>
          </li>
        ))}
        <li className="flex flex-col justify-center bg-[#14181D] p-5">
          <span className="text-[13px] font-semibold leading-relaxed text-white">The loop never stops.</span>
          <span className="mt-1 text-[12.5px] leading-relaxed text-white/60">Every cycle sharpens the next.</span>
        </li>
      </ol>
    </Section>
  );
}

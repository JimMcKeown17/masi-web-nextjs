import Link from "next/link";

import { Accent, Kicker, Section } from "../dashboard/Section";

// The four inputs the rest of the page expands on. Quiet labels, not stats.
const INPUTS = [
  { label: "Daily sessions", note: "every lesson logged" },
  { label: "Formal assessments", note: "three times a year" },
  { label: "Mentor visits", note: "in the classroom" },
  { label: "Live dashboards", note: "our team acts on" },
];

export function MeasurementHero() {
  return (
    <Section className="bg-white">
      <Link
        href="/impact"
        className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 transition-colors hover:text-[#14181D]"
      >
        <span aria-hidden="true">&larr;</span> Our impact in data
      </Link>
      <div className="mt-6">
        <Kicker>Monitoring, Evaluation &amp; Data</Kicker>
      </div>
      <h1 className="max-w-[900px] font-serif text-5xl font-medium leading-[1.05] tracking-tight text-[#14181D] md:text-6xl lg:text-[64px]">
        We measure whether children can <Accent>read and count.</Accent>
      </h1>
      <p className="mt-6 max-w-[680px] text-lg leading-relaxed text-gray-600 md:text-[19px]">
        Behind that claim is a serious measurement system. Every session is logged, every child is assessed three times
        a year, trained mentors sit in the classrooms, and the results flow to live dashboards our own team acts on.
      </p>
      <div className="mt-12 grid grid-cols-2 gap-x-10 gap-y-7 sm:flex sm:flex-wrap sm:gap-x-14 sm:gap-y-8">
        {INPUTS.map((input) => (
          <div key={input.label}>
            <div className="text-[15px] font-bold text-[#14181D]">{input.label}</div>
            <div className="mt-0.5 text-[13px] text-gray-500">{input.note}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

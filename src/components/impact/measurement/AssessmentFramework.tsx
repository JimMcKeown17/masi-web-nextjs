import { BookOpen, Calculator } from "lucide-react";

import { Accent, Kicker, Section } from "../dashboard/Section";

// The four lenses we read every literacy score through.
const LITERACY_LENSES = ["Raw score", "Standardised 0–10", "Percent change", "Learning gain"];

export function AssessmentFramework() {
  return (
    <Section className="bg-[#FAF7F2]">
      <Kicker>Assessment framework</Kicker>
      <h2 className="max-w-[820px] font-serif text-3xl font-medium tracking-tight text-[#14181D] md:text-[40px]">
        We measure against <Accent>defined benchmarks.</Accent>
      </h2>
      <p className="mt-3.5 max-w-[660px] text-[17px] leading-relaxed text-gray-600">
        Two assessment systems, each with grade-level benchmarks set before the year begins, so a gain means the same
        thing in every classroom and every language.
      </p>
      <div className="mt-12 flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-7 shadow-[0_8px_30px_rgba(17,24,39,0.04)]">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF7F2] text-[#C81E3C] ring-1 ring-black/5">
            <BookOpen size={22} />
          </div>
          <h3 className="text-[19px] font-bold text-[#14181D]">Literacy</h3>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-gray-600">
            EGRA letter-sound fluency, measured in letters correct per minute, alongside the wider set of early-literacy
            skills we track for every child across the year.
          </p>
          <div className="mt-5 rounded-xl border border-black/10 bg-[#FAF7F2] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Benchmark</div>
            <div className="mt-1.5 text-[14px] leading-relaxed text-[#14181D]">
              40 letter sounds per minute by the end of Grade 1 in isiXhosa, with passage-reading benchmarks beyond it.
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              Read four ways
            </div>
            <div className="flex flex-wrap gap-2">
              {LITERACY_LENSES.map((lens) => (
                <span
                  key={lens}
                  className="rounded-full border border-black/10 bg-white px-3 py-1 text-[12.5px] font-medium text-gray-700"
                >
                  {lens}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-7 shadow-[0_8px_30px_rgba(17,24,39,0.04)]">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF7F2] text-[#C81E3C] ring-1 ring-black/5">
            <Calculator size={22} />
          </div>
          <h3 className="text-[19px] font-bold text-[#14181D]">Numeracy</h3>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-gray-600">
            The Yazi Amanani assessment across nine components, from counting aloud to written sums, captured at baseline
            and endline so every child is measured against their own starting point.
          </p>
          <div className="mt-5 rounded-xl border border-black/10 bg-[#FAF7F2] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Benchmarks by grade</div>
            <ul className="mt-2 space-y-1.5">
              {["Count to 20 and beyond", "Identify numbers to 100", "Write numbers 1 to 10"].map((item) => (
                <li key={item} className="flex gap-2.5 text-[14px] leading-snug text-[#14181D]">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#E72D4D]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-5 text-[12.5px] leading-relaxed text-gray-400">
            Components run from counting and number recognition through to sums, so an overall score breaks down into the
            exact skill each child is stuck on.
          </p>
        </div>
      </div>
    </Section>
  );
}

import { Lock, ShieldCheck } from "lucide-react";

import { Accent, Kicker, Section } from "../dashboard/Section";

export function QualityPrivacy() {
  return (
    <Section className="border-t border-black/5 bg-white">
      <Kicker>Quality &amp; privacy</Kicker>
      <h2 className="max-w-[760px] font-serif text-3xl font-medium tracking-tight text-[#14181D] md:text-[40px]">
        We hold the data, and <Accent>ourselves,</Accent> to a standard.
      </h2>
      <div className="mt-12 flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-7 shadow-[0_8px_30px_rgba(17,24,39,0.04)]">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF7F2] text-[#C81E3C] ring-1 ring-black/5">
            <ShieldCheck size={22} />
          </div>
          <h3 className="text-[19px] font-bold text-[#14181D]">Quality assurance</h3>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-gray-600">
            We measure the outcomes and watch how the work is done. The system flags implementation patterns that
            tend to reduce learning, such as moving through letters too quickly or running groups too large to
            differentiate, so mentors can step in early.
          </p>
          <p className="mt-3.5 text-[13px] leading-relaxed text-gray-500">
            These flags drive coaching. They are never published as per-school or per-youth rankings.
          </p>
        </div>
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-7 shadow-[0_8px_30px_rgba(17,24,39,0.04)]">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF7F2] text-[#C81E3C] ring-1 ring-black/5">
            <Lock size={22} />
          </div>
          <h3 className="text-[19px] font-bold text-[#14181D]">Privacy and consent</h3>
          <p className="mt-2.5 text-[14.5px] leading-relaxed text-gray-600">
            Public views are aggregate and anonymised. Names and sensitive fields are masked. A child&apos;s photo or
            story appears only with guardian consent.
          </p>
          <p className="mt-3.5 text-[13px] leading-relaxed text-gray-500">
            We comply with POPIA, South Africa&apos;s data-protection law, in how we store, share and display every
            record.
          </p>
        </div>
      </div>
    </Section>
  );
}

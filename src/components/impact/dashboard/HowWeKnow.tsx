import { BarChart3, ClipboardList, Eye } from "lucide-react";
import Link from "next/link";

import { Kicker, Section } from "./Section";

const STREAMS = [
  {
    icon: ClipboardList,
    title: "Daily sessions",
    body: "Every lesson logged: letters taught, group composition, attendance, duration.",
    micro: "Shows children receive instruction",
  },
  {
    icon: BarChart3,
    title: "Formal assessments",
    body: "EGRA letter fluency and nine numeracy skills, at baseline, midline and endline.",
    micro: "Shows children actually learn",
  },
  {
    icon: Eye,
    title: "Mentor visits",
    body: "Trained mentors observe sessions, coach youth, and flag quality issues early.",
    micro: "Explains the numbers, and improves them",
  },
];

export function HowWeKnow() {
  return (
    <Section className="bg-white">
      <div className="text-center" id="how-we-know">
        <div className="flex items-center justify-center">
          <Kicker>Chapter 07 &middot; Credibility</Kicker>
        </div>
        <h2 className="font-serif text-3xl font-medium tracking-tight text-[#14181D] md:text-[40px]">
          How we <span className="font-light italic text-[#E72D4D]">know.</span>
        </h2>
        <p className="mx-auto mt-3.5 max-w-[620px] text-[17px] leading-relaxed text-gray-600">
          We don&apos;t just collect stories. Three independent evidence streams are triangulated daily, so when a number
          is high, we know why, and when it&apos;s low, we can fix it.
        </p>
      </div>
      <div className="mt-12 flex flex-col gap-6 text-left md:flex-row">
        {STREAMS.map((stream) => {
          const Icon = stream.icon;
          return (
            <div
              key={stream.title}
              className="flex-1 rounded-2xl border border-gray-200 bg-white p-7 shadow-[0_8px_30px_rgba(17,24,39,0.04)]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF7F2] text-[#C81E3C] ring-1 ring-black/5">
                <Icon size={22} />
              </div>
              <h3 className="mb-2 text-[17px] font-bold text-[#14181D]">{stream.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{stream.body}</p>
              <div className="mt-3.5 text-[12.5px] text-gray-400">{stream.micro}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-11 text-center">
        <Link
          href="/impact/measurement"
          className="inline-block rounded-md bg-[#14181D] px-7 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-black"
        >
          Inside our measurement system &rarr;
        </Link>
      </div>
    </Section>
  );
}

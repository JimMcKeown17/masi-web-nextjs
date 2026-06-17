import { BarChart3, ClipboardList, Eye } from "lucide-react";

import { Accent, Kicker, Section } from "../dashboard/Section";

// Expanded treatment of the dashboard's "How we know" teaser: what each stream
// captures and why it matters.
const STREAMS = [
  {
    icon: ClipboardList,
    title: "Daily sessions",
    captures: [
      "Letters and sounds taught",
      "Group size and composition",
      "Attendance and duration",
      "Which youth delivered the lesson",
    ],
    why: "Confirms children are receiving instruction, and exactly how much.",
  },
  {
    icon: BarChart3,
    title: "Formal assessments",
    captures: [
      "EGRA letter-sound fluency",
      "The wider early-literacy skill set",
      "Nine numeracy components",
      "Baseline, midline and endline",
    ],
    why: "Measures what each child can actually do.",
  },
  {
    icon: Eye,
    title: "Mentor visits",
    captures: [
      "Structured classroom observations",
      "Coaching notes for each youth",
      "Quality flags raised early",
      "Follow-up on flagged sites",
    ],
    why: "Explains the numbers, and improves them, before they reach a result.",
  },
];

export function EvidenceStreams() {
  return (
    <Section className="bg-[#FAF7F2]">
      <Kicker>Three evidence streams</Kicker>
      <h2 className="max-w-[760px] font-serif text-3xl font-medium tracking-tight text-[#14181D] md:text-[40px]">
        We collect three kinds of evidence, <Accent>every day.</Accent>
      </h2>
      <p className="mt-3.5 max-w-[640px] text-[17px] leading-relaxed text-gray-600">
        Each stream answers a different question. Together they let us separate effort from outcome, and outcome from
        luck.
      </p>
      <div className="mt-12 flex flex-col gap-6 md:flex-row">
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
              <h3 className="mb-3.5 text-[17px] font-bold text-[#14181D]">{stream.title}</h3>
              <ul className="space-y-1.5">
                {stream.captures.map((capture) => (
                  <li key={capture} className="flex gap-2.5 text-[13.5px] leading-snug text-gray-600">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#E72D4D]" />
                    {capture}
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-black/5 pt-3.5 text-[12.5px] leading-relaxed text-gray-500">
                <span className="font-semibold text-gray-700">Why it matters: </span>
                {stream.why}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-9 max-w-[760px] border-l-2 border-[#E72D4D] pl-5 text-[17px] leading-relaxed text-[#14181D]">
        When session activity is high but learning gains are low, mentor-visit data shows us the implementation issue
        behind the number.
      </div>
    </Section>
  );
}

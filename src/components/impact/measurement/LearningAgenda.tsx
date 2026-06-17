import { Accent, Kicker, Section } from "../dashboard/Section";

const QUESTIONS = [
  {
    q: "How early can we start?",
    a: "ECD pilots test whether four- and five-year-olds can reach Grade 1 reading benchmarks before they ever enter Grade 1.",
  },
  {
    q: "Which language, at which pace?",
    a: "We compare progress across isiXhosa, English and Afrikaans to set the right sequence and pacing for each.",
  },
  {
    q: "Full-time or part-time youth?",
    a: "Different delivery models are measured side by side to see which produces stronger, more consistent gains.",
  },
  {
    q: "How much does grouping help?",
    a: "We test differentiation and group size against learning gains to find where the returns start to fade.",
  },
];

export function LearningAgenda() {
  return (
    <Section className="bg-[#FAF7F2]">
      <Kicker>What we&apos;re testing</Kicker>
      <h2 className="max-w-[760px] font-serif text-3xl font-medium tracking-tight text-[#14181D] md:text-[40px]">
        A programme that <Accent>learns.</Accent>
      </h2>
      <p className="mt-3.5 max-w-[640px] text-[17px] leading-relaxed text-gray-600">
        Every year we run pilots and hold them to the same evidence bar as the core programme. The ones that prove out
        become part of it.
      </p>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {QUESTIONS.map((item) => (
          <div key={item.q} className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="font-serif text-[20px] font-medium leading-snug text-[#14181D]">{item.q}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-gray-600">{item.a}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

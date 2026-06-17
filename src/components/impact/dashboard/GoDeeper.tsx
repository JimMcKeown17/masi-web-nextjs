import { Section } from "./Section";

const LINKS = [
  {
    title: "Live data portal",
    body: "The full exploration environment our own team uses.",
    cta: "data.masinyusane.org",
    href: "https://data.masinyusane.org",
  },
  {
    title: "Zazi iZandi portal",
    body: "Programme-level literacy results, 2023-2026.",
    cta: "data.zazi-izandi.co.za",
    href: "https://data.zazi-izandi.co.za",
  },
  {
    title: "Annual reports",
    body: "Audited results and financials, year by year.",
    cta: "View reports",
    href: "/impact/reports",
  },
  {
    title: "Due-diligence pack",
    body: "Methodology notes, data dictionary, evaluation designs.",
    cta: "Request pack",
    href: "mailto:info@masinyusane.org",
  },
];

export function GoDeeper() {
  return (
    <Section className="border-t border-black/5 bg-[#FAF7F2]">
      <h2 className="font-serif text-2xl tracking-tight text-[#14181D] md:text-[28px]">
        Go <span className="font-light italic text-[#E72D4D]">deeper.</span>
      </h2>
      <div className="mt-7 flex flex-col gap-4 md:flex-row">
        {LINKS.map((link) => (
          <a key={link.title} href={link.href} className="flex-1 rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
            <div className="mb-1.5 text-[15px] font-bold text-[#14181D]">{link.title}</div>
            <div className="text-[13px] leading-relaxed text-gray-500">{link.body}</div>
            <div className="mt-3.5 text-[13px] font-semibold text-[#E72D4D]">{link.cta} &rarr;</div>
          </a>
        ))}
      </div>
    </Section>
  );
}

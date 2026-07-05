import { FadeUp } from "@/components/animations/FadeAnimations";
import { NEXT_CHAPTERS } from "@/lib/data-map/config";
import { Eyebrow } from "./legend";

// The map's known future: short, numbered, no roadmap theatre.

export function NextChapter() {
  return (
    <section id="next" className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4">
        <FadeUp>
          <Eyebrow index="08" label="What comes next" />
          <h2 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            The map is
            <span className="italic font-light text-[#E72D4D]"> moving.</span>
          </h2>
        </FadeUp>

        <div className="mt-12 grid md:grid-cols-3 gap-10">
          {NEXT_CHAPTERS.map((c, i) => (
            <FadeUp key={c.title} delay={0.1 * (i + 1)}>
              <div>
                <span className="font-serif text-3xl italic text-[#E72D4D]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-serif text-2xl text-[#14181D]">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {c.body}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.4}>
          <div className="mt-16 border-t border-gray-200 pt-6 flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-xs text-gray-400">
              This page renders entirely from{" "}
              <code className="font-mono">src/lib/data-map/config.ts</code>.
              When the wiring changes, change the config.
            </p>
            <p className="font-serif text-xs italic ml-auto text-gray-400">
              Every child reading. Every youth working.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

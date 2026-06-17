import Image from "next/image";

import { getImageUrl } from "@/lib/imageUrl";
import { Kicker, Section } from "./Section";
import { RadarChart } from "./RadarChart";

// Zanothando Mhlanga, Grade R, Isaac Booi Primary. Real, consented photo and profile.
// Axes (clockwise from top): Letter Sounds, Story Comp., First Sounds, Read Words,
// Read Sentences, Write Letters, Write CVCs, Listen Words.
// November (endline) approximates her real end-of-year radar; January (baseline) is
// near-zero on reading and writing, ~50% letters, partial listening.
const BASELINE_JAN = [0.5, 0.15, 0.3, 0.0, 0.0, 0.0, 0.0, 0.4];
const ENDLINE_NOV = [1.0, 0.3, 0.9, 0.65, 0.6, 0.7, 0.9, 1.0];

const ACCENT = "#C81E3C";

export function ChildProfile() {
  return (
    <Section className="bg-[#FAF7F2]">
      <Kicker accent={ACCENT}>Chapter 03 &middot; One Child</Kicker>
      <h2 className="max-w-[640px] font-serif text-3xl font-medium leading-[1.1] tracking-tight text-[#14181D] md:text-[42px]">
        Behind every percentage is a child we know by name.
      </h2>
      <p className="mt-4 max-w-[620px] text-[17px] leading-relaxed text-gray-600">
        We track all 11 of Zanothando&apos;s literacy skills, meeting her exactly at her level and never moving on until
        she has mastered each one. We do this for every child on our core literacy programme.
      </p>

      <div className="mt-12 flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Face-focused portrait */}
        <div className="flex-1">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-[0_16px_44px_rgba(17,24,39,0.18)]">
            <Image
              src={getImageUrl("images/Zanothando Mhlanga.webp")}
              alt="Zanothando Mhlanga, Grade R at Isaac Booi Primary"
              fill
              sizes="(min-width: 1024px) 540px, 100vw"
              className="scale-[1.4] object-cover object-[50%_9%]"
              style={{ transformOrigin: "50% 9%" }}
            />
            <div className="absolute inset-x-4 bottom-4 rounded-xl bg-[#0E1116]/65 px-4 py-2.5 text-[13px] leading-relaxed text-white backdrop-blur-sm">
              <b>Zanothando, Grade R</b>
              <br />
              Isaac Booi Primary
            </div>
          </div>
        </div>

        {/* Skill radar, same footprint as the photo */}
        <div className="flex-1">
          <div className="flex aspect-square w-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_8px_30px_rgba(17,24,39,0.06)]">
            <div className="text-[13px] font-semibold text-gray-700">Zanothando &middot; skill profile</div>
            <div className="my-2.5 flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="h-[3px] w-[18px] rounded bg-slate-300" />
                January
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-[3px] w-[18px] rounded bg-[#C81E3C]" />
                November
              </span>
            </div>
            <div className="flex flex-1 items-center">
              <RadarChart baseline={BASELINE_JAN} endline={ENDLINE_NOV} />
            </div>
            <div className="text-[11px] text-gray-400">11 skills on the full profile; 8 shown here.</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

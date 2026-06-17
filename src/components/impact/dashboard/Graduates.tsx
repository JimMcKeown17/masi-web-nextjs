import Image from "next/image";

import { group } from "@/lib/api/impact/selectors";
import { getImageUrl } from "@/lib/imageUrl";
import { PublishedStatsPayload } from "@/lib/types/impact";

import { Kicker, Section } from "./Section";

// Graduate headshots from the GCS bucket (images/Graduates/grad headshot N.png).
const PHOTOS = Array.from({ length: 12 }, (_, i) => ({
  src: `images/Graduates/grad headshot ${i + 1}.png`,
  alt: "Masinyusane graduate",
}));

export function Graduates({ payload }: { payload: PublishedStatsPayload | null }) {
  const stats = group(payload, "graduates");

  return (
    <Section className="bg-[#0E1116] text-white">
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
        <div className="flex-1">
          <Kicker accent="#E2B53C" dark>
            Chapter 06 &middot; The Long Game
          </Kicker>
          <h2 className="font-serif text-3xl font-medium leading-[1.12] tracking-tight md:text-[40px]">
            Literacy at six becomes a <span className="font-light italic text-[#E2B53C]">graduation at twenty-two.</span>
          </h2>
          <p className="mt-4 max-w-[480px] text-[16.5px] leading-relaxed text-gray-400">
            The same model (local people, real investment, relentless follow-through) has put hundreds of young people
            from these communities through university.{" "}
            <b className="text-gray-200">Many now lead the programmes measured on this page.</b>
          </p>
          {stats.length > 0 && (
            <div className="mt-7 flex gap-12">
              {stats.map((stat) => (
                <div key={stat.key}>
                  <div className="font-serif text-[44px] font-medium text-[#E2B53C]">{stat.value}</div>
                  <div className="mt-0.5 text-[13px] text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
          <a
            href="/programs/top-learners"
            className="mt-8 inline-block rounded-xl border border-[#E2B53C]/40 px-6 py-3 text-[14.5px] font-semibold text-white transition-colors hover:bg-[#E2B53C]/10"
          >
            Meet the graduates &rarr;
          </a>
        </div>
        <div className="grid w-full flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          {PHOTOS.map((photo) => (
            <div key={photo.src} className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-white/10">
              <Image
                src={getImageUrl(photo.src)}
                alt={photo.alt}
                fill
                sizes="(min-width: 1024px) 150px, 45vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

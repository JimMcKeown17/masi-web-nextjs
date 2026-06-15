'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { FadeUp, FadeLeft } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

// ============================================================================
// PLACEHOLDER STORY — DO NOT SHIP.
// Name, photo, caption, story, quote, and the facts below are all illustrative,
// used to prove out the "Meet a woman" layout. Replace with one real, consented
// person and her real before/after details before the page goes live. The photo
// currently reuses an existing staff image.
// ============================================================================
const PERSON = {
  name: 'Nomsa',
  caption: 'Literacy coach since 2023',
  photo: '/images/Staff 1.jpg',
  story:
    'Before Masinyusane, Nomsa had finished school but never held a job. We hired her, trained her in our literacy method, and placed her in a school in her own community. Today she coaches children through their first words every single day, and earns the first steady income her household has known.',
  pullquote: 'From her first job to a leader in her school.',
  facts: [
    { value: '2 yrs', label: 'unemployed before her first job' },
    { value: '14', label: 'children she now teaches to read' },
    { value: '1st', label: 'steady income in her household' },
  ],
};

export default function PersonStorySection() {
  return (
    <section className="bg-[#0E1116] text-white py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <FadeUp className="max-w-3xl mb-14 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#5B9BFF]" />
            <span className="text-sm tracking-[0.25em] uppercase text-white/60">One woman&apos;s story</span>
          </div>
          <h2 style={serif} className="text-4xl md:text-6xl leading-[1.05]">
            Meet <span className="italic font-light text-[#5B9BFF]">{PERSON.name}.</span>
          </h2>
        </FadeUp>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - portrait + story */}
          <FadeUp className="space-y-7">
            <div className="relative rounded-lg overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src={getImageUrl(PERSON.photo)}
                  alt={`${PERSON.name}, Masinyusane literacy coach`}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                <p className="text-sm text-white/75">{PERSON.caption}</p>
              </div>
            </div>

            <p className="text-white/80 text-lg leading-relaxed">{PERSON.story}</p>

            <p style={serif} className="text-2xl md:text-3xl italic font-light leading-snug text-white">
              {PERSON.pullquote}
            </p>
          </FadeUp>

          {/* Right - her journey in facts */}
          <FadeLeft>
            <div className="rounded-lg bg-[#171C24] ring-1 ring-white/10 p-8 md:p-10">
              <p className="text-sm tracking-[0.2em] uppercase text-white/50 mb-8">Her journey</p>
              <div className="space-y-8">
                {PERSON.facts.map((f) => (
                  <div key={f.label} className="border-t border-white/10 pt-5 first:border-t-0 first:pt-0">
                    <span style={serif} className="block text-4xl md:text-5xl font-medium text-[#5B9BFF]">
                      {f.value}
                    </span>
                    <p className="text-white/70 mt-1">{f.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeLeft>
        </div>
      </div>
    </section>
  );
}

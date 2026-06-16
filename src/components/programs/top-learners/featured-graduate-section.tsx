'use client';
import { getAssetUrl } from '@/lib/imageUrl';
import { FadeUp, FadeRight } from '@/components/animations/FadeAnimations';
import { ArrowRight } from 'lucide-react';
import GraduatePortrait from './graduate-portrait';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

// One graduate, in depth, as the emotional crescendo before the numbers. Aphiwe's arc
// (rural herdboy -> MSc -> PhD track -> Altron in Sandton) is the strongest single story
// across both magazines. Dark panel for contrast; gold-on-dark uses the lifted #E2B53C
// so the accent stays legible. Story is third-person from the 2024 magazine; quote is his.
const FEATURED = {
  name: 'Aphiwe',
  caption: 'MSc Applied Mathematics',
  image: 'images/Graduates/aphiwe-magaya.webp',
  story:
    'From the deep rural areas of the former Transkei, this former herdboy is now well on his way to a PhD. Having lost his brother and his father, he credits his family for their support, and he now works in Africa’s richest square mile, Sandton, for the corporate powerhouse Altron Digital Business.',
  quote:
    'Graduation has not only landed me a job, it has expanded my network, with many organisations looking to collaborate with me to develop this country for the better.',
  facts: [
    { value: 'MSc', label: 'in Applied Mathematics, with a PhD next' },
    { value: 'Herdboy', label: 'to a corporate role in Sandton' },
    { value: 'Altron', label: 'Digital Business, Johannesburg' },
  ],
};

export default function FeaturedGraduateSection() {
  return (
    <section className="bg-[#0E1116] text-white py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Portrait - left rail */}
          <FadeUp className="lg:col-span-5">
            <div className="relative rounded-lg overflow-hidden">
              <div className="relative aspect-[3/4]">
                <GraduatePortrait
                  image={FEATURED.image}
                  name={FEATURED.name}
                  dark
                  sizes="(min-width: 1024px) 42vw, 100vw"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                <p className="text-sm text-white/75">{FEATURED.caption}</p>
              </div>
            </div>
          </FadeUp>

          {/* Eyebrow + headline + story + quote + facts */}
          <FadeRight className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-[#E2B53C]" />
              <span className="text-sm tracking-[0.25em] uppercase text-white/60">One graduate&apos;s road</span>
            </div>
            <h2 style={serif} className="text-4xl md:text-6xl leading-[1.05] mb-8">
              Meet <span className="italic font-light text-[#E2B53C]">{FEATURED.name}.</span>
            </h2>

            <div className="flex flex-col gap-7">
              <p className="text-white/80 text-lg leading-relaxed">{FEATURED.story}</p>

              <blockquote style={serif} className="text-2xl md:text-[2rem] italic font-light leading-snug text-white">
                &ldquo;{FEATURED.quote}&rdquo;
              </blockquote>

              <a
                href={getAssetUrl('reports/2025 Graduates Magazine.pdf')}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-[#E2B53C] font-medium w-fit"
              >
                Read more graduate stories
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>

              <div className="mt-2 pt-7 border-t border-white/10">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {FEATURED.facts.map((f) => (
                    <div key={f.label}>
                      <span style={serif} className="block text-3xl md:text-4xl font-medium text-[#E2B53C]">
                        {f.value}
                      </span>
                      <p className="text-white/65 text-sm mt-1 leading-snug">{f.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeRight>
        </div>
      </div>
    </section>
  );
}

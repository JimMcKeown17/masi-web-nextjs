'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { FadeUp, FadeRight } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

// Hazel's story is real and consented: a former Top Learner and refugee from
// Zimbabwe whom we hired as a coach. The quote and facts are her own, from her
// film (youtu.be/JhPAAnCIt5s). Displayed first-name-only, matching the
// program-page convention. Photos live in GCS at images/youth/ (5 available;
// #1 is the direct portrait, #3 and #5 are storytelling shots with children).
const PERSON = {
  name: 'Hazel',
  caption: 'Top Learner, now a literacy coach',
  photo: '/images/youth/Hazel Khumalo - Sifunimfundo ECD [27 January 2026] (1) (1).webp',
  story:
    'Hazel was one of our Top Learners in high school, among the brightest in her class. But as a refugee from Zimbabwe, she had no way to pay for university, and the path simply ended. So we hired her into the programme. Without this job, she would be sitting at home.',
  quote:
    '“This job gives me a sense of purpose in life. This is what I wake up for every day. I am making a difference in these children’s lives.”',
  videoUrl: 'https://www.youtube.com/watch?v=JhPAAnCIt5s',
  facts: [
    { value: 'Top 5%', label: 'of all our youth for children’s reading gains' },
    { value: '4 yrs', label: 'in that top tier, in her own community' },
    { value: 'Next', label: 'a degree in education, with our support' },
  ],
};

export default function PersonStorySection() {
  return (
    <section className="bg-[#0E1116] text-white py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Portrait - left rail */}
          <FadeUp className="lg:col-span-5">
            <div className="relative rounded-lg overflow-hidden">
              <div className="relative aspect-[3/4]">
                <Image
                  src={getImageUrl(PERSON.photo)}
                  alt={`${PERSON.name}, Masinyusane literacy coach`}
                  fill
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                <p className="text-sm text-white/75">{PERSON.caption}</p>
              </div>
            </div>
          </FadeUp>

          {/* Eyebrow + headline + story + quote + journey */}
          <FadeRight className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-[#5B9BFF]" />
              <span className="text-sm tracking-[0.25em] uppercase text-white/60">One coach&apos;s story</span>
            </div>
            <h2 style={serif} className="text-4xl md:text-6xl leading-[1.05] mb-8">
              Meet <span className="italic font-light text-[#5B9BFF]">{PERSON.name}.</span>
            </h2>

            <div className="flex flex-col gap-7">
              <p className="text-white/80 text-lg leading-relaxed">{PERSON.story}</p>

              <blockquote style={serif} className="text-2xl md:text-[2rem] italic font-light leading-snug text-white">
                {PERSON.quote}
              </blockquote>

              <a
                href={PERSON.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 text-[#5B9BFF] font-medium w-fit"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-full border border-[#5B9BFF]/60 group-hover:bg-[#5B9BFF] group-hover:text-[#0E1116] transition-colors">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </span>
                Watch her story
              </a>

              <div className="mt-2 pt-7 border-t border-white/10">
                <p className="text-sm tracking-[0.2em] uppercase text-white/50 mb-6">Her journey</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {PERSON.facts.map((f) => (
                    <div key={f.label}>
                      <span style={serif} className="block text-3xl md:text-4xl font-medium text-[#5B9BFF]">
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

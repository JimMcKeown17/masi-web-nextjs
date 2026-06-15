'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getImageUrl, getAssetUrl } from '@/lib/imageUrl';
import { FadeUp } from '@/components/animations/FadeAnimations';
import CountUp from '@/components/animations/count-up';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

const GRADUATE_COUNT = 505;

const GRADUATES = [
  {
    name: 'Azama Zamani',
    credential: 'Advanced Diploma, Information Technology',
    quote:
      'Graduation means everything to me, thanks to Masinyusane. They supported me through financial struggles, and even covered my graduation attire. Now they have helped secure a bursary for my Post-grad Diploma in Cybersecurity.',
    image: 'images/Graduates/Graduate - Sinazo.webp',
  },
  {
    name: 'Thando Mbeki',
    credential: 'Bachelor of Commerce',
    quote:
      'Thanks to Masinyusane, I was able to complete my degree and secure an internship at a leading financial institution. Their support went beyond academics. They believed in my potential.',
    image: 'images/Graduates/Graduate - Aviwe.webp',
  },
  {
    name: 'Nomsa Dlamini',
    credential: 'Bachelor of Education',
    quote:
      'The mentorship and guidance I received from Masinyusane shaped me into the educator I am today. I am now giving back to my community, teaching the next generation.',
    image: 'images/Graduates/Graduate - Sinazo Mpofu.webp',
  },
];

export default function GradsV3() {
  const [index, setIndex] = useState(0);
  const grad = GRADUATES[index];

  return (
    <section className="bg-[#FAF7F2] py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <FadeUp>
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#B8860B]" />
            <span className="text-sm tracking-[0.25em] uppercase text-gray-500">
              Our Scholarship Fund
            </span>
          </div>
        </FadeUp>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-end mb-14 md:mb-20">
          <FadeUp className="lg:col-span-7">
            <h2 style={serif} className="text-4xl md:text-5xl leading-[1.15] text-[#14181D]">
              What happens when you flood a township with{' '}
              <span className="italic text-[#B8860B]">graduates?</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mt-5 max-w-xl">
              Our Scholarship Fund is creating a generation of leaders: young
              people who lift their families out of poverty, uplift their own
              communities, and show the next child exactly what&apos;s possible.
              We&apos;re going to find out what that does.
            </p>
          </FadeUp>

          <FadeUp delay={0.1} className="lg:col-span-5 lg:text-right">
            <span style={serif} className="block text-6xl md:text-7xl font-medium text-[#B8860B] leading-none">
              <CountUp to={GRADUATE_COUNT} />
            </span>
            <p className="text-gray-500 mt-2">university graduates, and counting</p>
            <a
              href="/donate"
              className="inline-block mt-5 text-[#14181D] font-medium border-b-2 border-[#B8860B] pb-0.5 hover:text-[#B8860B] transition-colors"
            >
              Support the Scholarship Fund &rarr;
            </a>
          </FadeUp>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Quote */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.figure
                key={grad.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45 }}
              >
                <blockquote style={serif} className="text-2xl md:text-4xl leading-[1.3] text-[#14181D] mb-8">
                  <span className="text-[#B8860B]">&ldquo;</span>
                  {grad.quote}
                  <span className="text-[#B8860B]">&rdquo;</span>
                </blockquote>
                <figcaption>
                  <p className="font-semibold text-[#14181D] text-lg">{grad.name}</p>
                  <p className="text-gray-500">{grad.credential}</p>
                </figcaption>
              </motion.figure>
            </AnimatePresence>

            <div className="flex items-center gap-4 mt-10">
              <button
                onClick={() => setIndex((index - 1 + GRADUATES.length) % GRADUATES.length)}
                aria-label="Previous graduate"
                className="w-12 h-12 rounded-full border border-[#14181D]/20 flex items-center justify-center hover:bg-[#14181D] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIndex((index + 1) % GRADUATES.length)}
                aria-label="Next graduate"
                className="w-12 h-12 rounded-full border border-[#14181D]/20 flex items-center justify-center hover:bg-[#14181D] hover:text-white transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-400 ml-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {index + 1} / {GRADUATES.length}
              </span>
              <a
                href={getAssetUrl('reports/2025 Graduates Magazine.pdf')}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-[#14181D] font-medium border-b-2 border-[#B8860B] pb-0.5 hover:text-[#B8860B] transition-colors"
              >
                Graduate Magazine &rarr;
              </a>
            </div>
          </div>

          {/* Portrait */}
          <div className="lg:col-span-5 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={grad.image}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="relative"
              >
                <div className="absolute -top-4 -right-4 w-full h-full rounded-xl bg-[#B8860B]/15" />
                <Image
                  src={getImageUrl(grad.image)}
                  alt={grad.name}
                  width={640}
                  height={720}
                  className="relative rounded-xl w-full h-[420px] md:h-[520px] object-cover object-top"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

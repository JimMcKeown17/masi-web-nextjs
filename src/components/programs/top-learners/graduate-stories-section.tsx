'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAssetUrl } from '@/lib/imageUrl';
import { FadeUp } from '@/components/animations/FadeAnimations';
import GraduatePortrait from './graduate-portrait';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

// Curated graduate voices from the 2024 + 2025 Graduate Magazines. Quotes are the
// graduates' own words, lightly trimmed. `image` is left undefined until the portrait
// webp is converted and uploaded to the documented GCS path (see the convert list); the
// shared GraduatePortrait renders a gold monogram tile in the meantime.
interface Graduate {
  name: string;
  credential: string;
  context: string;
  quote: string;
  image?: string; // target: images/Graduates/<slug>.webp
}

const GRADUATES: Graduate[] = [
  {
    name: 'Babalwa Otola',
    credential: 'Marine Engineering',
    context: 'The first graduate in her family, and among the first women to finish the degree.',
    quote:
      'As the first family graduate, it meant the world; not just any graduate, but an Engineering graduate, amongst the first few females to actually finish the degree. I have opened portals in my life I never thought I had.',
    image: 'images/Graduates/babalwa-otola.webp',
  },
  {
    name: 'Esethu Ndlungwane',
    credential: 'Bachelor of Science',
    context: 'First in her family at university; now in her first year of Medicine.',
    quote:
      'My graduation marked a milestone of hard work, perseverance and dedication. Each step I took across the stage represented a step towards becoming Dr Ndlungwane.',
    image: 'images/Graduates/esethu-ndlungwane.webp',
  },
  {
    name: 'Pilani Nama',
    credential: 'National Diploma, Analytical Chemistry',
    context: 'Survived a violent attack during his training, soldiered on, and is now employed.',
    quote:
      'The first, but certainly not last, graduate in my family. I have broken a cycle. I cannot express my gratitude in words.',
    image: 'images/Graduates/pilani-nama.webp',
  },
  {
    name: 'Sanelisiwe Shiyani',
    credential: 'BCom Accounting',
    context: 'Thrived in a Masi House of Excellence; hired as a trainee accountant at a top firm.',
    quote:
      'Not only did they take care of me academically, but they made sure that mentally I was always well. It indeed takes a village to raise a child.',
    image: 'images/Graduates/sanelise-shiyani.webp',
  },
  {
    name: 'Aphelele Njajula',
    credential: 'Diploma, Analytical Chemistry',
    context: 'The first in her family past Grade 12; now a lab assistant at a major steel company.',
    quote:
      'I was able to remain unshaken throughout the journey. So many opportunities are coming my way, and the world is my oyster.',
    image: 'images/Graduates/aphelele-njajula.webp',
  },
  {
    name: 'Sibabalwe Magala',
    credential: 'Advanced Diploma, Economics',
    context: 'Lost her father mid-degree; Masinyusane stood by her through grief and depression.',
    quote:
      'If I could make it through grief, depression and financial hardship, so can you. Keep going. Your victory is coming.',
    image: 'images/Graduates/sibabalwe-magala.webp',
  },
];

export default function GraduateStoriesSection() {
  const [index, setIndex] = useState(0);
  const grad = GRADUATES[index];
  const go = (dir: number) => setIndex((index + dir + GRADUATES.length) % GRADUATES.length);

  return (
    <section className="bg-[#FAF7F2] py-20 md:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <FadeUp className="max-w-3xl mb-14 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 bg-[#B8860B]" />
            <span className="text-sm tracking-[0.25em] uppercase text-gray-500">In their own words</span>
          </div>
          <h2 style={serif} className="text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
            The proof is in the{' '}
            <span className="italic font-light text-[#B8860B]">graduates.</span>
          </h2>
        </FadeUp>

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
                <blockquote style={serif} className="text-2xl md:text-[2.5rem] leading-[1.3] text-[#14181D] mb-8">
                  <span className="text-[#B8860B]">&ldquo;</span>
                  {grad.quote}
                  <span className="text-[#B8860B]">&rdquo;</span>
                </blockquote>
                <figcaption>
                  <p className="font-semibold text-[#14181D] text-lg">{grad.name}</p>
                  <p className="text-gray-500">{grad.credential}</p>
                  <p className="text-gray-500 text-sm mt-2 max-w-md leading-snug">{grad.context}</p>
                </figcaption>
              </motion.figure>
            </AnimatePresence>

            <div className="flex items-center gap-4 mt-10">
              <button
                onClick={() => go(-1)}
                aria-label="Previous graduate"
                className="w-12 h-12 rounded-full border border-[#14181D]/20 flex items-center justify-center hover:bg-[#14181D] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => go(1)}
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
                key={grad.name}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                className="relative"
              >
                <div className="absolute -top-4 -right-4 w-full h-full rounded-xl bg-[#B8860B]/15" />
                <div className="relative rounded-xl overflow-hidden w-full h-[420px] md:h-[520px]">
                  <GraduatePortrait
                    image={grad.image}
                    name={grad.name}
                    sizes="(min-width: 1024px) 42vw, 100vw"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

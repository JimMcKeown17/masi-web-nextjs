'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import { motion } from 'framer-motion';
import { Play, ChevronDown } from 'lucide-react';

// Media Resources hero. Accent: brand red (signal #E72D4D), the house accent for
// cross-cutting pages, matching the /media/in-the-news sibling. Full-bleed photo
// following the programme hero pattern.
export default function MediaResourcesHeroSection() {
  const scrollToContent = () =>
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });

  return (
    <section className="relative h-screen min-h-[640px]">
      <Image
        src={getImageUrl('/images/Lit Session 1.jpg')}
        alt="A Masinyusane literacy session"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Layered scrim: protect the text zone on the left, let the photo breathe */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/15 to-transparent" />

      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl text-white">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="h-px w-10 bg-[#E72D4D]" />
              <span className="text-sm md:text-base tracking-[0.25em] uppercase text-white font-medium">
                Media Resources
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-serif text-5xl md:text-7xl font-semibold leading-[1.04] mb-6"
            >
              See it for
              <br />
              <span className="italic font-light text-[#E72D4D]">yourself.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-white/85 max-w-xl mb-9"
            >
              Films, stories and photography from inside Masinyusane&apos;s classrooms,
              preschools and communities. Press and partners are welcome to use them.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
            >
              <a
                href="#featured"
                className="group inline-flex items-center gap-3 text-white font-medium text-lg"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-full border border-white/60 group-hover:bg-white group-hover:text-black transition-colors">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </span>
                Watch the featured film
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToContent}
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12 text-white/80 hover:text-white transition-colors"
        aria-label="Scroll to content"
      >
        <span className="flex w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/50 items-center justify-center">
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </span>
      </button>
    </section>
  );
}

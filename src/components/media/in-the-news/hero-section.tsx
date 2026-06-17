'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import { motion } from 'framer-motion';
import { Play, ChevronDown } from 'lucide-react';

// In the News hero. Accent: brand red (signal #E72D4D), the house accent for
// cross-cutting pages. Full-bleed photo following the programme hero pattern.
export default function NewsHeroSection() {
  const scrollToContent = () =>
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });

  return (
    <section className="relative h-screen min-h-[640px]">
      <Image
        src={getImageUrl('/images/Staff 1.jpg')}
        alt="The Masinyusane team"
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
                Press Coverage
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-serif text-5xl md:text-7xl font-semibold leading-[1.04] mb-6"
            >
              Making
              <br />
              <span className="italic font-light text-[#E72D4D]">headlines.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-white/85 max-w-xl mb-9"
            >
              From the State of the Nation Address to local front pages, Masinyusane&apos;s
              work in early literacy and youth employment is drawing national attention.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
            >
              <a
                href="#citizen"
                className="group inline-flex items-center gap-3 text-white font-medium text-lg"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-full border border-white/60 group-hover:bg-white group-hover:text-black transition-colors">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </span>
                Watch: Citizen of the Year 2025
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

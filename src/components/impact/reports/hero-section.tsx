'use client';
import { getImageUrl, getAssetUrl } from '@/lib/imageUrl';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

// Reports hero. Accent: brand red (deep #C81E3C / signal #E72D4D), the house accent
// the /impact section already uses. Full-bleed video following the programme hero
// pattern in src/components/programs/*/hero-section.tsx.
export default function ReportsHeroSection() {
  const scrollToContent = () =>
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });

  return (
    <section className="relative h-screen min-h-[640px]">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={getImageUrl('/images/Empowering Banner_raw (1).mp4')} type="video/mp4" />
      </video>

      {/* Layered scrim: protect the text zone on the left, let the footage breathe */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/30" />
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
                Reports &amp; Accountability
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-serif text-5xl md:text-7xl font-semibold leading-[1.04] mb-6"
            >
              The work,
              <br />
              <span className="italic font-light text-[#E72D4D]">on the record.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-white/85 max-w-xl mb-9"
            >
              Annual reports, programme results and independently audited financials.
              Read exactly how Masinyusane spends every rand, and what it produces.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-wrap items-center gap-x-8 gap-y-4"
            >
              <a
                href={getAssetUrl('reports/Masinyusane Annual Report 2024 (R).pdf')}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#C81E3C] hover:bg-[#a8182f] text-white px-9 py-4 rounded-md font-semibold text-lg transition-colors"
              >
                Read the 2024 Annual Report
              </a>
              <a
                href="#archive"
                className="text-white font-medium border-b-2 border-[#E72D4D] pb-0.5 hover:text-[#E72D4D] transition-colors"
              >
                Browse the archive
              </a>
            </motion.div>

            {/* Anchoring line, true to the archive below: financials exist for 2021-2024 */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="mt-12 inline-block border-t border-[#E72D4D]/60 pt-4"
            >
              <span className="text-white/75">
                Independently audited financials, every year since 2021.
              </span>
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

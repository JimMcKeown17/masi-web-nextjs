'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EasternCapeBanner() {
  const scrollToContent = () =>
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });

  return (
    <header className="relative h-screen min-h-[640px] w-full">
      <Image
        src={getImageUrl('images/eastern_cape_photo.jpg')}
        alt="Eastern Cape, South Africa"
        fill
        className="object-cover"
        priority
      />

      {/* Layered scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

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
                Where we work
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-serif text-5xl md:text-7xl font-semibold leading-[1.05] mb-6"
            >
              Eastern Cape,
              <br />
              <span className="italic font-light">South Africa.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-white/85 max-w-xl"
            >
              A land of beautiful, talented people plagued by poverty.
            </motion.p>
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
    </header>
  );
}

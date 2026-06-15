'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <header className="relative h-screen min-h-[640px] w-full">
      <Image
        src={getImageUrl('images/LCs/LC-11.jpg')}
        alt="Masinyusane staff"
        fill
        className="object-cover"
        priority
      />

      {/* Layered scrim: protect the text, let the photo breathe elsewhere */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/25" />
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
                Who we are
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-serif text-5xl md:text-7xl font-semibold leading-[1.05] mb-6"
            >
              Masinyusane is a
              <br />
              <span className="italic font-light">community organisation.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-white/85 max-w-xl"
            >
              Our staff are community members and former beneficiaries, now serving
              the communities they come from.
            </motion.p>
          </div>
        </div>
      </div>
    </header>
  );
}

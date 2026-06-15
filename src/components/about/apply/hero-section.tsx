'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function ApplyHeroSection() {
  return (
    <section className="relative h-[70vh] min-h-[460px]">
      <Image
        src={getImageUrl('/images/Lit Session 1.jpg')}
        alt="Jobs and scholarships at Masinyusane"
        fill
        className="object-cover object-[center_28%]"
        priority
      />

      {/* Layered scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent" />

      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl text-white">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="h-px w-10 bg-[#E72D4D]" />
              <span className="text-sm md:text-base tracking-[0.25em] uppercase text-white font-medium">
                Get involved
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="font-serif text-5xl md:text-7xl font-semibold leading-[1.05] mb-5"
            >
              Jobs &amp; <span className="italic font-light">Scholarships.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-white/85 max-w-xl"
            >
              Join our team or further your education with Masinyusane.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}

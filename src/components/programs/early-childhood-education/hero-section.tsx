'use client';
import { getImageUrl } from '@/lib/imageUrl';
import { motion } from 'framer-motion';
import { Play, ChevronDown } from 'lucide-react';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export default function ECEHeroSection() {
  const scrollToContent = () =>
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });

  return (
    <section className="relative h-screen min-h-[640px]">
      <video
        autoPlay
        muted
        loop
        playsInline
        poster={getImageUrl('/images/Early Childhood Education.png')}
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={getImageUrl('/images/Sume Video Strip.mp4')} type="video/mp4" />
      </video>

      {/* Layered scrim: protect the text zone, let the footage breathe elsewhere */}
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
                Early Childhood Education
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              style={serif}
              className="text-5xl md:text-7xl font-semibold leading-[1.05] mb-6"
            >
              Teaching children to
              <br />
              <span className="italic font-light">read, write, and count.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-white/85 max-w-xl mb-9"
            >
              Data-driven literacy and numeracy for children aged 2 to 9, taught at
              their level until they reach mastery.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-wrap items-center gap-4"
            >
              <a
                href="/donate"
                className="bg-[#C81E3C] hover:bg-[#a81632] text-white px-9 py-4 rounded-md font-semibold text-lg transition-colors"
              >
                Sponsor a child
              </a>
              <a
                href="https://www.youtube.com/watch?v=tj_W0jlFiPQ"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 px-6 py-4 text-white font-medium text-lg"
              >
                <span className="flex items-center justify-center w-11 h-11 rounded-full border border-white/60 group-hover:bg-white group-hover:text-black transition-colors">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </span>
                Watch the film
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

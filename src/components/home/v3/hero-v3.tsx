'use client';
import { getImageUrl } from '@/lib/imageUrl';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import CountUp from '@/components/animations/count-up';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export default function HeroV3() {
  return (
    <section className="relative h-screen min-h-[640px]">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
        <source src={getImageUrl('/images/Home_Page_Hero_Video_3.mp4')} type="video/mp4" />
      </video>

      {/* Layered scrim: protect text zones, let the video breathe elsewhere */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

      <div className="relative h-full flex flex-col">
        <div className="flex-1 flex items-center">
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
                  Gqeberha, South Africa
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                style={serif}
                className="text-5xl md:text-7xl font-semibold leading-[1.05] mb-6"
              >
                Every child reading.
                <br />
                <span className="italic font-normal">Every youth working.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-lg md:text-xl text-white/85 max-w-xl mb-9"
              >
                We hire and train unemployed local youth to run data-driven literacy
                and numeracy programmes in South Africa&apos;s public schools.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="flex flex-wrap items-center gap-4"
              >
                <a
                  href="/donate"
                  className="bg-[#E72D4D] hover:bg-[#c91f3d] text-white px-9 py-4 rounded-md font-semibold text-lg transition-colors"
                >
                  Donate
                </a>
                <a
                  href="https://www.youtube.com/watch?v=5j2d6nlFVe8&t=3s"
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

        {/* Proof ticker pinned to the hero's bottom edge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="border-t border-white/15 bg-black/35 backdrop-blur-sm"
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 divide-x divide-white/15">
              {[
                { to: 19228, label: 'children in our literacy programmes' },
                { to: 1964, label: 'jobs created for unemployed youth' },
                { to: 10000, suffix: '+', label: 'high school learners assisted' },
              ].map((s) => (
                <div key={s.label} className="py-5 md:py-6 px-4 md:px-8 text-white">
                  <span style={serif} className="block">
                    <CountUp
                      to={s.to}
                      suffix={s.suffix ?? ''}
                      className="block text-2xl md:text-4xl font-medium"
                    />
                  </span>
                  <span className="block text-xs md:text-sm text-white/75 mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

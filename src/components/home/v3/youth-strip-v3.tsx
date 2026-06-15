'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { FadeUp, FadeRight } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

// Mirror of the ECE strip: photo on the LEFT, copy on the RIGHT, so the
// programme sections alternate sides as you scroll. Blue accent ties it to
// the jobs stat band that follows and bleeds up into it.
export default function YouthStripV3() {
  return (
    <section className="relative bg-white pt-16 md:pt-24 pb-0 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-end">
          {/* Photo, left on desktop, below copy on mobile.
              scale-130 matches the rendered height of the ECE portrait so both
              programme strips fill their column to the same fullness. */}
          <FadeRight className="relative scale-130 origin-bottom order-2 md:order-1">
            <Image
              src={getImageUrl('/images/Azaluve Mama & Aphathelwe Makabana.webp')}
              alt="A Masinyusane youth coach with a young learner"
              width={840}
              height={840}
              className="w-full h-auto"
            />
          </FadeRight>

          {/* Copy, right on desktop */}
          <FadeUp className="space-y-7 pb-10 md:pb-16 order-1 md:order-2">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span style={serif} className="text-sm italic text-[#1D4ED8]">02</span>
                <span className="h-px w-10 bg-[#1D4ED8]" />
                <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Our programmes</span>
              </div>
              <h2 style={serif} className="text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
                Creating
                <br />
                <span className="italic font-light text-[#1D4ED8]">Community Jobs</span>
              </h2>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              We hire unemployed young people from these communities and train them to
              coach literacy and numeracy in public schools. All day, every day.
            </p>

            <div className="flex flex-wrap items-center gap-5">
              <a
                href="https://www.youtube.com/watch?v=5j2d6nlFVe8&t=3s"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#1D4ED8] hover:bg-[#1740b0] text-white px-7 py-3.5 rounded-md font-medium transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Watch the video
              </a>
              <a
                href="/impact/data-portal"
                className="text-[#14181D] font-medium border-b-2 border-[#1D4ED8] pb-0.5 hover:text-[#1D4ED8] transition-colors"
              >
                Explore the data &rarr;
              </a>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

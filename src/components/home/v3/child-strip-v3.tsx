'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { FadeUp, FadeLeft } from '@/components/animations/FadeAnimations';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

export default function ChildStripV3() {
  return (
    <section className="relative bg-white pt-16 md:pt-24 pb-0 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-end">
          <FadeUp className="space-y-7 pb-10 md:pb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span style={serif} className="text-sm italic text-[#C81E3C]">01</span>
                <span className="h-px w-10 bg-[#C81E3C]" />
                <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Our programmes</span>
              </div>
              <h2 style={serif} className="text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
                Early Childhood
                <br />
                <span className="italic font-light text-[#C81E3C]">Education</span>
              </h2>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              Our data-driven programmes give children aged 2&ndash;13 the right support
              at the right level, helping them read, learn, and grow with confidence.
            </p>

            <div className="flex flex-wrap items-center gap-5">
              <a
                href="https://www.youtube.com/watch?v=5j2d6nlFVe8&t=3s"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 bg-[#C81E3C] hover:bg-[#a81632] text-white px-7 py-3.5 rounded-md font-medium transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                Watch the video
              </a>
              <a
                href="/impact/data-portal"
                className="text-[#14181D] font-medium border-b-2 border-[#C81E3C] pb-0.5 hover:text-[#C81E3C] transition-colors"
              >
                Explore the data &rarr;
              </a>
            </div>
          </FadeUp>

          <FadeLeft className="relative scale-115 origin-bottom">
            <Image
              src={getImageUrl('/images/Dyanti Luphawu - Sifunimfundo ECD.webp')}
              alt="Smiling child from Early Childhood Education program"
              width={840}
              height={840}
              className="w-full h-auto"
            />
          </FadeLeft>
        </div>
      </div>
    </section>
  );
}

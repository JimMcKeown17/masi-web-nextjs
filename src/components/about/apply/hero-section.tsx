'use client';
import { getImageUrl } from '@/lib/imageUrl';
import { FadeRight } from '@/components/animations/FadeAnimations';
import Image from 'next/image';

export default function ApplyHeroSection() {
  return (
    <section className="relative h-[70vh] min-h-[500px]">
      <div className="relative h-full">
        <Image
          src={getImageUrl("/images/Lit Session 1.jpg")}
          alt="Jobs & Scholarships"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <FadeRight>
              <div className="max-w-2xl text-white">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                  Jobs & <span className="font-light bg-gradient-to-r from-blue-400 to-rose-400 bg-clip-text text-transparent">Scholarships</span>
                </h1>
                <p className="text-xl md:text-2xl drop-shadow-lg">
                  Join our team or advance your education with Masinyusane opportunities.
                </p>
              </div>
            </FadeRight>
          </div>
        </div>
      </div>
    </section>
  );
}


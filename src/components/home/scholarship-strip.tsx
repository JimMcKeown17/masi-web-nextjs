'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { FadeRight } from '@/components/animations/FadeAnimations';


export default function ScholarshipStrip() {
    return (
        <section className="relative">
        <Image 
          src={getImageUrl('images/Website Strip - TL.png')}
          alt="Top Learner"
          width={1920}
          height={600}
          className="w-full h-auto"
        />
        <FadeRight className="absolute top-1/2 left-[10%] -translate-y-1/2 text-white hidden md:block">
          <h1 className="text-8xl font-extrabold mb-2">454</h1>
          <p className="text-2xl font-light">We have empowered</p>
          <p className="text-2xl font-semibold">454 University Graduates</p>
        </FadeRight>
      </section>
        
    )
}
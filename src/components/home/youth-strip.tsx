'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { FadeRight } from '@/components/animations/FadeAnimations';


export default function YouthStrip() {
    return (
        <section className="relative">
        <Image 
          src={getImageUrl("/images/Website Strip Community jobs 2 (sml).png")}
          className="w-full h-auto"
          alt="Community Jobs"
          width={800}
          height={600}
        />
        <FadeRight className="absolute top-1/2 left-[10%] -translate-y-1/2 text-white hidden md:block">
          <h1 className="text-8xl font-extrabold mb-2">316</h1>
          <p className="text-2xl font-light">We have created</p>
          <p className="text-2xl font-semibold">316 Community Jobs.</p>
        </FadeRight>
      </section>
        
    )
}
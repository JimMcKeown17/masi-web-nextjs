'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { FadeRight } from '@/components/animations/FadeAnimations';


export default function ChildStrip() {
    return (
        <section className="relative">
        <Image 
          src={getImageUrl('/images/Website Strip - Child Red.png')}
          alt="Smiling Girl"
          width={800}
          height={600}
          className="w-full h-auto"
        />
        <FadeRight className="absolute top-1/2 left-[10%] -translate-y-1/2 text-white hidden md:block">
          <h1 className="text-8xl font-extrabold mb-2">2x</h1>
          <p className="text-2xl font-light">Children on the program</p>
          <p className="text-2xl font-semibold">learn to read twice as fast.</p>
        </FadeRight>
      </section>
        
    )
}
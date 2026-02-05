import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <header className="relative h-screen w-full">
      <Image
        src={getImageUrl('images/LCs/LC-11.jpg')}
        alt="About Us - Masinyusane"
        fill
        className="object-cover"
        priority
      />

      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Text content — positioned upper-left */}
      <div className="absolute inset-0 flex items-start justify-start">
        <div className="mt-[28vh] ml-[8vw] max-w-2xl px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Masinyusane embodies the term{' '}
            <span className="font-bold">community organisation.</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90">
            Our staff consists of community members and former beneficiaries.
          </p>
        </div>
      </div>
    </header>
  );
}

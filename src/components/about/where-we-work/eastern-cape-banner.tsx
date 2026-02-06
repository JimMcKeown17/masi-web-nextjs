'use client';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

export default function EasternCapeBanner() {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <header className="relative h-screen w-full">
      <Image
        src={getImageUrl('images/eastern_cape_photo.jpg')}
        alt="Eastern Cape, South Africa"
        fill
        className="object-cover"
        priority
      />

      {/* Dark overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Text content — centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-white leading-tight">
            Eastern Cape, <span className="font-bold">South Africa</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-white/90">
            A land of beautiful, talented people plagued by poverty.
          </p>
        </div>
      </div>

      {/* Scroll down arrow - bottom right */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12 text-white hover:text-white/80 transition-colors"
        aria-label="Scroll to content"
      >
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white flex items-center justify-center">
          <ChevronDown className="w-6 h-6 md:w-7 md:h-7" />
        </div>
      </button>
    </header>
  );
}


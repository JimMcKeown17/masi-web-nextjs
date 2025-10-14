'use client';
import { getImageUrl } from '@/lib/imageUrl';
import { FadeRight } from '@/components/animations/FadeAnimations';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function TopLearnersHeroSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="relative h-[70vh] min-h-[500px]">
      <div className="relative h-full">
        {/* Desktop/Tablet - Background Image */}
        {!isMobile && (
          <>
            <Image
              src={getImageUrl("/images/tl-photo-1.webp")}
              alt="Scholarship Fund"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center">
              <div className="container mx-auto px-4">
                <FadeRight>
                  <div className="max-w-2xl text-white">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                      Scholarship <span className="font-light bg-gradient-to-r from-blue-400 to-rose-400 bg-clip-text text-transparent">Fund</span>
                    </h1>
                    <p className="text-xl md:text-2xl drop-shadow-lg">
                      Creating a generation of young graduates empowered to uplift their communities.
                    </p>
                  </div>
                </FadeRight>
              </div>
            </div>
          </>
        )}

        {/* Mobile - Image */}
        {isMobile && (
          <div className="relative h-full w-full">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${getImageUrl('/images/tl-photo-1.webp')}')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 flex items-center">
              <div className="container mx-auto px-4">
                <FadeRight>
                  <div className="text-white">
                    <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
                      Scholarship <span className="font-light bg-gradient-to-r from-blue-400 to-rose-400 bg-clip-text text-transparent">Fund</span>
                    </h1>
                    <p className="text-xl mb-6 drop-shadow-lg">
                      Creating a generation of young graduates empowered to uplift their communities.
                    </p>
                  </div>
                </FadeRight>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


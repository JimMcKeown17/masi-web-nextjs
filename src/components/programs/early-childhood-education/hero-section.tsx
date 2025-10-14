'use client';
import { getImageUrl } from '@/lib/imageUrl';
import { FadeRight } from '@/components/animations/FadeAnimations';
import { useState, useEffect } from 'react';

export default function ECEHeroSection() {
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
    <section className="relative h-screen">
      <div className="relative h-full">
        {/* Desktop/Tablet - Video */}
        {!isMobile && (
          <div className="grid md:grid-cols-12 h-full">
            {/* Left Column - Text Content */}
            <div className="md:col-span-4 bg-white flex items-center">
              <div className="container mx-auto px-6">
                <FadeRight>
                  <div className="max-w-xl">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                      Early Childhood <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Education</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 mb-8">
                      Teaching Children To Read, Write, and Count.
                    </p>
                    <a 
                      href="#donate" 
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-rose-600 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      Sponsor a Child
                    </a>
                  </div>
                </FadeRight>
              </div>
            </div>

            {/* Right Column - Video */}
            <div className="md:col-span-8 relative overflow-hidden">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={getImageUrl("/images/Sume Video Strip.mp4")} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            </div>
          </div>
        )}

        {/* Mobile - Image */}
        {isMobile && (
          <div className="relative h-full w-full">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${getImageUrl('/images/Early Childhood Education.png')}')`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 flex items-center">
              <div className="container mx-auto px-4">
                <FadeRight>
                  <div className="text-white">
                    <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
                      Early Childhood <span className="font-light bg-gradient-to-r from-blue-400 to-rose-400 bg-clip-text text-transparent">Education</span>
                    </h1>
                    <p className="text-xl mb-6 drop-shadow-lg">
                      Teaching Children To Read, Write, and Count.
                    </p>
                    <a 
                      href="#donate" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-rose-600 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      Sponsor a Child
                    </a>
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


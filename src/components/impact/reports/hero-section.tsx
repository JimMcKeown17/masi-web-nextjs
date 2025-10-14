'use client';
import { getImageUrl } from '@/lib/imageUrl';
import { FadeRight } from '@/components/animations/FadeAnimations';
import { useState, useEffect } from 'react';

export default function ReportsHeroSection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
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
          <div className="grid lg:grid-cols-12 h-full">
            {/* Left Column - Text Content */}
            <div className="lg:col-span-4 bg-white flex items-center">
              <div className="container mx-auto px-6">
                <FadeRight>
                  <div className="max-w-xl">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                      Our Impact: <span className="font-light bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">Measurable Results, Real Stories</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 mb-8">
                      Access our annual reports, success stories, vital statistics, and financial statements to see how we're building a better future.
                    </p>
                    <a 
                      href="/downloads/annual-report.pdf" 
                      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-rose-600 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
                      download
                    >
                      Annual Report
                    </a>
                  </div>
                </FadeRight>
              </div>
            </div>

            {/* Right Column - Video */}
            <div className="lg:col-span-8 relative overflow-hidden">
              <video 
                autoPlay 
                muted 
                loop 
                playsInline 
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={getImageUrl("/images/Empowering Banner_raw (1).mp4")} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            </div>
          </div>
        )}

        {/* Mobile - Static gradient background */}
        {isMobile && (
          <div className="relative h-full w-full bg-gradient-to-br from-blue-600 via-blue-700 to-rose-600">
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <FadeRight>
                  <div className="text-white">
                    <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
                      Our Impact: <span className="font-light">Measurable Results, Real Stories</span>
                    </h1>
                    <p className="text-xl mb-6 drop-shadow-lg">
                      Access our annual reports, success stories, vital statistics, and financial statements to see how we're building a better future.
                    </p>
                    <a 
                      href="/downloads/annual-report.pdf" 
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
                      download
                    >
                      Annual Report
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


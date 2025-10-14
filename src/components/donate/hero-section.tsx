'use client';
import { getImageUrl } from '@/lib/imageUrl';
import { FadeRight, FadeLeft } from '@/components/animations/FadeAnimations';
import Image from 'next/image';
import { useEffect } from 'react';

export default function DonateHeroSection() {
  useEffect(() => {
    // Load Donorbox widget script
    const script = document.createElement('script');
    script.src = 'https://donorbox.org/widget.js';
    script.setAttribute('paypalExpress', 'true');
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen py-20 md:py-0">
      <div className="absolute inset-0">
        <Image
          src={getImageUrl("/images/Strip - Child.jpg")}
          alt="Support Our Mission"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center min-h-screen py-12">
          {/* Left Column - Text Content */}
          <div className="lg:col-span-6">
            <FadeRight>
              <div className="text-white space-y-6 max-w-xl">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  Make a <span className="font-light bg-gradient-to-r from-blue-300 to-rose-300 bg-clip-text text-transparent">Difference</span>
                </h1>
                <p className="text-xl md:text-2xl leading-relaxed drop-shadow-lg">
                  Your donation empowers children and youth through education, creating lasting change in communities across South Africa.
                </p>
                
                {/* Impact Highlights */}
                <div className="grid grid-cols-2 gap-6 pt-8">
                  <div className="space-y-2">
                    <p className="text-4xl font-bold drop-shadow-lg">18,276</p>
                    <p className="text-sm opacity-90">Children Benefitting</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-bold drop-shadow-lg">364</p>
                    <p className="text-sm opacity-90">Community Jobs Created</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-bold drop-shadow-lg">154</p>
                    <p className="text-sm opacity-90">Schools We Work In</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-bold drop-shadow-lg">100+</p>
                    <p className="text-sm opacity-90">University Scholarships</p>
                  </div>
                </div>
              </div>
            </FadeRight>
          </div>

          {/* Right Column - Donorbox Widget */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <FadeLeft>
              <div className="w-full max-w-xl">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-rose-600 p-6 text-white">
                    <h2 className="text-2xl md:text-3xl font-bold">Support Our Mission</h2>
                    <p className="mt-2 opacity-90">Every donation makes a real impact</p>
                  </div>
                  <div className="p-4">
                    <iframe
                      src="https://donorbox.org/embed/masi-donations?language=en-us"
                      name="donorbox"
                      allowPaymentRequest
                      seamless
                      frameBorder="0"
                      scrolling="no"
                      height="900px"
                      width="100%"
                      style={{
                        maxWidth: '100%',
                        minWidth: '250px',
                        maxHeight: 'none'
                      }}
                      allow="payment"
                    />
                  </div>
                </div>
              </div>
            </FadeLeft>
          </div>
        </div>
      </div>
    </section>
  );
}


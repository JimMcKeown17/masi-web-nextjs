'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const graduates = [
  { id: 1, image: 'images/grads/grad-carousel1.png', name: 'Graduate Story 1' },
  { id: 2, image: 'images/grads/grad-carousel2.png', name: 'Graduate Story 2' },
  { id: 3, image: 'images/grads/grad-carousel3.png', name: 'Graduate Story 3' },
  { id: 4, image: 'images/grads/grad-carousel4.png', name: 'Graduate Story 4' },
];

export default function GradsShowcase() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [activeSlide]);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveSlide((prev) => (prev + 1) % graduates.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveSlide((prev) => (prev - 1 + graduates.length) % graduates.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleDotClick = (index: number) => {
    if (isAnimating || index === activeSlide) return;
    setIsAnimating(true);
    setActiveSlide(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Success Stories
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Hear <span className="font-light bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">From Our</span>
                <br />
                <span className="font-light">Graduates</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-md">
                Discover the inspiring journeys of our graduates and how they&apos;re making a difference in their communities.
              </p>
            </div>

            {/* Navigation Dots - Desktop */}
            <div className="hidden md:flex gap-3 pt-4">
              {graduates.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`group relative h-1.5 rounded-full transition-all duration-500 ${
                    activeSlide === index ? 'w-16 bg-gradient-to-r from-blue-600 to-purple-600' : 'w-8 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <span className="sr-only">Slide {index + 1}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Content - Carousel */}
          <div className="lg:col-span-7">
            <div className="relative group">
              <Card className="overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-0 relative aspect-[4/3]">
                  {/* Images */}
                  {graduates.map((grad, index) => (
                    <div
                      key={grad.id}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        index === activeSlide
                          ? 'opacity-100 scale-100 z-10'
                          : 'opacity-0 scale-95 z-0'
                      }`}
                    >
                      <Image
                        src={getImageUrl(grad.image)}
                        alt={grad.name}
                        fill
                        className="object-contain"
                        priority={index === 0}
                      />
                    </div>
                  ))}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-20" />

                  {/* Navigation Buttons */}
                  <button
                    onClick={handlePrev}
                    disabled={isAnimating}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={isAnimating}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </CardContent>
              </Card>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 blur-2xl -z-10" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full opacity-20 blur-2xl -z-10" />
            </div>

            {/* Navigation Dots - Mobile */}
            <div className="flex md:hidden justify-center gap-2 mt-6">
              {graduates.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    activeSlide === index ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600' : 'w-2 bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <span className="sr-only">Slide {index + 1}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


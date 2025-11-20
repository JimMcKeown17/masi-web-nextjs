'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Graduate {
  id: number;
  name: string;
  credential: string;
  quote: string;
  image: string;
  gradientFrom: string;
  gradientTo: string;
}

interface GradsShowcaseProps {
  graduates: Graduate[];
  autoPlayInterval?: number;
}

export default function GradsShowcase({ 
  graduates, 
  autoPlayInterval = 4000 
}: GradsShowcaseProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveSlide((prev) => (prev + 1) % graduates.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveSlide((prev) => (prev - 1 + graduates.length) % graduates.length);
    setTimeout(() => setIsAnimating(false), 600);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % graduates.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlayInterval, graduates.length]);

  const currentGrad = graduates[activeSlide];
  
  // Check if gradient values are hex colors or Tailwind classes
  const isHexColor = (color: string) => color.startsWith('#');
  const useInlineGradient = isHexColor(currentGrad.gradientFrom) || isHexColor(currentGrad.gradientTo);

  return (
    <div className="relative w-full">
      {/* Gradient Strip - 35vh height, full width */}
      <div className="relative h-[35vh] min-h-[300px] max-h-[400px] overflow-visible">
        {/* Animated Background Gradient */}
        <div
          className={`absolute inset-0 transition-all duration-700 ${
            useInlineGradient ? '' : `bg-gradient-to-r ${currentGrad.gradientFrom} ${currentGrad.gradientTo}`
          }`}
          style={
            useInlineGradient
              ? {
                  backgroundImage: `linear-gradient(to right, ${currentGrad.gradientFrom}, ${currentGrad.gradientTo})`,
                }
              : undefined
          }
        />

        {/* Content Container */}
        <div className="container mx-auto px-4 h-full relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 h-full items-center relative">
            {/* Left Content Section */}
            <div className="md:col-span-7 lg:col-span-6 py-8 md:py-0 pr-8 md:pr-16">
              <div className="space-y-4 text-white max-w-2xl">
                {/* Graduate Name and Credential */}
                <div className="space-y-1">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                    {currentGrad.name}
                  </h3>
                  <p className="text-sm md:text-base text-white/90 font-medium">
                    {currentGrad.credential}
                  </p>
                </div>

                {/* Quote */}
                <div className="relative">
                  <div className="absolute -left-1 -top-1 text-6xl md:text-7xl text-white/20 font-serif leading-none">
                    "
                  </div>
                  <blockquote className="relative text-sm md:text-base lg:text-lg leading-relaxed text-white/95 italic pl-6 md:pl-8">
                    {currentGrad.quote}
                  </blockquote>
                </div>
              </div>
            </div>

            {/* Right Image Section - Layered on Top */}
            <div className="hidden md:block md:col-span-5 lg:col-span-6 h-full relative">
              <div className="absolute bottom-0 right-0 w-full h-[140%] max-h-[500px]">
                {graduates.map((grad, index) => (
                  <div
                    key={grad.id}
                    className={`absolute inset-0 transition-all duration-700 ${
                      index === activeSlide
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 translate-y-4'
                    }`}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={getImageUrl(grad.image)}
                        alt={grad.name}
                        fill
                        className="object-contain object-bottom"
                        priority={index === 0}
                        sizes="(max-width: 768px) 0vw, 50vw"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          disabled={isAnimating}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous graduate"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
        </button>
        <button
          onClick={handleNext}
          disabled={isAnimating}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next graduate"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5} />
        </button>

        {/* Navigation Dots - Bottom Left */}
        <div className="absolute bottom-6 left-4 md:left-auto md:right-4 z-20 flex gap-2">
          {graduates.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true);
                  setActiveSlide(index);
                  setTimeout(() => setIsAnimating(false), 600);
                }
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeSlide 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

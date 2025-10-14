'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';

export default function MeetOurGrads() {
    const [activeSlide, setActiveSlide] = useState(0);
    const slides = 4;
  
    useEffect(() => {
      const interval = setInterval(() => {
        setActiveSlide((prev) => (prev + 1) % slides);
      }, 5000);
      return () => clearInterval(interval);
    }, []);
  
    const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides);
    const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides) % slides);

    return (
        <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-4">
              <h2 className="text-3xl md:text-4xl font-bold">Hear <span className="font-light">From Our Graduates</span></h2>
            </div>
            <div className="md:col-span-8 relative">
              <div className="relative overflow-hidden rounded-lg">
                <div className="flex transition-transform duration-500" style={{transform: `translateX(-${activeSlide * 100}%)`}}>
                  <Image src={getImageUrl('images/grads/grad-carousel1.png')} alt="Graduate 1" width={800} height={600} className="w-full flex-shrink-0" />
                  <Image src={getImageUrl('images/grads/grad-carousel2.png')} alt="Graduate 2" width={800} height={600} className="w-full flex-shrink-0" />
                  <Image src={getImageUrl('images/grads/grad-carousel3.png')} alt="Graduate 3" width={800} height={600} className="w-full flex-shrink-0" />
                  <Image src={getImageUrl('images/grads/grad-carousel4.png')} alt="Graduate 4" width={800} height={600} className="w-full flex-shrink-0" />
                  {/* <img src="/images/grads/grad-carousel1.png" alt="Graduate 1" className="w-full flex-shrink-0" /> */}
                  {/* <img src="/images/grads/grad-carousel2.png" alt="Graduate 2" className="w-full flex-shrink-0" /> */}
                  {/* <img src="/images/grads/grad-carousel3.png" alt="Graduate 3" className="w-full flex-shrink-0" /> */}
                  {/* <img src="/images/grads/grad-carousel4.png" alt="Graduate 4" className="w-full flex-shrink-0" /> */}
                </div>
                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition">‹</button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition">›</button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {[0, 1, 2, 3].map(i => (
                    <button key={i} onClick={() => setActiveSlide(i)} className={`w-3 h-3 rounded-full transition ${activeSlide === i ? 'bg-white' : 'bg-white/50'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
        
    )
}
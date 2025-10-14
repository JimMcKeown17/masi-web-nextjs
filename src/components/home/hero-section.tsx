'use client';
import { getImageUrl } from '@/lib/imageUrl';
import { FadeRight } from '@/components/animations/FadeAnimations';

export default function HeroSection() {
  return (
    <section className="relative h-screen">
    <div className="relative h-full">
    <video autoPlay muted loop playsInline className="w-full h-full object-cover">
        <source src={getImageUrl("/images/Home_Page_Hero_Video_3.mp4")} type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-black/40 flex items-center">
        <div className="container mx-auto px-4">
        <FadeRight>
            <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                Empowering Through Education
            </h1>
            <p className="text-xl md:text-2xl drop-shadow-lg">
                Local Communities Implementing Data-Driven Literacy & Numeracy Programmes.
            </p>
            </div>
        </FadeRight>
        </div>
    </div>
    </div>
    </section>
    );
}
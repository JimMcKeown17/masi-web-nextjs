'use client';
import React from 'react';
import { FadeUp } from '@/components/animations/FadeAnimations';
import MediaHeroSection from '@/components/media/shared/hero-section';
import NewsSection from '@/components/media/in-the-news/news-section';
import Footer from '@/components/layout/Footer';

export default function InTheNewsPage() {
  return (
    <div className="min-h-screen bg-white">
      <MediaHeroSection
        label="Media"
        title="In the News"
        subtitle="See how Masinyusane and Zazi iZandi are shaping the conversation around early literacy and youth employment in South Africa."
      />

      <FadeUp>
        <NewsSection />
      </FadeUp>

      <Footer />
    </div>
  );
}

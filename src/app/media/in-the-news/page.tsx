'use client';
import React from 'react';
import { FadeUp } from '@/components/animations/FadeAnimations';
import NewsSection from '@/components/media/in-the-news/news-section';
import Footer from '@/components/layout/Footer';

export default function InTheNewsPage() {
  return (
    <div className="min-h-screen bg-white">
      <FadeUp>
        <NewsSection />
      </FadeUp>

      <Footer />
    </div>
  );
}

'use client';
import React from 'react';
import NewsHeroSection from '@/components/media/in-the-news/hero-section';
import NewsSection from '@/components/media/in-the-news/news-section';
import Footer from '@/components/layout/Footer';

export default function InTheNewsPage() {
  return (
    <div className="min-h-screen bg-white">
      <NewsHeroSection />
      <NewsSection />
      <Footer />
    </div>
  );
}

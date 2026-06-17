'use client';
import React from 'react';
import NewsSection from '@/components/media/in-the-news/news-section';
import Footer from '@/components/layout/Footer';

export default function InTheNewsPage() {
  return (
    <div className="min-h-screen bg-white">
      <NewsSection />
      <Footer />
    </div>
  );
}

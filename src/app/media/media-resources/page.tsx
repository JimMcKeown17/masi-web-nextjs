'use client';
import React from 'react';
import MediaResourcesHeroSection from '@/components/media/resources/hero-section';
import FeaturedVideoSection from '@/components/media/resources/featured-video-section';
import VideosSection from '@/components/media/resources/videos-section';
import GallerySection from '@/components/media/resources/gallery-section';
import Footer from '@/components/layout/Footer';

export default function MediaResourcesPage() {
  return (
    <div className="min-h-screen bg-white">
      <MediaResourcesHeroSection />
      <FeaturedVideoSection />
      <VideosSection />
      <GallerySection />
      <Footer />
    </div>
  );
}

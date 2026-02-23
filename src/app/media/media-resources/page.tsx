'use client';
import React from 'react';
import { FadeUp } from '@/components/animations/FadeAnimations';
import MediaHeroSection from '@/components/media/shared/hero-section';
import FeaturedVideoSection from '@/components/media/resources/featured-video-section';
import VideosSection from '@/components/media/resources/videos-section';
import GallerySection from '@/components/media/resources/gallery-section';
import Footer from '@/components/layout/Footer';

export default function MediaResourcesPage() {
  return (
    <div className="min-h-screen bg-white">
      <MediaHeroSection
        label="Media"
        title="Media & Resources"
        subtitle="Videos, photos, and resources showcasing Masinyusane's work in early literacy and youth employment."
      />

      <FeaturedVideoSection />

      <VideosSection />

      <FadeUp>
        <GallerySection />
      </FadeUp>

      <Footer />
    </div>
  );
}

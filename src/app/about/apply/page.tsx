'use client';
import React from 'react';
import { FadeUp } from '@/components/animations/FadeAnimations';
import ApplyHeroSection from '@/components/about/apply/hero-section';
import JobsSection from '@/components/about/apply/jobs-section';
import BursariesSection from '@/components/about/apply/bursaries-section';
import Footer from '@/components/layout/Footer';

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <ApplyHeroSection />

      {/* Jobs Section */}
      <FadeUp>
        <JobsSection />
      </FadeUp>

      {/* Bursaries Section */}
      <FadeUp>
        <BursariesSection />
      </FadeUp>

      {/* Footer */}
      <Footer />
    </div>
  );
}


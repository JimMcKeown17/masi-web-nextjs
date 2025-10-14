'use client';
import React from 'react';
import { FadeUp } from '@/components/animations/FadeAnimations';
import TopLearnersHeroSection from '@/components/programs/top-learners/hero-section';
import MissionSection from '@/components/programs/top-learners/mission-section';
import ContentSections from '@/components/programs/top-learners/content-sections';
import Footer from '@/components/layout/Footer';

export default function TopLearnersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <TopLearnersHeroSection />

      {/* Mission Section */}
      <FadeUp>
        <MissionSection />
      </FadeUp>

      {/* Content Sections */}
      <FadeUp>
        <ContentSections />
      </FadeUp>

      {/* Footer */}
      <Footer />
    </div>
  );
}


'use client';
import React from 'react';
import { FadeUp } from '@/components/animations/FadeAnimations';
import CommunityJobsHeroSection from '@/components/programs/community-jobs/hero-section';
import MissionSection from '@/components/programs/community-jobs/mission-section';
import ContentSections from '@/components/programs/community-jobs/content-sections';
import Footer from '@/components/layout/Footer';

export default function CommunityJobsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <CommunityJobsHeroSection />

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


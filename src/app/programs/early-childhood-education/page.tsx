'use client';
import React from 'react';
import { FadeUp } from '@/components/animations/FadeAnimations';
import ECEHeroSection from '@/components/programs/early-childhood-education/hero-section';
import MissionSection from '@/components/programs/early-childhood-education/mission-section';
import ImpactStatsSection from '@/components/programs/early-childhood-education/impact-stats-section';
import ContentSectionsV2 from '@/components/programs/early-childhood-education/content-sections-v2';
import Footer from '@/components/layout/Footer';

export default function EarlyChildhoodEducationPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <ECEHeroSection />

      {/* Mission Section */}
      <FadeUp>
        <MissionSection />
      </FadeUp>

      {/* Impact Stats Section */}
      <ImpactStatsSection />

      {/* Content Sections */}
      <FadeUp>
        <ContentSectionsV2 />
      </FadeUp>

      {/* Footer */}
      <Footer />
    </div>
  );
}


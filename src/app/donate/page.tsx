'use client';
import React from 'react';
import { FadeUp } from '@/components/animations/FadeAnimations';
import DonateHeroSection from '@/components/donate/hero-section';
import ImpactSection from '@/components/donate/impact-section';
import TrustedBySection from '@/components/home/trusted-by-section';
import Footer from '@/components/layout/Footer';

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Donorbox */}
      <DonateHeroSection />

      {/* Impact Section */}
      <FadeUp>
        <ImpactSection />
      </FadeUp>

      {/* Trusted By Section */}
      <FadeUp>
        <TrustedBySection />
      </FadeUp>

      {/* Footer */}
      <Footer />
    </div>
  );
}


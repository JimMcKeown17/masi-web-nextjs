'use client';
import React from 'react';
import { FadeUp } from '@/components/animations/FadeAnimations';
import ReportsHeroSection from '@/components/impact/reports/hero-section';
import FeaturedReportsSection from '@/components/impact/reports/featured-reports-section';
import YearlyReportsSection from '@/components/impact/reports/yearly-reports-section';
import Footer from '@/components/layout/Footer';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <ReportsHeroSection />

      {/* Featured Reports Section */}
      <FadeUp>
        <FeaturedReportsSection />
      </FadeUp>

      {/* Yearly Reports Section */}
      <FadeUp>
        <YearlyReportsSection />
      </FadeUp>

      {/* Footer */}
      <Footer />
    </div>
  );
}


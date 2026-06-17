'use client';
import React from 'react';
import ReportsHeroSection from '@/components/impact/reports/hero-section';
import FeaturedReportsSection from '@/components/impact/reports/featured-reports-section';
import YearlyReportsSection from '@/components/impact/reports/yearly-reports-section';
import Footer from '@/components/layout/Footer';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-white">
      <ReportsHeroSection />
      <FeaturedReportsSection />
      <YearlyReportsSection />
      <Footer />
    </div>
  );
}

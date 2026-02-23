'use client';
import React from 'react';
import { FadeUp } from '@/components/animations/FadeAnimations';
import ImpactHeroSection from '@/components/impact/overview/hero-section';
import KpiSection from '@/components/impact/overview/kpi-section';
import ImpactStatsSection from '@/components/impact/overview/stats-section';
import ChartsSection from '@/components/impact/overview/charts-section';
import Footer from '@/components/layout/Footer';

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-white">
      <ImpactHeroSection />

      <FadeUp>
        <KpiSection />
      </FadeUp>

      <ImpactStatsSection />

      <FadeUp>
        <ChartsSection />
      </FadeUp>

      <Footer />
    </div>
  );
}

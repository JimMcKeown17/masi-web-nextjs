'use client';

import ZaziHeroSection from '@/components/programs/zazi-izandi/hero-section';
import DoEPartnershipSection from '@/components/programs/zazi-izandi/doe-partnership-section';
import ZaziImpactSection from '@/components/programs/zazi-izandi/impact-section';
import ZaziStatsSection from '@/components/programs/zazi-izandi/stats-section';
import ZaziResearchSection from '@/components/programs/zazi-izandi/research-section';
import ZaziVideoSection from '@/components/programs/zazi-izandi/video-section';
import ZaziPartnersSection from '@/components/programs/zazi-izandi/partners-section';
import Footer from '@/components/layout/Footer';

export default function ZaziIZandiPage() {
  return (
    <div className="min-h-screen bg-white">
      <ZaziHeroSection />
      <DoEPartnershipSection />
      <ZaziImpactSection />
      <ZaziStatsSection />
      <ZaziResearchSection />
      <ZaziVideoSection />
      <ZaziPartnersSection />
      <Footer />
    </div>
  );
}

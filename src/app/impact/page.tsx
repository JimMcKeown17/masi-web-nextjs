'use client';

import { FadeUp } from '@/components/animations/FadeAnimations';
import ImpactHeroSection from '@/components/impact/overview/hero-section';
import EducationSection from '@/components/impact/overview/education-section';
import JobCreationSection from '@/components/impact/overview/job-creation-section';
import ScholarshipSection from '@/components/impact/overview/scholarship-section';
import Footer from '@/components/layout/Footer';

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-white">
      <ImpactHeroSection />

      <FadeUp>
        <EducationSection />
      </FadeUp>

      <FadeUp>
        <JobCreationSection />
      </FadeUp>

      <FadeUp>
        <ScholarshipSection />
      </FadeUp>

      <Footer />
    </div>
  );
}

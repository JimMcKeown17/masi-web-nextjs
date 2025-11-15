'use client';
import React, { useState, useEffect } from 'react';
import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';
import { FadeIn, FadeRight, FadeLeft, FadeUp } from '@/components/animations/FadeAnimations';
import HeroSection from '@/components/home/hero-section';
import MissionSection from '@/components/home/mission-section';
import ChildStrip from '@/components/home/child-strip';
import ChildStripInfo from '@/components/home/child-strip-info';
import ChildStripInfoV2 from '@/components/home/child-strip-info-v2';
import ChildStripV2 from '@/components/home/child-strip-v2';
import YouthStrip from '@/components/home/youth-strip';
import YouthStripInfo from '@/components/home/youth-strip-info';
import ScholarshipStrip from '@/components/home/scholarship-strip';
import ScholarshipStripInfo from '@/components/home/scholarship-strip-info';
import AnnualReportSection from '@/components/home/annual-report-section';
import DataPortalStrip from '@/components/home/data-portal-strip';
import MeetOurGrads from '@/components/home/meet-our-grads';
import GradsShowcase from '@/components/home/grads-showcase';
import OurApproachStrip from '@/components/home/our-approach-strip';
import TrustedBySection from '@/components/home/trusted-by-section';
import Footer from '@/components/layout/Footer';

export default function MasinyusaneHome() {


  return (
    <div className="min-h-screen bg-white">
   

      {/* Hero Video Section - fade-right like your Django version */}
      <HeroSection />

      {/* Mission Section - fade-up like your Django version */}
      <FadeUp>
        <MissionSection />
      </FadeUp>

            {/* Child Strip - fade-right on overlay text */}
      <ChildStripV2 />

      {/* Child Info Strip - fade-up */}
      <FadeUp>
        <ChildStripInfoV2 />
      </FadeUp>

      {/* Child Strip - fade-right on overlay text */}
      <ChildStrip />

      {/* Child Info Strip - fade-up */}
      <FadeUp>
        <ChildStripInfo />
      </FadeUp>

      {/* Youth Strip - fade-right */}
      <YouthStrip />

      {/* Youth Info Strip - fade-up */}
      <FadeUp>
        <YouthStripInfo />
      </FadeUp>

      {/* Scholarship Strip - fade-right */}
      <ScholarshipStrip />

      {/* Scholarship Info Strip - fade-up */}
      <FadeUp>
        <ScholarshipStripInfo />
      </FadeUp>

      {/* Annual Report Section */}
      <AnnualReportSection />

      {/* Meet Graduates Carousel */}
      <GradsShowcase />

      {/* Data Portal Section */}
      <DataPortalStrip />

      {/* Approach Section - fade-right like your Django version */}
      <OurApproachStrip />

      {/* Trusted By Section */}
      <TrustedBySection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
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
import YouthStripV2 from '@/components/home/youth-strip-v2';
import YouthStripInfoV2 from '@/components/home/youth-strip-info-v2';
import ScholarshipStripV2 from '@/components/home/scholarship-strip-v2';
import ScholarshipStripInfoV2 from '@/components/home/scholarship-strip-info-v2';

export default function MasinyusaneHome() {


  return (
    <div className="min-h-screen bg-white">
   

      {/* Hero Video Section - fade-right like your Django version */}
      <HeroSection />

      {/* Mission Section - fade-up like your Django version */}
      <FadeUp>
        <MissionSection />
      </FadeUp>

      {/* Decorative Gradient Bar */}
      <FadeUp>
        <div className="flex justify-center py-8">
          <div className="h-1 w-32 rounded-full bg-gradient-to-r from-[#FF006B] via-purple-500 to-[#4F46E5]"></div>
        </div>
      </FadeUp>

            {/* Child Strip - fade-right on overlay text */}
      <ChildStripV2 />

      {/* Child Info Strip - fade-up */}
      <FadeUp>
        <ChildStripInfoV2 />
      </FadeUp>
      {/* Youth Strip - fade-right */}
      <YouthStripV2 />

      {/* Youth Info Strip - fade-up */}
      <FadeUp>
        <YouthStripInfoV2 />
      </FadeUp>

      {/* Scholarship Strip - fade-right */}
      <ScholarshipStripV2 />

      {/* Scholarship Info Strip - fade-up */}
      <FadeUp>
        <ScholarshipStripInfoV2 />
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
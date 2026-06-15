import ECEHeroSection from '@/components/programs/early-childhood-education/hero-section';
import MissionSection from '@/components/programs/early-childhood-education/mission-section';
import ChildStorySection from '@/components/programs/early-childhood-education/child-story-section';
import ApproachSection from '@/components/programs/early-childhood-education/approach-section';
import NumeracySection from '@/components/programs/early-childhood-education/numeracy-section';
import PreschoolSection from '@/components/programs/early-childhood-education/preschool-section';
import StatBandV3 from '@/components/home/v3/stat-band-v3';
import DonateCtaV3 from '@/components/home/v3/donate-cta-v3';
import Footer from '@/components/layout/Footer';

export default function EarlyChildhoodEducationPage() {
  return (
    <div className="min-h-screen bg-white">
      <ECEHeroSection />

      <MissionSection />

      {/* One child's journey — emotional hook before the method */}
      <ChildStorySection />

      {/* The method, collapsed into a tight 3-card row */}
      <ApproachSection />

      {/* Numeracy — its own section (future: its own page) */}
      <NumeracySection />

      {/* We build and run preschools — its own section (future: its own page) */}
      <PreschoolSection />

      {/* The proof, at scale. Figures audited from the homepage / data portal (2025). */}
      <StatBandV3
        bg="#C81E3C"
        tagline={
          <>
            Not just her. This is happening{' '}
            <span className="not-italic font-medium">at scale.</span>
          </>
        }
        context="Every number here is audited and published in our public data portal."
        stats={[
          { to: 1.9, decimals: 1, suffix: 'x', label: 'we double the number of children hitting reading benchmarks.' },
          { to: 314, suffix: '%', label: 'better performance than control groups in 40+ preschools.' },
          { to: 19228, label: 'children in our literacy and reading projects in 2025.' },
        ]}
      />

      <DonateCtaV3 />

      <Footer />
    </div>
  );
}

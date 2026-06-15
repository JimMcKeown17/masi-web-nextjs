import CommunityJobsHeroSection from '@/components/programs/community-jobs/hero-section';
import MissionSection from '@/components/programs/community-jobs/mission-section';
import PersonStorySection from '@/components/programs/community-jobs/person-story-section';
import ChangesSection from '@/components/programs/community-jobs/changes-section';
import CtaSection from '@/components/programs/community-jobs/cta-section';
import StatBandV3 from '@/components/home/v3/stat-band-v3';
import Footer from '@/components/layout/Footer';

export default function CommunityJobsPage() {
  return (
    <div className="min-h-screen bg-white">
      <CommunityJobsHeroSection />

      <MissionSection />

      {/* One woman's story — emotional hook before the themes */}
      <PersonStorySection />

      {/* What a job changes — the four themes, collapsed into cards */}
      <ChangesSection />

      {/* The proof, at scale. Figures audited from the homepage / data portal (2025). */}
      <StatBandV3
        bg="#1D4ED8"
        tagline={
          <>
            Empowering a community to{' '}
            <span className="not-italic font-medium">uplift itself.</span>
          </>
        }
        context="South Africa has the world's highest youth unemployment rate: 43% of young people are out of work."
        stats={[
          { to: 1964, label: 'previously unemployed youth have received jobs.' },
          { to: 92, suffix: '%', label: 'of our jobs go to women.' },
        ]}
      />

      <CtaSection />

      <Footer />
    </div>
  );
}

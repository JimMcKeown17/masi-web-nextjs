import TopLearnersHeroSection from '@/components/programs/top-learners/hero-section';
import MissionSection from '@/components/programs/top-learners/mission-section';
import JourneySection from '@/components/programs/top-learners/journey-section';
import PillarsSection from '@/components/programs/top-learners/pillars-section';
import GraduateStoriesSection from '@/components/programs/top-learners/graduate-stories-section';
import FeaturedGraduateSection from '@/components/programs/top-learners/featured-graduate-section';
import CtaSection from '@/components/programs/top-learners/cta-section';
import StatBandV3 from '@/components/home/v3/stat-band-v3';
import Footer from '@/components/layout/Footer';

// Figures below are sourced from the 2025 Graduate Magazine (505 total) and the current
// program copy (1% degree share; 90% on-time applications, up from 14%). Re-verify
// against the data portal before each ship, per the design system.
export default function TopLearnersPage() {
  return (
    <div className="min-h-screen bg-white">
      <TopLearnersHeroSection />
      <MissionSection />
      {/* Lead with the single strongest story, then immediately scale it: Aphiwe is one of 505. */}
      <FeaturedGraduateSection />
      <StatBandV3
        bg="#B8860B"
        tagline="The road to 500, and well beyond."
        context="In 2015 we counted our graduates on one hand. The line has bent upward every year since."
        dataHref="/impact/data-portal"
        stats={[
          { to: 505, label: 'university graduates, and counting' },
          { to: 1, suffix: '%', label: 'of our communities hold a university degree. Our graduates are that 1%.' },
          { to: 90, suffix: '%', label: 'of our learners now apply to university correctly and on time, up from 14%.' },
        ]}
      />
      {/* Then the mechanism (how every graduate gets there), more voices, and the deep pillars. */}
      <JourneySection />
      <GraduateStoriesSection />
      <PillarsSection />
      <CtaSection />
      <Footer />
    </div>
  );
}

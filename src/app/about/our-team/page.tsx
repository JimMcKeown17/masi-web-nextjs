import HeroSection from '@/components/about/hero-section';
import ExecutiveDirector from '@/components/about/executive-director';
import TeamSection from '@/components/about/team-section';
import FemaleStatSection from '@/components/about/female-stat-section';
import FoundersSection from '@/components/about/founders-section';
import JobsChartSection from '@/components/about/jobs-chart-section';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Negative margin pulls hero under the fixed navbar so it fills the full viewport */}
      <div className="-mt-16">
        <HeroSection />
      </div>

      <ExecutiveDirector />
      <TeamSection />
      <FemaleStatSection />
      <FoundersSection />
      <JobsChartSection />

      <Footer />
    </div>
  );
}

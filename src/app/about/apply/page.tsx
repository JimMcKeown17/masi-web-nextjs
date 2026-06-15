import ApplyHeroSection from '@/components/about/apply/hero-section';
import JobsSection from '@/components/about/apply/jobs-section';
import BursariesSection from '@/components/about/apply/bursaries-section';
import Footer from '@/components/layout/Footer';

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-white">
      <ApplyHeroSection />
      <JobsSection />
      <BursariesSection />
      <Footer />
    </div>
  );
}

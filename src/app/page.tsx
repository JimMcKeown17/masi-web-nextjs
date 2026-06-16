import HeroV3 from '@/components/home/v3/hero-v3';
import MissionV3 from '@/components/home/v3/mission-v3';
import ChildStripV3 from '@/components/home/v3/child-strip-v3';
import YouthStripV3 from '@/components/home/v3/youth-strip-v3';
import StatBandV3 from '@/components/home/v3/stat-band-v3';
import DataPortalV3 from '@/components/home/v3/data-portal-v3';
import GradsV3 from '@/components/home/v3/grads-v3';
import DonateCtaV3 from '@/components/home/v3/donate-cta-v3';
import TrustedByV3 from '@/components/home/v3/trusted-by-v3';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Masinyusane | Every child reading, every youth working',
  description:
    'We hire and train unemployed local youth to run data-driven literacy and numeracy programmes in South Africa’s public schools.',
};

export default function MasinyusaneHome() {
  return (
    <div className="min-h-screen bg-white">
      <HeroV3 />
      <MissionV3 />

      <ChildStripV3 />
      <StatBandV3
        bg="#C81E3C"
        tagline={
          <>
            Where every child discovers <span className="not-italic font-medium">the power of words.</span>
          </>
        }
        context="Most children in our communities start school without the pre-literacy basics that wealthier peers take for granted."
        stats={[
          { to: 1.9, decimals: 1, suffix: 'x', label: 'We double the number of children hitting reading benchmarks.' },
          { to: 314, suffix: '%', label: 'better performance than control groups in 40+ preschools.' },
          { to: 19228, label: 'children in our literacy and reading projects in 2025.' },
        ]}
      />

      <YouthStripV3 />
      <StatBandV3
        bg="#1D4ED8"
        tagline={
          <>
            Empowering a community to <span className="not-italic font-medium">uplift itself.</span>
          </>
        }
        context="South Africa has the world's highest youth unemployment rate: 43% of young people are out of work."
        stats={[
          { to: 1964, label: 'previously unemployed youth have received jobs.' },
          { to: 92, suffix: '%', label: 'of our jobs go to women.' },
        ]}
      />

      <DataPortalV3 />
      <GradsV3 />
      <DonateCtaV3 />
      <TrustedByV3 />
      <Footer />
    </div>
  );
}

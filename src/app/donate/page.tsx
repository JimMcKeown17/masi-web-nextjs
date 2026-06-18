// src/app/donate/page.tsx
import DonateHero from '@/components/donate/donate-hero';
import GivingMenu from '@/components/donate/giving-menu';
import CustomAmountBand from '@/components/donate/custom-amount';
import AfterYouGive from '@/components/donate/after-you-give';
import TrustedBySection from '@/components/home/trusted-by-section';
import Footer from '@/components/layout/Footer';

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-white">
      <DonateHero />
      <GivingMenu />
      <CustomAmountBand />
      <AfterYouGive />
      <TrustedBySection />
      <Footer />
    </main>
  );
}

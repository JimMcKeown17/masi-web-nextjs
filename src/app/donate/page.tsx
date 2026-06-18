// src/app/donate/page.tsx
import DonateHero from '@/components/donate/donate-hero';
import GivingMenu from '@/components/donate/giving-menu';
import AfterYouGive from '@/components/donate/after-you-give';
import CustomAmountBand from '@/components/donate/custom-amount';
import DonorboxScript from '@/components/donate/donorbox-script';
import TrustedBySection from '@/components/home/trusted-by-section';
import Footer from '@/components/layout/Footer';

export default function DonatePage() {
  return (
    <main className="min-h-screen bg-white">
      <DonateHero />
      <GivingMenu />
      <AfterYouGive />
      <CustomAmountBand />
      <TrustedBySection />
      <Footer />
      <DonorboxScript />
    </main>
  );
}

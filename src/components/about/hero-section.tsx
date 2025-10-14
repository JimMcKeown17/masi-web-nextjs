import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <header className="relative h-[75vh] w-full">
      <Image
        src={getImageUrl('images/LCs/LC-11.jpg')}
        alt="About Us - Masinyusane"
        fill
        className="object-cover"
        priority
      />
    </header>
  );
}


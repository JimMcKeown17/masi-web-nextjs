'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/imageUrl';

const serif = { fontFamily: 'var(--font-fraunces), Georgia, serif' };

// Shared portrait. Real graduate photos are still being converted to webp, so when an
// image is absent we render a designed gold monogram tile instead of a broken image.
// Drop the webp into GCS at the documented path and set `image` to switch it on.
export function graduateInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function GraduatePortrait({
  image,
  name,
  dark = false,
  sizes,
}: {
  image?: string;
  name: string;
  dark?: boolean;
  sizes?: string;
}) {
  if (image) {
    return (
      <Image
        src={getImageUrl(image)}
        alt={name}
        fill
        sizes={sizes}
        className="object-cover object-top"
      />
    );
  }
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center ${
        dark
          ? 'bg-gradient-to-br from-[#B8860B]/30 via-[#171C24] to-[#0E1116]'
          : 'bg-gradient-to-br from-[#B8860B]/20 to-[#B8860B]/[0.04]'
      }`}
      aria-label={`Portrait of ${name} coming soon`}
    >
      <span
        style={serif}
        className={`text-6xl md:text-7xl font-medium ${dark ? 'text-[#E2B53C]/85' : 'text-[#B8860B]/75'}`}
      >
        {graduateInitials(name)}
      </span>
    </div>
  );
}

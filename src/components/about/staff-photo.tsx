import { getImageUrl } from '@/lib/imageUrl';
import Image from 'next/image';

type Align = "left" | "center" | "right";

interface StaffPhotoProps {
  imageSrc: string;
  alt: string;
  align?: Align;
  className?: string;
}

export default function StaffPhoto({
  imageSrc,
  alt,
  align = "center",
  className = "",
}: StaffPhotoProps) {
  const resolvedImageSrc = imageSrc.startsWith('/') ? imageSrc : getImageUrl(imageSrc);
  const objectPositionClass =
    align === "left"
      ? "object-left-bottom"
      : align === "right"
      ? "object-right-bottom"
      : "object-bottom";

  return (
    <div
      className={`relative w-full max-w-[414px] aspect-[4/3] overflow-visible ${className}`}
    >
      {/* Warm rounded panel behind - narrower at 88% width. Reads on both white and paper sections. */}
      <div className="absolute inset-x-[6%] top-16 bottom-0 rounded-[28px] bg-[#E8E2D6]" />

      {/* Foreground cutout image - taller to extend above panel */}
      <div className="absolute z-10 bottom-0 h-[102%] w-full">
        <Image
          src={resolvedImageSrc}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 414px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={`object-contain drop-shadow-sm ${objectPositionClass}`}
          draggable={false}
        />
      </div>
    </div>
  );
}

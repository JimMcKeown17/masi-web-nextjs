import { getImageUrl } from '@/lib/imageUrl';

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
  const alignClass =
    align === "left"
      ? "left-6"
      : align === "right"
      ? "right-6"
      : "left-1/2 -translate-x-1/2";

  return (
    <div
      className={`relative w-full max-w-[414px] aspect-[4/3] overflow-visible ${className}`}
    >
      {/* Grey rounded panel behind - narrower at 88% width */}
      <div className="absolute inset-x-[6%] top-16 bottom-0 rounded-[28px] bg-zinc-200" />

      {/* Foreground cutout image - taller to extend above panel */}
      <img
        src={getImageUrl(imageSrc)}
        alt={alt}
        className={`absolute z-10 bottom-0 h-[102%] w-auto max-w-full object-contain object-bottom drop-shadow-sm ${alignClass}`}
        draggable={false}
      />
    </div>
  );
}

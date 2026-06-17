import { KidFigure, KidVariant } from "./KidFigure";

export function IconArray({
  total,
  filled,
  filledVariant,
  emptyVariant,
  size = 17,
  className = "",
}: {
  total: number;
  filled: number;
  filledVariant: KidVariant;
  emptyVariant: KidVariant;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`flex gap-[5px] ${className}`} role="img" aria-label={`${filled} of ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <KidFigure key={index} variant={index < filled ? filledVariant : emptyVariant} size={size} />
      ))}
    </div>
  );
}

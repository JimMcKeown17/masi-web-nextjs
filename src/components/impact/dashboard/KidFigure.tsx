// "lit" = a child who has reached the benchmark; it glows the lifted gold used for
// gold-on-dark in the Ink & Signal system. Unlit tones stay neutral slate.
const PALETTE = {
  litHead: "#E2B53C",
  darkUnlit: "#2a2f45",
  lightUnlit: "#cbd5e1",
  lightShaded: "#334155",
} as const;

export type KidVariant = "dark-unlit" | "light-unlit" | "light-shaded" | "lit";

export function KidFigure({
  variant,
  size = 18,
  delayMs = 0,
}: {
  variant: KidVariant;
  size?: number;
  delayMs?: number;
}) {
  const fill =
    variant === "lit"
      ? PALETTE.litHead
      : variant === "dark-unlit"
        ? PALETTE.darkUnlit
        : variant === "light-shaded"
          ? PALETTE.lightShaded
          : PALETTE.lightUnlit;

  return (
    <svg
      width={size}
      height={size * 1.44}
      viewBox="0 0 18 26"
      aria-hidden="true"
      style={{
        filter: variant === "lit" ? "drop-shadow(0 0 7px rgba(226,181,60,0.75))" : "none",
        transition: "filter 0.6s ease",
        transitionDelay: `${delayMs}ms`,
      }}
    >
      {/* Child proportions: head wider than the shoulders, small rounded body. */}
      <circle
        cx="9"
        cy="6"
        r="5.5"
        fill={fill}
        style={{ transition: "fill 0.6s ease", transitionDelay: `${delayMs}ms` }}
      />
      <path
        d="M4 26 L4 20 Q4 14.5 9 14.5 Q14 14.5 14 20 L14 26 Z"
        fill={fill}
        style={{ transition: "fill 0.6s ease", transitionDelay: `${delayMs}ms` }}
      />
    </svg>
  );
}

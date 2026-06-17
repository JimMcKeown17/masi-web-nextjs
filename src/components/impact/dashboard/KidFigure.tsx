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
      <circle
        cx="9"
        cy="4.5"
        r="4.5"
        fill={fill}
        style={{ transition: "fill 0.6s ease", transitionDelay: `${delayMs}ms` }}
      />
      <path
        d="M2 26 L2 17 Q2 11 9 11 Q16 11 16 17 L16 26 Z"
        fill={fill}
        style={{ transition: "fill 0.6s ease", transitionDelay: `${delayMs}ms` }}
      />
    </svg>
  );
}

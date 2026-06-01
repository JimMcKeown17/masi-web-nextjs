import type { ReactNode } from "react";

// A thin SVG progress ring with rounded caps and centred content.
export function Ring({
  size,
  stroke = 8,
  fill,
  color,
  children,
}: {
  size: number;
  stroke?: number;
  fill: number;
  color: string;
  children: ReactNode;
}) {
  const r = (size - stroke) / 2 - 1;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(fill, 1)));
  const mid = size / 2;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="block">
        <circle cx={mid} cy={mid} r={r} fill="none" stroke="#f0f0f2" strokeWidth={stroke} />
        <circle
          cx={mid}
          cy={mid}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${mid} ${mid})`}
          style={{ transition: "stroke-dashoffset .6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

// Small "i" icon with a hover/tap tooltip (CSS only).
export function InfoTip({ text }: { text: string }) {
  return (
    <span
      tabIndex={0}
      className="group relative inline-grid place-items-center w-4 h-4 rounded-full bg-[#ececed] text-[#9a9aa0] text-[10px] font-bold italic cursor-help align-middle"
    >
      i
      <span className="pointer-events-none absolute bottom-[140%] left-1/2 -translate-x-1/2 w-[185px] rounded-[10px] bg-[#1c1c1e]/95 px-2.5 py-2 text-[11.5px] font-normal not-italic leading-[1.5] text-white opacity-0 invisible transition group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible z-30 shadow-xl">
        {text}
      </span>
    </span>
  );
}

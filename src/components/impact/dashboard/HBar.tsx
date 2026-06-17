import { ReactNode } from "react";

export function HBar({
  label,
  sublabel,
  valueText,
  pct,
  tone,
  accent = "#C81E3C",
  thin = false,
}: {
  label?: string;
  sublabel?: string;
  valueText: string;
  pct: number;
  tone: "brand" | "neutral";
  accent?: string;
  thin?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${thin ? "-mt-2 mb-3.5" : "mb-3.5"}`}>
      <div className="w-[130px] text-right text-[13px] leading-tight text-gray-500">
        {label}
        {sublabel && <span className="block text-[11px] text-gray-400">{sublabel}</span>}
      </div>
      <div className={`flex-1 overflow-hidden rounded-md bg-gray-100 ${thin ? "h-[18px]" : "h-[30px]"}`}>
        <div
          className="flex h-full items-center justify-end rounded-md pr-2 text-xs font-semibold text-white"
          style={{
            width: `${Math.max(0, Math.min(100, pct))}%`,
            backgroundColor: tone === "brand" ? accent : "#94a3b8",
          }}
        >
          {valueText}
        </div>
      </div>
    </div>
  );
}

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-[0_8px_30px_rgba(17,24,39,0.05)]">
      <div className="mb-4 text-[13px] font-semibold text-gray-700">{title}</div>
      {children}
    </div>
  );
}

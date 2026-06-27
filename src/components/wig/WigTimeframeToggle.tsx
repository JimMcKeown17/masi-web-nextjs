"use client";
import type { ComponentType } from "react";
import { CalendarDays, CalendarRange, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WigPeriod } from "@/lib/types/wig";
import { useWigData } from "./WigDataProvider";

const OPTIONS: {
  value: WigPeriod;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { value: "week", label: "1 week", icon: CalendarDays },
  { value: "month", label: "4 weeks", icon: CalendarRange },
  { value: "programme_year", label: "Year", icon: History },
];

export function WigTimeframeToggle() {
  const { period, setPeriod, isLoading } = useWigData();

  return (
    <div className="flex justify-end mb-5">
      <div
        className="inline-flex items-center rounded-lg border border-[#e5e5ea] bg-white p-1 shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
        role="radiogroup"
        aria-label="WIG timeframe"
      >
        {OPTIONS.map((option) => {
          const active = option.value === period;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={isLoading && active}
              onClick={() => setPeriod(option.value)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold transition-colors",
                active
                  ? "bg-[#f0f0f3] text-foreground"
                  : "text-[#6b6b70] hover:bg-[#f6f6f8] hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

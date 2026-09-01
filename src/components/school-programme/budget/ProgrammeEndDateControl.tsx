"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BudgetScenario } from "@/lib/types/youth-budget";
import {
  programmeEndPresetFor,
  programmeEndPresets,
} from "./programmeEndDate";

export function ProgrammeEndDateControl({
  draft,
  asOf,
  recalculating,
  onChange,
}: {
  draft: BudgetScenario;
  asOf: string;
  recalculating: boolean;
  onChange: (draft: BudgetScenario) => void;
}) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const presets = programmeEndPresets(draft.year);
  const activePreset = programmeEndPresetFor(
    draft.last_paid_programme_date,
    draft.year,
  );

  return (
    <section className="rounded-xl border border-[#1D4ED8]/20 bg-[#FAF7F2] p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Label
              htmlFor="budget-last-paid-programme-date"
              className="font-serif text-2xl text-[#14181D]"
            >
              Last paid programme date
            </Label>
            {recalculating ? (
              <span className="text-xs text-[#1D4ED8]">Recalculating...</span>
            ) : null}
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
            Caps paid working days for core and rural youth. NYS remains a
            full monthly contribution capped at earned wages plus UIF. Mentor
            remains a full monthly estimate for every projected month included.
          </p>
          <p className="mt-1 text-xs text-gray-500">
            This remains a private what-if until an authorised user saves the
            shared scenario in the full controls below.
          </p>
        </div>
        <Input
          ref={dateInputRef}
          id="budget-last-paid-programme-date"
          type="date"
          min={asOf}
          max={`${draft.year}-11-30`}
          value={draft.last_paid_programme_date}
          onChange={(event) =>
            onChange({
              ...draft,
              last_paid_programme_date: event.target.value,
            })
          }
          className="w-44 bg-white tabular-nums"
        />
      </div>
      <div
        className="mt-4 flex flex-wrap gap-2"
        aria-label="Programme end date presets"
      >
        {presets.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            variant={activePreset === preset.id ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onChange({
                ...draft,
                last_paid_programme_date: preset.date,
              })
            }
            className={
              activePreset === preset.id
                ? "bg-[#1D4ED8] text-white hover:bg-[#1740b0]"
                : "bg-white"
            }
          >
            {preset.label}
          </Button>
        ))}
        <Button
          type="button"
          variant={activePreset === "custom" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            dateInputRef.current?.focus();
            dateInputRef.current?.showPicker?.();
          }}
          className={
            activePreset === "custom"
              ? "bg-[#1D4ED8] text-white hover:bg-[#1740b0]"
              : "bg-white"
          }
        >
          Custom date
        </Button>
      </div>
    </section>
  );
}

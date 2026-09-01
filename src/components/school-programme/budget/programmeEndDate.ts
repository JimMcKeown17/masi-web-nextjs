export type ProgrammeEndPreset =
  | "end-october"
  | "mid-november"
  | "full-november"
  | "custom";

export function programmeEndPresets(year: number) {
  return [
    {
      id: "end-october" as const,
      label: "End October",
      date: `${year}-10-31`,
    },
    {
      id: "mid-november" as const,
      label: "Mid-November",
      date: `${year}-11-14`,
    },
    {
      id: "full-november" as const,
      label: "Full November",
      date: `${year}-11-30`,
    },
  ];
}

export function programmeEndPresetFor(
  value: string,
  year: number,
): ProgrammeEndPreset {
  return programmeEndPresets(year).find((preset) => preset.date === value)?.id ?? "custom";
}

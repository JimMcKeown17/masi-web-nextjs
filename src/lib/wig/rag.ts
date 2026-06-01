// Pure RAG/format helpers for WIG measures. Status is computed client-side from
// value vs target + direction (the backend supplies numbers only).
import type { Direction, RagStatus, ValueScale } from "@/lib/types/wig";

export function ragStatus(
  value: number | null | undefined,
  target: number,
  direction: Direction
): RagStatus {
  if (value === null || value === undefined) return "none";
  if (direction === "gte") {
    if (value >= target) return "green";
    if (value >= 0.9 * target) return "amber";
    return "red";
  }
  // lower-is-better (e.g. duplicate rate, mismatch count)
  if (target === 0) return value === 0 ? "green" : "red";
  if (value <= target) return "green";
  if (value <= 1.5 * target) return "amber";
  return "red";
}

// Fraction of the ring to fill (0..1), representing progress toward target.
export function ringFill(value: number | null | undefined, target: number): number {
  if (value === null || value === undefined) return 0;
  if (target === 0) return value === 0 ? 0 : 1;
  return Math.max(0, Math.min(value / target, 1));
}

// Number shown inside the ring.
export function formatValue(
  value: number | null | undefined,
  scale: ValueScale
): string {
  if (value === null || value === undefined) return "–";
  switch (scale) {
    case "ratio":
      return Math.round(value * 100).toString();
    case "percent":
      return Math.round(value).toString();
    case "per_day":
      return value.toFixed(1);
    case "count":
      return value < 10 ? value.toFixed(1) : Math.round(value).toString();
  }
}

// Target shown beneath the ring, in the same scale as the value.
export function formatTarget(target: number, scale: ValueScale): string {
  switch (scale) {
    case "ratio":
      return `${Math.round(target * 100)}%`;
    case "percent":
      return `${Math.round(target)}%`;
    default:
      return target.toString();
  }
}

export const RAG_HEX: Record<RagStatus, string> = {
  green: "#34c759",
  amber: "#ff9f0a",
  red: "#ff3b30",
  none: "#d1d1d6",
};

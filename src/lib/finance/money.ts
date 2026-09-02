// Snapshot money is a decimal string ("^-?\d+\.\d{2}$"); parse only at the
// display boundary. Formatting is a string transform, not Intl: ICU has
// changed en-ZA punctuation between versions and a financial display
// contract must not depend on the build machine (overview 3.22).
import type { Money } from "@/lib/types/finance";

export function parseMoney(value: Money): number {
  return Number(value);
}

export function formatRand(value: Money | null, fallback = "n/a"): string {
  if (value === null) return fallback;
  const negative = value.startsWith("-");
  const [whole, cents = "00"] = (negative ? value.slice(1) : value).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${negative ? "-" : ""}R ${grouped},${cents.padEnd(2, "0").slice(0, 2)}`;
}

export function formatPercent(numerator: Money | null, denominator: Money | null): string | null {
  if (numerator === null || denominator === null) return null;
  const bottom = parseMoney(denominator);
  if (bottom === 0) return null;
  return `${((parseMoney(numerator) / bottom) * 100).toFixed(1)}%`;
}

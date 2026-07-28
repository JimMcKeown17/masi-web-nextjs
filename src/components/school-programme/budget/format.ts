const randFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  currencyDisplay: "symbol",
  maximumFractionDigits: 0,
});

const preciseRandFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  currencyDisplay: "symbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactRandFormatter = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  currencyDisplay: "symbol",
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Johannesburg",
});

const monthFormatter = new Intl.DateTimeFormat("en-ZA", {
  month: "short",
  timeZone: "UTC",
});

export function formatRand(value: number): string {
  return randFormatter.format(Number.isFinite(value) ? value : 0).replace(/\u00a0/g, " ");
}

export function formatPreciseRand(value: number): string {
  return preciseRandFormatter
    .format(Number.isFinite(value) ? value : 0)
    .replace(/\u00a0/g, " ");
}

export function formatCompactRand(value: number): string {
  return compactRandFormatter
    .format(Number.isFinite(value) ? value : 0)
    .replace(/\u00a0/g, " ");
}

export function formatBudgetDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return dateFormatter.format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatMonth(month: number, style: "short" | "long" = "short"): string {
  if (month < 1 || month > 12) return String(month);
  if (style === "short") {
    return monthFormatter.format(new Date(Date.UTC(2026, month - 1, 1)));
  }
  return new Intl.DateTimeFormat("en-ZA", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2026, month - 1, 1)));
}

export function verdictLanguage(verdict: number): {
  status: "under" | "over" | "on";
  amount: number;
  phrase: string;
} {
  const amount = Math.abs(verdict);
  if (Math.abs(verdict) < 0.005) {
    return { status: "on", amount: 0, phrase: "on budget" };
  }
  if (verdict > 0) {
    return {
      status: "under",
      amount,
      phrase: `${formatRand(amount)} under budget`,
    };
  }
  return {
    status: "over",
    amount,
    phrase: `${formatRand(amount)} over budget`,
  };
}

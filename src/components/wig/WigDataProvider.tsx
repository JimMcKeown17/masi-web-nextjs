"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { getWigLeadMeasures, getWigDataQuality, getWigZazi, getWigOutcomes } from "@/lib/api/wig";
import type { MeasureValue, WigPeriod, WigWindow, ZaziPayload, OutcomesPayload } from "@/lib/types/wig";

// One fetch for the whole board. Placed in the WIG layout so the three
// endpoints are loaded once and shared across every programme page; switching
// programmes in the sidebar reads from context (no refetch).
interface WigData {
  measures: Record<string, MeasureValue>;
  window: WigWindow;
  zaziAvailable: Record<string, boolean>; // keyed by programme key
  outcomes: OutcomesPayload;
}

interface WigContextValue {
  data?: WigData;
  period: WigPeriod;
  setPeriod: (period: WigPeriod) => void;
  isLoading: boolean;
  error?: Error;
}

const WigContext = createContext<WigContextValue | null>(null);

export function WigDataProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const [period, setPeriod] = useState<WigPeriod>("week");
  const { data, error, isLoading } = useSWR<WigData>(["wig-board", period], async () => {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    const emptyZazi: ZaziPayload = { available: {}, measures: {} };
    // A failed outcomes call must read as unavailable, never as "awaiting".
    const emptyOutcomes: OutcomesPayload = {
      available: false,
      source_note: "outcomes request failed",
      outcomes: {
        zazi_izandi: { kind: "unavailable", note: "outcomes request failed" },
        zazi_izandi_ecd: { kind: "unavailable", note: "outcomes request failed" },
      },
    };
    const [lead, dq, zazi, outcomes] = await Promise.all([
      getWigLeadMeasures(token, period),
      getWigDataQuality(token),
      getWigZazi(token).catch(() => emptyZazi),
      getWigOutcomes(token).catch(() => emptyOutcomes),
    ]);
    return {
      measures: { ...lead.measures, ...dq.measures, ...zazi.measures },
      window: lead.window,
      zaziAvailable: zazi.available,
      outcomes,
    };
  });

  return (
    <WigContext.Provider
      value={{ data, period, setPeriod, isLoading, error: error as Error | undefined }}
    >
      {children}
    </WigContext.Provider>
  );
}

export function useWigData(): WigContextValue {
  const ctx = useContext(WigContext);
  if (!ctx) throw new Error("useWigData must be used within WigDataProvider");
  return ctx;
}

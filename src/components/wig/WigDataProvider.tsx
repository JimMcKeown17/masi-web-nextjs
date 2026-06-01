"use client";
import { createContext, useContext, type ReactNode } from "react";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { getWigLeadMeasures, getWigDataQuality, getWigZazi } from "@/lib/api/wig";
import type { MeasureValue, WigWindow, ZaziPayload } from "@/lib/types/wig";

// One fetch for the whole board. Placed in the WIG layout so the three
// endpoints are loaded once and shared across every programme page; switching
// programmes in the sidebar reads from context (no refetch).
interface WigData {
  measures: Record<string, MeasureValue>;
  window: WigWindow;
  zaziAvailable: boolean;
}

interface WigContextValue {
  data?: WigData;
  isLoading: boolean;
  error?: Error;
}

const WigContext = createContext<WigContextValue | null>(null);

export function WigDataProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const { data, error, isLoading } = useSWR<WigData>("wig-board", async () => {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    const emptyZazi: ZaziPayload = { available: false, measures: {} };
    const [lead, dq, zazi] = await Promise.all([
      getWigLeadMeasures(token),
      getWigDataQuality(token),
      getWigZazi(token).catch(() => emptyZazi),
    ]);
    return {
      measures: { ...lead.measures, ...dq.measures, ...zazi.measures },
      window: lead.window,
      zaziAvailable: zazi.available,
    };
  });

  return (
    <WigContext.Provider
      value={{ data, isLoading, error: error as Error | undefined }}
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

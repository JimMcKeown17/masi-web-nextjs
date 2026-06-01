"use client";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { AlertTriangle } from "lucide-react";
import { PROGRAMMES } from "@/lib/wig/config";
import { getWigLeadMeasures, getWigDataQuality, getWigZazi } from "@/lib/api/wig";
import type { MeasureValue, ZaziPayload } from "@/lib/types/wig";
import { ProgrammeTile } from "./ProgrammeTile";
import { MetricsGuide } from "./MetricsGuide";

function formatRange(from: string, to: string): string {
  const f = new Date(`${from}T00:00:00`);
  const t = new Date(`${to}T00:00:00`);
  const day = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric" });
  const monthYear = t.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  return `${day(f)}–${day(t)} ${monthYear}`;
}

export function WigScoreboardClient() {
  const { getToken } = useAuth();
  const { data, error, isLoading } = useSWR("wig-board", async () => {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    const emptyZazi: ZaziPayload = { available: false, measures: {} };
    const [lead, dq, zazi] = await Promise.all([
      getWigLeadMeasures(token),
      getWigDataQuality(token),
      getWigZazi(token).catch(() => emptyZazi),
    ]);
    return { lead, dq, zazi };
  });

  if (isLoading) return <BoardSkeleton />;
  if (error || !data) return <BoardError message={(error as Error)?.message} />;

  const measures: Record<string, MeasureValue> = {
    ...data.lead.measures,
    ...data.dq.measures,
    ...data.zazi.measures,
  };
  const w = data.lead.window;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Wildly Important Goals</h1>
        <span className="text-sm text-muted-foreground">
          Week of {formatRange(w.date_from, w.date_to)}
        </span>
      </div>

      <div className="rounded-xl border border-dashed border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2.5 text-[13px] text-indigo-700 mb-5">
        <b>Org WIG</b> — to be defined · placeholder until the team sets the single north-star goal
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PROGRAMMES.map((p) => (
          <ProgrammeTile
            key={p.key}
            programme={p}
            measures={measures}
            zaziAvailable={data.zazi.available}
          />
        ))}
      </div>

      <MetricsGuide />
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-72 rounded-[26px] bg-white border border-[#f1f1f1] animate-pulse"
        />
      ))}
    </div>
  );
}

function BoardError({ message }: { message?: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-amber-800">
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <div>
        <span className="font-semibold">Couldn&apos;t load the WIG board.</span>{" "}
        {message || "Try again shortly."} If the backend WIG endpoints aren&apos;t deployed yet,
        that&apos;s expected.
      </div>
    </div>
  );
}

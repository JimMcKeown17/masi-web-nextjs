"use client";
import { PROGRAMMES } from "@/lib/wig/config";
import { formatWindowRange } from "@/lib/wig/rag";
import { useWigData } from "@/components/wig/WigDataProvider";
import { ProgrammeRollupCard } from "@/components/wig/ProgrammeRollupCard";
import { WigSkeleton, WigError } from "@/components/wig/states";

export default function WigOverviewPage() {
  const { data, isLoading, error } = useWigData();

  if (isLoading) return <WigSkeleton />;
  if (error || !data) return <WigError message={(error as Error)?.message} />;

  return (
    <div className="max-w-5xl">
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <span className="text-sm text-muted-foreground">
          {formatWindowRange(data.window)}
        </span>
      </div>

      <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2.5 text-[13px] text-indigo-700 mb-6">
        <b>Org WIG</b> — Hit our Word Reading &amp; Blending WIGs in all programmes
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROGRAMMES.map((p) => (
          <ProgrammeRollupCard
            key={p.key}
            programme={p}
            measures={data.measures}
            zaziAvailable={data.zaziAvailable}
            outcomes={data.outcomes}
          />
        ))}
      </div>
    </div>
  );
}

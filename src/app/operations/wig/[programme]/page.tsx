"use client";
import { useParams, notFound } from "next/navigation";
import { programmeBySlug } from "@/lib/wig/config";
import { formatWeekRange } from "@/lib/wig/rag";
import { useWigData } from "@/components/wig/WigDataProvider";
import { ProgrammeView } from "@/components/wig/ProgrammeView";
import { WigSkeleton, WigError } from "@/components/wig/states";

export default function ProgrammePage() {
  const params = useParams<{ programme: string }>();
  const programme = programmeBySlug(params.programme);
  if (!programme) notFound();

  const { data, isLoading, error } = useWigData();

  if (isLoading) return <WigSkeleton />;
  if (error || !data) return <WigError message={(error as Error)?.message} />;

  return (
    <ProgrammeView
      key={programme.key}
      programme={programme}
      measures={data.measures}
      zaziAvailable={data.zaziAvailable}
      weekLabel={formatWeekRange(data.window.date_from, data.window.date_to)}
    />
  );
}

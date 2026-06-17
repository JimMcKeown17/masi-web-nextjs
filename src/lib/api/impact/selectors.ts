import { PublishedStat, PublishedStatsPayload } from "@/lib/types/impact";

export function pick(payload: PublishedStatsPayload | null, key: string): PublishedStat | null {
  return payload?.stats[key] ?? null;
}

export function group(payload: PublishedStatsPayload | null, name: string): PublishedStat[] {
  if (!payload?.groups[name]) return [];
  return payload.groups[name].map((key) => payload.stats[key]).filter((stat): stat is PublishedStat => Boolean(stat));
}

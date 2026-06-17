import "server-only";

import { PublishedStatsPayload } from "@/lib/types/impact";

export async function getPublishedStats(): Promise<PublishedStatsPayload | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/impact/published-stats/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PublishedStatsPayload;
  } catch {
    return null;
  }
}

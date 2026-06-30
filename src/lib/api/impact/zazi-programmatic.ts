import "server-only";

import { ZaziProgrammaticPayload } from "@/lib/types/data-portal";

// Fetches the Zazi Programmatic-impact payload via the Masi backend proxy
// (which calls the Zazi backend server-side with the shared secret). ISR-cached;
// returns null on failure so the page can render a graceful empty state while
// the last good copy keeps serving.
export async function getZaziProgrammatic(): Promise<ZaziProgrammaticPayload | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/impact/zazi-programmatic/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as ZaziProgrammaticPayload;
  } catch {
    return null;
  }
}

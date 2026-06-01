// API client for the WIG dashboard endpoints (Masi backend, ADMIN/PM only).
import type {
  LeadMeasuresPayload,
  DataQualityPayload,
  ZaziPayload,
} from "@/lib/types/wig";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getJson<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${path} (${res.status})`);
  return res.json() as Promise<T>;
}

export function getWigLeadMeasures(token: string) {
  return getJson<LeadMeasuresPayload>("/wig/lead-measures/", token);
}

export function getWigDataQuality(token: string) {
  return getJson<DataQualityPayload>("/wig/data-quality/", token);
}

export function getWigZazi(token: string) {
  return getJson<ZaziPayload>("/wig/zazi/", token);
}

// API client for the School Programme Grid. Reads are open to any authenticated
// user; writes require ADMIN / PROJECT MANAGER (enforced server-side).
import type {
  SchoolProgrammeGrid,
  CellEdit,
  StatsEdit,
} from "@/lib/types/school-programme";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function asError(res: Response, fallback: string): Promise<never> {
  const body = await res.json().catch(() => ({}));
  throw new Error((body as { detail?: string }).detail || fallback);
}

export async function getGrid(
  token: string,
  year: number,
): Promise<SchoolProgrammeGrid> {
  const res = await fetch(`${API_URL}/school-programme-grid/?year=${year}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await asError(res, "Failed to load the grid");
  return res.json();
}

export async function updateCell(token: string, cellId: number, fields: CellEdit) {
  const res = await fetch(`${API_URL}/school-programme-grid/cell/${cellId}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fields),
  });
  if (!res.ok) await asError(res, "Failed to update cell");
  return res.json();
}

// Declare a programme at a school (create the cell). Idempotent server-side, so a
// double-click is harmless; the new row is empty until a count/plan is typed.
export async function createCell(
  token: string,
  body: { school_uid: string; programme: string; year: number },
) {
  const res = await fetch(`${API_URL}/school-programme-grid/cell/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) await asError(res, "Failed to add the programme");
  return res.json();
}

// Remove an empty cell (reverses an accidental add). The server refuses if the
// cell holds any data, so real numbers can't be deleted by mistake.
export async function deleteCell(token: string, cellId: number) {
  const res = await fetch(`${API_URL}/school-programme-grid/cell/${cellId}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await asError(res, "Failed to remove the cell");
}

export async function updateStats(token: string, statsId: number, fields: StatsEdit) {
  const res = await fetch(`${API_URL}/school-programme-grid/stats/${statsId}/`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fields),
  });
  if (!res.ok) await asError(res, "Failed to update stats");
  return res.json();
}

export async function rolloverGrid(token: string, fromYear: number, toYear: number) {
  const res = await fetch(`${API_URL}/school-programme-grid/rollover/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from_year: fromYear, to_year: toYear }),
  });
  if (!res.ok) await asError(res, "Failed to roll over the year");
  return res.json();
}

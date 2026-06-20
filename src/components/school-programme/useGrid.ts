"use client";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import {
  getGrid,
  updateCell,
  updateStats,
  createCell,
  deleteCell,
} from "@/lib/api/school-programme";
import type { CellEdit, StatsEdit } from "@/lib/types/school-programme";

// One data source for both grid pages (children + youth are two projections of
// the same payload). Owns the fetch and the write-through edit handlers so the
// page components stay presentational.
export function useGrid(year: number) {
  const { getToken } = useAuth();
  const swr = useSWR(`/operations/school-programme-grid?year=${year}`, async () => {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    return getGrid(token, year);
  });

  async function onCellEdit(cellId: number, fields: CellEdit) {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    await updateCell(token, cellId, fields);
    await swr.mutate();
  }

  async function onStatsEdit(statsId: number, fields: StatsEdit) {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    await updateStats(token, statsId, fields);
    await swr.mutate();
  }

  async function onCellAdd(schoolUid: string, programme: string) {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    await createCell(token, { school_uid: schoolUid, programme, year });
    await swr.mutate();
  }

  async function onCellRemove(cellId: number) {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    await deleteCell(token, cellId);
    await swr.mutate();
  }

  return { ...swr, onCellEdit, onStatsEdit, onCellAdd, onCellRemove };
}

"use client";

import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import {
  createExpenditure,
  createPot,
  deletePot,
  getYouthBudget,
  previewScenario,
  updateExpenditure,
  updatePot,
  updateScenario,
} from "@/lib/api/youth-budget";
import type {
  BudgetScenarioUpdate,
  FundingPotCreate,
  FundingPotUpdate,
  YouthExpenditureCreate,
  YouthExpenditureUpdate,
} from "@/lib/types/youth-budget";

export function youthBudgetCacheKey(year: number) {
  return `/operations/youth-budget?year=${year}`;
}

export function useYouthBudget(year: number) {
  const { getToken } = useAuth();
  const swr = useSWR(youthBudgetCacheKey(year), async () => {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    return getYouthBudget(token, year);
  });

  async function tokenForWrite() {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    return token;
  }

  async function onScenarioUpdate(fields: Omit<BudgetScenarioUpdate, "year">) {
    await updateScenario(await tokenForWrite(), { year, ...fields });
    await swr.mutate();
  }

  async function onPotCreate(fields: Omit<FundingPotCreate, "year">) {
    await createPot(await tokenForWrite(), { year, ...fields });
    await swr.mutate();
  }

  async function onPotUpdate(potId: number, fields: FundingPotUpdate) {
    await updatePot(await tokenForWrite(), potId, fields);
    await swr.mutate();
  }

  async function onPotDelete(potId: number) {
    await deletePot(await tokenForWrite(), potId);
    await swr.mutate();
  }

  async function onExpenditureCreate(
    fields: Omit<YouthExpenditureCreate, "year">,
  ) {
    await createExpenditure(await tokenForWrite(), { year, ...fields });
    await swr.mutate();
  }

  async function onExpenditureUpdate(
    expenditureId: number,
    fields: YouthExpenditureUpdate,
  ) {
    await updateExpenditure(await tokenForWrite(), expenditureId, fields);
    await swr.mutate();
  }

  return {
    ...swr,
    onScenarioUpdate,
    onPotCreate,
    onPotUpdate,
    onPotDelete,
    onExpenditureCreate,
    onExpenditureUpdate,
  };
}

export function useYouthBudgetPreview(
  fields: BudgetScenarioUpdate | null,
) {
  const { getToken } = useAuth();
  const serialized = fields ? JSON.stringify(fields) : null;
  return useSWR(
    serialized ? ["/operations/youth-budget/preview", serialized] : null,
    async ([, payload]) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return previewScenario(
        token,
        JSON.parse(payload) as BudgetScenarioUpdate,
      );
    },
    { keepPreviousData: true },
  );
}

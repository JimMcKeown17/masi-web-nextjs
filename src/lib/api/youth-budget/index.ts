import type {
  BudgetScenario,
  BudgetScenarioUpdate,
  FundingPot,
  FundingPotCreate,
  FundingPotUpdate,
  MonthlyYouthExpenditure,
  YouthBudgetPreview,
  YouthBudgetSummary,
  YouthExpenditureCreate,
  YouthExpenditureUpdate,
} from "@/lib/types/youth-budget";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function asError(res: Response, fallback: string): Promise<never> {
  const body = await res.json().catch(() => ({}));
  throw new Error((body as { detail?: string }).detail || fallback);
}

function jsonHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getYouthBudget(
  token: string,
  year: number,
): Promise<YouthBudgetSummary> {
  const res = await fetch(
    `${API_URL}/youth-budget/?year=${encodeURIComponent(year)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!res.ok) await asError(res, "Failed to load the youth budget");
  return res.json();
}

export async function updateScenario(
  token: string,
  fields: BudgetScenarioUpdate,
): Promise<BudgetScenario> {
  const res = await fetch(`${API_URL}/youth-budget/scenario/`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(fields),
  });
  if (!res.ok) await asError(res, "Failed to update the budget scenario");
  return res.json();
}

export async function previewScenario(
  token: string,
  fields: BudgetScenarioUpdate,
): Promise<YouthBudgetPreview> {
  const res = await fetch(`${API_URL}/youth-budget/preview/`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(fields),
  });
  if (!res.ok) await asError(res, "Failed to preview the budget scenario");
  return res.json();
}

export async function createPot(
  token: string,
  fields: FundingPotCreate,
): Promise<FundingPot> {
  const res = await fetch(`${API_URL}/youth-budget/pots/`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(fields),
  });
  if (!res.ok) await asError(res, "Failed to create the funding pot");
  return res.json();
}

export async function updatePot(
  token: string,
  potId: number,
  fields: FundingPotUpdate,
): Promise<FundingPot> {
  const res = await fetch(`${API_URL}/youth-budget/pots/${potId}/`, {
    method: "PATCH",
    headers: jsonHeaders(token),
    body: JSON.stringify(fields),
  });
  if (!res.ok) await asError(res, "Failed to update the funding pot");
  return res.json();
}

export async function deletePot(token: string, potId: number): Promise<void> {
  const res = await fetch(`${API_URL}/youth-budget/pots/${potId}/`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await asError(res, "Failed to delete the funding pot");
}

export async function createExpenditure(
  token: string,
  fields: YouthExpenditureCreate,
): Promise<MonthlyYouthExpenditure> {
  const res = await fetch(`${API_URL}/youth-budget/expenditure/`, {
    method: "POST",
    headers: jsonHeaders(token),
    body: JSON.stringify(fields),
  });
  if (!res.ok) await asError(res, "Failed to create the expenditure row");
  return res.json();
}

export async function updateExpenditure(
  token: string,
  expenditureId: number,
  fields: YouthExpenditureUpdate,
): Promise<MonthlyYouthExpenditure> {
  const res = await fetch(
    `${API_URL}/youth-budget/expenditure/${expenditureId}/`,
    {
      method: "PATCH",
      headers: jsonHeaders(token),
      body: JSON.stringify(fields),
    },
  );
  if (!res.ok) await asError(res, "Failed to update the expenditure row");
  return res.json();
}

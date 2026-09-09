import { FinanceBudgets } from "@/components/finance/FinanceBudgetsPage";

export default function FinanceBudgetsPage() {
  return <div>
    <header className="mb-4">
      <h1 className="font-serif text-3xl font-semibold">Budgets</h1>
      <p className="text-sm text-muted-foreground">Explore projected spending and the expenses behind each budget line.</p>
    </header>
    <FinanceBudgets />
  </div>;
}

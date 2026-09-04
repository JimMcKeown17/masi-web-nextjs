"use client";

import { useParams } from "next/navigation";

import { FinanceContractDetail } from "@/components/finance/FinanceContractDetail";
import { useFinanceSnapshot } from "@/components/finance/useFinanceSnapshot";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinanceContractPage() {
  const { contract_code: contractCode } = useParams<{ contract_code: string }>();
  const { data, error, isLoading } = useFinanceSnapshot();

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" aria-label="Loading finance snapshot" />;
  }
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    );
  }
  if (!data) return null;

  return (
    <FinanceContractDetail
      contracts={data.snapshot.funder_contracts}
      contractCode={contractCode}
      accountingYear={data.accounting_year}
    />
  );
}

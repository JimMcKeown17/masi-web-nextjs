import Link from "next/link";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { FunderContract } from "@/lib/types/finance";

import { FunderContractsTable } from "./FunderContractsTable";

export function FinanceContractDetail({
  contracts,
  contractCode,
  accountingYear,
}: {
  contracts: FunderContract[];
  contractCode: string;
  accountingYear: number;
}) {
  const contract = contracts.find((item) => item.contract_code === contractCode);

  if (!contract) {
    return (
      <>
        <BackToFunders />
        <Alert variant="destructive">
          <AlertDescription>
            No funder contract with code {contractCode} exists in this snapshot.
          </AlertDescription>
        </Alert>
      </>
    );
  }

  return (
    <>
      <BackToFunders />
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-semibold">{contract.contract_code}</h1>
        <p className="text-sm text-muted-foreground">
          {contract.block_label}
          {contract.period_label ? `, ${contract.period_label}` : ""}
        </p>
      </header>
      <FunderContractsTable
        contracts={[contract]}
        accountingYear={accountingYear}
        initiallyExpanded={[contract.id]}
      />
    </>
  );
}

function BackToFunders() {
  return (
    <Link
      href="/operations/finance/funders"
      className="mb-4 inline-block text-sm font-medium underline underline-offset-4"
    >
      Back to Funders
    </Link>
  );
}

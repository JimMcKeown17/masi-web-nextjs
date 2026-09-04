import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  assertFinanceAccess,
  FIELD_APP_UNAUTHENTICATED,
  FIELD_APP_FORBIDDEN,
} from "@/lib/masi/auth-guard";
import { FinanceNav } from "@/components/finance/FinanceNav";

export const metadata: Metadata = {
  title: "Finance | Operations",
};

export const dynamic = "force-dynamic";

// The capability guard is frontend defence in depth; Django independently protects
// the snapshot endpoint with the same finance.read evaluator.
export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await assertFinanceAccess();
  } catch (err) {
    if (err instanceof Error && err.message === FIELD_APP_UNAUTHENTICATED) {
      redirect("/auth/sign-in?redirect_url=/operations/finance/overview");
    }
    if (err instanceof Error && err.message === FIELD_APP_FORBIDDEN) {
      return (
        <div className="min-h-screen pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-xl">
            <div className="bg-card rounded-lg shadow-sm p-6 border">
              <h1 className="text-lg font-semibold mb-2">Access denied</h1>
              <p className="text-sm text-muted-foreground">
                Finance access has not been granted to your account.
              </p>
            </div>
          </div>
        </div>
      );
    }
    throw err;
  }

  return (
    <div className="min-h-screen px-4 pb-16 pt-20 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <FinanceNav />
        {children}
      </div>
    </div>
  );
}

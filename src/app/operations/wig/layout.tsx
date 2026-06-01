import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  assertFieldAppAccess,
  FIELD_APP_UNAUTHENTICATED,
  FIELD_APP_FORBIDDEN,
} from "@/lib/masi/auth-guard";
import { WigShell } from "@/components/wig/WigShell";

export const metadata: Metadata = {
  title: "WIG | Operations",
};

export const dynamic = "force-dynamic";

// ADMIN / PROJECT MANAGER only. Guarding the layout protects every
// /operations/wig/* route, so the pages themselves don't re-check.
export default async function WigLayout({ children }: { children: React.ReactNode }) {
  try {
    await assertFieldAppAccess();
  } catch (err) {
    if (err instanceof Error && err.message === FIELD_APP_UNAUTHENTICATED) {
      redirect("/auth/sign-in?redirect_url=/operations/wig");
    }
    if (err instanceof Error && err.message === FIELD_APP_FORBIDDEN) {
      return (
        <div className="min-h-screen pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-xl">
            <div className="bg-card rounded-lg shadow-sm p-6 border">
              <h1 className="text-lg font-semibold mb-2">Access denied</h1>
              <p className="text-sm text-muted-foreground">
                The WIG dashboard is restricted to Admins and Project Managers. Contact a
                project lead if you think you should have access.
              </p>
            </div>
          </div>
        </div>
      );
    }
    throw err;
  }

  return <WigShell>{children}</WigShell>;
}

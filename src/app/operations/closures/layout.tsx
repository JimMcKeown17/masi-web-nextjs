import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  assertFieldAppAccess,
  FIELD_APP_UNAUTHENTICATED,
  FIELD_APP_FORBIDDEN,
} from "@/lib/masi/auth-guard";

export const metadata: Metadata = {
  title: "Closure Calendar | Operations",
};

export const dynamic = "force-dynamic";

// ADMIN / PROJECT MANAGER only. Guarding the layout protects the page, so it
// doesn't re-check. Mirrors /operations/wig.
export default async function ClosuresLayout({ children }: { children: React.ReactNode }) {
  try {
    await assertFieldAppAccess();
  } catch (err) {
    if (err instanceof Error && err.message === FIELD_APP_UNAUTHENTICATED) {
      redirect("/auth/sign-in?redirect_url=/operations/closures");
    }
    if (err instanceof Error && err.message === FIELD_APP_FORBIDDEN) {
      return (
        <div className="min-h-screen pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-xl">
            <div className="bg-card rounded-lg shadow-sm p-6 border">
              <h1 className="text-lg font-semibold mb-2">Access denied</h1>
              <p className="text-sm text-muted-foreground">
                The Closure Calendar is restricted to Admins and Project Managers. Contact a
                project lead if you think you should have access.
              </p>
            </div>
          </div>
        </div>
      );
    }
    throw err;
  }

  return <div className="min-h-screen pt-24 pb-12">{children}</div>;
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  assertFieldAppAccess,
  FIELD_APP_UNAUTHENTICATED,
  FIELD_APP_FORBIDDEN,
} from "@/lib/masi/auth-guard";
import { GridNav } from "@/components/school-programme/GridNav";

export const metadata: Metadata = {
  title: "School Programme Grid | Operations",
};

export const dynamic = "force-dynamic";

// ADMIN / PROJECT MANAGER only. Guarding the layout protects the route; the
// client page renders read data and gates write controls server-side too.
export default async function SchoolProgrammeGridLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await assertFieldAppAccess();
  } catch (err) {
    if (err instanceof Error && err.message === FIELD_APP_UNAUTHENTICATED) {
      redirect("/auth/sign-in?redirect_url=/operations/school-programme-grid");
    }
    if (err instanceof Error && err.message === FIELD_APP_FORBIDDEN) {
      return (
        <div className="min-h-screen pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-xl">
            <div className="bg-card rounded-lg shadow-sm p-6 border">
              <h1 className="text-lg font-semibold mb-2">Access denied</h1>
              <p className="text-sm text-muted-foreground">
                The School Programme Grid is restricted to Admins and Project
                Managers. Contact a project lead if you think you should have
                access.
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
        <GridNav />
        {children}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getStaffRoster,
  getAssessmentResults,
  getSyncHealth,
} from "@/lib/masi/api";
import {
  FIELD_APP_UNAUTHENTICATED,
  FIELD_APP_FORBIDDEN,
} from "@/lib/masi/auth-guard";
import { StaffRosterTable } from "@/components/operations/field-app/staff-roster-table";
import { AssessmentResultsTable } from "@/components/operations/field-app/assessment-results-table";
import { SyncHealthPanel } from "@/components/operations/field-app/sync-health-panel";

export const metadata: Metadata = {
  title: "Field App | Operations",
};

export const dynamic = "force-dynamic";

export default async function FieldAppPage() {
  let rosterResult, assessmentsResult, syncResult;
  try {
    [rosterResult, assessmentsResult, syncResult] = await Promise.all([
      getStaffRoster(),
      getAssessmentResults(100),
      getSyncHealth(),
    ]);
  } catch (err) {
    if (err instanceof Error && err.message === FIELD_APP_UNAUTHENTICATED) {
      redirect("/auth/sign-in?redirect_url=/operations/field-app");
    }
    if (err instanceof Error && err.message === FIELD_APP_FORBIDDEN) {
      return (
        <div className="min-h-screen pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-xl">
            <div className="bg-card rounded-lg shadow-sm p-6 border">
              <h1 className="text-lg font-semibold mb-2">Access denied</h1>
              <p className="text-sm text-muted-foreground">
                The Masi Field App dashboard is restricted to Admins and Project Managers.
                Contact a project lead if you think you should have access.
              </p>
            </div>
          </div>
        </div>
      );
    }
    throw err;
  }

  const hasFailure =
    !rosterResult.isLive || !assessmentsResult.isLive || !syncResult.isLive;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl space-y-4">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Masi Field App</h1>
          <p className="text-sm text-muted-foreground">
            Live view of the React Native mobile app in the field. Refreshes on every request.
          </p>
        </header>

        {hasFailure && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-amber-800">
              <span className="font-semibold">Some data is unavailable.</span>{" "}
              One or more queries to the Masi Supabase project failed. Showing empty tables
              for the affected sections. Try again in a few minutes, or check the server logs.
            </div>
          </div>
        )}

        <Tabs defaultValue="roster">
          <TabsList>
            <TabsTrigger value="roster">Staff Roster</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="sync">Sync Health</TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="mt-4">
            <StaffRosterTable rows={rosterResult.data} />
          </TabsContent>

          <TabsContent value="assessments" className="mt-4">
            <AssessmentResultsTable rows={assessmentsResult.data} />
          </TabsContent>

          <TabsContent value="sync" className="mt-4">
            <SyncHealthPanel data={syncResult.data} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

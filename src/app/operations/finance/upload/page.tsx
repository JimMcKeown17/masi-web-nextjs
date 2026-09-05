import { redirect } from "next/navigation";
import { FinanceUpload } from "@/components/finance/FinanceUpload";
import { canPublishFinance } from "@/lib/finance/access";
import { assertFinanceAccess, FIELD_APP_UNAUTHENTICATED, FIELD_APP_FORBIDDEN } from "@/lib/masi/auth-guard";
import { getUserProfile } from "@/lib/server/user";

export const dynamic = "force-dynamic";

export default async function FinanceUploadPage() {
  try {
    await assertFinanceAccess();
    const profile = await getUserProfile();
    if (!canPublishFinance(profile?.capabilities)) throw new Error(FIELD_APP_FORBIDDEN);
  } catch (error) {
    if (error instanceof Error && error.message === FIELD_APP_UNAUTHENTICATED) redirect("/auth/sign-in?redirect_url=/operations/finance/upload");
    if (error instanceof Error && error.message === FIELD_APP_FORBIDDEN) return <div role="alert"><h1 className="font-serif text-2xl">Access denied</h1><p>Finance read and publish access are required to upload workbooks.</p></div>;
    throw error;
  }
  return <FinanceUpload />;
}

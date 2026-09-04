import "server-only";
import { auth } from "@clerk/nextjs/server";
import { getUserProfile } from "@/lib/server/user";
import { canAccessFinance } from "@/lib/finance/access";

export const FIELD_APP_UNAUTHENTICATED = "FIELD_APP_UNAUTHENTICATED";
export const FIELD_APP_FORBIDDEN = "FIELD_APP_FORBIDDEN";

// Allowed roles come from Django's User.role enum. Values are case-sensitive
// strings stored on the Masi Django user model, fetched via /api/me/.
// Deliberately excludes MENTOR (field observers, not leadership) to match
// the security posture of the Masi mobile-app field test roll-out.
const ALLOWED_ROLES = new Set<string>(["ADMIN", "PROJECT MANAGER"]);

export async function assertFieldAppAccess(): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error(FIELD_APP_UNAUTHENTICATED);

  // getUserProfile() returns null if Django is unreachable or the Clerk user
  // has no matching Django profile. In either case we fail closed — a role-
  // gated dashboard must not render when the role source is unavailable.
  const profile = await getUserProfile();
  if (!profile) throw new Error(FIELD_APP_FORBIDDEN);

  const role = (profile as { role?: string }).role;
  if (!role || !ALLOWED_ROLES.has(role)) {
    throw new Error(FIELD_APP_FORBIDDEN);
  }
}

export async function assertFinanceAccess(): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error(FIELD_APP_UNAUTHENTICATED);

  const profile = await getUserProfile();
  if (!profile) throw new Error(FIELD_APP_FORBIDDEN);

  const role = (profile as { role?: string }).role;
  if (!canAccessFinance(role)) {
    throw new Error(FIELD_APP_FORBIDDEN);
  }
}

import "server-only";
import { getMasiSupabase } from "./supabase-server";
import {
  assertFieldAppAccess,
  FIELD_APP_UNAUTHENTICATED,
  FIELD_APP_FORBIDDEN,
} from "./auth-guard";
import {
  type StaffRosterRow,
  type AssessmentResultRow,
  type SyncHealthSnapshot,
  type TableHealthRow,
  type InactiveStaffRow,
  type CoachDetail,
  type CoachChild,
  type CoachSession,
  type CoachAssessment,
  type FetchResult,
  EMPTY_ROSTER,
  EMPTY_ASSESSMENT_RESULTS,
  EMPTY_SYNC_HEALTH,
  EMPTY_COACH_DETAIL,
} from "./types";

// Tables whose write-flow we surface on the dashboard.
//
// We no longer query the cloud `synced` column — see offlineSync.js:122 in
// the Masi mobile app, which strips `synced` from every upsert payload.
// Cloud `synced` just reflects the column default (false) forever, so
// "unsynced count in cloud" is not a useful pending-queue indicator. True
// pending-queue state lives in AsyncStorage on each device and is not
// observable from the web. Instead we measure "rows written in last 7 days"
// per table — a real flow signal.
//
// `children` is still listed here because flow-counting only needs
// `created_at` (which it has), not `synced`.
const TABLES_TO_TRACK = [
  "sessions",
  "assessments",
  "children",
  "time_entries",
  "groups",
  "staff_children",
  "letter_mastery",
] as const;

function isAuthError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.message === FIELD_APP_UNAUTHENTICATED || err.message === FIELD_APP_FORBIDDEN;
}

// Supabase PostgrestError exposes message/code/details/hint as non-enumerable
// getters — default console.error prints "{}". Pull them out explicitly, and
// fall back to a full property dump (with constructor name) for synthesised
// fetch-level errors whose standard fields are all empty.
function describeError(err: unknown): string {
  if (!err) return "unknown error";
  if (err instanceof Error) {
    return `${err.name}${err.message ? `: ${err.message}` : ""}`;
  }
  if (typeof err === "object") {
    const e = err as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };
    const standard = [
      typeof e.message === "string" && e.message ? e.message : null,
      typeof e.code === "string" && e.code ? `code=${e.code}` : null,
      typeof e.details === "string" && e.details ? e.details : null,
      typeof e.hint === "string" && e.hint ? e.hint : null,
    ].filter(Boolean);
    if (standard.length) return standard.join(" | ");
    const ctor = (err as object).constructor?.name ?? "Object";
    const keys = Object.getOwnPropertyNames(err);
    const kv = keys
      .map((k) => {
        const v = (err as Record<string, unknown>)[k];
        if (typeof v === "string") return `${k}='${v}'`;
        if (v === null || typeof v === "number" || typeof v === "boolean") return `${k}=${v}`;
        return `${k}=${typeof v}`;
      })
      .join(", ");
    return `${ctor}{${kv || "empty"}}`;
  }
  return String(err);
}

function logApiError(context: string, err: unknown): void {
  console.error(`[masi/api] ${context}: ${describeError(err)}`);
}

function laterOf(...dates: (string | null | undefined)[]): string | null {
  let max: string | null = null;
  for (const d of dates) {
    if (!d) continue;
    if (max === null || d > max) max = d;
  }
  return max;
}

// ─── Staff Roster ────────────────────────────────────────────────

export async function getStaffRoster(): Promise<FetchResult<StaffRosterRow[]>> {
  await assertFieldAppAccess();

  try {
    const supabase = getMasiSupabase();

    const [usersRes, staffChildrenRes, sessionsRes, assessmentsRes, timeEntriesRes] =
      await Promise.all([
        supabase
          .from("users")
          .select("id, first_name, last_name, job_title, assigned_school"),
        supabase.from("staff_children").select("staff_id"),
        supabase.from("sessions").select("user_id, created_at"),
        supabase.from("assessments").select("user_id, created_at"),
        supabase.from("time_entries").select("user_id, created_at"),
      ]);

    if (usersRes.error) throw usersRes.error;
    if (staffChildrenRes.error) throw staffChildrenRes.error;
    if (sessionsRes.error) throw sessionsRes.error;
    if (assessmentsRes.error) throw assessmentsRes.error;
    if (timeEntriesRes.error) throw timeEntriesRes.error;

    const childrenCount = new Map<string, number>();
    for (const row of staffChildrenRes.data ?? []) {
      const k = row.staff_id as string;
      childrenCount.set(k, (childrenCount.get(k) ?? 0) + 1);
    }

    const sessionsCount = new Map<string, number>();
    const lastSession = new Map<string, string>();
    for (const row of sessionsRes.data ?? []) {
      const k = row.user_id as string;
      sessionsCount.set(k, (sessionsCount.get(k) ?? 0) + 1);
      const prev = lastSession.get(k);
      if (!prev || (row.created_at as string) > prev) {
        lastSession.set(k, row.created_at as string);
      }
    }

    const assessmentsCount = new Map<string, number>();
    const lastAssessment = new Map<string, string>();
    for (const row of assessmentsRes.data ?? []) {
      const k = row.user_id as string;
      assessmentsCount.set(k, (assessmentsCount.get(k) ?? 0) + 1);
      const prev = lastAssessment.get(k);
      if (!prev || (row.created_at as string) > prev) {
        lastAssessment.set(k, row.created_at as string);
      }
    }

    const lastTimeEntry = new Map<string, string>();
    for (const row of timeEntriesRes.data ?? []) {
      const k = row.user_id as string;
      const prev = lastTimeEntry.get(k);
      if (!prev || (row.created_at as string) > prev) {
        lastTimeEntry.set(k, row.created_at as string);
      }
    }

    const rows: StaffRosterRow[] = (usersRes.data ?? []).map((u) => ({
      id: u.id as string,
      first_name: (u.first_name as string) ?? "",
      last_name: (u.last_name as string) ?? "",
      job_title: (u.job_title as string | null) ?? null,
      assigned_school: (u.assigned_school as string | null) ?? null,
      children_count: childrenCount.get(u.id as string) ?? 0,
      sessions_count: sessionsCount.get(u.id as string) ?? 0,
      assessments_count: assessmentsCount.get(u.id as string) ?? 0,
      last_activity: laterOf(
        lastSession.get(u.id as string),
        lastAssessment.get(u.id as string),
        lastTimeEntry.get(u.id as string),
      ),
    }));

    rows.sort((a, b) => {
      if (a.last_activity && b.last_activity) {
        return a.last_activity > b.last_activity ? -1 : a.last_activity < b.last_activity ? 1 : 0;
      }
      if (a.last_activity) return -1;
      if (b.last_activity) return 1;
      return 0;
    });

    return { data: rows, isLive: true };
  } catch (err) {
    if (isAuthError(err)) throw err;
    logApiError("getStaffRoster failed", err);
    return { data: EMPTY_ROSTER, isLive: false };
  }
}

// ─── Assessment Results ──────────────────────────────────────────

export async function getAssessmentResults(
  limit = 100,
): Promise<FetchResult<AssessmentResultRow[]>> {
  await assertFieldAppAccess();

  try {
    const supabase = getMasiSupabase();

    const assessmentsRes = await supabase
      .from("assessments")
      .select(
        "id, user_id, child_id, assessment_type, accuracy, correct_responses, date_assessed",
      )
      .order("date_assessed", { ascending: false })
      .limit(limit);

    if (assessmentsRes.error) throw assessmentsRes.error;
    const assessments = assessmentsRes.data ?? [];

    const childIds = Array.from(new Set(assessments.map((a) => a.child_id as string)));
    const userIds = Array.from(new Set(assessments.map((a) => a.user_id as string)));

    // LEFT JOIN semantics: fetch children and users separately, merge in JS.
    // Orphaned child_id (no matching row) renders with child_name: null.
    // Preserves the deliberate no-FK design in supabase-migrations/05_add_assessments_table.sql
    // so offline-sync-created assessments are not hidden from the dashboard.
    const [childrenRes, usersRes] = await Promise.all([
      childIds.length
        ? supabase.from("children").select("id, first_name, last_name").in("id", childIds)
        : Promise.resolve({ data: [], error: null }),
      userIds.length
        ? supabase.from("users").select("id, first_name, last_name").in("id", userIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (childrenRes.error) throw childrenRes.error;
    if (usersRes.error) throw usersRes.error;

    const childById = new Map<string, { first_name: string; last_name: string }>();
    for (const c of childrenRes.data ?? []) {
      childById.set(c.id as string, {
        first_name: (c.first_name as string) ?? "",
        last_name: (c.last_name as string) ?? "",
      });
    }

    const userById = new Map<string, { first_name: string; last_name: string }>();
    for (const u of usersRes.data ?? []) {
      userById.set(u.id as string, {
        first_name: (u.first_name as string) ?? "",
        last_name: (u.last_name as string) ?? "",
      });
    }

    const rows: AssessmentResultRow[] = assessments.map((a) => {
      const child = childById.get(a.child_id as string);
      const user = userById.get(a.user_id as string);
      return {
        id: a.id as string,
        user_id: a.user_id as string,
        coach_name: user ? `${user.first_name} ${user.last_name}`.trim() || null : null,
        child_id: a.child_id as string,
        child_name: child ? `${child.first_name} ${child.last_name}`.trim() || null : null,
        assessment_type: (a.assessment_type as string | null) ?? null,
        accuracy: (a.accuracy as number | null) ?? null,
        correct_responses: (a.correct_responses as number | null) ?? null,
        date_assessed: a.date_assessed as string,
      };
    });

    return { data: rows, isLive: true };
  } catch (err) {
    if (isAuthError(err)) throw err;
    logApiError("getAssessmentResults failed", err);
    return { data: EMPTY_ASSESSMENT_RESULTS, isLive: false };
  }
}

// ─── Sync Health ─────────────────────────────────────────────────

export async function getSyncHealth(): Promise<FetchResult<SyncHealthSnapshot>> {
  await assertFieldAppAccess();

  try {
    const supabase = getMasiSupabase();

    const sevenDaysAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const oneDayAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Per-table resilience: one failing table must not take down the whole
    // sync-health panel. Each table's error is captured on its own row so the
    // dashboard still shows what it can and the user sees what's broken.
    //
    // Query shape: GET + limit(1) + count:exact. HEAD+filter has edge-case
    // failures in PostgREST when the filtered count requires a sequential scan
    // (empty-message synthesised errors). GET costs one id per query and is
    // far more consistent.
    const perTablePromises = TABLES_TO_TRACK.map(async (t): Promise<TableHealthRow> => {
      try {
        const [totalRes, recentRes] = await Promise.all([
          supabase.from(t).select("id", { count: "exact" }).limit(1),
          supabase
            .from(t)
            .select("id", { count: "exact" })
            .gte("created_at", sevenDaysAgoIso)
            .limit(1),
        ]);
        const errors: string[] = [];
        if (totalRes.error) {
          logApiError(`getSyncHealth[${t}] total`, totalRes.error);
          errors.push(`total: ${describeError(totalRes.error)}`);
        }
        if (recentRes.error) {
          logApiError(`getSyncHealth[${t}] last_7d`, recentRes.error);
          errors.push(`last_7d: ${describeError(recentRes.error)}`);
        }
        return {
          table: t,
          total: totalRes.error ? 0 : totalRes.count ?? 0,
          last_7d: recentRes.error ? 0 : recentRes.count ?? 0,
          error: errors.length ? errors.join(" · ") : undefined,
        };
      } catch (e) {
        logApiError(`getSyncHealth[${t}]`, e);
        return { table: t, total: 0, last_7d: 0, error: describeError(e) };
      }
    });

    const [tableRows, sessionsRecent, assessmentsRecent, timeRecent, usersRes] =
      await Promise.all([
        Promise.all(perTablePromises),
        supabase
          .from("sessions")
          .select("user_id, created_at")
          .gte("created_at", sevenDaysAgoIso),
        supabase
          .from("assessments")
          .select("user_id, created_at")
          .gte("created_at", sevenDaysAgoIso),
        supabase
          .from("time_entries")
          .select("user_id, created_at")
          .gte("created_at", sevenDaysAgoIso),
        supabase.from("users").select("id, first_name, last_name, assigned_school"),
      ]);

    if (sessionsRecent.error) throw sessionsRecent.error;
    if (assessmentsRecent.error) throw assessmentsRecent.error;
    if (timeRecent.error) throw timeRecent.error;
    if (usersRes.error) throw usersRes.error;

    const activeIn7d = new Set<string>();
    const lastActivity = new Map<string, string>();

    const collectActivity = (rows: { user_id: unknown; created_at: unknown }[]) => {
      for (const r of rows) {
        const k = r.user_id as string;
        const ts = r.created_at as string;
        activeIn7d.add(k);
        const prev = lastActivity.get(k);
        if (!prev || ts > prev) lastActivity.set(k, ts);
      }
    };
    collectActivity(sessionsRecent.data ?? []);
    collectActivity(assessmentsRecent.data ?? []);
    collectActivity(timeRecent.data ?? []);

    let activity_24h = 0;
    for (const rows of [sessionsRecent.data, assessmentsRecent.data, timeRecent.data]) {
      for (const r of rows ?? []) {
        if ((r.created_at as string) >= oneDayAgoIso) activity_24h += 1;
      }
    }

    const inactive_staff: InactiveStaffRow[] = (usersRes.data ?? [])
      .filter((u) => !activeIn7d.has(u.id as string))
      .map((u) => ({
        id: u.id as string,
        first_name: (u.first_name as string) ?? "",
        last_name: (u.last_name as string) ?? "",
        assigned_school: (u.assigned_school as string | null) ?? null,
        last_activity: lastActivity.get(u.id as string) ?? null,
      }));

    return {
      data: { tables: tableRows, activity_24h, inactive_staff },
      isLive: true,
    };
  } catch (err) {
    if (isAuthError(err)) throw err;
    logApiError("getSyncHealth failed", err);
    return { data: EMPTY_SYNC_HEALTH, isLive: false };
  }
}

// ─── Coach Detail ────────────────────────────────────────────────

export async function getCoachDetail(userId: string): Promise<FetchResult<CoachDetail>> {
  await assertFieldAppAccess();

  try {
    const supabase = getMasiSupabase();

    const [profileRes, staffChildrenRes, sessionsRes, assessmentsRes] = await Promise.all([
      supabase
        .from("users")
        .select("id, first_name, last_name, job_title, assigned_school, created_at")
        .eq("id", userId)
        .maybeSingle(),
      supabase
        .from("staff_children")
        .select(
          "assigned_at, children:children(id, first_name, last_name, teacher, class, school, age)",
        )
        .eq("staff_id", userId),
      supabase
        .from("sessions")
        .select("id, session_type, session_date, created_at, notes, children_ids")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("assessments")
        .select("id, child_id, assessment_type, accuracy, correct_responses, date_assessed")
        .eq("user_id", userId)
        .order("date_assessed", { ascending: false })
        .limit(50),
    ]);

    if (profileRes.error) throw profileRes.error;
    if (staffChildrenRes.error) throw staffChildrenRes.error;
    if (sessionsRes.error) throw sessionsRes.error;
    if (assessmentsRes.error) throw assessmentsRes.error;

    type EmbeddedChild = {
      id: string;
      first_name: string;
      last_name: string;
      teacher: string | null;
      class: string | null;
      school: string | null;
      age: number | null;
    };
    type StaffChildrenRow = {
      assigned_at: string | null;
      children: EmbeddedChild | EmbeddedChild[] | null;
    };

    const children: CoachChild[] = [];
    for (const row of (staffChildrenRes.data ?? []) as StaffChildrenRow[]) {
      const c = Array.isArray(row.children) ? row.children[0] : row.children;
      if (!c) continue;
      children.push({
        id: c.id,
        first_name: c.first_name ?? "",
        last_name: c.last_name ?? "",
        teacher: c.teacher,
        class: c.class,
        school: c.school,
        age: c.age,
        assigned_at: row.assigned_at,
      });
    }

    const sessions: CoachSession[] = (sessionsRes.data ?? []).map((s) => ({
      id: s.id as string,
      session_type: (s.session_type as string | null) ?? null,
      session_date: (s.session_date as string | null) ?? null,
      created_at: s.created_at as string,
      notes: (s.notes as string | null) ?? null,
      children_count: Array.isArray(s.children_ids) ? s.children_ids.length : 0,
    }));

    const assessmentRows = assessmentsRes.data ?? [];
    const assessmentChildIds = Array.from(
      new Set(assessmentRows.map((a) => a.child_id as string)),
    );
    const childNameById = new Map<string, string>();
    if (assessmentChildIds.length) {
      const namesRes = await supabase
        .from("children")
        .select("id, first_name, last_name")
        .in("id", assessmentChildIds);
      if (namesRes.error) throw namesRes.error;
      for (const c of namesRes.data ?? []) {
        const name = `${(c.first_name as string) ?? ""} ${(c.last_name as string) ?? ""}`.trim();
        childNameById.set(c.id as string, name);
      }
    }

    const assessments: CoachAssessment[] = assessmentRows.map((a) => ({
      id: a.id as string,
      child_id: a.child_id as string,
      child_name: childNameById.get(a.child_id as string) ?? null,
      assessment_type: (a.assessment_type as string | null) ?? null,
      accuracy: (a.accuracy as number | null) ?? null,
      correct_responses: (a.correct_responses as number | null) ?? null,
      date_assessed: a.date_assessed as string,
    }));

    const profile = profileRes.data
      ? {
          id: profileRes.data.id as string,
          first_name: (profileRes.data.first_name as string) ?? "",
          last_name: (profileRes.data.last_name as string) ?? "",
          job_title: (profileRes.data.job_title as string | null) ?? null,
          assigned_school: (profileRes.data.assigned_school as string | null) ?? null,
          created_at: (profileRes.data.created_at as string | null) ?? null,
        }
      : null;

    return {
      data: { profile, children, sessions, assessments },
      isLive: true,
    };
  } catch (err) {
    if (isAuthError(err)) throw err;
    logApiError("getCoachDetail failed", err);
    return { data: EMPTY_COACH_DETAIL, isLive: false };
  }
}

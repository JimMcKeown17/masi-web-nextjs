import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { getCoachDetail } from "@/lib/masi/api";
import {
  FIELD_APP_UNAUTHENTICATED,
  FIELD_APP_FORBIDDEN,
} from "@/lib/masi/auth-guard";
import type {
  LetterTallyEntry,
  ReadingLevelBreakdownEntry,
} from "@/lib/masi/types";

export const metadata: Metadata = {
  title: "Coach Detail | Field App",
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ userId: string }>;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Accuracy column stores a percent 0-100 (not a 0-1 fraction). Mobile app
// thresholds like `accuracy >= 75` in AssessmentResultsScreen.js confirm the
// unit. Just round to a whole percent — do not multiply.
function formatAccuracy(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return `${Math.round(value)}%`;
}

export default async function CoachDetailPage({ params }: Props) {
  const { userId } = await params;

  let result;
  try {
    result = await getCoachDetail(userId);
  } catch (err) {
    if (err instanceof Error && err.message === FIELD_APP_UNAUTHENTICATED) {
      redirect(`/auth/sign-in?redirect_url=/operations/field-app/${userId}`);
    }
    if (err instanceof Error && err.message === FIELD_APP_FORBIDDEN) {
      return (
        <div className="min-h-screen pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-xl">
            <div className="bg-card rounded-lg shadow-sm p-6 border">
              <h1 className="text-lg font-semibold mb-2">Access denied</h1>
              <p className="text-sm text-muted-foreground">
                The Masi Field App dashboard is restricted to Admins and Project Managers.
              </p>
            </div>
          </div>
        </div>
      );
    }
    throw err;
  }

  const {
    profile,
    children,
    sessions,
    assessments,
    active_days,
    letters_taught,
    letters_taught_by_language,
    reading_level_breakdown,
  } = result.data;

  const languageBuckets = Object.entries(letters_taught_by_language);

  if (!profile && result.isLive) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl space-y-4">
          <BackLink />
          <div className="bg-card rounded-lg shadow-sm p-6 border">
            <h1 className="text-lg font-semibold mb-2">Coach not found</h1>
            <p className="text-sm text-muted-foreground">
              No staff member exists with id <code>{userId}</code>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim() || "—"
    : "—";

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl space-y-4">
        <BackLink />

        {!result.isLive && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-amber-800">
              <span className="font-semibold">Data unavailable.</span>{" "}
              The Masi Supabase query failed. This page is showing an empty state.
            </div>
          </div>
        )}

        {/* Profile header */}
        <div className="bg-card rounded-lg shadow-sm p-6 border">
          <h1 className="text-2xl font-semibold">{fullName}</h1>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>
              <span className="opacity-60">Role:</span> {profile?.job_title ?? "—"}
            </span>
            <span>
              <span className="opacity-60">School:</span> {profile?.assigned_school ?? "—"}
            </span>
            <span>
              <span className="opacity-60">Joined:</span>{" "}
              {formatDate(profile?.created_at ?? null)}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <StatCard label="Children" value={children.length} />
            <StatCard label="Recent sessions" value={sessions.length} sub="last 50" />
            <StatCard label="Recent assessments" value={assessments.length} sub="last 50" />
            <StatCard label="Active days" value={active_days} sub="distinct sign-ins" />
          </div>
        </div>

        {/* Children */}
        <section className="bg-card rounded-lg shadow-sm overflow-hidden border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold">Assigned children</h2>
          </div>
          {children.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center">
              No children assigned yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">Name</th>
                    <th className="text-left px-4 py-2 font-semibold">Class</th>
                    <th className="text-left px-4 py-2 font-semibold">Teacher</th>
                    <th className="text-left px-4 py-2 font-semibold">School</th>
                    <th className="text-right px-4 py-2 font-semibold">Age</th>
                    <th className="text-right px-4 py-2 font-semibold">Assigned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {children.map((c) => (
                    <tr key={c.id}>
                      <td className="px-4 py-2">
                        {`${c.first_name} ${c.last_name}`.trim() || "—"}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">{c.class ?? "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{c.teacher ?? "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{c.school ?? "—"}</td>
                      <td className="px-4 py-2 text-right tabular-nums">{c.age ?? "—"}</td>
                      <td className="px-4 py-2 text-right text-muted-foreground tabular-nums">
                        {formatDate(c.assigned_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Letters taught */}
        <section className="bg-card rounded-lg shadow-sm border p-4">
          <h2 className="text-sm font-semibold">Letters taught</h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">
            Based on <code>letter_mastery</code> rows recorded by this coach.
          </p>
          {languageBuckets.length > 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languageBuckets.map(([lang, entries]) => (
                <LetterGrid key={lang} title={lang} entries={entries} />
              ))}
            </div>
          ) : (
            <LetterGrid entries={letters_taught} />
          )}
        </section>

        {/* Reading levels */}
        <section className="bg-card rounded-lg shadow-sm border p-4">
          <h2 className="text-sm font-semibold">Reading levels seen</h2>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">
            Recorded across this coach&apos;s most recent 50 sessions
            (<code>activities.session_reading_level</code>).
          </p>
          <ReadingLevelBars entries={reading_level_breakdown} />
        </section>

        {/* Sessions */}
        <section className="bg-card rounded-lg shadow-sm overflow-hidden border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold">Recent sessions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Most recent 50 sessions.</p>
          </div>
          {sessions.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center">
              No sessions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">Date</th>
                    <th className="text-left px-4 py-2 font-semibold">Type</th>
                    <th className="text-right px-4 py-2 font-semibold">Children</th>
                    <th className="text-left px-4 py-2 font-semibold">Letters</th>
                    <th className="text-left px-4 py-2 font-semibold">Level</th>
                    <th className="text-left px-4 py-2 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessions.map((s) => {
                    const letters = s.letters_focused?.length
                      ? s.letters_focused.join(", ")
                      : null;
                    return (
                      <tr key={s.id}>
                        <td className="px-4 py-2 tabular-nums whitespace-nowrap">
                          {formatDate(s.session_date ?? s.created_at)}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {s.session_type ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {s.children_count}
                        </td>
                        <td
                          className="px-4 py-2 text-muted-foreground max-w-[16ch] truncate"
                          title={letters ?? undefined}
                        >
                          {letters ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                          {s.session_reading_level ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground max-w-[20ch] truncate">
                          {s.notes ?? ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Assessments */}
        <section className="bg-card rounded-lg shadow-sm overflow-hidden border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold">Recent assessments</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Most recent 50 assessments.
            </p>
          </div>
          {assessments.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center">
              No assessments recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">Date</th>
                    <th className="text-left px-4 py-2 font-semibold">Child</th>
                    <th className="text-left px-4 py-2 font-semibold">Type</th>
                    <th className="text-left px-4 py-2 font-semibold">Set</th>
                    <th className="text-left px-4 py-2 font-semibold">Language</th>
                    <th className="text-right px-4 py-2 font-semibold">Correct</th>
                    <th className="text-right px-4 py-2 font-semibold">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {assessments.map((a) => (
                    <tr key={a.id}>
                      <td className="px-4 py-2 tabular-nums whitespace-nowrap">
                        {formatDate(a.date_assessed)}
                      </td>
                      <td className="px-4 py-2">
                        {a.child_name ?? (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <span className="italic">unknown child</span>
                            <span
                              className="text-[10px] uppercase tracking-wide bg-muted px-1.5 py-0.5 rounded"
                              title="Orphaned child_id — offline-sync artifact"
                            >
                              orphan
                            </span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {a.assessment_type ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground tabular-nums text-xs">
                        {a.letter_set_id ?? "—"}
                      </td>
                      <td className="px-4 py-2">
                        {a.letter_language ? (
                          <span className="text-[10px] uppercase tracking-wide bg-muted px-1.5 py-0.5 rounded">
                            {a.letter_language}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {a.correct_responses ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums font-medium">
                        {formatAccuracy(a.accuracy)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/operations/field-app"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Field App
    </Link>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div>
      <p className="text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">
        {label}
        {sub && <span className="opacity-70"> · {sub}</span>}
      </p>
    </div>
  );
}

function LetterGrid({
  entries,
  title,
}: {
  entries: LetterTallyEntry[];
  title?: string;
}) {
  const max = Math.max(...entries.map((e) => e.count), 1);
  const hasAny = entries.some((e) => e.count > 0);
  return (
    <div>
      {title && (
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
          {title}
        </p>
      )}
      <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1">
        {entries.map((e) => {
          const isMax = hasAny && e.count === max;
          return (
            <div
              key={e.letter}
              className={`flex flex-col items-center justify-center rounded border py-1.5 ${
                e.count === 0
                  ? "opacity-30"
                  : isMax
                    ? "bg-primary/10 border-primary/40"
                    : ""
              }`}
            >
              <span className="text-xs font-semibold">{e.letter.toUpperCase()}</span>
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {e.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReadingLevelBars({
  entries,
}: {
  entries: ReadingLevelBreakdownEntry[];
}) {
  const max = Math.max(...entries.map((e) => e.count), 1);
  return (
    <div className="space-y-1.5">
      {entries.map((e) => (
        <div key={e.level} className="flex items-center gap-3 text-sm">
          <div className="w-32 shrink-0 text-muted-foreground">{e.level}</div>
          <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
            <div
              className="h-full bg-primary rounded"
              style={{ width: `${(e.count / max) * 100}%` }}
            />
          </div>
          <div className="w-8 text-right tabular-nums text-xs">{e.count}</div>
        </div>
      ))}
    </div>
  );
}

"use client";
import type { GridHealth, Programme } from "@/lib/types/school-programme";

// Staff-facing health panel: the last nightly refresh's integrity flags, grouped
// by severity. The point is to defuse the scary raw count -- most of
// "reach without identities" is the expected Zazi data-source gap (Zazi sessions
// live in a separate backend), not a per-school error.

function sumValues(obj: Record<string, number>): number {
  return Object.values(obj).reduce((a, b) => a + b, 0);
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-ZA", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function Row({ label, count, help }: { label: string; count: number | string; help?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t py-1.5 first:border-t-0">
      <div>
        <span className="text-sm">{label}</span>
        {help && <p className="text-xs text-muted-foreground">{help}</p>}
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums">{count}</span>
    </div>
  );
}

function Section({
  title, tone, children,
}: {
  title: string;
  tone: "attention" | "known" | "info";
  children: React.ReactNode;
}) {
  const bar = {
    attention: "border-l-amber-400",
    known: "border-l-slate-400",
    info: "border-l-muted-foreground/30",
  }[tone];
  return (
    <div className={`border-l-2 pl-3 ${bar}`}>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export function GridHealthPanel({
  health, programmes,
}: {
  health: GridHealth | null;
  programmes: Programme[];
}) {
  if (!health) {
    return (
      <p className="mt-6 text-xs text-muted-foreground">
        Data health: no refresh report yet. It populates after the nightly grid refresh runs.
      </p>
    );
  }

  const label = (key: string) => programmes.find((p) => p.key === key)?.label ?? key;
  const reach = health.reach_without_identities;
  const unplacedYouth = sumValues(health.site_assigned_no_school);
  const blankTitles = sumValues(health.unmapped_job_titles);
  const stranded = health.youth_on_nongrid_schools ?? [];
  const strandedYouth = stranded.reduce((a, e) => a + e.youth, 0);

  const toReview =
    health.schools_missing_uid.length +
    unplacedYouth +
    strandedYouth +
    reach.buckets.masi_staffing.length +
    reach.buckets.manual_count.length;

  return (
    <details className="mt-6 rounded-lg border bg-card">
      <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-sm font-semibold">
        Data health
        <span className="font-normal text-muted-foreground">
          {health.year} refresh &middot; checked {formatWhen(health.as_of)}
        </span>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${
            toReview > 0 ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
          }`}
        >
          {toReview > 0 ? `${toReview} to review` : "all clear"}
        </span>
      </summary>

      <div className="grid gap-4 border-t px-4 py-4 sm:grid-cols-2">
        <Section title="Needs attention" tone="attention">
          {health.schools_missing_uid.length > 0 && (
            <Row
              label="Schools with no UID"
              count={health.schools_missing_uid.length}
              help={`${health.schools_missing_uid.join(", ")} — youth here stay off-grid until the row gets a school_uid or the duplicate is merged.`}
            />
          )}
          {unplacedYouth > 0 && (
            <Row
              label="Youth at an unknown school"
              count={unplacedYouth}
              help="Their Site Placement doesn't match any school — usually a typo in Airtable."
            />
          )}
          {strandedYouth > 0 && (
            <Row
              label="Youth on retired school rows"
              count={strandedYouth}
              help={`${stranded.map((e) => `${e.school} (${e.youth})`).join(", ")} — attached to a school row the grid doesn't read, so its cells undercount. The nightly youth sync re-points these; if one persists, the school rows need merging.`}
            />
          )}
          {reach.buckets.masi_staffing.length > 0 && (
            <Row
              label="Masi coach, no 2026 sessions yet"
              count={reach.buckets.masi_staffing.length}
              help="A coach is staffed but no sessions have matched this year. Clears as session data lands."
            />
          )}
          {reach.buckets.manual_count.length > 0 && (
            <Row
              label="Manual count, no child identities"
              count={reach.buckets.manual_count.length}
              help="An aggregate count (e.g. 1000 Stories) with no child-level records to back demographics."
            />
          )}
          {toReview === 0 && <p className="py-1.5 text-sm text-muted-foreground">Nothing to review.</p>}
        </Section>

        <Section title="Known Zazi data gap (expected)" tone="known">
          <Row
            label="Zazi schools without resolved children"
            count={reach.buckets.zazi_sourced.length}
            help="Zazi iZandi sessions live in the separate Zazi backend; these schools aren't in the current export, so the grid sees no child identities. Expected, not an error."
          />
          <Row label="Unresolved Zazi participants" count={health.unresolved_zazi_participants} />
          {health.unmapped_zazi_schools.length > 0 && (
            <Row
              label="Unmapped Zazi schools"
              count={health.unmapped_zazi_schools.length}
              help={health.unmapped_zazi_schools.join(", ")}
            />
          )}
        </Section>

        <Section title="Reach by programme" tone="info">
          {reach.by_programme_set.length === 0 ? (
            <p className="py-1.5 text-sm text-muted-foreground">None.</p>
          ) : (
            reach.by_programme_set.map((s) => (
              <Row
                key={s.programmes.join("+")}
                label={s.programmes.map(label).join(" + ")}
                count={s.count}
              />
            ))
          )}
        </Section>

        <Section title="Info" tone="info">
          {blankTitles > 0 && (
            <Row label="Blank job titles" count={blankTitles} help="Youth with no Job Title — not counted in any programme." />
          )}
          {Object.entries(health.off_grid_roster).map(([title, count]) => (
            <Row key={title} label={`Off-grid: ${title}`} count={count} />
          ))}
          {health.unknown_site_type_tokens.length > 0 && (
            <Row
              label="Unknown site-type tokens"
              count={health.unknown_site_type_tokens.length}
              help={health.unknown_site_type_tokens.join(", ")}
            />
          )}
          {blankTitles === 0 &&
            Object.keys(health.off_grid_roster).length === 0 &&
            health.unknown_site_type_tokens.length === 0 && (
              <p className="py-1.5 text-sm text-muted-foreground">Nothing to note.</p>
            )}
        </Section>
      </div>
    </details>
  );
}

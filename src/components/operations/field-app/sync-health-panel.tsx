import type { SyncHealthSnapshot } from "@/lib/masi/types";

function formatRelative(iso: string | null): string {
  if (!iso) return "no activity";
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours < 1) return "<1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function SyncHealthPanel({ data }: { data: SyncHealthSnapshot }) {
  const okTables = data.tables.filter((t) => !t.error);
  const totalRows = okTables.reduce((s, t) => s + t.total, 0);
  const rowsLast7d = okTables.reduce((s, t) => s + t.last_7d, 0);
  const tablesWithNoRecent = okTables.filter((t) => t.last_7d === 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg shadow-sm p-4 border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Total rows
          </p>
          <p className="text-2xl font-semibold tabular-nums">{totalRows}</p>
          <p className="text-xs text-muted-foreground mt-1">Across all tracked tables</p>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4 border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Rows this week
          </p>
          <p
            className={`text-2xl font-semibold tabular-nums ${
              rowsLast7d === 0 ? "text-amber-600" : ""
            }`}
          >
            {rowsLast7d}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Created in the last 7 days — measures sync flow
          </p>
        </div>
        <div className="bg-card rounded-lg shadow-sm p-4 border">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
            Activity (24h)
          </p>
          <p className="text-2xl font-semibold tabular-nums">{data.activity_24h}</p>
          <p className="text-xs text-muted-foreground mt-1">
            New sessions + assessments + check-ins
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm overflow-hidden border">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Rows per table</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            <code>children_groups</code> is not shown — its schema has no
            timestamped creation marker relevant to sync flow. The cloud{" "}
            <code>synced</code> column isn&apos;t queried: the mobile app strips it from
            every upsert, so it doesn&apos;t reflect pending-upload state. True pending
            state lives on each device&apos;s local storage and isn&apos;t observable here.
          </p>
          {tablesWithNoRecent.length > 0 && (
            <p className="text-xs text-amber-700 mt-2">
              ⚠ {tablesWithNoRecent.length}{" "}
              {tablesWithNoRecent.length === 1 ? "table has" : "tables have"} no new rows in
              the last 7 days:{" "}
              <span className="font-mono">
                {tablesWithNoRecent.map((t) => t.table).join(", ")}
              </span>
              . Could indicate a sync problem or just a quiet week for that entity.
            </p>
          )}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-2 font-semibold">Table</th>
              <th className="text-right px-4 py-2 font-semibold">Total</th>
              <th className="text-right px-4 py-2 font-semibold">Last 7 days</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.tables.map((t) => (
              <tr key={t.table}>
                <td className="px-4 py-2 font-mono">{t.table}</td>
                {t.error ? (
                  <td colSpan={2} className="px-4 py-2 text-right text-red-600 text-xs">
                    <span title={t.error} className="cursor-help">
                      query failed — {t.error.length > 80 ? t.error.slice(0, 77) + "…" : t.error}
                    </span>
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-2 text-right tabular-nums">{t.total}</td>
                    <td
                      className={`px-4 py-2 text-right tabular-nums ${
                        t.last_7d === 0
                          ? "text-amber-600 font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      {t.last_7d}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-card rounded-lg shadow-sm overflow-hidden border">
        <div className="px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">
            Staff with no activity in the last 7 days
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            No sessions, assessments, or check-ins recorded recently.
          </p>
        </div>
        {data.inactive_staff.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground text-center">
            All staff have been active in the last 7 days.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-2 font-semibold">Staff</th>
                <th className="text-left px-4 py-2 font-semibold">School</th>
                <th className="text-right px-4 py-2 font-semibold">Last activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.inactive_staff.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-2">
                    {`${s.first_name} ${s.last_name}`.trim() || "—"}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {s.assigned_school ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right text-muted-foreground tabular-nums">
                    {formatRelative(s.last_activity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

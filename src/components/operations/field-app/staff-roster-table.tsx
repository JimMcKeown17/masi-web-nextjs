import Link from "next/link";
import type { StaffRosterRow } from "@/lib/masi/types";

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  if (hours < 1) return "<1h ago";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function StaffRosterTable({ rows }: { rows: StaffRosterRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="bg-card rounded-lg shadow-sm p-8 text-center text-muted-foreground text-sm">
        No staff records found.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden border">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Staff</th>
              <th className="text-left px-4 py-3 font-semibold">Role</th>
              <th className="text-left px-4 py-3 font-semibold">School</th>
              <th className="text-right px-4 py-3 font-semibold">Children</th>
              <th className="text-right px-4 py-3 font-semibold">Sessions</th>
              <th className="text-right px-4 py-3 font-semibold">Assessments</th>
              <th
                className="text-right px-4 py-3 font-semibold"
                title="Distinct days the user has clocked in"
              >
                Active days
              </th>
              <th className="text-right px-4 py-3 font-semibold">Last activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/operations/field-app/${row.id}`}
                    className="font-medium hover:text-primary hover:underline"
                  >
                    {`${row.first_name} ${row.last_name}`.trim() || "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{row.job_title ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.assigned_school ?? "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums">{row.children_count}</td>
                <td className="px-4 py-3 text-right tabular-nums">{row.sessions_count}</td>
                <td className="px-4 py-3 text-right tabular-nums">{row.assessments_count}</td>
                <td className="px-4 py-3 text-right tabular-nums">{row.active_days}</td>
                <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                  {formatRelative(row.last_activity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";
import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type {
  SchoolProgrammeGrid,
  GridCell,
  GridSchool,
  CellEdit,
  StatsEdit,
} from "@/lib/types/school-programme";
import { EditableNumber } from "./EditableNumber";
import {
  SortHeader,
  SortButton,
  SchoolNameCell,
  AddCellButton,
  RemoveCellButton,
  reachTotal,
  monthsAgo,
  sortSchools,
  type SortState,
} from "./shared";

interface Props {
  grid: SchoolProgrammeGrid;
  canEdit: boolean;
  onCellEdit: (cellId: number, fields: CellEdit) => Promise<void>;
  onStatsEdit: (statsId: number, fields: StatsEdit) => Promise<void>;
  onCellAdd: (schoolUid: string, programme: string) => Promise<void>;
  onCellRemove: (cellId: number) => Promise<void>;
}

function ChildrenCell({
  cell,
  schoolUid,
  programme,
  canEdit,
  onCellEdit,
  onCellAdd,
  onCellRemove,
}: {
  cell: GridCell | undefined;
  schoolUid: string | null;
  programme: string;
  canEdit: boolean;
  onCellEdit: (cellId: number, fields: CellEdit) => Promise<void>;
  onCellAdd: (schoolUid: string, programme: string) => Promise<void>;
  onCellRemove: (cellId: number) => Promise<void>;
}) {
  if (!cell) {
    return (
      <td className="border-l border-border/50 px-2 py-1.5 text-center">
        {canEdit && schoolUid ? (
          <AddCellButton onAdd={() => onCellAdd(schoolUid, programme)} />
        ) : (
          <span className="text-muted-foreground/25">·</span>
        )}
      </td>
    );
  }
  const computed = cell.count_source === "computed";
  const stale = !computed && monthsAgo(cell.updated_at);
  const removable =
    canEdit &&
    cell.children_count == null &&
    cell.youth_planned == null &&
    (cell.youth_active ?? 0) === 0;
  return (
    <td
      className={cn(
        "border-l border-border/50 px-2 py-1.5 align-middle",
        computed && "bg-muted/40",
      )}
      title={
        computed
          ? `Computed (${cell.count_basis}) · as of ${cell.as_of?.slice(0, 10) ?? "—"}`
          : "Manual — click the number to edit"
      }
    >
      <div className="flex flex-col items-center gap-0.5">
        <span className="flex items-center gap-1">
          <EditableNumber
            value={cell.children_count}
            disabled={!canEdit || !cell.editable}
            onSave={(next) => onCellEdit(cell.id, { children_count: next })}
            className={cn("text-sm", computed ? "font-normal text-muted-foreground" : "font-medium")}
          />
          {removable && <RemoveCellButton onRemove={() => onCellRemove(cell.id)} />}
        </span>
        {stale && (
          <span className="text-[10px] text-amber-600" title="Manual cell may be stale">
            {stale} ago
          </span>
        )}
      </div>
    </td>
  );
}

function DemographicsPopover({
  school,
  canEdit,
  onStatsEdit,
}: {
  school: GridSchool;
  canEdit: boolean;
  onStatsEdit: (statsId: number, fields: StatsEdit) => Promise<void>;
}) {
  const stats = school.stats;
  if (!stats) return <span className="text-muted-foreground/40">—</span>;
  const summary =
    stats.pct_african != null || stats.pct_coloured != null || stats.pct_white != null
      ? `${stats.pct_african ?? 0}/${stats.pct_coloured ?? 0}/${stats.pct_white ?? 0}`
      : "set…";
  return (
    <Popover>
      <PopoverTrigger className="rounded px-1 text-[11px] tabular-nums text-muted-foreground hover:bg-accent hover:ring-1 hover:ring-border">
        {summary}
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-2 text-sm">
        <p className="font-medium">Race estimate (site-level %)</p>
        {(["pct_african", "pct_coloured", "pct_white"] as const).map((field) => (
          <div key={field} className="flex items-center justify-between">
            <label className="capitalize text-muted-foreground">
              {field.replace("pct_", "% ")}
            </label>
            <EditableNumber
              value={stats[field]}
              disabled={!canEdit}
              onSave={(next) => onStatsEdit(stats.id, { [field]: next } as StatsEdit)}
            />
          </div>
        ))}
        <p className="pt-1 text-[11px] text-muted-foreground">
          A school estimate. Gender (% female) is computed per child, not entered here.
        </p>
      </PopoverContent>
    </Popover>
  );
}

export function ChildrenGrid({
  grid,
  canEdit,
  onCellEdit,
  onStatsEdit,
  onCellAdd,
  onCellRemove,
}: Props) {
  const [sort, setSort] = useState<SortState>({ key: "unique", dir: "desc" });

  const sorted = useMemo(() => {
    const valueFor = (s: GridSchool): number | string => {
      if (sort.key === "name") return s.name;
      if (sort.key === "unique") return s.stats?.unique_beneficiaries ?? -1;
      if (sort.key === "total") return reachTotal(s);
      if (sort.key === "pct_female") return s.stats?.pct_female ?? -1;
      return s.cells[sort.key]?.children_count ?? -1; // a programme column
    };
    return sortSchools(grid.schools, valueFor, sort.dir);
  }, [grid.schools, sort]);

  // Column totals across every school (programme reach + summed uniques).
  const totals = useMemo(() => {
    const perProgramme: Record<string, number> = {};
    let total = 0;
    let unique = 0;
    for (const s of grid.schools) {
      for (const p of grid.programmes) {
        perProgramme[p.key] = (perProgramme[p.key] ?? 0) + (s.cells[p.key]?.children_count ?? 0);
      }
      total += reachTotal(s);
      unique += s.stats?.unique_beneficiaries ?? 0;
    }
    return { perProgramme, total, unique };
  }, [grid.schools, grid.programmes]);

  return (
    <div className="max-h-[75vh] overflow-auto rounded-lg border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="sticky left-0 top-0 z-30 h-9 bg-muted px-3 font-medium">
              <SortButton label="School" sortKey="name" current={sort} onSort={setSort} align="left" defaultDir="asc" />
            </th>
            {grid.programmes.map((p) => (
              <SortHeader key={p.key} label={p.label} sortKey={p.key} current={sort} onSort={setSort} title={`Sort by ${p.label}`} />
            ))}
            <SortHeader label="Unique" sortKey="unique" current={sort} onSort={setSort} title="Deduped distinct children (headline)" />
            <SortHeader label="Total" sortKey="total" current={sort} onSort={setSort} title="Sum of every programme column (reach)" />
            <SortHeader label="% F" sortKey="pct_female" current={sort} onSort={setSort} title="% female across deduped children" />
            <th className="sticky top-0 z-20 h-9 border-l border-border/50 bg-muted px-2 text-center font-medium">Race</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-y-2 bg-muted/40 text-xs font-semibold">
            <th className="sticky left-0 z-10 bg-muted/40 px-3 py-1.5 text-left text-muted-foreground">
              Totals · {grid.schools.length} schools
            </th>
            {grid.programmes.map((p) => (
              <td key={p.key} className="border-l border-border/50 px-2 py-1.5 text-center tabular-nums">
                {(totals.perProgramme[p.key] ?? 0).toLocaleString()}
              </td>
            ))}
            <td className="border-l border-border/50 px-2 py-1.5 text-center tabular-nums text-foreground">
              {totals.unique.toLocaleString()}
            </td>
            <td className="border-l border-border/50 px-2 py-1.5 text-center tabular-nums text-muted-foreground">
              {totals.total.toLocaleString()}
            </td>
            <td className="border-l border-border/50 px-2 py-1.5 text-center text-muted-foreground/40">—</td>
            <td className="border-l border-border/50 px-2 py-1.5 text-center text-muted-foreground/40">—</td>
          </tr>
          {sorted.map((school) => {
            const stats = school.stats;
            const unique = stats?.unique_beneficiaries ?? null;
            const total = reachTotal(school);
            const overCap = unique != null && unique > total && total > 0;
            return (
              <tr key={school.school_uid ?? school.name} className="border-t hover:bg-muted/20">
                <SchoolNameCell school={school} />
                {grid.programmes.map((p) => (
                  <ChildrenCell
                    key={p.key}
                    cell={school.cells[p.key]}
                    schoolUid={school.school_uid}
                    programme={p.key}
                    canEdit={canEdit}
                    onCellEdit={onCellEdit}
                    onCellAdd={onCellAdd}
                    onCellRemove={onCellRemove}
                  />
                ))}
                <td
                  className={cn(
                    "border-l border-border/50 px-2 py-1.5 text-center font-semibold tabular-nums",
                    overCap ? "text-destructive" : "text-foreground",
                  )}
                  title={overCap ? "Unique exceeds Total — check inputs" : "Computed: distinct children"}
                >
                  {unique ?? "—"}
                </td>
                <td className="border-l border-border/50 px-2 py-1.5 text-center tabular-nums text-muted-foreground">
                  {total > 0 ? total.toLocaleString() : "—"}
                </td>
                <td className="border-l border-border/50 px-2 py-1.5 text-center tabular-nums text-muted-foreground">
                  {stats?.pct_female != null ? `${stats.pct_female}%` : "—"}
                </td>
                <td className="border-l border-border/50 px-2 py-1.5 text-center">
                  <DemographicsPopover school={school} canEdit={canEdit} onStatsEdit={onStatsEdit} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

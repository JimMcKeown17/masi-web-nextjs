"use client";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  SchoolProgrammeGrid,
  GridCell,
  GridSchool,
  CellEdit,
} from "@/lib/types/school-programme";
import { EditableNumber } from "./EditableNumber";
import {
  SortHeader,
  SortButton,
  SchoolNameCell,
  AddCellButton,
  RemoveCellButton,
  youthActiveTotal,
  youthPlannedTotal,
  sortSchools,
  type SortState,
} from "./shared";

interface Props {
  grid: SchoolProgrammeGrid;
  canEdit: boolean;
  onCellEdit: (cellId: number, fields: CellEdit) => Promise<void>;
  onCellAdd: (schoolUid: string, programme: string) => Promise<void>;
  onCellRemove: (cellId: number) => Promise<void>;
}

// Traffic-light tint by the active-vs-planned gap.
function tintFor(active: number, planned: number | null): string {
  if (planned == null) return "";
  if (active < planned) return "bg-red-50";
  if (active > planned) return "bg-amber-50";
  return "bg-emerald-50";
}

function YouthCell({
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
  const active = cell.youth_active ?? 0;
  const planned = cell.youth_planned;
  const removable = canEdit && cell.children_count == null && planned == null && active === 0;
  const title =
    planned != null
      ? `${active} active of ${planned} planned`
      : `${active} active — no plan set`;
  return (
    <td
      className={cn(
        "border-l border-border/50 px-2 py-1.5 text-center align-middle",
        tintFor(active, planned),
      )}
      title={`Youth: ${title}`}
    >
      <div className="flex items-baseline justify-center gap-0.5 tabular-nums">
        <span className="text-sm font-semibold">{active}</span>
        <span className="text-muted-foreground">/</span>
        <EditableNumber
          value={planned}
          disabled={!canEdit}
          onSave={(next) => onCellEdit(cell.id, { youth_planned: next })}
          placeholder="–"
          width="w-8"
          className="text-sm"
        />
        {removable && <RemoveCellButton onRemove={() => onCellRemove(cell.id)} />}
      </div>
    </td>
  );
}

// planned - active. Positive = vacancies to hire (red); negative = over-hire (amber).
function VacancyNum({ vac }: { vac: number }) {
  const cls = vac > 0 ? "text-red-600" : vac < 0 ? "text-amber-600" : "text-emerald-600";
  return (
    <span className={cn("font-semibold tabular-nums", cls)} title="Planned minus active">
      {vac > 0 ? `+${vac}` : vac}
    </span>
  );
}

export function YouthGrid({ grid, canEdit, onCellEdit, onCellAdd, onCellRemove }: Props) {
  const [sort, setSort] = useState<SortState>({ key: "vacancy", dir: "desc" });

  const sorted = useMemo(() => {
    const valueFor = (s: GridSchool): number | string => {
      if (sort.key === "name") return s.name;
      if (sort.key === "active") return youthActiveTotal(s);
      if (sort.key === "planned") return youthPlannedTotal(s);
      if (sort.key === "vacancy") return youthPlannedTotal(s) - youthActiveTotal(s);
      return s.cells[sort.key]?.youth_active ?? -1; // a programme column
    };
    return sortSchools(grid.schools, valueFor, sort.dir);
  }, [grid.schools, sort]);

  const totals = useMemo(() => {
    const active: Record<string, number> = {};
    const planned: Record<string, number> = {};
    let a = 0;
    let p = 0;
    for (const s of grid.schools) {
      for (const prog of grid.programmes) {
        const c = s.cells[prog.key];
        active[prog.key] = (active[prog.key] ?? 0) + (c?.youth_active ?? 0);
        planned[prog.key] = (planned[prog.key] ?? 0) + (c?.youth_planned ?? 0);
      }
      a += youthActiveTotal(s);
      p += youthPlannedTotal(s);
    }
    return { active, planned, a, p, vac: p - a };
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
              <SortHeader key={p.key} label={p.label} sortKey={p.key} current={sort} onSort={setSort} title={`Sort by ${p.label} (active)`} />
            ))}
            <SortHeader label="Active" sortKey="active" current={sort} onSort={setSort} title="Active youth across programmes" />
            <SortHeader label="Planned" sortKey="planned" current={sort} onSort={setSort} title="Planned youth across programmes" />
            <SortHeader label="Vacancies" sortKey="vacancy" current={sort} onSort={setSort} title="Planned minus active (positive = to hire)" />
          </tr>
        </thead>
        <tbody>
          <tr className="border-y-2 bg-muted/40 text-xs font-semibold">
            <th className="sticky left-0 z-10 bg-muted/40 px-3 py-1.5 text-left text-muted-foreground">
              Totals · {grid.schools.length} schools
            </th>
            {grid.programmes.map((p) => (
              <td key={p.key} className="border-l border-border/50 px-2 py-1.5 text-center tabular-nums">
                {totals.active[p.key] ?? 0}
                <span className="text-muted-foreground">/{totals.planned[p.key] ?? 0}</span>
              </td>
            ))}
            <td className="border-l border-border/50 px-2 py-1.5 text-center tabular-nums">{totals.a}</td>
            <td className="border-l border-border/50 px-2 py-1.5 text-center tabular-nums">{totals.p}</td>
            <td className="border-l border-border/50 px-2 py-1.5 text-center">
              <VacancyNum vac={totals.vac} />
            </td>
          </tr>
          {sorted.map((school) => {
            const a = youthActiveTotal(school);
            const p = youthPlannedTotal(school);
            return (
              <tr key={school.school_uid ?? school.name} className="border-t hover:bg-muted/20">
                <SchoolNameCell school={school} />
                {grid.programmes.map((prog) => (
                  <YouthCell
                    key={prog.key}
                    cell={school.cells[prog.key]}
                    schoolUid={school.school_uid}
                    programme={prog.key}
                    canEdit={canEdit}
                    onCellEdit={onCellEdit}
                    onCellAdd={onCellAdd}
                    onCellRemove={onCellRemove}
                  />
                ))}
                <td className="border-l border-border/50 px-2 py-1.5 text-center font-medium tabular-nums">{a}</td>
                <td className="border-l border-border/50 px-2 py-1.5 text-center tabular-nums text-muted-foreground">{p}</td>
                <td className="border-l border-border/50 px-2 py-1.5 text-center">
                  <VacancyNum vac={p - a} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

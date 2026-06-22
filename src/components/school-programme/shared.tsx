"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GridSchool, Programme } from "@/lib/types/school-programme";

// ---- sorting ----------------------------------------------------------------

export type SortDir = "asc" | "desc";
export interface SortState {
  key: string;
  dir: SortDir;
}

// Click a header: same column toggles direction; a new column adopts its default
// (descending for counts, ascending for the school name).
export function nextSort(current: SortState, key: string, defaultDir: SortDir): SortState {
  if (current.key === key) return { key, dir: current.dir === "asc" ? "desc" : "asc" };
  return { key, dir: defaultDir };
}

export function sortSchools(
  schools: GridSchool[],
  valueFor: (s: GridSchool) => number | string,
  dir: SortDir,
): GridSchool[] {
  const sorted = [...schools].sort((a, b) => {
    const va = valueFor(a);
    const vb = valueFor(b);
    if (typeof va === "string" || typeof vb === "string") {
      return String(va).localeCompare(String(vb));
    }
    return va - vb;
  });
  return dir === "desc" ? sorted.reverse() : sorted;
}

// The clickable label + direction caret. Used standalone inside the sticky-left
// school corner, and wrapped by SortHeader for every other column.
export function SortButton({
  label,
  sortKey,
  current,
  onSort,
  align = "center",
  defaultDir = "desc",
  title,
}: {
  label: string;
  sortKey: string;
  current: SortState;
  onSort: (next: SortState) => void;
  align?: "left" | "center";
  defaultDir?: SortDir;
  title?: string;
}) {
  const active = current.key === sortKey;
  return (
    <button
      type="button"
      onClick={() => onSort(nextSort(current, sortKey, defaultDir))}
      title={title ?? "Click to sort"}
      className={cn(
        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
        align === "left" ? "" : "justify-center",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {label}
      <span className={cn("text-[9px]", active ? "opacity-100" : "opacity-30")}>
        {active ? (current.dir === "asc" ? "▲" : "▼") : "⇅"}
      </span>
    </button>
  );
}

// A sortable column header. Sticky to the top of the scroll container so the
// header stays put while the body scrolls.
export function SortHeader(props: {
  label: string;
  sortKey: string;
  current: SortState;
  onSort: (next: SortState) => void;
  align?: "left" | "center";
  defaultDir?: SortDir;
  title?: string;
}) {
  return (
    <th
      className={cn(
        "sticky top-0 z-20 h-9 border-l border-border/50 bg-muted px-2 font-medium",
        props.align === "left" ? "text-left" : "text-center",
      )}
    >
      <SortButton {...props} />
    </th>
  );
}

// ---- shared cells / states --------------------------------------------------

// Sticky-left school name cell (shared by both grids). Rendered as a <th> so it
// pins on horizontal scroll.
export function SchoolNameCell({ school }: { school: GridSchool }) {
  return (
    <th className="sticky left-0 z-10 bg-background px-3 py-1.5 text-left align-top font-normal">
      <div className="flex items-center gap-2">
        <span className="font-medium">{school.name}</span>
        {school.site_type && (
          <Badge variant="outline" className="text-[10px]">
            {school.site_type}
          </Badge>
        )}
      </div>
      {!school.school_uid && (
        <span
          className="text-[10px] text-amber-600"
          title="No school_uid: child sessions cannot be joined"
        >
          unmatched
        </span>
      )}
    </th>
  );
}

export function EmptyState({ year }: { year: number }) {
  return (
    <div className="rounded-lg border border-dashed p-12 text-center">
      <p className="text-sm font-medium">No programme data for {year} yet</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Nothing has been set up for this year. The grid fills from the nightly
        refresh and from management entries. Pick another year above.
      </p>
    </div>
  );
}

export function YearSelect({ year, setYear }: { year: number; setYear: (y: number) => void }) {
  const current = new Date().getFullYear();
  const years = [current + 1, current, current - 1, current - 2];
  return (
    <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
      <SelectTrigger className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {years.map((y) => (
          <SelectItem key={y} value={String(y)}>
            {y}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ---- aggregation ------------------------------------------------------------

// "Total" = sum of every programme column for a school (reach; double-counts a
// child enrolled in two programmes). "Unique" (deduped) lives on stats.
export function reachTotal(school: GridSchool): number {
  return Object.values(school.cells).reduce((s, c) => s + (c.children_count ?? 0), 0);
}

export function youthActiveTotal(school: GridSchool): number {
  return Object.values(school.cells).reduce((s, c) => s + (c.youth_active ?? 0), 0);
}

export function youthPlannedTotal(school: GridSchool): number {
  return Object.values(school.cells).reduce((s, c) => s + (c.youth_planned ?? 0), 0);
}

export function monthsAgo(iso: string | null): string | null {
  if (!iso) return null;
  const months = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24 * 30));
  return months < 1 ? null : `${months}mo`;
}

// ---- leadership staffing summary --------------------------------------------

export interface StaffingWatchItem {
  school: string;
  programme: string; // human label
  active: number;
  planned: number;
  gap: number; // planned - active, always > 0 in the watchlist
}

export interface StaffingSummary {
  filled: number; // planned positions actually in post (Σ min(active, planned))
  totalPlanned: number; // Σ youth_planned over cells that HAVE a plan
  pctStaffed: number | null; // plan fill-rate, 0-100; null when nothing planned
  openVacancies: number; // Σ max(0, planned - active) over planned cells
  netVacancies: number; // Σ planned - Σ active over ALL cells (= the table's Vacancies total); redeployment to other sites/programmes offsets a cell's gap
  schoolsShort: number; // schools with a plan and any vacancy
  overHires: number; // Σ max(0, active - planned) over planned cells
  schoolsOver: number;
  fullyStaffed: number; // schools with a plan and zero vacancy
  schoolsWithPlan: number;
  watchlist: StaffingWatchItem[]; // top gaps, descending
  asOf: string | null; // latest cell refresh in view
}

// Derive the youth-staffing scoreboard from the (already filtered) grid so the
// board and the table read the same numbers.
//
// Plan-relative by design: only cells with youth_planned set count toward the
// plan math. A cell with active youth but no plan (youth_planned null) is real
// staffing but not part of any allocation, so it must NOT inflate "% staffed" or
// register as an over-hire -- it is simply outside the plan. "% staffed" is the
// honest fill-rate of planned positions (<= 100%); over-hires are surplus only
// where a plan exists. Per-school coverage uses cell-level vacancies so an
// over-hire in one programme can't mask a vacancy in another.
export function summarizeStaffing(
  schools: GridSchool[],
  programmes: Programme[],
): StaffingSummary {
  const label = new Map(programmes.map((p) => [p.key, p.label]));

  let totalPlanned = 0;
  let totalActive = 0;
  let openVacancies = 0;
  let overHires = 0;
  let asOf: string | null = null;
  const watchlist: StaffingWatchItem[] = [];

  let schoolsWithPlan = 0;
  let fullyStaffed = 0;
  let schoolsShort = 0;
  let schoolsOver = 0;

  for (const school of schools) {
    let sVacancy = 0;
    let sOver = 0;
    let sHasPlan = false;

    for (const [key, cell] of Object.entries(school.cells)) {
      if (cell.as_of && (asOf === null || cell.as_of > asOf)) asOf = cell.as_of;
      totalActive += cell.youth_active ?? 0; // ALL cells, incl. unplanned-active (redeployments)
      const planned = cell.youth_planned;
      if (planned == null) continue; // unplanned cell: outside the plan math
      sHasPlan = true;
      totalPlanned += planned;
      const active = cell.youth_active ?? 0;
      const gap = planned - active;
      if (gap > 0) {
        openVacancies += gap;
        sVacancy += gap;
        watchlist.push({ school: school.name, programme: label.get(key) ?? key, active, planned, gap });
      } else if (gap < 0) {
        overHires += -gap;
        sOver += -gap;
      }
    }

    if (sHasPlan) {
      schoolsWithPlan += 1;
      if (sVacancy === 0) fullyStaffed += 1;
      else schoolsShort += 1;
      if (sOver > 0) schoolsOver += 1;
    }
  }

  return {
    filled: totalPlanned - openVacancies,
    totalPlanned,
    pctStaffed:
      totalPlanned > 0 ? Math.round((100 * (totalPlanned - openVacancies)) / totalPlanned) : null,
    openVacancies,
    netVacancies: totalPlanned - totalActive,
    schoolsShort,
    overHires,
    schoolsOver,
    fullyStaffed,
    schoolsWithPlan,
    watchlist: watchlist.sort((a, b) => b.gap - a.gap).slice(0, 3),
    asOf,
  };
}

// ---- filters ----------------------------------------------------------------

export function GridFilters({
  programmes,
  siteType,
  setSiteType,
  programme,
  setProgramme,
}: {
  programmes: Programme[];
  siteType: string;
  setSiteType: (v: string) => void;
  programme: string;
  setProgramme: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={siteType} onValueChange={setSiteType}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sites</SelectItem>
          <SelectItem value="Primary">Primary</SelectItem>
          <SelectItem value="ECD">ECD</SelectItem>
        </SelectContent>
      </Select>
      <Select value={programme} onValueChange={setProgramme}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All programmes</SelectItem>
          {programmes.map((p) => (
            <SelectItem key={p.key} value={p.key}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Row filters: by normalized site type, and by participation in a programme
// (a cell exists for that programme at the school).
export function applyFilters(
  schools: GridSchool[],
  siteType: string,
  programme: string,
): GridSchool[] {
  return schools.filter((s) => {
    if (siteType !== "all" && s.site_type !== siteType) return false;
    if (programme !== "all" && !s.cells[programme]) return false;
    return true;
  });
}

export function NoMatches() {
  return (
    <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
      No schools match these filters.
    </div>
  );
}

// Shown in an empty (no-row) cell: declares the programme at this school.
export function AddCellButton({ onAdd }: { onAdd: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      title="This school runs this programme — add it"
      className="rounded px-1.5 text-muted-foreground/30 transition-colors hover:bg-accent hover:text-primary"
    >
      +
    </button>
  );
}

// Reverses an accidental add. Only rendered on a truly-empty cell.
export function RemoveCellButton({ onRemove }: { onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      title="Remove this empty cell"
      className="rounded text-[10px] text-muted-foreground/30 transition-colors hover:text-destructive"
    >
      ✕
    </button>
  );
}

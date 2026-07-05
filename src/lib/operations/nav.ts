import {
  Activity,
  CalendarOff,
  Database,
  LayoutGrid,
  Radio,
  TrendingUp,
  UserCog,
  Waypoints,
} from "lucide-react";

// Single source of truth for the internal Operations tools. Both the navbar
// "Operations" menu and the /operations hub page render from this list, so
// adding a tool here surfaces it in both places.

export type OpsRole = "ADMIN" | "PROJECT MANAGER" | "MENTOR";

const ALL_ROLES: OpsRole[] = ["ADMIN", "PROJECT MANAGER", "MENTOR"];
const LEADERSHIP: OpsRole[] = ["ADMIN", "PROJECT MANAGER"];

export interface OpsTool {
  title: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface OpsGroup {
  title: string;
  blurb: string;
  roles: OpsRole[];
  tools: OpsTool[];
}

export const OPS_GROUPS: OpsGroup[] = [
  {
    title: "Field Work",
    blurb: "The day-to-day: visits logged, sessions tracked, coaches supported.",
    roles: ALL_ROLES,
    tools: [
      {
        title: "Mentors",
        href: "/operations/mentors",
        description: "Log school visits and review coaching coverage.",
        icon: UserCog,
      },
      {
        title: "Youth Sessions",
        href: "/operations/youth-sessions",
        description: "Daily session activity, per-coach heatmaps and school coverage.",
        icon: Activity,
      },
      {
        title: "Field App",
        href: "/operations/field-app",
        description: "Live view of the Masi mobile-app field activity.",
        icon: Radio,
      },
    ],
  },
  {
    title: "Leadership",
    blurb: "The scoreboards leadership runs the organisation with.",
    roles: LEADERSHIP,
    tools: [
      {
        title: "WIG",
        href: "/operations/wig",
        description: "Wildly Important Goals scoreboard across all programmes.",
        icon: TrendingUp,
      },
      {
        title: "School Programme Grid",
        href: "/operations/school-programme-grid",
        description: "Children served and youth staffing per school and programme.",
        icon: LayoutGrid,
      },
      {
        title: "Data Map",
        href: "/operations/data-map",
        description: "How our data flows from capture to dashboards.",
        icon: Waypoints,
      },
    ],
  },
  {
    title: "Data & Calendar",
    blurb: "The plumbing: sync health and the working-days calendar.",
    roles: LEADERSHIP,
    tools: [
      {
        title: "Closure Calendar",
        href: "/operations/closures",
        description: "School closures and staff absences.",
        icon: CalendarOff,
      },
      {
        title: "ETL Preview",
        href: "/operations/preview",
        description: "Sync health, record counts and orphan-key checks.",
        icon: Database,
      },
    ],
  },
];

// Groups visible to a given Django role (undefined role sees nothing).
export function opsGroupsForRole(role: string | undefined | null): OpsGroup[] {
  if (!role) return [];
  return OPS_GROUPS.filter((g) => g.roles.includes(role as OpsRole));
}

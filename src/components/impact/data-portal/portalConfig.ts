// Impact Data Portal — navigation shell configuration (single source of truth).
//
// This drives the PortalNav programme strip AND the in-page View anchors. The
// portal is programme-primary (see CONTEXT.md): Programme is the top-level axis,
// Views are analytical lenses nested inside a programme.
//
// IMPORTANT — keep `views` honest. List only the views that are actually BUILT
// and render on a programme's page. The View matrix is deliberately sparse (a
// programme simply lacks the views it does not offer). Because the same config
// drives both the anchor nav and which sections render, an unbuilt view left out
// here can never produce a dead anchor. Add a view to a programme only when its
// section ships.

export type PortalViewId = "programmatic" | "site-level" | "children";

export const VIEW_LABELS: Record<PortalViewId, string> = {
  programmatic: "Programmatic",
  "site-level": "Site-Level",
  children: "Children",
};

export interface Programme {
  slug: string; // URL segment under /impact/data-portal/
  label: string; // display name in the strip
  accent: string; // Ink & Signal accent, lit when this programme is active
  status: "live" | "coming-soon";
  views: PortalViewId[]; // BUILT views only — drives anchors + which sections render
}

// Accent placeholder for programmes whose Ink & Signal accent Jim has not yet
// assigned. Deliberately the neutral ink, NOT a guessed brand colour — the strip
// stays neutral and the active indicator simply reads as ink until a real accent
// is chosen (Zazi = crimson and Community Jobs = blue are the only confirmed two).
const UNASSIGNED_ACCENT = "#14181D";

export const PROGRAMMES: Programme[] = [
  {
    slug: "zazi-izandi",
    label: "Zazi iZandi",
    accent: "#C81E3C", // confirmed — early-grade literacy = children = crimson
    status: "live",
    views: ["programmatic"], // Site-Level joins when its section ships; Zazi has no Children view (single-metric, see CONTEXT.md)
  },
  {
    slug: "core-literacy",
    label: "Core Literacy",
    accent: UNASSIGNED_ACCENT,
    status: "coming-soon",
    views: [],
  },
  {
    slug: "numeracy",
    label: "Numeracy",
    accent: UNASSIGNED_ACCENT,
    status: "coming-soon",
    views: [],
  },
  {
    slug: "1000-stories",
    label: "1000 Stories",
    accent: UNASSIGNED_ACCENT,
    status: "coming-soon",
    views: [],
  },
  {
    slug: "community-jobs",
    label: "Community Jobs",
    accent: "#1D4ED8", // confirmed — youth employment = blue
    status: "coming-soon",
    views: [],
  },
];

export function programmeBySlug(slug: string): Programme | undefined {
  return PROGRAMMES.find((p) => p.slug === slug);
}

// The in-page View anchor nav is only meaningful when a programme offers two or
// more views; a single-view programme (today: Zazi) needs no sub-nav.
export function hasViewNav(programme: Programme): boolean {
  return programme.views.length >= 2;
}

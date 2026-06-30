"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PROGRAMMES, VIEW_LABELS, hasViewNav, programmeBySlug } from "./portalConfig";

const BASE = "/impact/data-portal";

// The portal's programme switcher: a slim editorial masthead that sits under the
// global navbar. Neutral chrome (ink + hairlines + tracked labels); the active
// programme is lit in its own accent. Programme-primary per CONTEXT.md — NOT a
// sidebar (ADR 0001: a sidebar reads as a Streamlit dashboard, which we are
// moving away from). Derives its active state from the URL, mirroring Navbar.tsx,
// so the shell layout stays a one-liner and the pages do not repeat themselves.
export function PortalNav() {
  const pathname = usePathname();
  const activeSlug = pathname.startsWith(BASE)
    ? pathname.slice(BASE.length).replace(/^\//, "").split("/")[0]
    : "";
  const active = programmeBySlug(activeSlug);

  return (
    <div className="sticky top-16 z-40 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1180px] items-stretch gap-5 px-6 md:px-12 lg:px-20">
        {/* Masthead identity (quiet; hidden on small screens to give the strip room) */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <span className="h-px w-8 bg-gray-300" />
          <span className="text-[11px] uppercase tracking-[0.25em] text-gray-400">Impact Data Portal</span>
        </div>

        {/* Programme strip — horizontally scrollable on narrow screens */}
        <nav
          aria-label="Programmes"
          // min-w-0 lets this flex item shrink below its content width so
          // overflow-x-auto actually scrolls on narrow screens instead of
          // forcing page-level horizontal overflow (flexbox min-width: auto trap).
          className="flex min-w-0 flex-1 items-stretch gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {PROGRAMMES.map((p) => {
            const isActive = p.slug === active?.slug;
            const comingSoon = p.status === "coming-soon";
            return (
              <Link
                key={p.slug}
                href={`${BASE}/${p.slug}`}
                aria-current={isActive ? "page" : undefined}
                className="group relative flex items-center whitespace-nowrap px-3 py-3.5 text-[13px]"
              >
                <span
                  className={`transition-colors ${
                    isActive ? "font-medium text-[#14181D]" : "text-gray-500 group-hover:text-[#14181D]"
                  }`}
                >
                  {p.label}
                </span>
                {comingSoon && (
                  <span className="ml-1.5 text-[9.5px] uppercase tracking-[0.18em] text-gray-300">Soon</span>
                )}
                {/* active indicator, lit in the programme's accent, sitting on the bottom hairline */}
                <span
                  className="pointer-events-none absolute inset-x-2 bottom-0 h-[2px] rounded-full transition-opacity duration-200"
                  style={{ backgroundColor: p.accent, opacity: isActive ? 1 : 0 }}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* In-page View anchors — render only when the active programme offers 2+
          built views (the config keeps this honest; today no programme does, so
          this stays dormant until Core Literacy / Numeracy ship their sections). */}
      {active && hasViewNav(active) && (
        <div className="border-t border-gray-100 bg-[#FAF7F2]">
          <div className="mx-auto flex max-w-[1180px] items-center gap-5 overflow-x-auto px-6 py-2 md:px-12 lg:px-20">
            <span className="shrink-0 text-[10px] uppercase tracking-[0.22em] text-gray-400">Views</span>
            {active.views.map((v) => (
              <a
                key={v}
                href={`#${v}`}
                className="whitespace-nowrap text-[12.5px] text-gray-500 underline-offset-4 hover:text-[#14181D] hover:underline"
              >
                {VIEW_LABELS[v]}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

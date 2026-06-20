"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/operations/school-programme-grid", label: "Children served" },
  { href: "/operations/school-programme-grid/youth", label: "Youth staffing" },
];

// Switches between the two projections of the grid. Shared across both pages via
// the section layout so the tab bar is identical on each.
export function GridNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex gap-6 border-b">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "-mb-px border-b-2 px-1 py-2 text-sm font-medium transition-colors",
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

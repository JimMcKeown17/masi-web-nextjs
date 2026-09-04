"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useUser } from "@/components/providers/UserProvider";
import { canAccessFinance } from "@/lib/finance/access";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/operations/finance/overview", label: "Overview" },
  { href: "/operations/finance/funders", label: "Funders" },
  { href: "/operations/finance/coverage", label: "Coverage" },
  { href: "/operations/finance/fix", label: "Fix" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function FinanceNavView({
  pathname,
  capabilities,
}: {
  pathname: string;
  capabilities: unknown;
}) {
  if (!canAccessFinance(capabilities)) return null;

  return (
    <nav aria-label="Finance views" className="mb-6 flex gap-6 overflow-x-auto border-b">
      {TABS.map((tab) => {
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-1 py-2 text-sm font-medium transition-colors",
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function FinanceNav() {
  const user = useUser();
  return <FinanceNavView pathname={usePathname()} capabilities={user?.capabilities} />;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useUser } from "@/components/providers/UserProvider";
import { canAccessFinance, canPublishFinance } from "@/lib/finance/access";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/operations/finance/overview", label: "Overview" },
  { href: "/operations/finance/budgets", label: "Budgets" },
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
    <nav aria-label="Finance views" className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
      {[...TABS, ...(canPublishFinance(capabilities) ? [{ href: "/operations/finance/upload", label: "Upload" }] : [])].map((tab) => {
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-md border-l-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              active
                ? "border-[#E72D4D] bg-white/10 text-white"
                : "border-transparent text-gray-300 hover:bg-white/5 hover:text-white",
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

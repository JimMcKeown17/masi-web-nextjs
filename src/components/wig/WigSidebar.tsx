"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  BookText,
  Baby,
  Blocks,
  Calculator,
  Database,
  BookMarked,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PROGRAMMES, programmeSlug } from "@/lib/wig/config";
import { useWigData } from "./WigDataProvider";
import { onTrackCount } from "./ProgrammeView";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  zazi_izandi: BookOpen,
  zazi_izandi_ecd: Blocks,
  core_literacy: BookText,
  ecd_literacy: Baby,
  numeracy: Calculator,
  data_team: Database,
};

interface NavEntry {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  key?: string; // programme key, for the on-track badge
  exact?: boolean;
}

const NAV: NavEntry[] = [
  { name: "Overview", href: "/operations/wig", icon: LayoutDashboard, exact: true },
  ...PROGRAMMES.map((p) => ({
    name: p.label,
    href: `/operations/wig/${programmeSlug(p.key)}`,
    icon: ICONS[p.key] ?? LayoutDashboard,
    key: p.key,
  })),
];

export function WigSidebar({ onOpenGuide }: { onOpenGuide: () => void }) {
  const pathname = usePathname();
  const { data } = useWigData();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
  }

  function badge(key?: string) {
    if (!key || !data) return null;
    const programme = PROGRAMMES.find((p) => p.key === key);
    if (!programme) return null;
    const onTrack = onTrackCount(programme, data.measures);
    const total = programme.measures.length;
    const allGood = onTrack === total;
    return (
      <span
        className={cn(
          "ml-auto text-[10.5px] font-semibold rounded-full px-1.5 py-0.5 tabular-nums",
          allGood ? "text-[#1a7f37] bg-[#34c759]/10" : "text-[#b45309] bg-[#ff9f0a]/10"
        )}
      >
        {onTrack}/{total}
      </span>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-[#ececec] sticky top-16 h-[calc(100vh-4rem)] shrink-0">
        <div className="px-4 py-5 border-b border-[#f0f0f0]">
          <span className="block text-[15px] font-semibold tracking-tight">Wildly Important Goals</span>
          <span className="block text-[11.5px] text-muted-foreground mt-0.5">Management scoreboard</span>
        </div>

        <nav className="flex-1 px-2.5 py-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] transition-colors",
                  active
                    ? "bg-[#f0f0f3] text-foreground font-semibold"
                    : "text-[#6b6b70] hover:text-foreground hover:bg-[#f6f6f8]"
                )}
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                <span className="truncate">{item.name}</span>
                {badge(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="px-2.5 py-3 border-t border-[#f0f0f0] flex flex-col gap-0.5">
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] text-[#6b6b70] hover:text-foreground hover:bg-[#f6f6f8] transition-colors"
          >
            <BookMarked className="w-[18px] h-[18px] shrink-0" />
            <span className="truncate">Metrics guide</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] text-[#6b6b70] hover:text-foreground hover:bg-[#f6f6f8] transition-colors"
          >
            <ArrowLeft className="w-[18px] h-[18px] shrink-0" />
            <span className="truncate">Back to site</span>
          </Link>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-[#ececec] flex justify-around py-1.5">
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-md text-[9px]",
                active ? "text-foreground font-semibold" : "text-[#9a9aa0]"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="truncate max-w-[52px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

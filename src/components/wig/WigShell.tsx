"use client";
import { useState, type ReactNode } from "react";
import { WigDataProvider } from "./WigDataProvider";
import { WigSidebar } from "./WigSidebar";
import { MetricsGuide } from "./MetricsGuide";

// Client shell for the WIG dashboard: one data fetch (provider), the sidebar,
// the page content, and the Metrics Guide drawer (opened from the sidebar).
export function WigShell({ children }: { children: ReactNode }) {
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <WigDataProvider>
      <div className="flex min-h-screen bg-[#fafafa] pt-16">
        <WigSidebar onOpenGuide={() => setGuideOpen(true)} />
        <main className="flex-1 min-w-0 px-5 py-7 md:px-10 md:py-9 pb-28 md:pb-9">
          {children}
        </main>
      </div>
      <MetricsGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </WigDataProvider>
  );
}

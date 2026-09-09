import type { ReactNode } from "react";

export function FinanceWorkspace({ navigation, children }: { navigation: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-10 pt-20 text-[#14181D] dark:bg-[#0E1116] dark:text-gray-100">
      <div className="mx-auto grid max-w-[1680px] grid-cols-[minmax(0,1fr)] items-start lg:grid-cols-[190px_minmax(0,1fr)]">
        <aside className="min-w-0 bg-[#14181D] text-white lg:sticky lg:top-20 lg:min-h-[calc(100dvh-5rem)]">
          <div className="hidden px-6 pb-6 pt-7 lg:block">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gray-400">Operations</p>
            <p className="mt-2 font-serif text-2xl">Finance</p>
          </div>
          {navigation}
        </aside>
        <div data-finance-content className="min-w-0 px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}

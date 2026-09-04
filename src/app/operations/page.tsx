import type { Metadata } from "next";
import Link from "next/link";
import { getUserProfile } from "@/lib/server/user";
import { opsGroupsForAccess } from "@/lib/operations/nav";

export const metadata: Metadata = {
  title: "Operations | Masinyusane",
  description: "Every internal Masinyusane tool in one place.",
};

export const dynamic = "force-dynamic";

// The operations hub: an access-filtered directory of every internal tool.
// Renders from the same config as the navbar Operations menu, so the two
// can never drift apart. Clerk auth is enforced by the middleware; the
// role comes from the Django profile and fails closed to an empty state.
export default async function OperationsHubPage() {
  const profile = await getUserProfile();
  const role = (profile as { role?: string } | null)?.role;
  const capabilities = (profile as { capabilities?: unknown } | null)?.capabilities;
  const groups = opsGroupsForAccess(role, capabilities);

  return (
    <main className="min-h-screen bg-[#FAF7F2] pt-28 md:pt-36 pb-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px w-10 bg-[#C81E3C]" />
          <span className="text-sm tracking-[0.25em] uppercase text-gray-500">
            Masinyusane · Internal tools
          </span>
        </div>
        <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] text-[#14181D]">
          Operations
        </h1>
        <p className="mt-5 max-w-2xl text-gray-600 text-lg leading-relaxed">
          Every internal tool in one place. What you see here depends on your
          access.
        </p>

        {groups.length === 0 ? (
          <div className="mt-12 max-w-xl rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="font-serif text-xl text-[#14181D]">
              No tools enabled for your account
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              Operations tools are permission-based. If you think you should
              have access, contact a project lead.
            </p>
          </div>
        ) : (
          <div className="mt-14 space-y-14">
            {groups.map((group) => (
              <section key={group.title}>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-5">
                  <h2 className="font-serif text-2xl text-[#14181D]">
                    {group.title}
                  </h2>
                  <p className="text-sm text-gray-500">{group.blurb}</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="group rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:border-[#C81E3C]/40"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAF7F2] ring-1 ring-black/[0.06] transition-colors group-hover:bg-[#C81E3C]/[0.06]">
                          <Icon className="h-5 w-5 text-[#14181D]" />
                        </span>
                        <h3 className="mt-4 font-serif text-lg text-[#14181D]">
                          {tool.title}
                        </h3>
                        <p className="mt-1 text-sm leading-snug text-gray-500">
                          {tool.description}
                        </p>
                        <code className="mt-3 block font-mono text-[11px] text-gray-400">
                          {tool.href}
                        </code>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        <p className="mt-16 border-t border-gray-200 pt-6 text-xs text-gray-400 max-w-2xl">
          Tools are listed in src/lib/operations/nav.ts; adding one there puts
          it here and in the navbar menu. The Data Map explains how these
          tools connect to the data underneath them.
        </p>
      </div>
    </main>
  );
}

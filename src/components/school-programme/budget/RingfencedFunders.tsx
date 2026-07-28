import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RingfencedPot } from "@/lib/types/youth-budget";
import { formatPreciseRand, formatRand } from "./format";

function RingfencedRow({ pot }: { pot: RingfencedPot }) {
  const hasSurplus = pot.surplus >= 0;
  const verdict = hasSurplus
    ? `${formatRand(pot.surplus)} unspent, rolls over`
    : `${formatRand(Math.abs(pot.surplus))} short`;

  return (
    <article className="grid gap-4 px-5 py-5 md:px-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(9rem,0.6fr)_minmax(9rem,0.6fr)_minmax(13rem,0.9fr)] lg:items-center">
      <div className="min-w-0">
        <h3 className="font-medium text-[#14181D]">{pot.funder_name}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pot.schools.length === 0 ? (
            <span className="text-xs text-[#7F1428]">No schools assigned</span>
          ) : (
            pot.schools.map((school, index) => (
              <Badge
                key={`${school}-${index}`}
                variant="outline"
                className="bg-white"
              >
                {school}
              </Badge>
            ))
          )}
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {pot.costed_youth} youth + {pot.open_posts} open posts
        </p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
          Pot amount
        </p>
        <p className="mt-1 font-serif text-xl tabular-nums text-[#14181D]">
          {formatPreciseRand(pot.amount)}
        </p>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
          Projected at plan
        </p>
        <p className="mt-1 font-serif text-xl tabular-nums text-[#14181D]">
          {formatPreciseRand(pot.projected_at_plan)}
        </p>
      </div>

      <p
        className={cn(
          "rounded-md border px-3 py-2 text-sm font-medium",
          hasSurplus
            ? "border-[#1D4ED8]/20 bg-[#1D4ED8]/5 text-[#1740b0]"
            : "border-[#C81E3C]/20 bg-[#C81E3C]/5 text-[#7F1428]",
        )}
      >
        {verdict}
      </p>
    </article>
  );
}

export function RingfencedFunders({
  pots,
  totalAmount,
}: {
  pots: RingfencedPot[];
  totalAmount: number;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-white">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b bg-[#FAF7F2] px-5 py-5 md:px-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#1D4ED8]" />
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500">
              Ringfenced funders
            </span>
          </div>
          <h2 className="mt-2 font-serif text-3xl text-[#14181D]">
            Wind-farm{" "}
            <span className="italic text-[#1D4ED8]">sub-budgets</span>
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-600">
            School-bound funding, costed separately with underspend carried
            into the next year.
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
            Active ringfenced total
          </p>
          <p className="mt-1 font-serif text-2xl tabular-nums text-[#14181D]">
            {formatPreciseRand(totalAmount)}
          </p>
        </div>
      </div>

      {pots.length === 0 ? (
        <div className="px-5 py-10 text-center md:px-6">
          <p className="text-sm font-medium text-[#14181D]">
            No active ringfenced funders for this year
          </p>
          <p className="mx-auto mt-1 max-w-lg text-sm text-gray-500">
            Mark a Funding Pot as ringfenced and assign its schools to track it
            here.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {pots.map((pot, index) => (
            <RingfencedRow
              key={`${pot.funder_name}-${pot.amount}-${index}`}
              pot={pot}
            />
          ))}
        </div>
      )}

      <footer className="border-t bg-[#14181D] px-5 py-3 text-sm text-white md:px-6">
        Ringfenced money never counts toward the main verdict.
      </footer>
    </section>
  );
}

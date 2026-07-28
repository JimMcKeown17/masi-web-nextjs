"use client";

import { useRef, useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  BudgetScenario,
  YouthBudgetCohort,
} from "@/lib/types/youth-budget";
import { formatRand } from "./format";

interface EstimateBucket {
  id: number;
  label: string;
  count: number;
  rate: number;
}

function prefilledBuckets(
  scenario: BudgetScenario,
  cohorts: YouthBudgetCohort[],
): EstimateBucket[] {
  let nonYeboHeadcount = 0;
  let nysEligible = 0;
  for (const cohort of cohorts) {
    if (cohort.programme === "yebo") continue;
    nonYeboHeadcount += cohort.headcount;
    nysEligible += cohort.nys_eligible_count;
  }
  const nysFullTime = Math.max(0, Math.trunc(scenario.nys_full_time_count || 0));
  const nysPartTime = Math.max(0, Math.trunc(scenario.nys_part_time_count || 0));
  const subsidisedCount = Math.min(nysFullTime, nysEligible);
  const fullRate = Math.round(4.5 * 20 * scenario.wage_rate * 1.01);
  const subsidisedRate = Math.max(
    0,
    Math.round(
      4.5 * 20 * scenario.wage_rate * 1.01 -
        scenario.subsidy_contribution,
    ),
  );

  return [
    {
      id: 1,
      label: "Subsidised (NYS)",
      count: subsidisedCount,
      rate: subsidisedRate,
    },
    {
      id: 2,
      label: "Fully funded",
      count: Math.max(0, nonYeboHeadcount - subsidisedCount),
      rate: fullRate,
    },
    {
      id: 3,
      label: "Subsidy-only part-timers",
      count: nysPartTime,
      rate: 0,
    },
  ];
}

export function QuickEstimate({
  scenario,
  cohorts,
  remainingMonths,
  modelCommittedTotal,
}: {
  scenario: BudgetScenario;
  cohorts: YouthBudgetCohort[];
  remainingMonths: number;
  modelCommittedTotal: number;
}) {
  const nextId = useRef(4);
  const [buckets, setBuckets] = useState(() =>
    prefilledBuckets(scenario, cohorts),
  );
  const [months, setMonths] = useState(remainingMonths);

  const total =
    buckets.reduce(
      (sum, bucket) =>
        sum + Math.max(0, bucket.count) * Math.max(0, bucket.rate),
      0,
    ) * Math.max(0, months);
  const difference = total - modelCommittedTotal;

  function updateBucket(
    id: number,
    field: "label" | "count" | "rate",
    value: string | number,
  ) {
    setBuckets((current) =>
      current.map((bucket) =>
        bucket.id === id
          ? {
              ...bucket,
              [field]:
                field === "label"
                  ? value
                  : Math.max(
                      0,
                      Number.isFinite(Number(value))
                        ? field === "count"
                          ? Math.trunc(Number(value))
                          : Number(value)
                        : 0,
                    ),
            }
          : bucket,
      ),
    );
  }

  function reset() {
    setBuckets(prefilledBuckets(scenario, cohorts));
    setMonths(remainingMonths);
  }

  function addBucket() {
    const id = nextId.current;
    nextId.current += 1;
    setBuckets((current) => [
      ...current,
      { id, label: "New bucket", count: 0, rate: 0 },
    ]);
  }

  return (
    <section className="rounded-xl border bg-[#FAF7F2] p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#1D4ED8]" />
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500">
              Back-of-envelope
            </span>
          </div>
          <h2 className="mt-2 font-serif text-3xl text-[#14181D]">
            Quick <span className="italic text-[#1D4ED8]">Estimate</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Scratchpad only. Change the buckets to mirror the team&apos;s mental
            math. These values are never persisted.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={reset}>
          <RotateCcw />
          Reset live prefill
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border bg-white">
        {buckets.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No estimate buckets remain.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBucket}
              className="mt-3"
            >
              <Plus />
              Add bucket
            </Button>
          </div>
        ) : (
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-2 font-medium">Bucket</th>
                <th className="px-3 py-2 text-right font-medium">People</th>
                <th className="px-3 py-2 text-right font-medium">Monthly rate</th>
                <th className="px-3 py-2 text-right font-medium">Subtotal</th>
                <th className="w-12 px-3 py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((bucket) => (
                <tr key={bucket.id} className="border-b last:border-0">
                  <td className="px-4 py-2">
                    <Input
                      aria-label="Bucket label"
                      value={bucket.label}
                      onChange={(event) =>
                        updateBucket(bucket.id, "label", event.target.value)
                      }
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Input
                      aria-label={`${bucket.label} people`}
                      type="number"
                      min={0}
                      step={1}
                      value={bucket.count}
                      onChange={(event) =>
                        updateBucket(
                          bucket.id,
                          "count",
                          Number(event.target.value),
                        )
                      }
                      className="inline-flex w-24 text-right tabular-nums"
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Input
                      aria-label={`${bucket.label} monthly rate`}
                      type="number"
                      min={0}
                      step={1}
                      value={bucket.rate}
                      onChange={(event) =>
                        updateBucket(
                          bucket.id,
                          "rate",
                          Number(event.target.value),
                        )
                      }
                      className="inline-flex w-32 text-right tabular-nums"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">
                    {formatRand(bucket.count * bucket.rate * months)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        setBuckets((current) =>
                          current.filter((item) => item.id !== bucket.id),
                        )
                      }
                      aria-label={`Remove ${bucket.label}`}
                    >
                      <Trash2 />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <Button type="button" variant="outline" size="sm" onClick={addBucket}>
          <Plus />
          Add bucket
        </Button>
        <div className="w-36 space-y-1.5">
          <Label htmlFor="quick-estimate-months" className="text-xs">
            Months remaining
          </Label>
          <Input
            id="quick-estimate-months"
            type="number"
            min={0}
            max={12}
            step={1}
            value={months}
            onChange={(event) =>
              setMonths(
                Math.max(0, Math.trunc(Number(event.target.value) || 0)),
              )
            }
            className="text-right tabular-nums"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-[#1D4ED8] p-4 text-white">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">
            Quick Estimate total
          </p>
          <p className="mt-2 font-serif text-3xl tabular-nums">
            {formatRand(total)}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
            Model total, currently employed youth
          </p>
          <p className="mt-2 font-serif text-3xl tabular-nums text-[#14181D]">
            {formatRand(modelCommittedTotal)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Quick Estimate is {formatRand(Math.abs(difference))}{" "}
            {difference >= 0 ? "higher" : "lower"}.
          </p>
        </div>
      </div>
    </section>
  );
}

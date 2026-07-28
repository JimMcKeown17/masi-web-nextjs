"use client";

import { Fragment, useState, type FormEvent } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  FundingFeasibility,
  FundingPot,
  FundingPotCreate,
  FundingPotUpdate,
  YouthBudgetSchool,
} from "@/lib/types/youth-budget";
import { formatBudgetDate, formatPreciseRand, formatRand } from "./format";

interface PotDraft {
  funderName: string;
  amount: string;
  asOf: string;
  note: string;
  schoolIds: number[];
  isActive: boolean;
}

function blankDraft(asOf: string): PotDraft {
  return {
    funderName: "",
    amount: "",
    asOf,
    note: "",
    schoolIds: [],
    isActive: true,
  };
}

function draftFromPot(pot: FundingPot): PotDraft {
  return {
    funderName: pot.funder_name,
    amount: String(pot.amount),
    asOf: pot.as_of,
    note: pot.note,
    schoolIds: pot.schools.map((school) => school.id),
    isActive: pot.is_active,
  };
}

function FeasibilityWarning({
  pot,
  warning,
}: {
  pot: FundingPot;
  warning: FundingFeasibility | undefined;
}) {
  if (pot.schools.length === 0 || !warning || warning.shortfall <= 0) {
    return null;
  }
  return (
    <div className="rounded-md border border-[#C81E3C]/20 bg-[#C81E3C]/5 px-3 py-2 text-xs text-[#7F1428]">
      Projected {formatRand(warning.projected_at_schools)} at these schools vs{" "}
      {formatRand(warning.amount)} pot - {formatRand(warning.shortfall)} at risk
      of stranding.
    </div>
  );
}

export function PotsPanel({
  pots,
  potsTotal,
  feasibility,
  schoolOptions,
  asOf,
  canEdit,
  onCreate,
  onUpdate,
  onDelete,
}: {
  pots: FundingPot[];
  potsTotal: number;
  feasibility: FundingFeasibility[];
  schoolOptions: YouthBudgetSchool[];
  asOf: string;
  canEdit: boolean;
  onCreate: (fields: Omit<FundingPotCreate, "year">) => Promise<void>;
  onUpdate: (potId: number, fields: FundingPotUpdate) => Promise<void>;
  onDelete: (potId: number) => Promise<void>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<FundingPot | null>(null);
  const [draft, setDraft] = useState<PotDraft>(() => blankDraft(asOf));
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function openCreate() {
    setEditing(null);
    setDraft(blankDraft(asOf));
    setDialogOpen(true);
  }

  function openEdit(pot: FundingPot) {
    setEditing(pot);
    setDraft(draftFromPot(pot));
    setDialogOpen(true);
  }

  function toggleSchool(schoolId: number, checked: boolean) {
    setDraft((current) => ({
      ...current,
      schoolIds: checked
        ? [...current.schoolIds, schoolId]
        : current.schoolIds.filter((id) => id !== schoolId),
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const funderName = draft.funderName.trim();
    const amount = Number(draft.amount);
    if (!funderName || !draft.asOf || !Number.isFinite(amount) || amount < 0) {
      toast.error("Enter a funder, non-negative amount, and as-of date.");
      return;
    }

    const fields = {
      funder_name: funderName,
      amount,
      as_of: draft.asOf,
      note: draft.note,
      schools: draft.schoolIds,
      is_active: draft.isActive,
    };
    setSaving(true);
    try {
      if (editing) {
        await onUpdate(editing.id, fields);
        toast.success("Funding Pot updated.");
      } else {
        await onCreate(fields);
        toast.success("Funding Pot added.");
      }
      setDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save the Funding Pot.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(pot: FundingPot) {
    if (
      !window.confirm(
        `Delete the ${pot.funder_name} Funding Pot? This cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(pot.id);
    try {
      await onDelete(pot.id);
      toast.success("Funding Pot deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete the Funding Pot.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b bg-[#FAF7F2] px-5 py-5 md:px-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[#1D4ED8]" />
            <span className="text-xs uppercase tracking-[0.25em] text-gray-500">
              Funding
            </span>
          </div>
          <h2 className="mt-2 font-serif text-3xl text-[#14181D]">
            Funding <span className="italic text-[#1D4ED8]">Pots</span>
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Remaining balances, with school restrictions and stranding checks.
          </p>
        </div>
        {canEdit ? (
          <Button
            type="button"
            onClick={openCreate}
            className="bg-[#1D4ED8] text-white hover:bg-[#1740b0]"
          >
            <Plus />
            Add Funding Pot
          </Button>
        ) : null}
      </div>

      {pots.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm font-medium">No Funding Pots for this year</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            The verdict has no active funding balance until a manager adds one.
          </p>
          {canEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openCreate}
              className="mt-4"
            >
              <Plus />
              Add the first Funding Pot
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-5 py-2.5 font-medium">Funder</th>
                <th className="px-3 py-2.5 text-right font-medium">Amount</th>
                <th className="px-3 py-2.5 font-medium">As of</th>
                <th className="px-3 py-2.5 font-medium">School restriction</th>
                <th className="px-3 py-2.5 font-medium">Note</th>
                {canEdit ? (
                  <th className="px-5 py-2.5 text-right font-medium">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {pots.map((pot) => {
                const warning = feasibility.find(
                  (row) => row.funder_name === pot.funder_name,
                );
                return (
                  <Fragment key={pot.id}>
                    <tr
                      className={
                        pot.is_active
                          ? "border-b align-top"
                          : "border-b bg-gray-50 align-top text-gray-500"
                      }
                    >
                      <td className="px-5 py-3 font-medium">
                        <div className="flex flex-wrap items-center gap-2">
                          {pot.funder_name}
                          {!pot.is_active ? (
                            <Badge variant="outline">Inactive</Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right font-medium tabular-nums">
                        {formatPreciseRand(pot.amount)}
                      </td>
                      <td className="px-3 py-3 text-gray-600">
                        {formatBudgetDate(pot.as_of)}
                      </td>
                      <td className="px-3 py-3">
                        {pot.schools.length === 0 ? (
                          <span className="text-gray-500">Unrestricted</span>
                        ) : (
                          <div className="flex max-w-xs flex-wrap gap-1">
                            {pot.schools.map((school) => (
                              <Badge key={school.id} variant="outline">
                                {school.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="max-w-xs px-3 py-3 text-gray-600">
                        {pot.note || <span className="text-gray-400">None</span>}
                      </td>
                      {canEdit ? (
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEdit(pot)}
                              aria-label={`Edit ${pot.funder_name}`}
                            >
                              <Pencil />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => remove(pot)}
                              disabled={deletingId === pot.id}
                              aria-label={`Delete ${pot.funder_name}`}
                              className="text-[#C81E3C] hover:text-[#C81E3C]"
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                    {pot.schools.length > 0 && warning?.shortfall ? (
                      <tr className="border-b">
                        <td
                          colSpan={canEdit ? 6 : 5}
                          className="px-5 py-2"
                        >
                          <FeasibilityWarning pot={pot} warning={warning} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
              <tr className="border-t-2 bg-[#14181D] text-white">
                <td className="px-5 py-3 font-medium">
                  Active Funding Pots total
                </td>
                <td className="px-3 py-3 text-right font-serif text-lg tabular-nums">
                  {formatPreciseRand(potsTotal)}
                </td>
                <td colSpan={canEdit ? 4 : 3} className="px-3 py-3 text-xs text-white/60">
                  Inactive pots are excluded from the verdict.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!saving) setDialogOpen(open);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <form onSubmit={submit} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {editing ? "Edit Funding Pot" : "Add Funding Pot"}
              </DialogTitle>
              <DialogDescription>
                A blank school restriction means this pot can be spent across
                all schools.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pot-funder">Funder</Label>
                <Input
                  id="pot-funder"
                  value={draft.funderName}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      funderName: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pot-amount">Remaining amount</Label>
                <Input
                  id="pot-amount"
                  type="number"
                  min={0}
                  step={0.01}
                  value={draft.amount}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pot-as-of">Balance as of</Label>
                <Input
                  id="pot-as-of"
                  type="date"
                  value={draft.asOf}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      asOf: event.target.value,
                    }))
                  }
                  required
                />
              </div>
              <label className="flex items-center gap-2 self-end rounded-md border px-3 py-2 text-sm">
                <Checkbox
                  checked={draft.isActive}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({
                      ...current,
                      isActive: checked === true,
                    }))
                  }
                />
                Include in the active total
              </label>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pot-note">Note</Label>
              <Textarea
                id="pot-note"
                value={draft.note}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
                placeholder="Optional funding context"
              />
            </div>

            <div className="space-y-2">
              <div>
                <Label>School restriction</Label>
                <p className="text-xs text-muted-foreground">
                  Select every school where this Funding Pot can be spent.
                </p>
              </div>
              {schoolOptions.length === 0 ? (
                <div className="rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground">
                  No active school options are available.
                </div>
              ) : (
                <div className="grid max-h-56 gap-1 overflow-y-auto rounded-md border p-2 sm:grid-cols-2">
                  {schoolOptions.map((school) => {
                    const checked = draft.schoolIds.includes(school.id);
                    return (
                      <label
                        key={school.id}
                        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            toggleSchool(school.id, value === true)
                          }
                        />
                        {school.name}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#1D4ED8] text-white hover:bg-[#1740b0]"
              >
                {saving ? "Saving..." : "Save Funding Pot"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

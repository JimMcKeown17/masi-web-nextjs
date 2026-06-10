"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import { toast } from "sonner";
import { CalendarOff, Trash2, AlertCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

import {
  getClosureLookups,
  listClosures,
  bulkCreateClosures,
  deleteClosure,
  listAbsences,
  bulkCreateAbsences,
  deleteAbsence,
} from "@/lib/api/closures";
import type {
  ClosureScopeType,
  AbsenceReason,
  SchoolClosure,
  StaffAbsence,
  ClosureLookups,
} from "@/lib/types/closures";

function isoDate(d: Date): string {
  // Local calendar date (YYYY-MM-DD), not UTC -- toISOString() would shift the
  // date back a day in SAST (UTC+2) during the early-morning hours.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const isoToday = () => isoDate(new Date());
const isoPlusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return isoDate(d);
};

// Window the tables show: a month back through the rest of the year.
const WINDOW_FROM = isoPlusDays(-30);
const WINDOW_TO = isoPlusDays(180);

const ABSENCE_REASONS: { value: AbsenceReason; label: string }[] = [
  { value: "vacation", label: "Vacation" },
  { value: "funeral", label: "Funeral" },
  { value: "sick", label: "Sick" },
  { value: "other", label: "Other" },
];

// Filterable multi-select for suburbs / schools / youth.
function PickList({
  options,
  selected,
  onChange,
  placeholder,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );
  const toggle = (value: string) =>
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );

  return (
    <div className="rounded-md border">
      <Input
        placeholder={placeholder ?? "Search…"}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="rounded-b-none border-0 border-b focus-visible:ring-0"
      />
      <div className="max-h-48 overflow-y-auto p-1">
        {filtered.length === 0 ? (
          <p className="p-2 text-sm text-muted-foreground">No matches.</p>
        ) : (
          filtered.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Checkbox
                checked={selected.includes(o.value)}
                onCheckedChange={() => toggle(o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))
        )}
      </div>
      {selected.length > 0 && (
        <div className="border-t p-2 text-xs text-muted-foreground">
          {selected.length} selected
        </div>
      )}
    </div>
  );
}

export default function ClosureCalendarPage() {
  const { getToken } = useAuth();
  const authToken = async () => {
    const token = await getToken();
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  const { data: lookups, error: lookupsError } = useSWR<ClosureLookups>(
    "closure-lookups",
    async () => getClosureLookups(await authToken())
  );

  const closuresKey = `closures-${WINDOW_FROM}-${WINDOW_TO}`;
  const { data: closures, mutate: mutateClosures } = useSWR<SchoolClosure[]>(
    closuresKey,
    async () => listClosures(await authToken(), WINDOW_FROM, WINDOW_TO)
  );

  const absencesKey = `absences-${WINDOW_FROM}-${WINDOW_TO}`;
  const { data: absences, mutate: mutateAbsences } = useSWR<StaffAbsence[]>(
    absencesKey,
    async () => listAbsences(await authToken(), WINDOW_FROM, WINDOW_TO)
  );

  return (
    <div className="container mx-auto max-w-6xl px-4">
      <div className="mb-6 flex items-center gap-3">
        <CalendarOff className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Closure Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Record non-working days so the per-day stats don&apos;t count them. Days are open
            Mon–Fri unless a closure or absence says otherwise.
          </p>
        </div>
      </div>

      {lookupsError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Couldn&apos;t load schools/youth. Try refreshing.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="closures">
        <TabsList className="mb-4">
          <TabsTrigger value="closures">School closures</TabsTrigger>
          <TabsTrigger value="absences">Staff absences</TabsTrigger>
        </TabsList>

        <TabsContent value="closures" className="space-y-6">
          <ClosureForm lookups={lookups} authToken={authToken} onDone={() => mutateClosures()} />
          <ClosureTable
            closures={closures}
            authToken={authToken}
            onChanged={() => mutateClosures()}
          />
        </TabsContent>

        <TabsContent value="absences" className="space-y-6">
          <AbsenceForm lookups={lookups} authToken={authToken} onDone={() => mutateAbsences()} />
          <AbsenceTable
            absences={absences}
            authToken={authToken}
            onChanged={() => mutateAbsences()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

type AuthToken = () => Promise<string>;

function ClosureForm({
  lookups,
  authToken,
  onDone,
}: {
  lookups: ClosureLookups | undefined;
  authToken: AuthToken;
  onDone: () => void;
}) {
  const [scopeType, setScopeType] = useState<ClosureScopeType>("global");
  const [typeValue, setTypeValue] = useState<string>("");
  const [suburbs, setSuburbs] = useState<string[]>([]);
  const [schools, setSchools] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState(isoToday());
  const [dateTo, setDateTo] = useState(isoToday());
  const [reason, setReason] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetScope = (next: ClosureScopeType) => {
    setScopeType(next);
    setTypeValue("");
    setSuburbs([]);
    setSchools([]);
  };

  const scopeValues = (): (string | null)[] | undefined => {
    if (scopeType === "global") return undefined;
    if (scopeType === "type") return typeValue ? [typeValue] : [];
    if (scopeType === "region") return suburbs;
    return schools;
  };

  const submit = async () => {
    if (!dateFrom || !dateTo || dateTo < dateFrom) {
      toast.error("Pick a valid date range.");
      return;
    }
    const values = scopeValues();
    if (scopeType !== "global" && (!values || values.length === 0)) {
      toast.error("Pick at least one target for this scope.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await bulkCreateClosures(await authToken(), {
        date_from: dateFrom,
        date_to: dateTo,
        scope_type: scopeType,
        scope_values: values,
        is_open: isOpen,
        reason,
      });
      toast.success(`Saved: ${res.created} added, ${res.updated} updated.`);
      setReason("");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save closure.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a closure</CardTitle>
        <CardDescription>
          Closes weekdays in the range for the chosen scope. For a citywide event, pick several
          suburbs.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Scope</Label>
          <Select value={scopeType} onValueChange={(v) => resetScope(v as ClosureScopeType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">All schools (global)</SelectItem>
              <SelectItem value="type">By school type</SelectItem>
              <SelectItem value="region">By suburb</SelectItem>
              <SelectItem value="school">Specific school(s)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Target</Label>
          {scopeType === "global" && (
            <p className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Applies to every school.
            </p>
          )}
          {scopeType === "type" && (
            <Select value={typeValue} onValueChange={setTypeValue}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a type…" />
              </SelectTrigger>
              <SelectContent>
                {(lookups?.school_types ?? []).map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {scopeType === "region" && (
            <PickList
              options={(lookups?.suburbs ?? []).map((s) => ({ value: s, label: s }))}
              selected={suburbs}
              onChange={setSuburbs}
              placeholder="Search suburbs…"
            />
          )}
          {scopeType === "school" && (
            <PickList
              options={(lookups?.schools ?? []).map((s) => ({
                value: s.school_uid,
                label: s.name,
              }))}
              selected={schools}
              onChange={setSchools}
              placeholder="Search schools…"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="closure-from">From</Label>
          <Input
            id="closure-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="closure-to">To</Label>
          <Input
            id="closure-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="closure-reason">Reason</Label>
          <Input
            id="closure-reason"
            placeholder="e.g. Floods, water outage, assessment day"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <Checkbox
            checked={isOpen}
            onCheckedChange={(c) => setIsOpen(c === true)}
          />
          Mark as <span className="font-medium">open</span> instead (override a broader closure or
          a public holiday)
        </label>

        <div className="md:col-span-2">
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Saving…" : "Save closure"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ClosureTable({
  closures,
  authToken,
  onChanged,
}: {
  closures: SchoolClosure[] | undefined;
  authToken: AuthToken;
  onChanged: () => void;
}) {
  const remove = async (c: SchoolClosure) => {
    try {
      await deleteClosure(await authToken(), c.id);
      toast.success("Closure removed.");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove.");
    }
  };

  if (!closures) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Closures ({closures.length})</CardTitle>
        <CardDescription>{WINDOW_FROM} to {WINDOW_TO}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {closures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No closures in this window.
                </TableCell>
              </TableRow>
            ) : (
              closures.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="whitespace-nowrap">{c.date}</TableCell>
                  <TableCell>
                    {c.scope_display}
                    {c.source === "public_holiday" && (
                      <Badge variant="secondary" className="ml-2">
                        Auto
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.reason || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={c.is_open ? "outline" : "destructive"}>
                      {c.is_open ? "Open" : "Closed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(c)}
                      aria-label="Remove closure"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AbsenceForm({
  lookups,
  authToken,
  onDone,
}: {
  lookups: ClosureLookups | undefined;
  authToken: AuthToken;
  onDone: () => void;
}) {
  const [youth, setYouth] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState(isoToday());
  const [dateTo, setDateTo] = useState(isoToday());
  const [reason, setReason] = useState<AbsenceReason>("vacation");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (youth.length === 0) {
      toast.error("Pick at least one person.");
      return;
    }
    if (!dateFrom || !dateTo || dateTo < dateFrom) {
      toast.error("Pick a valid date range.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await bulkCreateAbsences(await authToken(), {
        youth_uids: youth,
        date_from: dateFrom,
        date_to: dateTo,
        reason,
        note,
      });
      toast.success(`Saved: ${res.created} added, ${res.updated} updated.`);
      setNote("");
      setYouth([]);
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save absence.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add an absence</CardTitle>
        <CardDescription>
          Marks weekdays in the range as not-expected for the chosen people, so they aren&apos;t
          flagged inactive or counted in their denominator.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>People</Label>
          <PickList
            options={(lookups?.youth ?? []).map((y) => ({ value: y.youth_uid, label: y.name }))}
            selected={youth}
            onChange={setYouth}
            placeholder="Search youth…"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="absence-from">From</Label>
          <Input
            id="absence-from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="absence-to">To</Label>
          <Input
            id="absence-to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Reason</Label>
          <Select value={reason} onValueChange={(v) => setReason(v as AbsenceReason)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ABSENCE_REASONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="absence-note">Note (optional)</Label>
          <Input
            id="absence-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Saving…" : "Save absence"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AbsenceTable({
  absences,
  authToken,
  onChanged,
}: {
  absences: StaffAbsence[] | undefined;
  authToken: AuthToken;
  onChanged: () => void;
}) {
  const remove = async (a: StaffAbsence) => {
    try {
      await deleteAbsence(await authToken(), a.id);
      toast.success("Absence removed.");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove.");
    }
  };

  if (!absences) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Absences ({absences.length})</CardTitle>
        <CardDescription>{WINDOW_FROM} to {WINDOW_TO}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Person</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {absences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No absences in this window.
                </TableCell>
              </TableRow>
            ) : (
              absences.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap">{a.date}</TableCell>
                  <TableCell>{a.youth_name || a.youth_uid}</TableCell>
                  <TableCell className="capitalize">{a.reason}</TableCell>
                  <TableCell className="text-muted-foreground">{a.note || "—"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(a)}
                      aria-label="Remove absence"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

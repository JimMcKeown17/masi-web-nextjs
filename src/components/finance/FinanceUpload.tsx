"use client";

import { useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import useSWR, { useSWRConfig } from "swr";
import { useUser } from "@/components/providers/UserProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { canPublishFinance } from "@/lib/finance/access";
import { approveFinanceRun, demoteFinanceRun, financeRunsCacheKey, FinanceRunApiError, getFinanceCurrent, getFinanceRun, getFinanceRuns, uploadFinanceRun } from "@/lib/api/finance-runs";
import type { ApprovalOptions, FinanceRun, FinanceRunAction, FinanceRunStatus } from "@/lib/types/finance-runs";
import { FinanceRunSelector } from "./FinanceRunSelector";
import { FinanceRunSummary } from "./FinanceRunSummary";

type Requirements = Pick<ApprovalOptions, "acknowledge_findings" | "override_anti_rollback">;
const NO_REQUIREMENTS: Requirements = { acknowledge_findings: false, override_anti_rollback: false };
const EMPTY_OPTIONS: ApprovalOptions = { ...NO_REQUIREMENTS, note: "" };
type UploadState = "idle" | "uploading" | "success" | "error";

export function validateFinanceFile(file: Pick<File, "name" | "size">): string | null {
  if (!/\.xlsx$/i.test(file.name)) return "Select an .xlsx workbook.";
  if (file.size === 0) return "The workbook is empty.";
  if (file.size > 32 * 1024 * 1024) return "The workbook exceeds the 32 MiB limit.";
  return null;
}
export function requirementsAfterError(previous: Requirements, code: string): Requirements {
  return {
    acknowledge_findings: previous.acknowledge_findings || code === "FINDINGS_ACKNOWLEDGEMENT_REQUIRED",
    override_anti_rollback: previous.override_anti_rollback || code === "ANTI_ROLLBACK",
  };
}
export function approvalReady(action: FinanceRunAction, requirements: Requirements, options: ApprovalOptions): boolean {
  return (!requirements.acknowledge_findings || options.acknowledge_findings)
    && (!requirements.override_anti_rollback || options.override_anti_rollback)
    && (!(action === "demote" || options.acknowledge_findings || options.override_anti_rollback) || Boolean(options.note.trim()));
}
export function UploadStatus({ state, message }: { state: UploadState; message: string }) {
  return <div aria-live={state === "error" ? "assertive" : "polite"} role={state === "error" ? "alert" : "status"} aria-atomic="true" className="text-sm">
    {message}
    {state === "uploading" ? <progress aria-label="Uploading and processing workbook" className="mt-2 block w-full" /> : null}
  </div>;
}
export function ApprovalFields({ action, requirements, options, onChange }: {
  action: FinanceRunAction; requirements: Requirements; options: ApprovalOptions; onChange: (options: ApprovalOptions) => void;
}) {
  const noteRequired = action === "demote" || options.acknowledge_findings || options.override_anti_rollback;
  return <div className="space-y-4">
    {requirements.acknowledge_findings ? <label className="flex items-start gap-2"><input type="checkbox" checked={options.acknowledge_findings} onChange={(event) => onChange({ ...options, acknowledge_findings: event.target.checked })} />Acknowledge in-scope findings</label> : null}
    {requirements.override_anti_rollback ? <label className="flex items-start gap-2"><input type="checkbox" checked={options.override_anti_rollback} onChange={(event) => onChange({ ...options, override_anti_rollback: event.target.checked })} />Override anti-rollback</label> : null}
    <label className="block">Approval note {noteRequired ? "(required)" : "(optional)"}
      <textarea required={noteRequired} maxLength={10000} value={options.note} onChange={(event) => onChange({ ...options, note: event.target.value })} className="mt-1 min-h-24 w-full rounded-md border bg-background p-2" />
    </label>
  </div>;
}

export function FinanceUpload() {
  const { userId, getToken } = useAuth();
  const user = useUser();
  if (!userId || !canPublishFinance(user?.capabilities)) return <p role="alert">Finance read and publish access are required.</p>;
  // Remount local upload/dialog state on account change as well as partitioning SWR.
  return <FinanceUploadSession key={userId} userId={userId} getToken={getToken} />;
}

export function FinanceUploadSession({ userId, getToken }: { userId: string; getToken: () => Promise<string | null> }) {
  const { mutate } = useSWRConfig();
  const [year, setYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState<FinanceRunStatus | "">("");
  const [cursor, setCursor] = useState<string>();
  const [selectedId, setSelectedId] = useState("");
  const [returnedRun, setReturnedRun] = useState<FinanceRun>();
  const [file, setFile] = useState<File>();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<FinanceRunAction | null>(null);
  const [requirements, setRequirements] = useState(NO_REQUIREMENTS);
  const [options, setOptions] = useState(EMPTY_OPTIONS);
  const [mutating, setMutating] = useState(false);
  const [mutationMessage, setMutationMessage] = useState("");
  const [mutationError, setMutationError] = useState(false);
  const [refreshPending, setRefreshPending] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const summary = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const busy = uploadState === "uploading" || mutating;
  async function token() {
    const value = await getToken();
    if (!value) throw new Error("Not authenticated. Sign in again.");
    return value;
  }
  const list = useSWR(financeRunsCacheKey(userId, `list:${year}:${status}:${cursor ?? ""}`), async () => getFinanceRuns(await token(), { year, status: status || undefined, cursor }));
  const current = useSWR(financeRunsCacheKey(userId, `current:${year}`), async () => getFinanceCurrent(await token(), year));
  const detail = useSWR(selectedId ? financeRunsCacheKey(userId, `detail:${selectedId}`) : null, async () => getFinanceRun(await token(), selectedId));
  const currentId = current.error ? undefined : current.data?.runs.funders?.id;
  const currentDetail = useSWR(currentId ? financeRunsCacheKey(userId, `detail:${currentId}`) : null, async () => getFinanceRun(await token(), currentId!));
  const selectedRun = detail.error ? undefined : detail.data ?? (returnedRun?.id === selectedId ? returnedRun : undefined);

  async function refresh() {
    // Invalidate every visited list/current/detail plus the existing reader cache for this account.
    await mutate((key) => typeof key === "string" && (
      key.startsWith(`/operations/finance/runs?user=${encodeURIComponent(userId)}&`)
      || key.startsWith(`/operations/finance/snapshot?user=${userId}&`)
    ));
  }
  async function verifyPublication() {
    try {
      const authToken = await token();
      // SWR revalidation can resolve with retained data on errors. Check the GETs
      // directly and only publish their results once every required read succeeds.
      const [nextCurrent, nextList, nextDetail] = await Promise.all([
        getFinanceCurrent(authToken, year),
        getFinanceRuns(authToken, { year, status: status || undefined, cursor }),
        getFinanceRun(authToken, selectedId),
      ]);
      const nextCurrentId = nextCurrent.runs.funders?.id;
      const nextCurrentDetail = nextCurrentId
        ? nextCurrentId === selectedId ? nextDetail : await getFinanceRun(authToken, nextCurrentId)
        : undefined;
      await Promise.all([
        mutate(financeRunsCacheKey(userId, `current:${year}`), nextCurrent, { revalidate: false }),
        mutate(financeRunsCacheKey(userId, `list:${year}:${status}:${cursor ?? ""}`), nextList, { revalidate: false }),
        mutate(financeRunsCacheKey(userId, `detail:${selectedId}`), nextDetail, { revalidate: false }),
        ...(nextCurrentDetail ? [mutate(financeRunsCacheKey(userId, `detail:${nextCurrentDetail.id}`), nextCurrentDetail, { revalidate: false })] : []),
      ]);
      setRefreshPending(false); setMutationError(false);
      setMutationMessage(`Approved server state refreshed. Current run: ${nextCurrentId ?? "none"}.`);
    } catch {
      setRefreshPending(true); setMutationError(true);
      setMutationMessage("Change succeeded, refresh pending. Retry the refresh to verify the current run.");
    }
  }
  async function retryPublicationRefresh() {
    if (busyRef.current) return;
    busyRef.current = true; setMutating(true);
    try { await verifyPublication(); }
    finally { busyRef.current = false; setMutating(false); }
  }
  function chooseFile(next?: File) {
    if (busyRef.current || refreshPending) return;
    setFile(undefined);
    if (!next) return;
    const error = validateFinanceFile(next);
    setUploadState(error ? "error" : "idle");
    setMessage(error ?? `Selected ${next.name}`);
    if (!error) setFile(next);
  }
  async function upload() {
    if (!file || busyRef.current || refreshPending) return;
    const error = validateFinanceFile(file);
    if (error) { setMessage(error); setUploadState("error"); return; }
    busyRef.current = true;
    setUploadState("uploading"); setMessage("Uploading and processing workbook. Please wait.");
    try {
      const result = await uploadFinanceRun(await token(), file, year);
      if (result.status === 400 || result.status === 409) {
        setUploadState("error");
        setMessage(result.error.code === "UPLOAD_IN_PROGRESS" ? "UPLOAD_IN_PROGRESS: another upload for this year is still processing. Wait, then retry the same file." : `${result.error.code}: ${result.error.detail}`);
        return;
      }
      const run = result.run;
      setReturnedRun(run); setSelectedId(run.id); setStatus(""); setCursor(undefined);
      setUploadState(run.status === "failed" ? "error" : "success");
      setMessage(`${result.status === 200 ? "Idempotent replay: existing run returned" : run.status === "failed" ? "Failed run created" : "Candidate created"}. Status: ${run.status}. ${run.failure?.message ?? "Review the run summary."}`);
      await refresh();
      summary.current?.focus();
    } catch (error) {
      setUploadState("error"); setMessage(`${error instanceof Error ? error.message : "Upload failed"}. If the response was lost, retry the same file to retrieve its existing run.`);
    } finally { busyRef.current = false; }
  }
  function openAction(next: FinanceRunAction) {
    opener.current = document.activeElement as HTMLElement;
    setRequirements(NO_REQUIREMENTS); setOptions(EMPTY_OPTIONS); setMutationMessage(""); setMutationError(false); setAction(next);
  }
  async function confirm() {
    if (!action || !selectedRun || busyRef.current || refreshPending || !approvalReady(action, requirements, options)) return;
    busyRef.current = true; setMutating(true); setMutationError(false); setMutationMessage("Applying change and refreshing approved server state…");
    try {
      await (action === "approve" ? approveFinanceRun : demoteFinanceRun)(await token(), selectedRun.id, options);
      setRefreshPending(true); setReturnedRun(undefined);
      // Publication changes shared approved state for every previously used account.
      // Clear data and fence in-flight reads without fetching for another account;
      // verified reads below repopulate only this publisher's account-scoped keys.
      await mutate((key) => typeof key === "string" && key.startsWith("/operations/finance/snapshot?user="), undefined, { revalidate: false });
      await mutate((key) => typeof key === "string" && key.startsWith("/operations/finance/runs?user="), undefined, { revalidate: false });
      await verifyPublication();
      setAction(null);
    } catch (error) {
      if (error instanceof FinanceRunApiError) setRequirements((previous) => requirementsAfterError(previous, error.code));
      setMutationError(true);
      setMutationMessage(error instanceof FinanceRunApiError ? `${error.code}: ${error.message}` : error instanceof Error ? error.message : "Publication failed");
    } finally { busyRef.current = false; setMutating(false); }
  }
  function pageCursor(url: string | null) {
    // Read only the cursor from server pagination links; never forward credentials to a supplied URL.
    setCursor(url ? new URL(url, "https://pagination.invalid").searchParams.get("cursor") ?? undefined : undefined);
  }
  const readError = list.error || current.error || detail.error || currentDetail.error;
  return <div className="space-y-6">
    <header><h1 className="font-serif text-3xl">Publish finance workbook</h1><p className="mt-2 text-muted-foreground">Upload, inspect and explicitly approve a funders run for reader pages.</p></header>
    <FinanceRunSelector year={year} status={status} selectedId={selectedId} selectedRun={selectedRun} runs={list.error ? [] : list.data?.results ?? []} currentId={currentId} disabled={busy || refreshPending || action !== null}
      onYearChange={(value) => { setYear(value); setCursor(undefined); setSelectedId(""); setReturnedRun(undefined); }}
      onStatusChange={(value) => { setStatus(value); setCursor(undefined); }} onRunChange={(value) => { setSelectedId(value); setReturnedRun(undefined); }} />
    <div className="flex gap-3"><Button variant="outline" disabled={busy || refreshPending || !list.data?.previous || Boolean(list.error)} onClick={() => pageCursor(list.data?.previous ?? null)}>Newer runs</Button><Button variant="outline" disabled={busy || refreshPending || !list.data?.next || Boolean(list.error)} onClick={() => pageCursor(list.data?.next ?? null)}>Older runs</Button></div>
    {list.isLoading || current.isLoading || detail.isLoading ? <p role="status">Loading finance runs…</p> : null}
    {readError && !refreshPending ? <div role="alert">Could not refresh finance runs: {readError instanceof Error ? readError.message : "Request failed"}. <Button variant="outline" onClick={() => void refresh()}>Retry</Button></div> : null}
    {!list.isLoading && !list.error && list.data?.results.length === 0 ? <p>No runs match these filters.</p> : null}
    {current.data && !current.error && !current.data.compatible ? <p role="status">Current compatibility: {current.data.compatibility_reason?.code ?? "Unavailable"}</p> : null}
    <form onSubmit={(event) => { event.preventDefault(); void upload(); }} className="space-y-4 rounded-lg border bg-card p-5" aria-busy={uploadState === "uploading"}>
      <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (busy || refreshPending) return; if (event.dataTransfer.files.length !== 1) { setFile(undefined); setUploadState("error"); setMessage("Select one .xlsx workbook at a time."); } else chooseFile(event.dataTransfer.files[0]); }} className="rounded-md border border-dashed p-5">
        <label className="block">Drop or select an .xlsx workbook (maximum 32 MiB)
          <input type="file" accept=".xlsx" disabled={busy || refreshPending} className="mt-3 block w-full text-sm" onChange={(event) => chooseFile(event.target.files?.[0])} />
        </label>
      </div>
      <Button type="submit" disabled={busy || refreshPending || !file}>Upload workbook for {year}</Button>
      <UploadStatus state={uploadState} message={message} />
    </form>
    <div ref={summary} tabIndex={-1} aria-label="Selected run summary" className="outline-offset-4">
      {selectedRun ? <FinanceRunSummary run={selectedRun} currentId={currentId} currentRun={currentDetail.error ? undefined : currentDetail.data} disabled={busy || refreshPending || Boolean(readError)} onAction={openAction} /> : null}
    </div>
    {!action ? <p role={mutationError ? "alert" : "status"} aria-live="polite">{mutationMessage}</p> : null}
    {refreshPending && !action ? <Button variant="outline" disabled={mutating} onClick={() => void retryPublicationRefresh()}>Retry refresh</Button> : null}
    <Dialog open={action !== null} onOpenChange={(open) => { if (!open && !mutating) setAction(null); }}>
      <DialogContent showCloseButton={!mutating} onCloseAutoFocus={(event) => { event.preventDefault(); if (opener.current?.isConnected) opener.current.focus(); else summary.current?.focus(); }} onEscapeKeyDown={(event) => { if (mutating) event.preventDefault(); }} onInteractOutside={(event) => { if (mutating) event.preventDefault(); }}>
        <DialogTitle>{action === "demote" ? "Confirm demotion" : selectedRun?.status === "superseded" ? "Confirm re-approval" : "Confirm approval"}</DialogTitle>
        <DialogDescription>{action === "demote" ? "Restore the server-selected predecessor as current. A note is required; the same integrity, findings and anti-rollback checks apply." : "Make this run current for reader pages. The server will recheck integrity, findings and anti-rollback requirements."}</DialogDescription>
        {action ? <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void confirm(); }}>
          <fieldset disabled={mutating}><ApprovalFields action={action} requirements={requirements} options={options} onChange={setOptions} /></fieldset>
          <p role={mutationError ? "alert" : "status"} aria-live={mutationError ? "assertive" : "polite"}>{mutationMessage}</p>
          <div className="flex gap-3"><Button type="button" variant="outline" disabled={mutating} onClick={() => setAction(null)}>Cancel</Button><Button type="submit" disabled={mutating || !approvalReady(action, requirements, options)}>{mutating ? "Applying…" : action === "demote" ? "Confirm demotion" : "Confirm approval"}</Button></div>
        </form> : null}
      </DialogContent>
    </Dialog>
  </div>;
}

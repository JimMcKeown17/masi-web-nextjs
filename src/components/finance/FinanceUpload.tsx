"use client";

import { financeCurrentMessage } from "@/lib/finance/currentMessage";
import { useLayoutEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import useSWR, { useSWRConfig } from "swr";
import { useUser } from "@/components/providers/UserProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { canPublishFinance } from "@/lib/finance/access";
import { approveFinanceRun, demoteFinanceRun, financeRunsCacheKey, FinanceRunApiError, getFinanceCurrent, getFinanceRun, getFinanceRuns, getBudgetLedgerDependencies, uploadFinanceRun, pullFinanceBudget } from "@/lib/api/finance-runs";
import type { ApprovalOptions, FinanceRun, FinanceRunAction, FinanceRunKind, FinanceRunStatus } from "@/lib/types/finance-runs";
import { FinanceRunSelector } from "./FinanceRunSelector";
import { FinanceRunSummary } from "./FinanceRunSummary";

type Requirements = Pick<ApprovalOptions, "acknowledge_findings" | "override_anti_rollback">;
const NO_REQUIREMENTS: Requirements = { acknowledge_findings: false, override_anti_rollback: false };
const EMPTY_OPTIONS: ApprovalOptions = { ...NO_REQUIREMENTS, note: "" };
type UploadState = "idle" | "uploading" | "success" | "error";

function budgetPullMessage(code?: string): string {
  const reasons: Record<string, string> = {
    BUDGET_PULL_NOT_CONFIGURED: "Google Sheets refresh is not configured for this year. Ask an administrator to check the connection.",
    BUDGET_PULL_ACCESS_DENIED: "Google Sheets access was denied. Ask an administrator to check the sheet's read permission and Google API setup.",
    BUDGET_PULL_QUOTA: "Google Sheets is temporarily limiting requests. Wait before trying again.",
    BUDGET_PULL_TIMEOUT: "Google Sheets did not respond in time. Try again when the connection is available.",
    BUDGET_PULL_SOURCE_CHANGED: "The sheet changed during export. Wait until editing has paused, then refresh again.",
    BUDGET_PULL_METADATA_INVALID: "Google Sheets did not provide valid source modification information.",
    BUDGET_PULL_SIZE_LIMIT: "The Google response exceeded the permitted size.",
    UPLOAD_IN_PROGRESS: "Another finance workbook is still processing for this year. Wait before trying again.",
    HTTP_403: "Your account no longer has finance publish access. Ask an administrator to check your permissions.",
  };
  return `${reasons[code ?? ""] ?? "The Sheets refresh could not complete. Review your connection and selected ledger, then try again."} You can also upload an exported workbook below; your ledger selection is preserved.`;
}

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
  const [year,setYear] = useState(new Date().getFullYear());
  const [kind,setKind] = useState<FinanceRunKind>("funders");
  return <FinanceUploadContext key={`${userId}:${kind}:${year}`} userId={userId} getToken={getToken} year={year} setYear={setYear} kind={kind} setKind={setKind}/>;
}
function FinanceUploadContext({userId,getToken,year,setYear,kind,setKind}: {userId:string;getToken:()=>Promise<string|null>;year:number;setYear:(year:number)=>void;kind:FinanceRunKind;setKind:(kind:FinanceRunKind)=>void}) {
  const { mutate } = useSWRConfig();
  const active = useRef(true);
  useLayoutEffect(()=>{active.current=true;return ()=>{active.current=false;};},[]);
  const [ledgerSelection,setLedgerRunId] = useState<string | null>(null);
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
    if (!active.current) throw new Error("Selection changed.");
    const value = await getToken();
    if (!active.current) throw new Error("Selection changed.");
    if (!value) throw new Error("Not authenticated. Sign in again.");
    return value;
  }
  const list = useSWR(financeRunsCacheKey(userId, `list:${kind}:${year}:${status}:${cursor ?? ""}`), async () => getFinanceRuns(await token(), { kind, year, status: status || undefined, cursor }));
  const current = useSWR(financeRunsCacheKey(userId, `current:${year}`), async () => getFinanceCurrent(await token(), year));
  const detail = useSWR(selectedId ? financeRunsCacheKey(userId, `detail:${selectedId}`) : null, async () => getFinanceRun(await token(), selectedId));
  const currentId = current.error ? undefined : current.data?.runs[kind]?.id;
  const currentDetail = useSWR(currentId ? financeRunsCacheKey(userId, `detail:${currentId}`) : null, async () => getFinanceRun(await token(), currentId!));
  const dependencies = useSWR(kind === "budgets" ? financeRunsCacheKey(userId, `dependencies:funders:${year}`) : null, async()=>getBudgetLedgerDependencies(token,year));
  // The API returns eligible approved runs newest first. An explicit choice is preserved.
  const ledgerRunId = ledgerSelection ?? (!dependencies.error ? dependencies.data?.[0]?.id : undefined) ?? "";
  const eligibleLedger = !dependencies.error && dependencies.data?.find(run=>run.id===ledgerRunId);
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
        getFinanceRuns(authToken, { kind, year, status: status || undefined, cursor }),
        getFinanceRun(authToken, selectedId),
      ]);
      if (!active.current) return;
      const nextCurrentId = nextCurrent.runs[kind]?.id;
      const nextCurrentDetail = nextCurrentId
        ? nextCurrentId === selectedId ? nextDetail : await getFinanceRun(authToken, nextCurrentId)
        : undefined;
      if (!active.current) return;
      await Promise.all([
        mutate(financeRunsCacheKey(userId, `current:${year}`), nextCurrent, { revalidate: false }),
        mutate(financeRunsCacheKey(userId, `list:${kind}:${year}:${status}:${cursor ?? ""}`), nextList, { revalidate: false }),
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
  async function upload(source: "file" | "sheets" = "file") {
    if ((source === "file" && !file) || (source === "sheets" && kind !== "budgets") || busyRef.current || refreshPending || (kind === "budgets" && !eligibleLedger)) return;
    const error = source === "file" && file ? validateFinanceFile(file) : null;
    if (error) { setMessage(error); setUploadState("error"); return; }
    busyRef.current = true;
    setUploadState("uploading"); setMessage(source === "sheets" ? "Fetching Google Sheets export and processing workbook. Please wait." : "Uploading and processing workbook. Please wait.");
    try {
      const result = source === "sheets"
        ? await pullFinanceBudget(await token(), year, ledgerRunId)
        : await uploadFinanceRun(await token(), file!, year, kind === "budgets" ? {kind,ledgerRunId} : {kind});
      if (!active.current) return;
      if (result.status === 400 || result.status === 409) {
        setUploadState("error");
        setMessage(source === "sheets" ? budgetPullMessage(result.error.code) : result.error.code === "UPLOAD_IN_PROGRESS" ? "UPLOAD_IN_PROGRESS: another upload for this year is still processing. Wait, then retry the same file." : `${result.error.code}: ${result.error.detail}`);
        return;
      }
      const run = result.run;
      setReturnedRun(run); setSelectedId(run.id); setStatus(""); setCursor(undefined);
      setUploadState(run.status === "failed" ? "error" : "success");
      setMessage(run.status === "candidate" ? `Import complete. Awaiting approval. Review the summary below and choose Review and approve to publish ${kind === "budgets" ? "this budget on Overview and Budgets" : "these Management Accounts"}.` : run.status === "failed" ? "Import stopped. See the explanation and next steps in the summary below. No new figures have been published." : `${result.status === 200 ? "Existing run returned" : "Import completed"}. Review the summary below.`);
      await refresh();
      summary.current?.focus();
    } catch (error) {
      if (!active.current) return;
      setUploadState("error");
      setMessage(source === "sheets" ? budgetPullMessage(error instanceof FinanceRunApiError ? error.code : undefined) : `${error instanceof Error ? error.message : "Upload failed"}. If the response was lost, retry the same file to retrieve its existing run.`);
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
      if (!active.current) {
        // The mutation still changed shared state after navigation/account change.
        // Fence old reads, then let mounted consumers fetch with their own actor.
        await mutate((key)=>typeof key === "string" && (key.startsWith("/operations/finance/runs?user=") || key.startsWith("/operations/finance/snapshot?user=")), undefined, {revalidate:true});
        return;
      }
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
  function fileUpload() {
    return <div className="space-y-4">
      <div onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); if (busy || refreshPending) return; if (event.dataTransfer.files.length !== 1) { setFile(undefined); setUploadState('error'); setMessage('Select one .xlsx workbook at a time.'); } else chooseFile(event.dataTransfer.files[0]); }} className="rounded-lg border-2 border-dashed bg-muted/20 p-6 sm:p-8">
        <label className="block text-sm font-medium">Drop your workbook here, or choose a file
          <input type="file" accept=".xlsx" disabled={busy || refreshPending} className="mt-4 block w-full min-w-0 text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-2 file:font-medium file:text-foreground" onChange={event => chooseFile(event.target.files?.[0])} />
        </label><p className="mt-3 text-xs text-muted-foreground">Excel workbook (.xlsx), up to 32 MiB.</p>
        {file ? <p className="mt-3 break-words text-sm font-medium">Ready to upload: {file.name}</p> : null}
      </div>
      <Button type="submit" size="lg" className="h-auto min-h-12 w-full whitespace-normal bg-[#1D4ED8] px-5 py-3 text-white hover:bg-[#1740B0] sm:w-auto" disabled={busy || refreshPending || !file || (kind === 'budgets' && !eligibleLedger)}>{kind === 'budgets' ? 'Upload budget workbook' : 'Upload Management Accounts'}</Button>
    </div>;
  }
  const readError = list.error || current.error || detail.error || currentDetail.error;
  return <div className="space-y-6">
    <header><h1 className="font-serif text-3xl">Update finance workbooks</h1><p className="mt-2 text-muted-foreground">Import the latest accounts or budget, then review and approve them for the dashboard.</p></header>
    <div role="tablist" aria-label="Workbook type" className="inline-flex max-w-full gap-1 rounded-lg border bg-card p-1">
      {([['funders', 'Management Accounts'], ['budgets', 'Budget']] as const).map(([value, label]) => <button key={value} id={`import-tab-${value}`} type="button" role="tab" aria-selected={kind === value} aria-controls="finance-import-panel" tabIndex={kind === value ? 0 : -1}
        onClick={() => setKind(value)} onKeyDown={event => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 'funders' : event.key === 'End' ? 'budgets' : kind === 'funders' ? 'budgets' : 'funders'; setKind(next); requestAnimationFrame(() => document.getElementById(`import-tab-${next}`)?.focus()); } }}
        className={`rounded-md px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${kind === value ? 'bg-[#1D4ED8] text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>{label}</button>)}
    </div>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <div id="finance-import-panel" role="tabpanel" aria-labelledby={`import-tab-${kind}`} className="min-w-0 space-y-4">
        <form onSubmit={(event) => { event.preventDefault(); void upload(); }} className="space-y-6 rounded-xl border bg-card p-5 sm:p-7" aria-busy={uploadState === "uploading"}>
          <div><p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{year} · {kind === 'budgets' ? 'Organisation budget' : 'Management Accounts'}</p>
            <h2 className="mt-2 font-serif text-2xl">{kind === 'budgets' ? 'Bring your budget up to date' : 'Upload your latest accounts'}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{kind === 'budgets' ? 'Pull the latest figures from your connected Google Sheet.' : 'Choose the updated Management Accounts workbook to prepare it for review.'}</p>
          </div>
          {kind === "budgets" ? <>
            <Button type="button" size="lg" className="h-auto min-h-12 w-full whitespace-normal bg-[#1D4ED8] px-5 py-3 text-white hover:bg-[#1740B0] sm:w-auto" disabled={busy || refreshPending || !eligibleLedger} onClick={() => void upload("sheets")}>Refresh budget from Google Sheets</Button>
            <div className="space-y-2 text-sm">
              {eligibleLedger ? <p className="break-words text-muted-foreground">Using Management Accounts: <span className="font-medium text-foreground">{eligibleLedger.source_name}</span></p> : null}
              {dependencies.isLoading ? <p role="status">Loading approved Management Accounts…</p> : null}
              {dependencies.error ? <p role="alert">Could not load approved Management Accounts. <Button type="button" variant="link" onClick={()=>void dependencies.mutate()}>Retry sources</Button></p> : null}
              {!dependencies.isLoading && !dependencies.error && !eligibleLedger ? <p role="status">Upload and approve Management Accounts for {year} before importing a budget.</p> : null}
              <details><summary className="w-fit cursor-pointer font-medium text-blue-700 dark:text-blue-400">Change source</summary>
                <label className="mt-3 block">Management Accounts source<select aria-label="Management Accounts source" className="mt-1 w-full rounded border bg-background p-2" value={ledgerRunId} disabled={busy || refreshPending || dependencies.isLoading} onChange={event=>setLedgerRunId(event.target.value)}><option value="">Select approved Management Accounts</option>{!dependencies.error ? dependencies.data?.map(run=><option key={run.id} value={run.id}>{run.source_name} ({run.id})</option>) : null}</select></label>
                <p className="mt-2 text-muted-foreground">The most recent eligible upload is selected by default. Choose another source only if this budget needs it.</p>
              </details>
              <p className="text-muted-foreground">Imports the latest budget for review. Approval updates the dashboard.</p>
            </div>
          </> : null}
          {kind === 'budgets' ? <details className="border-t pt-4"><summary className="cursor-pointer text-sm font-medium">Upload a budget workbook instead</summary><div className="mt-4 space-y-4">{fileUpload()}</div></details> : fileUpload()}
          <UploadStatus state={uploadState} message={message} />
        </form>
        {readError && !refreshPending ? <div role="alert">Could not refresh finance imports. <Button variant="outline" onClick={() => void refresh()}>Retry</Button></div> : null}
        {current.data && !current.error && !current.data.compatible ? <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">{financeCurrentMessage(current.data)}</p> : null}
      </div>
      <aside aria-label="Import context and history" className="min-w-0 space-y-5 rounded-xl border bg-card p-5 text-sm">
        <details><summary className="cursor-pointer">Accounting year: <strong>{year}</strong> <span className="ml-2 text-blue-700 dark:text-blue-400">Change</span></summary>
          <label className="mt-3 block">Accounting year<input type="number" min={1} max={32767} value={year} className="mt-1 w-full rounded-md border bg-background p-2" onChange={event => { const next = Number(event.target.value); if (Number.isInteger(next) && next >= 1 && next <= 32767) setYear(next); }} /></label>
        </details>
        <section className="space-y-2 border-t pt-4"><h2 className="font-medium">Currently on the dashboard</h2>
          {current.isLoading || currentDetail.isLoading ? <p className="text-muted-foreground">Loading approved source…</p> : current.error || currentDetail.error ? <p className="text-muted-foreground">Approved source could not be checked.</p> : currentDetail.data ? <><p className="break-words text-muted-foreground">{currentDetail.data.source_name}</p><button type="button" className="text-blue-700 hover:underline dark:text-blue-400" disabled={busy || refreshPending} onClick={() => { setSelectedId(currentDetail.data!.id); setReturnedRun(undefined); }}>View approved import</button></> : <p className="text-muted-foreground">No approved {kind === 'budgets' ? 'budget' : 'Management Accounts'} for {year} yet.</p>}
        </section>
        <details className="border-t pt-4"><summary className="cursor-pointer font-medium">Import history</summary><div className="mt-4 space-y-4">
          <FinanceRunSelector year={year} showYear={false} status={status} selectedId={selectedId} selectedRun={selectedRun} runs={list.error ? [] : list.data?.results ?? []} currentId={currentId} disabled={busy || refreshPending || action !== null}
            onYearChange={setYear} onStatusChange={(value) => { setStatus(value); setCursor(undefined); }} onRunChange={(value) => { setSelectedId(value); setReturnedRun(undefined); }} />
          <div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" disabled={busy || refreshPending || !list.data?.previous || Boolean(list.error)} onClick={() => pageCursor(list.data?.previous ?? null)}>Newer imports</Button><Button type="button" size="sm" variant="outline" disabled={busy || refreshPending || !list.data?.next || Boolean(list.error)} onClick={() => pageCursor(list.data?.next ?? null)}>Older imports</Button></div>
          {list.isLoading ? <p role="status">Loading imports…</p> : null}
          {!list.isLoading && !list.error && list.data?.results.length === 0 ? <p>No imports match these filters.</p> : null}
        </div></details>
      </aside>
    </div>
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
          <div className="flex gap-3"><Button type="button" variant="outline" disabled={mutating} onClick={() => setAction(null)}>Cancel</Button><Button type="submit" className="bg-[#1D4ED8] text-white hover:bg-[#1740B0]" disabled={mutating || !approvalReady(action, requirements, options)}>{mutating ? "Applying…" : action === "demote" ? "Confirm demotion" : "Confirm approval"}</Button></div>
        </form> : null}
      </DialogContent>
    </Dialog>
  </div>;
}

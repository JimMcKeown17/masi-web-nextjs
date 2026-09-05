import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import { FinanceUploadSession } from "../../src/components/finance/FinanceUpload";
import { runFixture } from "../../src/components/finance/financeRunTestFixture";
import type { FinanceRun } from "../../src/lib/types/finance-runs";

const imported = runFixture({ id: "import", status: "approved", schema_version: "1.0.0", producer_version: null, approved_by: 1, approved_at: "2026-09-01T00:00:00Z", allowed_actions: [] });
let candidate = runFixture({ in_scope_error_count: 1 });
let current: FinanceRun = imported;
let uploads = 0;
const requests: string[] = [];
window.fetch = async (input, init) => {
  const url = new URL(String(input), "https://mock.invalid");
  requests.push(`${init?.method ?? "GET"} ${url.pathname}`);
  const json = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status }));
  if (url.pathname.endsWith("/current/")) return json({ accounting_year: 2026, runs: { funders: { ...current, management_accounts_sha256: current.source_sha256 } }, compatible: true, compatibility_reason: null });
  if (url.pathname.endsWith("/runs/") && init?.method === "POST") { uploads++; return json(candidate, uploads === 1 ? 201 : 200); }
  if (url.pathname.endsWith("/runs/")) return json({ results: [candidate, imported], next: null, previous: null });
  if (url.pathname.endsWith("/approve/")) {
    const options = JSON.parse(String(init?.body));
    if (!options.override_anti_rollback) return json({ code: "ANTI_ROLLBACK", detail: "Review source rollback" }, 409);
    if (!options.acknowledge_findings) return json({ code: "FINDINGS_ACKNOWLEDGEMENT_REQUIRED", detail: "Review findings" }, 409);
    candidate = { ...candidate, status: "approved", previous_approved: "import", approved_by: 1, approved_at: "2026-09-05T00:00:00Z", allowed_actions: ["demote"] };
    imported.status = "superseded"; current = candidate; return json(candidate);
  }
  if (url.pathname.endsWith("/demote/")) {
    const options = JSON.parse(String(init?.body));
    if (!options.note.trim()) return json({ code: "NOTE_REQUIRED" }, 409);
    if (!options.override_anti_rollback) return json({ code: "ANTI_ROLLBACK", detail: "Restore older source" }, 409);
    candidate = { ...candidate, status: "superseded", allowed_actions: ["approve"] };
    imported.status = "approved"; current = imported; return json(imported);
  }
  return json(url.pathname.includes("/import/") ? imported : candidate);
};
const pause = () => new Promise((resolve) => setTimeout(resolve, 30));
async function until(predicate: () => unknown, label: string) {
  for (let attempt = 0; attempt < 100; attempt++) { if (predicate()) return; await pause(); }
  throw new Error(`Timed out: ${label}`);
}
function check(condition: unknown, label: string) { if (!condition) throw new Error(label); }
function button(label: string, scope: ParentNode = document) {
  const found = [...scope.querySelectorAll("button")].find((element) => element.textContent === label);
  if (!found) throw new Error(`Missing button: ${label}`);
  return found;
}
function dialog() { return document.querySelector<HTMLElement>('[role="dialog"]')!; }
function checkbox(label: string) {
  const found = [...dialog().querySelectorAll("label")].find((element) => element.textContent?.includes(label))?.querySelector<HTMLInputElement>("input");
  if (!found) throw new Error(`Missing checkbox: ${label}`);
  return found;
}
function note(value: string) {
  const input = dialog().querySelector("textarea")!;
  Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}
function click(label: string, scope: ParentNode = document) { const element = button(label, scope); element.focus(); element.click(); }
async function approve() {
  click("Confirm approval", dialog());
  await until(() => dialog()?.textContent?.includes("Override anti-rollback"), "rollback guard");
  check(!dialog().textContent?.includes("Acknowledge in-scope findings"), "Acknowledgement appeared before API required it");
  checkbox("Override anti-rollback").click(); await pause();
  check(button("Confirm approval", dialog()).disabled, "Override must require a note");
  note("Reviewed source and findings"); await pause();
  click("Confirm approval", dialog());
  await until(() => dialog()?.textContent?.includes("Acknowledge in-scope findings"), "finding guard");
  check(dialog().querySelector("textarea")?.value === "Reviewed source and findings", "Guard response discarded note");
  checkbox("Acknowledge in-scope findings").click(); await pause();
  click("Confirm approval", dialog());
  await until(() => !dialog() && document.body.textContent?.includes("Approved server state refreshed"), "approval refresh");
}
async function run() {
  createRoot(document.getElementById("root")!).render(<SWRConfig value={{ provider: () => new Map(), revalidateOnFocus: false }}><FinanceUploadSession userId="browser-test" getToken={async () => "test-token"} /></SWRConfig>);
  await until(() => document.querySelector('input[type="file"]'), "upload form");
  const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
  const transfer = new DataTransfer(); transfer.items.add(new File(["test workbook"], "20260901 Masi.xlsx")); input.files = transfer.files; input.dispatchEvent(new Event("change", { bubbles: true })); await pause();
  click(`Upload workbook for ${new Date().getFullYear()}`);
  await until(() => document.body.textContent?.includes("Candidate created"), "candidate result");
  await until(() => [...document.querySelectorAll("button")].some((item) => item.textContent === "Approve" && !item.disabled), "candidate action");
  click("Approve"); await until(() => dialog(), "confirmation"); await pause();
  check(dialog().contains(document.activeElement), "Dialog did not receive focus");
  check(!dialog().querySelector('input[type="checkbox"]'), "Premature guard checkboxes");
  const cancel = button("Cancel", dialog()); cancel.focus();
  // Radix traps programmatic focus as well as keyboard traversal.
  input.focus(); await pause(); check(dialog().contains(document.activeElement), "Focus escaped modal");
  click("Cancel", dialog()); await until(() => !dialog(), "cancel"); await pause();
  check(document.activeElement?.textContent === "Approve", "Cancel failed to restore trigger focus");
  click("Approve"); await pause(); await approve();
  click("Demote"); await pause();
  check(button("Confirm demotion", dialog()).disabled, "Demotion needs a note");
  note("Restore imported predecessor"); await pause(); click("Confirm demotion", dialog());
  await until(() => dialog()?.textContent?.includes("Override anti-rollback"), "demotion guard");
  checkbox("Override anti-rollback").click(); await pause(); click("Confirm demotion", dialog());
  await until(() => !dialog() && current.id === "import", "import restored");
  click(`Upload workbook for ${new Date().getFullYear()}`);
  await until(() => document.body.textContent?.includes("Idempotent replay"), "replay");
  await until(() => [...document.querySelectorAll("button")].some((item) => item.textContent === "Re-approve" && !item.disabled), "reapprove action");
  click("Re-approve"); await pause(); await approve();
  check(current.id === candidate.id, "Recovery sequence did not restore candidate");
  check(requests.filter((item) => item.includes("/current/")).length >= 4, "Current state not refreshed after mutations");
  document.getElementById("result")!.textContent = "PASS: upload, dialog focus containment/return, separate API guards, notes, approval, imported predecessor demotion, idempotent replay, re-approval and current refresh";
}
run().catch((error) => { document.getElementById("result")!.textContent = `FAIL: ${error.message}`; });

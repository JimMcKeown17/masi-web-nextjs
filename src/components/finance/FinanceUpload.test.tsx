import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { validateFinanceFile, UploadStatus, ApprovalFields, approvalReady, requirementsAfterError } from "./FinanceUpload";
import { FinanceRunSummary } from "./FinanceRunSummary";
import { runFixture } from "./financeRunTestFixture";

test("client rejects wrong extensions, empty files and files above 32 MiB before upload", () => {
  assert.match(validateFinanceFile({ name: "data.csv", size: 10 })!, /xlsx/);
  assert.match(validateFinanceFile({ name: "data.xlsx", size: 33554433 })!, /32 MiB/);
  assert.match(validateFinanceFile({ name: "data.xlsx", size: 0 })!, /empty/);
  assert.equal(validateFinanceFile({ name: "data.XLSX", size: 33554432 }), null);
});

test("upload outcomes distinguish candidate, failed, replay, conflict and accessible progress/errors", () => {
  const cases = [
    ["uploading", "Uploading and processing", /role="status"/, /<progress/],
    ["success", "Candidate created", /Candidate created/, /role="status"/],
    ["success", "Idempotent replay", /Idempotent replay/, /role="status"/],
    ["error", "UPLOAD_IN_PROGRESS", /UPLOAD_IN_PROGRESS/, /role="alert"/],
    ["error", "Failed run", /Failed run/, /role="alert"/],
  ] as const;
  for (const [state, message, a, b] of cases) {
    const html = renderToStaticMarkup(<UploadStatus state={state} message={message} />);
    assert.match(html, a); assert.match(html, b);
  }
});

test("confirmation separates API-required acknowledgement and rollback override and requires notes", () => {
  const none = { acknowledge_findings: false, override_anti_rollback: false };
  const ack = requirementsAfterError(none, "FINDINGS_ACKNOWLEDGEMENT_REQUIRED");
  const both = requirementsAfterError(ack, "ANTI_ROLLBACK");
  assert.deepEqual(ack, { acknowledge_findings: true, override_anti_rollback: false });
  const options = { ...none, note: "" };
  const render = (required: typeof none) => renderToStaticMarkup(<ApprovalFields action="approve" requirements={required} options={options} onChange={() => {}} />);
  assert.doesNotMatch(render(none), /type="checkbox"/);
  assert.match(render(ack), /Acknowledge in-scope findings/);
  assert.doesNotMatch(render(ack), /Override anti-rollback/);
  assert.match(render(both), /Override anti-rollback/);
  assert.equal(approvalReady("approve", none, options), true);
  assert.equal(approvalReady("approve", ack, { ...options, acknowledge_findings: true }), false);
  assert.equal(approvalReady("approve", ack, { ...options, acknowledge_findings: true, note: "Reviewed" }), true);
  assert.equal(approvalReady("approve", both, { ...options, acknowledge_findings: true, note: "Reviewed" }), false);
  assert.equal(approvalReady("demote", none, options), false);
  assert.equal(approvalReady("demote", none, { ...options, note: "Restore predecessor" }), true);
});

test("summary exposes re-approval, checked demotion and failed terminal state", () => {
  const render = (run: ReturnType<typeof runFixture>, currentId?: string) => renderToStaticMarkup(<FinanceRunSummary run={run} currentId={currentId} onAction={() => {}} />);
  assert.match(render(runFixture({ status: "superseded" })), /Re-approve/);
  assert.doesNotMatch(render(runFixture({ status: "failed", payload: null, allowed_actions: [], failure: { code: "INVALID_XLSX", phase: "parse", message: "Invalid workbook" } })), />Approve</);
  assert.match(render(runFixture({ id: "current", status: "approved", previous_approved: "import", allowed_actions: ["demote"] }), "current"), /Demote/);
  assert.doesNotMatch(render(runFixture({ status: "approved", previous_approved: null, allowed_actions: ["demote"] })), />Demote</);
});

test("summary shows provenance, measurements and findings separated by severity and scope", () => {
  const findings = (["error", "warn", "info"] as const).flatMap((severity) => [true, false].map((in_scope_year) => ({ code: "PARSER_WARNING", severity, in_scope_year, message: `Finding-${severity}-${in_scope_year}`, source: "Contract Key", sheet_row: 12 })));
  const run = runFixture({ payload: { findings }, finding_count: 6 });
  const html = renderToStaticMarkup(<FinanceRunSummary run={run} currentRun={runFixture({ id: "current", status: "approved" })} currentId="current" onAction={() => {}} />);
  for (const label of ["Candidate source", "Current approved source", "SHA-256", "0.2.0", "2.0.0", "100 ms", "200 ms", "1000 bytes", "Ledger rows", "Allocations", "Outside 2026", "Contract Key"]) assert.ok(html.includes(label), label);
  for (const finding of findings) assert.ok(html.includes(finding.message));
});

test("confirmation marks the note required for demotion and checked guard options", () => {
  const options = { acknowledge_findings: false, override_anti_rollback: false, note: "" };
  const html = renderToStaticMarkup(<ApprovalFields action="demote" requirements={options} options={options} onChange={() => {}} />);
  assert.match(html, /<textarea[^>]*required=""/);
  const ackHtml = renderToStaticMarkup(<ApprovalFields action="approve" requirements={{ ...options, acknowledge_findings: true }} options={{ ...options, acknowledge_findings: true }} onChange={() => {}} />);
  assert.match(ackHtml, /<textarea[^>]*required=""/);
});

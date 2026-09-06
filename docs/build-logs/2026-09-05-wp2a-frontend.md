# WP2a stage 3: frontend

Status: local implementation in progress; base eb434c0. No deployment evidence.

## RED evidence

- `node --import tsx --test src/lib/api/finance-runs.test.ts src/components/finance/FinanceNav.test.tsx`: 6 passed, 2 failed. API file failed with missing `./finance-runs` (raw XLSX metadata/no-cache, typed upload outcomes, read/mutation contract tests could not load). Navigation `Upload capability gate: ADMIN` failed `false !== true`. Recorded before implementation.

## Contract boundary

Approved revision 4 sections 3.6, 3.7, 4.1–4.3 and 8.1. Read-only inspection of the sibling backend's `api/views/finance_runs.py` and `api/services/finance_runs.py` establishes the implemented serializer fields, cursor envelope and guard errors. `allowed_actions` is a string array; approval requirements arrive as `ANTI_ROLLBACK` and `FINDINGS_ACKNOWLEDGEMENT_REQUIRED` responses. No client inference of rollback rules. Upload is the next backend stage.
- API/navigation GREEN: the same focused command passed 10/10 after implementation.
- `node --import tsx --test src/components/finance/FinanceUpload.test.tsx src/components/finance/FinanceRunSelector.test.tsx`: both files failed to load missing components before implementation. Named cases: client extension/size/empty checks; candidate/failure/replay/conflict/progress; separate guard requirements and notes; re-approval/demotion/failed actions; selector status/current/selection stability.
- UI GREEN: the same focused command passed 5/5.
- Reader RED: `node --import tsx --test src/lib/finance/fixture.test.ts src/components/finance/HygienePanel.test.tsx`: 6 passed, 2 failed. `projected 1.1.0 fixture validates while 1.0.0 remains unchanged` failed because the schema copy did not exist; `1.1.0 findings retain every severity and historical scope` failed because Hygiene grouped by code/scope and hid the distinct warning/info severity labels. Grouping now includes severity.
- Reader GREEN: the same focused command passed 8/8. The supervisor explicitly adds PARSER_WARNING beyond revision 4's three codes. The inspected backend 1.1.0 schema omits it; this frontend schema includes it. Cross-repository canonical schema/fixture alignment is PENDING with the supervisor. The 1.1.0 fixture is synthetic reader coverage, not a release golden fixture; original 1.0.0 fixture/schema digests are unchanged.

## Implementation

- Added bearer/no-store list, detail, current, approve, demote and raw XLSX upload clients. Query metadata includes source name and optional client modified-at; only Authorization and standard Content-Type headers are sent. Upload results preserve 201/200/409/400 distinctions and stable errors.
- Upload page checks both `/api/me/` capabilities server-side. Navigation and client entry fail closed without both. Local state remounts on account change; SWR keys include the account. Reader pages retain the original snapshot client/hook.
- Run browsing uses bounded server cursor pages, year/status controls and explicit status/current labels. Pagination extracts only a cursor, never sends credentials to an API-provided URL. A selected detail stays selected across pages/status filters.
- Upload supports select/drop, extension/empty/32 MiB checks and an indeterminate accessible upload/processing indicator. Candidate/failed/replay/concurrent states are distinct. Summaries show provenance, source comparison, producer/schema, timing/memory/counts, failures and findings by severity and scope.
- Radix modal confirmation contains focus and explicitly restores the action trigger or summary. Separate guard checkboxes appear only after the API requires them; notes are required for either checked guard and every demotion. The server chooses the predecessor. Mutations refresh account-scoped current/list/detail and existing reader caches; failed reads suppress actions. Superseded replay exposes Re-approve.
- Additive 1.1.0 types/schema/synthetic fixture preserve all old reader tests and exercise all new finding severities/scopes. Hygiene grouping includes severity so a code with mixed severities cannot hide warning/info labels.

## Browser evidence boundary

`node scripts/finance/check-upload-browser.mjs` bundles the real upload session, with mocked host authentication and HTTP responses, using the installed esbuild dependency of tsx. Initial bundling exposed the Next host-auth boundary; isolating that boundary made bundling succeed. Chrome launch then failed with SIGABRT (no stdout/stderr) in this sandbox. The script cleans its local temporary directory. No focus/interaction or visual PASS is claimed.

The retained harness checks actual dialog focus containment/return, required notes, API-triggered guards, upload, approval, demotion to an imported predecessor, replay/re-approval and current refresh. Run with local Chrome, or set CHROME_BIN to another installed Chrome binary. This optional browser command is separate from the portable Node unit suite.

## Release dependencies / PENDING

- `pnpm build`: intentionally not run; supervisor owns font/network-capable build.
- Browser harness execution; responsive, light/dark and keyboard visual review; authenticated live role/reader/upload probes. No E2E/live/production proof from unit/SSR tests.
- Backend upload stage and endpoint integration; capacity/import/cutover/deployment gates remain with the supervisor. No frontend migration, environment variable or schedule added; existing NEXT_PUBLIC_API_URL must end in /api.
- PARSER_WARNING schema enum alignment across publisher/backend/frontend and release golden digest verification.

## Final verification

- `pnpm test:unit`: PASS, 69 tests, 0 failures, 0 skipped. All four new unit-test files are appended to the explicit package.json list.
- `pnpm exec tsc --noEmit`: PASS, exit 0, no diagnostics.
- `pnpm lint`: PASS, exit 0, 0 errors, 0 new warnings. The existing `@next/next/no-img-element` warning at `src/app/image-debug/page.tsx:56` remains unchanged; no unrelated page edits.
- `git diff --check`: PASS.
- `pnpm build`: PENDING, supervisor only.

## Git handoff

Uncommitted. Staging the explicit 25 changed/new paths failed: `Unable to create .../.git/index.lock: Operation not permitted` (exit 128). No commit or push occurred; all implementation files remain in this clone for the supervisor.

## Review fixes, round 1

### RED

Before implementation, `pnpm test:unit` exited 1: 77 tests, 69 passed, 8 failed,
0 cancelled, 0 skipped. Failing names:

- `approve clears inactive account snapshots before delayed reader remount`
- `demote clears inactive account snapshots before delayed reader remount`
- `approve: failed post-mutation current GET reports pending and retries reads only`
- `approve: failed post-mutation list GET reports pending and retries reads only`
- `approve: failed post-mutation detail GET reports pending and retries reads only`
- `demote: failed post-mutation current GET reports pending and retries reads only`
- `demote: failed post-mutation list GET reports pending and retries reads only`
- `demote: failed post-mutation detail GET reports pending and retries reads only`

The snapshot cases failed because superseded figures remained during a delayed GET;
the six failed-read cases rejected the false refreshed-state announcement. These
are DOM interaction tests with the real installed React, SWR, Upload session and
snapshot hook, mocked host auth and HTTP only. The test bundle uses installed tsx's
esbuild. jsdom resolves locally first, then from `JSDOM_MODULE_ROOT` (default: the
already installed `/usr/local/lib/node_modules/flowise`). No packages were installed.
A supervisor environment needs jsdom available by one of those paths. DOM evidence
does not establish real-browser focus or responsive/light/dark visual correctness.

### Implementation and GREEN

- Successful approval/demotion explicitly clears every visited snapshot key for the
  account, including latest and year-specific inactive entries, through SWR mutation
  with `undefined` data. Other accounts are preserved. Run caches are also cleared.
  The existing snapshot client, hook and reader pages are unchanged.
- Current, filtered list, selected detail and (when distinct) current detail are
  checked directly through the existing GET clients. Only after all succeed are
  their caches populated without revalidation and the verified current ID announced.
  Selection/filter context is preserved, including after demotion.
- Mutation success survives read failure: the dialog closes with `Change succeeded,
  refresh pending` and a `Retry refresh` action that performs reads only. Further
  edits are disabled while verification is pending. All six injected failures
  verify a single POST, GET-only retry and the current ID from the current response,
  deliberately different from the mutation response.
- `pnpm test:unit`: PASS, 77 tests, 77 passed, 0 failed, 0 cancelled, 0 skipped.
- `pnpm exec tsc --noEmit`: PASS, exit 0, no diagnostics.
- `pnpm lint`: PASS, exit 0; `1 problem (0 errors, 1 warning)`. The sole warning is
  the existing `@next/next/no-img-element` in `src/app/image-debug/page.tsx:56:17`;
  no new warnings.
- `git diff --check`: PASS.
- `pnpm build`: PENDING for the supervisor; intentionally not run. No network,
  package installation, backend changes, migrations, environment/deploy actions or
  live production verification were performed. Existing release/browser/visual
  dependencies above remain PENDING.

## Review fixes, round 2

### RED

Before the implementation fix, `pnpm test:unit` exited 1: 79 tests, 77 passed,
2 failed, 0 cancelled, 0 skipped. Failing names:

- `approve clears shared approved state on B → A → B without cross-account requests`
- `demote clears shared approved state on B → A → B without cross-account requests`

Both failed with `Superseded figures must be absent while replacement GET is pending`.
The real snapshot hook initially fetches and renders B's data, B unmounts, A publishes,
and B remounts while its new GETs are delayed. The harness uses installed SWR 2.3.6
and normally required local jsdom 26, with host authentication and HTTP mocked.
The other-account-cache-survives assertion has been replaced with account-switch
freshness and authorization isolation checks. Existing round-1 retry cases remain.

### Implementation and GREEN

- Successful approval/demotion clears snapshot and mutable current/list/detail data
  across every account's finance cache keys using SWR mutation with `undefined`
  and `revalidate: false`. Account-separated key construction is unchanged. The
  round-1 verified current/list/detail reads populate only the publishing account;
  refresh failure and GET-only retry behavior remain intact.
- The two new interactions fetch B's latest/year snapshots and current/list/detail
  state, switch to A for one publication POST, then return to B with all GETs delayed.
  They assert loading without superseded figures or run state, no publisher data in
  B's run cache, no B reader revalidation during A's session, B-only credentials
  on return, and preservation of unrelated cache data. Reader pages, hook and API
  data path are unchanged.
- `pnpm test:unit`: PASS, 79 tests, 79 passed, 0 failed, 0 cancelled, 0 skipped.
- `pnpm exec tsc --noEmit`: PASS, exit 0, no diagnostics.
- `pnpm lint`: PASS, exit 0; `1 problem (0 errors, 1 warning)`. The sole warning is
  the existing `@next/next/no-img-element` in `src/app/image-debug/page.tsx:56:17`;
  no new warnings.
- `git diff --check`: PASS.
- `pnpm build`: PENDING for the supervisor; intentionally not run. No network,
  package installs, migrations, environment changes or deployments performed.
  Real-browser responsive/light/dark/focus checks and live release evidence remain
  PENDING; this is local jsdom interaction and unit evidence only.

### Git handoff

Uncommitted: staging the four explicit changed files failed with
`.git/index.lock: Operation not permitted` (exit 128). No commit or push occurred.
The existing untracked `.review-detached.pid` was left untouched.

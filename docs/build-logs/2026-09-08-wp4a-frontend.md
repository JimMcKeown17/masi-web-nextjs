# WP4 slice A budgets frontend

Local uncommitted build on `feat/wp4a-budgets-frontend`, based on
`633cc44b5cf376574ac5bb93f882173ce3364099`. Approved backend source inspected at
`0a6e4ce179491cf306e5a558f5a2149d27a23748` in the supervisor's detached backend
review checkout. No Git metadata writes, commits, merges, pushes or deployments.
The pre-existing `.review-detached.pid` is untouched.

## Implemented boundary

- Discriminated funders/budgets run payloads and typed budget hierarchy, lines,
  findings, provenance and contributor pages. Funders retain their snapshot API.
- Raw XLSX upload adds budgets kind and exact `ledger_run_id` query parameter.
  Approved, same-year, schema 2.0.0 fact-bearing ledger choices follow every page;
  only cursor values are followed, never pagination origins with bearer credentials.
- Upload reuses replay, failed/candidate, approval, demotion, re-approval, independent
  findings/rollback acknowledgement and notes. Budget summary exposes both source
  identities and original finding coordinates. Budget schema 1.0.0 is not mislabeled
  as an imported factless funder snapshot. Peak memory is correctly labeled process RSS.
- Actor/kind/year changes remount candidate/dependency/file/dialog state. SWR keys
  partition actor and list kind/year; dependency choices partition actor/year;
  immutable run IDs bind detail and contributor caches to their exact dependency.
  The cross-kind current endpoint is shared by year intentionally. Late publication
  still invalidates shared state after the old session unmounts; mounted readers
  revalidate with their own actor, without restoring the old selection.
- `/operations/finance/budgets` renders expandable department/sub-department/line
  rows, producer decimal strings and known incomplete subtotals. Null budget,
  unavailable actual, WF exclusion and numeric zero remain distinct. Labels disclose
  sheet as-of/month, budget-used versus linear projection, shared BC, applied share,
  contributor count, both source identities and incompatible current runs.
- Existing Fix includes a kind/year selector. Budgets preserve every severity and
  scope by default, with explicit severity/scope filters and exports. Funders retain
  the existing accounting-year default and historical toggle, with severity filtering.
- Visible budget-table and finding rows export to CSV and genuine XLSX. ExcelJS
  4.4.0 loads only when XLSX is requested. Cells are display strings, not formulas;
  CSV prefixes potentially executable text. No money/share/projection calculation
  was moved into React. Export rows use exactly the selected visible table rows.
- Contributors use existing `/finance/runs/<budget-id>/rows/` and authenticated
  `/rows/export/` paths, exact untrimmed BC/year, cursor pagination, pinned ledger
  metadata and full-amount-before-share labels. No unauthenticated download links.

## RED and local verification

Node 20.11.0 and existing jsdom 26.1.0. Tests use synthetic payloads and mocked
transport in real React/SWR/jsdom interactions; they are not hosted or browser E2E
proof. New test files are explicitly enumerated in `test:unit`.

Captured RED outputs in `/private/tmp/masi-supervisor-20260907/`:

| Log | Failing behavior before its implementation/fix |
|---|---|
| `frontend-api-red.log` | Budget upload still sent funders kind, 3 pass / 1 fail |
| `frontend-api-red2.log` | Budget listing/dependency and contributor API additions, 4 pass / 1 fail |
| `frontend-budgets-red.log` | `rendersHierarchyAndProducerValues`, missing component |
| `frontend-budgets-red2.log` | `distinguishesNullZeroAndWfExclusion` known subtotals and `showsPinnedLedgerAndIncompatibleCurrent`, 1 pass / 2 fail |
| `frontend-findings-red.log` | `preservesAllFindingSeverities`, missing findings component |
| `frontend-exports-red.log` | `exportsVisibleRowsAndLabelsSharedContributors`, 4 pass / 1 fail |
| `frontend-contributors-red.log` | Contributor pagination/auth download interaction, missing action |
| `frontend-reader-red.log` | Direct reader denial and stale actor/year interaction, missing reader component |
| `frontend-upload-red.log` | `selectsBudgetKindAndLedgerDependency`, missing kind selector |
| `frontend-replay-red.log` | `replaysAndReapprovesBudgetCandidate`, missing budget finding source cells |
| `frontend-permissions-red.log` | `keepsReadOnlyAndUnprivilegedUsersOut`, direct Fix denial missing |
| `frontend-late-approval-red.log` | Actor switched during approval retained old current state |

Focused commands used `node --import tsx --test` with the affected files and, for
single interaction slices, `--test-name-pattern`. Pattern-excluded tests in those
focused runs are not skipped requirements. Additional regression interactions cover
pending upload kind/year/actor switches, Fix export filters, API 400/409 failures,
cache partitioning, authentic XLSX decoding and text-cell safety. Those were added
as regression checks after the related slice and are not claimed as individual REDs.
Existing funder interaction tests were updated to select the Run control by its
accessible label instead of select index after addition of the Kind control.

Final source-tree gates (2026-09-08):

- `COREPACK_ENABLE_AUTO_PIN=0 pnpm test:unit`: **99 passed, 0 failed, 0 skipped**.
  Full run log: `/private/tmp/masi-supervisor-20260907/frontend-unit.log`.
- `COREPACK_ENABLE_AUTO_PIN=0 pnpm exec tsc --noEmit`: exit 0, no diagnostics.
- `COREPACK_ENABLE_AUTO_PIN=0 pnpm lint`: exit 0, 0 errors, 1 pre-existing
  `@next/next/no-img-element` warning at `src/app/image-debug/page.tsx:56`.
- `git diff --check`: exit 0.
- `COREPACK_ENABLE_AUTO_PIN=0 NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 pnpm build`:
  exit 1, blocked exclusively by four existing Google Fonts fetches (Fraunces in
  two styles, Geist, Geist Mono). Existing Next middleware deprecation also warned.
  Log: `/private/tmp/masi-supervisor-20260907/frontend-build.log`. This is an
  environment failure, **not a passing build**. Supervisor owns the authorized
  network rerun on the final source tree. No font replacement or mock-build bypass.

Initial full-suite run exposed 10 existing interaction tests selecting the old
numeric select index after the Kind control was added; correcting those tests to
use the Run control's accessible label restored the full suite. Their assertions
and existing funder recovery behavior remain intact. No product failure is hidden
as an expected skip.

## Contract equality

Copied files directly from approved backend, without regeneration:

| Resource | SHA-256 (identical backend/frontend) |
|---|---|
| `api/contracts/budget-run-1.0.0.json` → `src/lib/finance/budget-run-1.0.0.json` | `4e35186a43eaf30cacb9ffc305db8c7f1be954905b9d87ee12afbfae417889b8` |
| `api/tests_data/budget-run-1.0.0.json` → `src/lib/finance/fixtures/budget-run-1.0.0.json` | `86c6ada0f86a592d3228544cfe5917d3183a61910e5c97769735d6a49f7c0497` |

The contract test validates the golden using copied JSON Schema and pins both
hashes. Existing snapshot fixtures and schemas remain unchanged.

## Environment and remaining release work

Normal package install failed on sandbox DNS and mismatched default pnpm store.
Supervisor installed ExcelJS with authorized network access and the established
store. No unrelated dependency upgrades. Install reported existing Mapbox and
Clerk/React peer conflicts and deprecated subdependencies. Incidental Corepack
`packageManager` insertion was removed; gates use `COREPACK_ENABLE_AUTO_PIN=0`.

Build uses supervisor-approved synthetic `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`.
No production requests, credentials, real finance data or workbooks were used.
No backend/schema/migration changes. Approved backend deployment must precede
frontend enabling this kind. The publisher-owned formula-cache fix remains a
release dependency; this frontend does not change API/schema to work around it.

Supervisor still owns synthetic browser upload → preview → approve → current/
Budgets/Fix → export → demote/re-approve, keyboard/focus, responsive/light/dark
screenshots, independent review, real acceptance and release checks. Unit/jsdom
and a successful local build do not satisfy those gates. No deployment authorized.

## Review corrections and bounded browser follow-up (2026-09-08)

This section supersedes the original implementation's wire-shape assumption and
pending build result above. Supervisor committed the original build as `11d0cd9`;
review corrected the direct-derived API shape at `7758427`. No builder Git writes.

### Exact wire correction

Approved backend `api/services/finance_runs.py:547` stores `artifact['derived']`
in `run.payload`; `api/views/finance_runs.py:47` returns that payload unchanged and
places `manifest` alongside it. The first frontend incorrectly expected the full
artifact wrapper inside payload, and its mocks repeated that mistake. Golden/schema
byte equality did not establish run-detail wire compatibility.

RED public `getFinanceRun` → actual `FinanceRunSummary` reproduction using
`payload=golden.derived`, separate `manifest=golden.manifest`, failed with
`Cannot read properties of undefined (reading 'findings')`.
`frontend-wire-red.log` records the failure. BudgetPayload, runFindings, summary,
reader, Fix, fixtures and local harness now consume the exact derived-only shape.
New public API/summary and current reader/Fix interactions pass. The full corrected
suite was 101/101; supervisor's network build passed in
`frontend-build-round1-fix.log`. Independent review closed the high wire finding.

### Small presentation delta after 7758427

Visible decorative chevrons accompany the existing accessible hierarchy buttons.
All eight known completeness flags map to plain language; unknown flags are retained.
Displayed/exported derived amounts, row membership and calculations are unchanged.
Compatibility copy maps the exact backend SOURCE_MISMATCH, DEPENDENCY_UNRESOLVED
and NO_APPROVED_RUNS codes to readable explanations, without recalculating the
server verdict. Upload, Budgets and budget Fix use the same presentation helper.

RED: two presentation cases failed in `frontend-presentation-red.log` before the
chevrons/plain labels/copy. Focused budget/upload suite: **34 passed, 0 failed,
0 skipped**. TypeScript: exit 0. Lint: exit 0, only the existing image-debug warning.
`git diff --check`: clean. Supervisor production build: exit 0 with localhost API
origin, log `frontend-build-presentation.log`.

The first full presentation run had **101 pass / 1 fail** in the unchanged existing
`demote clears shared approved state on B → A → B without cross-account requests`
assertion `Returning B must fetch only with B credentials`. Preserve
`frontend-presentation-full.log`; the failure is not an expected skip. The exact
regression rerun passed; a subsequent unchanged-tree full rerun passed **102/102,
0 failed, 0 skipped** (`frontend-presentation-full-rerun.log`). The intermittent
first-run assertion is disclosed for reviewer assessment; its timing cause is not
claimed as proven and no assertion was weakened or source changed for the rerun.

### Actual browser evidence and precise gaps

Browser evidence used Chrome at `http://127.0.0.1:8768`, actual React finance
components, built CSS/font variables, explicit test auth and a synthetic fetch
implementation with CSP `connect-src 'none'`. This is browser UI against a synthetic
API, not real-backend E2E, real provider authentication or release evidence.
Harness and artifacts: `/private/tmp/masi-supervisor-20260907/wp4-browser/`.

Before the wire correction, desktop/mobile light/dark states were inspected and
saved as `pre-wire-*.png`; those are historical UI observations, not contract proof.
After the wire correction, the corrected desktop light screenshot is
`desktop-light.png`. The wrapping correction reduced the budget table from about
2,748 px content width to **1,352 px inside a 1,352 px container at a 1,440 px viewport**,
with all seven columns visible. No table values were removed.

Completed on the corrected wire/CSS harness before the final chevron/copy delta:

- Current approved budget renders the direct-derived response and separate pinned
  manifest. Keyboard Enter collapses department children from 15 rows to 1 and
  expands them again. Filtering selects Line 11 plus its ancestors.
- Line 11 shows the explicit 1/2 share and full contributor amounts; Next loads the
  second synthetic contributor page. Returned ledger ID matches the pinned manifest.
- Real Chrome budget CSV and XLSX files were downloaded and copied into the private
  harness folder. ExcelJS decoded the actual XLSX. Four rows including headers
  exactly match CSV after its deliberate text-safety prefix normalization; labels
  remain text cells. Evidence: `download-verification.json`.
- Both contributor export buttons issued authenticated budget-run paths with exact
  year/BC/format and created local download files. The producer/parser/real row
  membership is not exercised by the synthetic transport.

Not completed: browser upload file selection, upload/replay/approval/demotion/
re-approval, browser Fix filtering/export, corrected mobile/dark recapture, and
browser inspection of the final chevron/copy delta. A CUA file-chooser call stalled
for about 700 seconds and was aborted. It may have opened a native file picker;
selection/upload completion and picker cleanup are unverified. Browser work stopped
on supervisor instruction, with no further browser requests. The temporary browser
viewport override was 1,440×1,000 at that point. Existing jsdom coverage remains
separate from these missing browser gates. Screenshot files and downloads contain
synthetic data only. An unrelated installed wallet extension emitted a provider
injection console error; no product error is attributed to that extension message.

### Bounded investigation of the intermittent demotion assertion

On supervisor request, a private copy of the unchanged test added a React
`useLayoutEffect` commit marker and synthetic request path/token/account/phase
fields. The exact demotion test ran ten times: **10 passed / 0 failed**. Every
run recorded exactly five returning-B requests, all with `token-account-B`,
window account B, committed React actor B and phase `committed:account-B`.
No A request during window account B was observed. Therefore the original failure
was not reproduced and its cause remains **unresolved**; these results do not
prove the proposed pre-commit timing explanation or establish that it is harmless.
No product change or test assertion weakening followed this investigation.
Private evidence: `instrument-demote.py`, `demote-instrumented-01.log` through
`demote-instrumented-10.log`, and `demote-instrumented-summary.json` under
`/private/tmp/masi-supervisor-20260907/`. The failed full-run log remains preserved.

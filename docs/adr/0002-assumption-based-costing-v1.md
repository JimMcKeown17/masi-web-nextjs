# Assumption-based costing over per-youth payroll data (v1)

Projected youth cost is computed from a small set of shared assumptions (site-type x
job-title Hours Matrix at full utilisation with per-programme hours/days toggles in the
calculator, flat wage rate, flat subsidy contribution, school-days calendar), not from
per-youth data. This is deliberate, decided 2026-07-27 with Jim.

## Considered Options

- Per-youth Airtable `Hours Cap`: rejected — Jim distrusts the column, and it measures
  subsidy-expensable hours, not hours worked.
- Payroll-system integration / ledger ingestion: rejected for v1 — reconciliation is
  deferred; existing payroll-vs-DB checks cover auditing.
- Historical utilisation rates: rejected — requires the deferred reconciliation engine.

## Consequences

The projection systematically overstates cost (actual timesheet hours run below full cap),
which is the conservative direction for a nonprofit protecting against overspend. Every
number traces to either a verified artifact (R32.01 from a June payslip) or an explicit
scenario input; nothing derives from data nobody vouches for. Revisit when reconciliation
lands and real utilisation ratios exist.

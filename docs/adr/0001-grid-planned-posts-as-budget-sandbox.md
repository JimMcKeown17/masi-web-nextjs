# Grid youth_planned doubles as the budget sandbox

The youth budget calculator's "at-plan" projection prices the school-programme grid's
existing `youth_planned` numbers directly; there is no separate store of hypothetical
hires. Staff explore "can we afford 3 more at Seyisi?" by editing the plan in the grid
they already use and watching the affordability verdict move.

## Considered Options

A standalone sandbox where staff type hypothetical hires was rejected: it creates a second
place where hiring intentions live, and the plan and the model drift apart within weeks
(the same failure mode as the spreadsheets this system replaces). The lightweight
Quick Estimate panel survives only as a non-persisted mental-math reference, never as a
source of truth.

## Consequences

Editing `youth_planned` now moves a money verdict the whole team sees, not just a staffing
gap colour. That coupling is deliberate: the plan IS the spending intention.

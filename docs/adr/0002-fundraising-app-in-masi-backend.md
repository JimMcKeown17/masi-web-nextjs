# Fundraising system of record is a new Django app in the Masi backend

Donor, grant, and outreach data lives in a new `fundraising` Django app inside the existing Masi backend, with tables in `masi_database` — not a separate service, and not more models in the existing `api` app. UI lives under `/operations` behind Clerk.

Why: impact stats already live in `masi_database`, and the grant-writing and donor agents need to join relationship data directly against impact data. One deployable reuses the existing Render cron, auth, and API conventions. A separate app (rather than extending `api`) keeps fundraising a distinct bounded context with its own models and migration history — programme operations and fundraising have different sensitivity and lifecycles.

Consequences: donor data is PII with money attached (POPIA, plus US/EU donor jurisdictions). The existing local-snapshot workflow must exclude or sanitize fundraising tables when refreshing from prod; analysis against real donor data happens read-only against prod, same as today's discipline.

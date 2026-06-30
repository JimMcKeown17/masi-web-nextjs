# Build the fundraising/marketing system natively; buy only commodity edges

We are building an agentic fundraising and marketing system (CRM, grant writing, grant discovery, content packaging). We considered adopting nonprofit SaaS (Bloomerang/Salesforce NPSP for CRM, Mailchimp, Buffer) and gluing it together, but decided to build the core natively on the existing Django + Postgres + Next.js stack and subscribe only for commodity infrastructure: email deliverability (ESP), grant opportunity databases, and the LLM API.

Why: (1) Masi has no marketing staff — agents do the operating, and agents work best against a data model we own, with no third-party API limits or Zapier glue. (2) Our differentiation is rich impact data already in Masi Postgres; donor and grant data wants to join directly against it. (3) We already own a professional platform with auth (Clerk), dashboards, and sync-cron conventions.

Consequences: the CRM must stay a deliberately thin schema — we are not rebuilding Mailchimp or Salesforce. Anything that is pure infrastructure liability (IP reputation, unsubscribe compliance, bounce handling, grant database curation) gets bought, not built.

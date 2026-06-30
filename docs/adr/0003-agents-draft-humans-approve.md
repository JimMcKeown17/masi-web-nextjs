# One spine; agents draft, humans approve; Python-in-Django runtime

The fundraising/marketing system is one data spine (Contact, Donation, Opportunity, Grant, Deliverable, Interaction, Campaign in Masi Postgres) shared by multiple agents — not four separate products. Agents may read everything (PG, Airtable, Drive, grant sources, the web) but write only draft artifacts into Postgres. Sending, posting, and submitting are human acts performed through one approval surface in `/operations`. Every approved outbound action automatically logs an Interaction against its Contact.

Agents run as Python in the `fundraising` Django app using the Anthropic SDK: scheduled agents are management commands on Render cron (the existing house pattern); interactive agents are DRF streaming endpoints. Next.js is pure UI. No Celery, no separate agent service, no orchestration SaaS for v1.

Why: capability comes from the read surface, safety from the narrow write surface — there is no "the AI emailed a donor something embarrassing" failure mode, and an agent crash mid-run costs nothing. Auto-logging is why this CRM will not rot the way CRMs usually do: the pipe records itself. Autonomy is a per-agent dial that starts at zero and can be raised later (e.g., low-tier newsletter auto-send) without changing the architecture.

Considered: Vercel AI SDK in Next.js for interactive chat (better chat ergonomics, but splits prompts/tools across two runtimes away from the data); Claude Agent SDK worker service (more powerful loops, but a third deployable — specific agents can graduate to it later without moving where drafts land).

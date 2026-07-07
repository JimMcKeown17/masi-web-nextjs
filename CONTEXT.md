# Fundraising & Marketing

The agentic fundraising and marketing system for Masinyusane: donor relationships, grant pursuit, and content-driven outreach. System of record is the `fundraising` Django app in the Masi backend (see docs/adr/0002); agents draft, humans approve.

## Language

**Spine**:
The small set of fact tables in Masi Postgres (who, money, pursuits, obligations, touches, content use, drafts). A general ledger for relationships: work happens in the edge tools (Airtable, Drive, Gmail, Mailchimp, InDesign), and only the *facts* land here as rows — index cards, not boxes.
_Avoid_: "the CRM" (the spine is wider), "the database" (too vague)

**House pattern**:
Masi's established integration convention — staff enter data in Airtable, a nightly cron copies it into Postgres, everything downstream reads Postgres. Literacy/numeracy sessions and schools already flow this way.
_Avoid_: describing it as new architecture; it is the existing routine extended

**Contact**:
A person or organization Masi has (or pursues) a funding relationship with; `kind` distinguishes individual, foundation, corporate, government.
_Avoid_: constituent, party, lead

**Donation**:
A money-received event, belonging to exactly one Contact.
_Avoid_: gift, payment

**Interaction**:
A single touchpoint with a Contact — an email sent or received, newsletter delivery, meeting, or call note.
_Avoid_: activity, touch, message log

**Donor**:
A role, not a table — any Contact with at least one Donation.
_Avoid_: using "donor" as a schema entity

**Funder**:
Colloquial term for an institutional grantmaker (foundation/corporate/government Contact). Not a schema entity.

**Opportunity**:
A discrete pursuit of money from one Contact, from identification to won or declined.
_Avoid_: deal, lead, prospect (as entity)

**Grant**:
An awarded institutional commitment, created when an Opportunity is won — agreement, amount, period, and reporting obligations.
_Avoid_: award, using "grant" for the pursuit phase

**Deliverable**:
A dated obligation Masi owes — an application step on an Opportunity, or a report on a Grant.
_Avoid_: task, milestone

**Campaign**:
A planned push with a theme and date range (year-end appeal, GivingTuesday) that agents draft against.
_Avoid_: using "campaign" for routine cadence (the monthly newsletter is cadence, not a Campaign)

**Receiving Entity**:
One of Masi's two legal nonprofits — US 501(c)(3) or SA — that a Donation lands in; determines currency, receipt type (IRS letter vs Section 18A), and bank account.
_Avoid_: branch, chapter

**Subscriber**:
A role, not a table — any Contact with an email address and newsletter consent. All current subscribers (~500, in Mailchimp) are consented past donors and contacts.
_Avoid_: list member, audience (as entity)

**Broadcast**:
One message sent to a Segment through the ESP (Mailchimp) — the newsletter rail.
_Avoid_: blast, mass email

**Personal Send**:
A one-to-one email from Jim's own mailbox — agent-drafted as a Gmail draft, reviewed and sent by Jim. Lands in Primary, not Promotions; the rail for big donors.
_Avoid_: transactional email, direct mail

**Content Library**:
The Airtable base "Marketing Content Management + Success Stories" plus its linked Google Drive folders — where staff, designers, and the videographer work. Staff workflow is sacred; the system reads, never disrupts.
_Avoid_: asset bank, DAM

**Story**:
A person-centred narrative feature (child, youth, graduate) with headline, narrative, coach quote, photos, programme category, school, and consent form — the atomic unit of Masi marketing content.
_Avoid_: post, article, case study

**Content Use**:
One occasion of an asset appearing in a channel artifact — an Instagram post, a report page, a newsletter issue, a Personal Send. Replaces per-report columns.
_Avoid_: usage flag, "Report Use" columns

**Content Story** (the mirror):
The Postgres row mirroring one Airtable Success Story into the `fundraising` app (`ContentStory`), holding just the fields a newsletter needs (headline, narrative, coach quote, category, school, date, photo links, and a cached `hero_image_url`). The durable, queryable copy agents read; the Airtable Story stays the staff workspace and source of truth.
_Avoid_: treating it as the source of truth (Airtable is); mirroring every Airtable column

**Hero Photo**:
The single best photo for one Story, chosen once by a vision pass over the child's Google Drive folder and cached as a durable GCS URL on the Content Story (docs/adr/0008). What a newsletter embeds.
_Avoid_: embedding raw Drive or Airtable image links (not email-safe; they expire)

**Funder Package**:
A customized, designed funder report (InDesign; designer-assigned; due-dated) produced by the design team — the production artifact that fulfils a report Deliverable. Lives in the Content Library's "Funder Packages" table; ~23 exist.
_Avoid_: report (alone — ambiguous with grant reports as obligations)

**Tier**:
How much personal attention a Contact gets — Tier 1 Personal (everything from Jim's mailbox, ~15-40 people), Tier 2 Warm (batch-approved personalized messages), Tier 3 List (Broadcasts only). System-suggested from giving history and pipeline value; Jim assigns.
_Avoid_: level, grade, VIP flag

**Segment**:
Which content flavor a Contact gets — currently US donors, RSA & EU donors, foundations (inherited from Mailchimp). Orthogonal to Tier.
_Avoid_: conflating with Tier (attention is not flavor)

**Funder Brief**:
The structured intel artifact on one institutional funder — priorities, giving sizes and patterns, application requirements, key people, and a language map (their vocabulary ↔ Masi programmes). Attaches to the funder's Contact; feeds cultivation, ED-intro prep, and the Grant Writer's angle selection.
_Avoid_: dossier, profile

**Answer Block**:
A curated canonical answer to one grant-question theme, carrying the house voice, angle variants (jobs vs education emphasis), live data slots filled from Postgres at draft time, and won/lost tags.
_Avoid_: template, boilerplate, snippet

**Key Message**:
A point that must land somewhere in every application (M&E excellence, government partnership) — woven into generic answers when the funder asks few questions.
_Avoid_: talking point

**Tool Belt**:
The small, well-tested set of functions every agent composes — spine reads (`contact.history`, `opportunity.context`), curated knowledge (`published_stats.pick`, `answer_library.select`, `voice_guide.read`), draft writes (`draft.create`, `interaction.propose`), and the rails (`gmail.*`, `mailchimp.*`). The durable asset; agents are thin, disposable compositions over it (docs/adr/0006). Mental model: the knives and pans of a kitchen, not the recipes.
_Avoid_: conflating with the agents; "the API"; a place for business logic to sprawl

**Voice Guide**:
The distilled, versioned artifact of how Jim writes — seeded from his high-open-rate direct emails, served by `voice_guide.read()`, read by every drafting agent, and updated quarterly by the self-improving loop. Authored once; improved forever.
_Avoid_: style guide (broader); prompt (it is data the prompt reads)

**Self-improving loop**:
Capturing the diff between an agent's `draft_body` and the `final_body` Jim actually sent, classifying it (voice / facts / structure / killed), and feeding it back into the Voice Guide, the Answer Library, and the autonomy dial (docs/adr/0007). Mental model: an apprentice studying the editor's red pen — not model fine-tuning, not autonomous self-modification.
_Avoid_: "training the model"; "the AI learns" (it updates curated artifacts, humans still decide)

**Black (demographic, South African sense)**:
In SA grant and BBBEE usage, "Black" means everyone *not white* — African, Coloured, and Indian together. For Masi this is effectively **100%** (no white youth or children), and "% Black" should be answered as ~100%, never as the narrow African-only figure (a serious understatement that can read as misrepresentation). The detailed split (African / Coloured / White) is requested rarely (≈ HCI), and only for the current year — youth from `Youth.race` (exact), children from per-site % estimates. Cumulative all-time race is never reported.
_Avoid_: equating "Black" with "African only"; computing cumulative race; treating child race as per-person (it is a site-level estimate)

## Relationships

- A **Donation** belongs to exactly one **Contact** and exactly one **Receiving Entity**, recorded in its original currency; a Donation may link to a **Grant** (tranche payment)
- Donations enter via manual entry or agreed CSV import in /operations — never a live bank feed (deliberate v1 boundary)
- An **Interaction** belongs to exactly one **Contact**; interactions with a person at an organization log against the person and roll up via their organization link
- An individual **Contact** may link to one organization **Contact** (e.g., a programme officer at a foundation)
- An **Opportunity** belongs to exactly one **Contact** and ends at won or declined
- A won institutional **Opportunity** creates exactly one **Grant**; individual gifts won create only **Donations**
- A **Deliverable** belongs to either an **Opportunity** (application steps) or a **Grant** (reports)
- An **Interaction** may belong to one **Campaign**
- Both **Broadcasts** and **Personal Sends** log **Interactions**; one piece of newsletter content can render as both (Mailchimp issue for the list, plain personal update for big donors)
- A **Story** has many **Content Uses**; a Content Use names the channel and artifact (and, for funder-facing uses, lets agents answer "what has this Contact already seen")
- A report **Deliverable** is fulfilled by a **Funder Package**; Funder Packages sync from Airtable into the spine (house pattern) and the spine adds the Grant/Contact linkage Airtable can't express
- Social channels (FB, Instagram, TikTok, YouTube; themed weekly slots) are run and posted by staff; the agent assists in draft-mode only — proposed Content Calendar rows (story picks + captions), caption polish, newsletter repurposing, and LinkedIn drafts (funder-voiced, approved by Jim, posted manually)
- The Content Calendar is the single exception to one-way sync: agents write "Proposed by AI" rows back into it; everything else flows Airtable → PG only
- Consent: parents sign consent forms (attached per child in the Content Library); any saved image is cleared for use
- A renewal is a new **Opportunity** linked to the prior **Grant** (`renews_grant`)
- Routine recurring giving gets no **Opportunity** — only a discrete planned ask does
- Grants are won through cultivation: prospective funders receive **Broadcasts** and **Personal Sends** while an **Opportunity** sits at `cultivating`; the in-person ED intro is the pivotal conversion event before `applied`
- An application draft recombines **Answer Blocks** (numbers only ever from live data slots, never from old prose) and must place every **Key Message**; accepted answers feed back into the library
- Discovery is import-led (Jim's funder lists + optional Candid months), not scrape-led; deep research happens per named funder via the **Funder Brief**

## Example dialogue

> **Dev:** "The programme officer at the foundation emailed back — do I log that **Interaction** against the foundation?"
> **Domain expert:** "No — log it against *her* **Contact** record. She links to the foundation, so it rolls up. The foundation never writes emails; people do."

> **Dev:** "We won the OMT application — do I keep the **Opportunity** open for the reporting deadlines?"
> **Domain expert:** "No — the Opportunity closed at won. The **Grant** now exists and carries the report **Deliverables**. Next year's renewal will be a brand-new Opportunity that links back to this Grant."

## Flagged ambiguities

- "Donor" was used to mean both the table and the role — resolved: **Contact** is the entity; **Donor** is a role (has given).
- Institutional pipeline weight — resolved: pursuit (**Opportunity**) and stewardship (**Grant**) are separate objects; Jim chose the split over a single spanning Opportunity because foundation reporting is a heavyweight apparatus in this domain.
- "Tier" vs "segment" — resolved: two orthogonal axes on Contact. **Tier** = personal attention (1 Personal / 2 Warm / 3 List, Jim-assigned with system suggestions); **Segment** = content flavor (US / RSA-EU / foundations).

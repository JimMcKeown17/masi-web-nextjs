# Fundraising Spine — Increment 1 build spec (models + admin)

Implementation spec for the first build of the Layer 1 Spine (docs/adr/0002, 0003, 0006, 0007; CONTEXT.md).
Scope confirmed 2026-07-07: **the `fundraising` Django app, all 10 models, migrations, and Django admin only.** No React UI, no CSV import, no Tool Belt functions, no Airtable sync, no DRF endpoints — those are later increments.

## Where this is built

- **Repo:** the Masi backend, `/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/` (a SEPARATE git repo from this worktree — quote the path, it has a space).
- **Branch:** backend is on `main`, clean. Create and switch to a new branch `feature/fundraising-spine` off `main` before any changes. Do NOT commit — leave the work uncommitted on the branch for review.
- **This spec file** lives in the frontend worktree at `_plans/fundraising-spine-spec.md`; read it, but write all code in the backend repo.

## House conventions to follow exactly (verified against the codebase)

- Django 5.1.6, DRF 3.15.2, Python 3.10+. Run management commands as `venv/bin/python manage.py ...` from the backend dir.
- **PKs:** default `BigAutoField`. No UUIDs.
- **Timestamps:** every model carries standalone `created_at = models.DateTimeField(auto_now_add=True)` and `updated_at = models.DateTimeField(auto_now=True)`. There is NO shared abstract base model — do not invent one; copy the pair into each model (matches the majority house style).
- **Choices:** plain lists of `(value, label)` tuples. Module-level `*_CHOICES` constants at the top of `models.py`. Do NOT use `TextChoices`/`IntegerChoices` (zero in the codebase).
- **Optional text fields:** `blank=True, default=""` (not `null=True`) — matches `PublishedStat`.
- **Meta:** explicit snake_case `db_table` (matches newer fact tables), plus `ordering` and a `__str__` on every model.
- **JSONField:** `models.JSONField` (built-in; already imported via `from django.db import models`).
- **FKs:** `on_delete=` per the policy below, with `related_name` and string model refs where forward-referenced.
- **App registration:** add `'fundraising'` to `INSTALLED_APPS` in `masi_website/settings.py` at line 52 (in the local-apps group beside `'api'`, `'dashboards'`). Create `fundraising/apps.py` mirroring `api/apps.py` (`default_auto_field = 'django.db.models.BigAutoField'`, `name = 'fundraising'`).
- **Admin:** `@admin.register(Model)` decorator on an `admin.ModelAdmin` subclass, customizing `list_display` (+ `list_filter`, `search_fields`, `ordering` where useful). Copy the shape of `PublishedStatAdmin` in `api/admin.py`.
- **Migrations:** first file will be `fundraising/migrations/0001_initial.py` (its own namespace; ignore `api`'s 0038).
- **Tests:** `fundraising/tests.py`, Django `TestCase`. Run `venv/bin/python manage.py test fundraising`.

## Cross-cutting design decisions (bake these in)

1. **Money** is `DecimalField(max_digits=12, decimal_places=2)`, stored in its **original currency** (a `currency` field beside every amount). No FX conversion, no bank feeds — manual/CSV entry only (ADR 0001/0004). 12 digits covers R/$ grants comfortably.
2. **Email is NOT unique** at the DB level. Donors arrive with partial/duplicate emails across workbooks; dedup is handled by the reversible merge (identity), never a unique constraint.
3. **`on_delete` policy:**
   - `PROTECT` on `Donation.contact` and `Grant.contact` — money records must not vanish when a contact row is removed.
   - `CASCADE` on `Opportunity.contact`, `Interaction.contact`, `Deliverable.opportunity`/`grant`, `Expectation.contact` — these have no meaning without their parent.
   - `SET_NULL` on all optional cross-links (`Contact.organization`, `Contact.merged_into`, `Opportunity.renews_grant`, `Donation.grant`, `Grant.opportunity`, `Interaction.campaign`, `Interaction.source_draft`, `Draft.contact`/`opportunity`/`campaign`, `Expectation.grant`, `ContactMergeLog.merged_by`).
4. **The self-improving loop (ADR 0007) is in the `Draft` table from row one:** `draft_body` is written at creation; `final_body` is attached after the human sends; both are retained forever; `edit_classification` holds the later diff analysis. This is the one thing that is unrecoverable if omitted now.
5. **Reversible identity:** `Contact.merged_into` (self-FK, null = active) marks a soft-merged loser; `ContactMergeLog` records each merge with a full `loser_snapshot` JSON so an unmerge can restore it. The merge *operation* (reassign FKs, apply survivorship) is a later Tool Belt function — this increment only provides the tables.
6. **PII (ADR 0002):** these tables hold donor PII with money attached. Add a short module docstring at the top of `fundraising/models.py` noting that fundraising tables must be excluded/sanitized when refreshing a local snapshot from prod, and that analysis runs read-only against prod. (Documentation only — no code.)

## Module-level choice constants (top of `fundraising/models.py`)

```python
CONTACT_KIND_CHOICES = [
    ('individual', 'Individual'),
    ('foundation', 'Foundation'),
    ('corporate', 'Corporate'),
    ('government', 'Government'),
]
TIER_CHOICES = [
    ('1_personal', 'Tier 1 - Personal'),
    ('2_warm', 'Tier 2 - Warm'),
    ('3_list', 'Tier 3 - List'),
]
SEGMENT_CHOICES = [
    ('us', 'US donors'),
    ('rsa_eu', 'RSA & EU donors'),
    ('foundations', 'Foundations'),
]
RECEIVING_ENTITY_CHOICES = [
    ('us', 'US 501(c)(3)'),
    ('sa', 'South Africa'),
]
CURRENCY_CHOICES = [
    ('USD', 'US Dollar'),
    ('ZAR', 'South African Rand'),
    ('EUR', 'Euro'),
    ('GBP', 'British Pound'),
]
OPPORTUNITY_STAGE_CHOICES = [
    ('identified', 'Identified'),
    ('cultivating', 'Cultivating'),
    ('applied', 'Applied'),
    ('won', 'Won'),
    ('declined', 'Declined'),
]
DELIVERABLE_KIND_CHOICES = [
    ('application_step', 'Application step'),
    ('report', 'Report'),
]
DELIVERABLE_STATUS_CHOICES = [
    ('open', 'Open'),
    ('submitted', 'Submitted'),
    ('done', 'Done'),
    ('waived', 'Waived'),
]
INTERACTION_CHANNEL_CHOICES = [
    ('email_sent', 'Email sent'),
    ('email_received', 'Email received'),
    ('newsletter', 'Newsletter'),
    ('meeting', 'Meeting'),
    ('call', 'Call'),
    ('note', 'Note'),
]
INTERACTION_DIRECTION_CHOICES = [
    ('outbound', 'Outbound'),
    ('inbound', 'Inbound'),
    ('internal', 'Internal'),
]
DRAFT_KIND_CHOICES = [
    ('newsletter_broadcast', 'Newsletter broadcast'),
    ('personal_send', 'Personal send'),
    ('grant_answer', 'Grant answer'),
    ('grant_application', 'Grant application'),
    ('report_narrative', 'Report narrative'),
    ('interaction_capture', 'Interaction capture'),
    ('other', 'Other'),
]
DRAFT_STATUS_CHOICES = [
    ('draft', 'Draft'),
    ('approved', 'Approved'),
    ('sent', 'Sent'),
    ('discarded', 'Discarded'),
]
EXPECTATION_KIND_CHOICES = [
    ('annual_grant', 'Annual grant contract'),
    ('monthly_donor', 'Monthly donor'),
]
EXPECTATION_CADENCE_CHOICES = [
    ('annual', 'Annual'),
    ('monthly', 'Monthly'),
]
```

## The 10 models (exact fields)

Every model also gets `created_at = auto_now_add`, `updated_at = auto_now`, a `Meta` with `db_table` + `ordering`, and a `__str__`. Only the domain fields are listed below.

### 1. Contact  (`db_table = 'fundraising_contact'`, ordering `['name']`)
- `kind` — CharField(20, choices=CONTACT_KIND_CHOICES)
- `name` — CharField(200)  # person full name or organization name
- `organization` — FK('self', null, blank, SET_NULL, related_name='members')  # individual -> the org they belong to
- `role_title` — CharField(120, blank, default="")  # e.g. "Programme Officer"
- `tier` — CharField(12, choices=TIER_CHOICES, blank, default="")  # attention axis; unassigned = ""
- `segment` — CharField(20, choices=SEGMENT_CHOICES, blank, default="")  # content-flavor axis (orthogonal to tier)
- `primary_email` — EmailField(blank, default="")  # NOT unique
- `emails` — JSONField(null, blank)  # list[str] of additional addresses for Gmail-sync matching + dedup
- `phone` — CharField(40, blank, default="")
- `newsletter_consent` — BooleanField(default=False)  # Subscriber role = has email + this True
- `notes` — TextField(blank, default="")  # general
- `private_notes` — TextField(blank, default="")  # access-controlled (ADR 0004 privacy flag)
- `merged_into` — FK('self', null, blank, SET_NULL, related_name='merged_from')  # set = soft-merged loser; null = active
- `__str__` -> `f"{self.name} ({self.get_kind_display()})"`

### 2. Donation  (`db_table = 'fundraising_donation'`, ordering `['-date']`)
- `contact` — FK(Contact, PROTECT, related_name='donations')
- `receiving_entity` — CharField(4, choices=RECEIVING_ENTITY_CHOICES)
- `amount` — DecimalField(12, 2)
- `currency` — CharField(3, choices=CURRENCY_CHOICES)
- `date` — DateField()
- `grant` — FK('Grant', null, blank, SET_NULL, related_name='donations')  # tranche payment against a grant
- `method` — CharField(40, blank, default="")  # 'eft','card','check','csv_import', ...
- `source_reference` — CharField(120, blank, default="")  # import id / external ref
- `notes` — TextField(blank, default="")
- `__str__` -> `f"{self.amount} {self.currency} from {self.contact.name} ({self.date})"`

### 3. Opportunity  (`db_table = 'fundraising_opportunity'`, ordering `['-created_at']`)
- `contact` — FK(Contact, CASCADE, related_name='opportunities')
- `name` — CharField(200)
- `stage` — CharField(20, choices=OPPORTUNITY_STAGE_CHOICES, default='identified')
- `amount_requested` — DecimalField(12, 2, null, blank)
- `currency` — CharField(3, choices=CURRENCY_CHOICES, blank, default="")
- `deadline` — DateField(null, blank)
- `renews_grant` — FK('Grant', null, blank, SET_NULL, related_name='renewals')  # a renewal Opp links to the prior Grant
- `opened_at` — DateField(null, blank)
- `closed_at` — DateField(null, blank)  # set when stage -> won/declined
- `notes` — TextField(blank, default="")
- `__str__` -> `f"{self.name} [{self.get_stage_display()}]"`

### 4. Grant  (`db_table = 'fundraising_grant'`, ordering `['-created_at']`)
- `opportunity` — OneToOneField(Opportunity, null, blank, SET_NULL, related_name='grant')  # created from a won Opp; nullable for historical grants
- `contact` — FK(Contact, PROTECT, related_name='grants')
- `name` — CharField(200)
- `amount` — DecimalField(12, 2)
- `currency` — CharField(3, choices=CURRENCY_CHOICES)
- `receiving_entity` — CharField(4, choices=RECEIVING_ENTITY_CHOICES, blank, default="")
- `period_start` — DateField(null, blank)
- `period_end` — DateField(null, blank)
- `agreement_reference` — CharField(120, blank, default="")
- `notes` — TextField(blank, default="")
- `__str__` -> `f"{self.name} - {self.amount} {self.currency}"`

### 5. Deliverable  (`db_table = 'fundraising_deliverable'`, ordering `['due_date']`)
- `opportunity` — FK(Opportunity, null, blank, CASCADE, related_name='deliverables')
- `grant` — FK(Grant, null, blank, CASCADE, related_name='deliverables')
- `kind` — CharField(20, choices=DELIVERABLE_KIND_CHOICES)
- `title` — CharField(200)
- `due_date` — DateField(null, blank)
- `status` — CharField(20, choices=DELIVERABLE_STATUS_CHOICES, default='open')
- `notes` — TextField(blank, default="")
- **Meta.constraints:** a `CheckConstraint` named `deliverable_exactly_one_parent` enforcing exactly one of `opportunity`/`grant` is set:
  `(Q(opportunity__isnull=False) & Q(grant__isnull=True)) | (Q(opportunity__isnull=True) & Q(grant__isnull=False))`
  (import `Q, CheckConstraint` from `django.db.models`)
- `__str__` -> `f"{self.title} (due {self.due_date})"`

### 6. Interaction  (`db_table = 'fundraising_interaction'`, ordering `['-occurred_at']`)
- `contact` — FK(Contact, CASCADE, related_name='interactions')
- `channel` — CharField(20, choices=INTERACTION_CHANNEL_CHOICES)
- `direction` — CharField(10, choices=INTERACTION_DIRECTION_CHOICES, blank, default="")
- `occurred_at` — DateTimeField()
- `summary` — CharField(300, blank, default="")
- `body` — TextField(blank, default="")
- `campaign` — FK('Campaign', null, blank, SET_NULL, related_name='interactions')
- `source_draft` — FK('Draft', null, blank, SET_NULL, related_name='interactions')  # the sent draft that produced this (auto-log)
- `external_id` — CharField(200, blank, default="", db_index=True)  # gmail msg id / mailchimp id, for sync dedup
- **Meta.constraints:** a `UniqueConstraint` named `interaction_external_id_unique` on `['external_id']` with `condition=~Q(external_id='')` (dedup only when an external id is present; manual interactions stay un-constrained)
- `__str__` -> `f"{self.get_channel_display()} with {self.contact.name} @ {self.occurred_at:%Y-%m-%d}"`

### 7. Campaign  (`db_table = 'fundraising_campaign'`, ordering `['-start_date']`)
- `name` — CharField(200)
- `theme` — CharField(200, blank, default="")
- `start_date` — DateField(null, blank)
- `end_date` — DateField(null, blank)
- `notes` — TextField(blank, default="")
- `__str__` -> `self.name`

### 8. Draft  (`db_table = 'fundraising_draft'`, ordering `['-created_at']`)  — the ADR 0007 heart
- `kind` — CharField(30, choices=DRAFT_KIND_CHOICES)
- `status` — CharField(12, choices=DRAFT_STATUS_CHOICES, default='draft')
- `contact` — FK(Contact, null, blank, SET_NULL, related_name='drafts')
- `opportunity` — FK(Opportunity, null, blank, SET_NULL, related_name='drafts')
- `campaign` — FK(Campaign, null, blank, SET_NULL, related_name='drafts')
- `created_by_agent` — CharField(60, blank, default="")  # which agent produced it
- `subject` — CharField(300, blank, default="")  # email subject / issue title
- `draft_body` — TextField()  # written at creation; never overwritten
- `final_body` — TextField(blank, default="")  # attached after the human sends
- `edit_classification` — JSONField(null, blank)  # {magnitude, categories:[voice|facts|structure|killed]} from edit_capture.classify
- `external_ref` — CharField(200, blank, default="", db_index=True)  # gmail draft id / mailchimp campaign id
- `sent_at` — DateTimeField(null, blank)
- `__str__` -> `f"{self.get_kind_display()} draft [{self.status}]"`

### 9. ContactMergeLog  (`db_table = 'fundraising_contact_merge_log'`, ordering `['-created_at']`)
- `winner` — FK(Contact, CASCADE, related_name='merges_won')
- `loser` — FK(Contact, CASCADE, related_name='merges_lost')
- `loser_snapshot` — JSONField()  # full field snapshot of loser at merge time (for unmerge + survivorship audit)
- `reason` — TextField(blank, default="")
- `merged_by` — FK(User, null, blank, SET_NULL, related_name='+')  # from django.contrib.auth.models import User
- `active` — BooleanField(default=True)  # False after an unmerge
- `__str__` -> `f"merged contact {self.loser_id} -> {self.winner_id}"`

### 10. Expectation  (`db_table = 'fundraising_expectation'`, ordering `['next_expected_date']`)
- `contact` — FK(Contact, CASCADE, related_name='expectations')
- `kind` — CharField(20, choices=EXPECTATION_KIND_CHOICES)
- `grant` — FK(Grant, null, blank, SET_NULL, related_name='expectations')  # an annual-grant expectation links to its Grant
- `amount` — DecimalField(12, 2, null, blank)
- `currency` — CharField(3, choices=CURRENCY_CHOICES, blank, default="")
- `cadence` — CharField(10, choices=EXPECTATION_CADENCE_CHOICES)
- `next_expected_date` — DateField(null, blank)
- `active` — BooleanField(default=True)
- `notes` — TextField(blank, default="")
- `__str__` -> `f"{self.get_kind_display()} expectation for {self.contact.name}"`

## Admin (`fundraising/admin.py`)

Register all 10 with `@admin.register(...)` + `ModelAdmin`, following `PublishedStatAdmin`'s shape. Sensible defaults:
- **Contact:** `list_display=('name','kind','tier','segment','primary_email','newsletter_consent')`, `list_filter=('kind','tier','segment','newsletter_consent')`, `search_fields=('name','primary_email')`.
- **Donation:** `list_display=('contact','amount','currency','receiving_entity','date')`, `list_filter=('receiving_entity','currency')`, `date_hierarchy='date'`, `search_fields=('contact__name',)`.
- **Opportunity:** `list_display=('name','contact','stage','amount_requested','deadline')`, `list_filter=('stage',)`, `search_fields=('name','contact__name')`.
- **Grant:** `list_display=('name','contact','amount','currency','period_start','period_end')`, `search_fields=('name','contact__name')`.
- **Deliverable:** `list_display=('title','kind','status','due_date')`, `list_filter=('kind','status')`, `date_hierarchy='due_date'`.
- **Interaction:** `list_display=('contact','channel','direction','occurred_at')`, `list_filter=('channel','direction')`, `date_hierarchy='occurred_at'`, `search_fields=('contact__name','summary')`.
- **Campaign:** `list_display=('name','theme','start_date','end_date')`.
- **Draft:** `list_display=('kind','status','created_by_agent','contact','sent_at','created_at')`, `list_filter=('kind','status','created_by_agent')`, `readonly_fields=('created_at','updated_at')`.
- **ContactMergeLog:** `list_display=('winner','loser','active','created_at')`, `list_filter=('active',)`, `readonly_fields=('loser_snapshot','created_at','updated_at')`.
- **Expectation:** `list_display=('contact','kind','cadence','amount','next_expected_date','active')`, `list_filter=('kind','cadence','active')`.

## Tests (`fundraising/tests.py`, Django `TestCase`)

Prove the schema and its guarantees:
1. A `Contact` + `Donation` + `Opportunity` -> won -> `Grant` + a report `Deliverable` on the grant can all be created and related (happy-path smoke).
2. The `Deliverable` CheckConstraint **rejects** both-null and both-set (wrap each in `assertRaises(IntegrityError)` inside `transaction.atomic()`); accepts exactly-one.
3. The `Interaction` external_id partial-unique **rejects** a duplicate non-empty `external_id`, but **allows** two interactions with empty `external_id`.
4. A `Draft` created with `draft_body` and later given a `final_body` retains both (the loop's core guarantee).
5. `Contact.merged_into` self-link + a `ContactMergeLog` row with a `loser_snapshot` can be created (identity smoke).

## Build & verify steps (Codex)

1. `git checkout -b feature/fundraising-spine` in the backend repo (currently clean on `main`).
2. Create the app: `venv/bin/python manage.py startapp fundraising` (then trim boilerplate — remove unused `views.py`/`tests.py` scaffolding you don't use; keep `models.py`, `admin.py`, `apps.py`, `tests.py`, `migrations/`).
3. Write `models.py` (choice constants + 10 models + module docstring), `admin.py`, `apps.py`.
4. Register `'fundraising'` in `settings.py:52`.
5. `venv/bin/python manage.py makemigrations fundraising` -> expect `0001_initial.py`.
6. `venv/bin/python manage.py migrate` (applies to the local snapshot DB; additive, safe).
7. `venv/bin/python manage.py test fundraising` -> all green.
8. `venv/bin/python manage.py check` -> no issues.
9. Do NOT commit. Report: files created/changed, migration name, and the test output.

## Explicitly OUT of scope this increment

React `/operations/fundraising` UI; CSV import; Tool Belt functions; Airtable content sync; DRF endpoints; the merge *operation* logic; `edit_capture.classify` logic; Gmail/Mailchimp rails; local-snapshot exclusion tooling (documentation note only). These come in later increments.

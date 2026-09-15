# Test Plan: LEAD-2.3 — Online Digital Channel Lead Capture (all Client Types)

> **Status:** Ready — **12 passed / 1 failed / 0 skipped.** The single failure is TC-02's expected-fail assertion for **BUG-LB-007** (Sole Proprietor filtered out of the Client Type dropdown). TC-12 now executes for the first time — it previously skipped itself silently on every run; see the Recording Notes and **BUG-LB-014**.
> **Owner:** QA
> **Last Updated:** 2026-08-21
> **Estimated Duration:** 540s

## Metadata
| Field | Value |
|-------|-------|
| App | Land Bank CRM (Admin Portal) |
| Environment | Dev (`DEV_APP_URL`, active `TEST_ENV=dev`) |
| Login As | RM role (`RM_USERNAME` / `RM_PASSWORD` in the gitignored `.env`) |
| Page under test | Leads → **New Lead** modal (`LandBank.Crm/LBLead-create`), Lead Channel = **Online Digital Channel** |
| Sibling plan | [branch-manual-document-upload.md](branch-manual-document-upload.md) — the same matrix for the **Landbank Branch** channel |
| Downstream | [lead-to-opportunity-lifecycle.md](lead-to-opportunity-lifecycle.md), [../workflow/loan-application-workflow-stages.md](../workflow/loan-application-workflow-stages.md) |

## Objective
> Validate the **Online Digital Channel** lead-capture route for **every selectable Client Type**: the full client-detail form is presented immediately, **no consent or resolution is captured at lead time**, and the only thing that varies across client types is the **Entity Name** field. Consent for these leads is captured later, inside the loan application workflow.

> **Scope boundary.** This plan covers **lead capture only** — the field matrix, requiredness and save behaviour per client type. The downstream pre-screening → conversion → Opportunity path for Individual / Listed Company / Close Corporation is already covered by [lead-to-opportunity-lifecycle.md](lead-to-opportunity-lifecycle.md) (its TC-03 → TC-05) and is not duplicated here. TC-11 below adds the one downstream assertion that is specific to this channel: that the consent stage **is** outstanding in the workflow.

## One process, three variants

Recorded live 2026-08-21 by walking every selectable Client Type on the Online Digital Channel. Unlike the Landbank Branch route — which splits into two genuinely different capture processes — this channel has **a single process** with one field that varies.

**Common to all eight client types** (verified identical):

| Field | Label | Required |
|---|---|---|
| `leadOwner` | Lead Owner | ✅ (self-populates with the signed-in RM) |
| `channel` | Lead Channel | ✅ |
| `leadType` | Client Type | ✅ |
| `title` | Title | ✅ |
| `firstName` | First Name | ✅ |
| `lastName` | Last Name | ✅ |
| `territory` | Province | ✅ |
| `preferredCommunication` | Preferred Communication | ✅ |
| `mobileNumber` | Mobile Number | ✅ |
| `emailAddress` | Email Address | ✅ |
| `description` | Description | — optional |

**The only variation — Entity Name (`organisation`):**

| Variant | Client Types | Entity Name |
|---|---|---|
| **A — Individual** | `Individual (Individual)` | **hidden** (not captured) |
| **B — `(Entity)`-suffixed** | `Close Corporation (Entity)`, `Co-Operative (Entity)`, `Listed Company (Entity)` | shown, **required** |
| **C — non-suffixed** | `Trust`, `NGO`, `Partnership`, `Private Company` | shown, **optional** |

> The B/C split is **identical to the Landbank Branch channel** — the `(Entity)` suffix, not the actual legal form, decides whether Entity Name is mandatory. Tracked as **BUG-LB-009**.

**Never present on this channel, for any client type** — all absent from the DOM entirely:
`manualApproval`, `signatoryIdNumber`, `companyRegistrationNumber`, `signatoryConsent`, `resolution`, `otpPin`.
`uploadResAndConsent` exists but is hidden by class; `idNumber` and `region` are likewise hidden by class.

**Save is enabled from the outset for every client type** — there is no upload gate, no OTP step and no commit button anywhere on this channel.

## How this differs from the Landbank Branch channel

| | **Online Digital Channel** | **Landbank Branch** |
|---|---|---|
| Client-detail block | shown **immediately** | **collapsed** until consent is captured |
| Consent captured at lead time | **no** | **yes** — 1 document (Individual) or 2 (all others) |
| Resolution captured at lead time | **no** | yes, for the seven non-Individual types |
| Distinct capture processes | **1** | **2** |
| **ID Number** for an Individual | **not captured** (hidden) | **required** |
| Request OTP | never offered | offered for Individual when consent is not uploaded |
| Upload / Download Template actions | none | `(press to upload)`, `Upload`, and 1–2 template downloads |
| Save gating | never gated | disabled while the upload toggle is on and uncommitted |
| Consent stage in the workflow | **outstanding** — actioned in the Inbox | already satisfied on arrival |

> **Worth raising:** an Individual captured through the Branch channel must supply a **Luhn-validated ID Number**, but the same Individual captured through the Online Digital Channel is **never asked for one**. The identity of the applicant is therefore unverified at lead capture on this channel. Logged as **BUG-LB-011** below.

## Known Blockers / Defects

> **BUG-LB-011 (data-quality gap, recorded live 2026-08-21).** On the **Online Digital Channel** the `idNumber` field is **hidden for every client type**, including `Individual (Individual)`. The same Individual captured via **Landbank Branch** must supply an ID Number, which is Luhn-validated. So the channel a lead arrives through determines whether the applicant's ID is captured or verified at all. Downstream, the loan application's **ID Verification** step (see [../workflow/loan-application-workflow-stages.md](../workflow/loan-application-workflow-stages.md)) checks the ID against Home Affairs — with no ID captured at lead time, that value has to be supplied later on the Opportunity, and nothing at lead capture enforces it.

> **BUG-LB-009 (carried over).** **Entity Name** is required for the three `(Entity)`-suffixed client types and optional for `Trust`, `NGO`, `Partnership` and `Private Company`, on **both** channels. A Private Company or Trust lead can be created with no entity name at all.

> **BUG-LB-013 (recorded live 2026-08-21).** **Entity Name is never displayed after capture** — not on
> `LBLead-details v58` and not as a column on the Leads grid — even for the client types where the create
> form makes it **mandatory**. The value *is* persisted correctly: the grid's own data request already
> selects `organisation` in its `properties` list and returns
> `"organisation": "AutoQA Online Close Corp CC"`, it simply renders no column for it. So this is a
> **rendering gap, not data loss** — the operator is forced to supply a value they can never read back.
> **TC-04..TC-06** assert the absence on the details page and **TC-13** asserts the persistence, so the
> plan fails loudly if either half changes.
>
> Contrast **BUG-LB-012** on the Landbank Branch channel, where a declined CIPC lookup **wipes** the
> persisted Entity Name outright. Same field, two very different faults.

> **BUG-LB-014 (recorded live 2026-08-21).** On the converted Opportunity's **Client Info** tab,
> *Does the client have a resolution?* (`loanApplication_hasResolution`) is rendered **twice** — both
> instances inside the *same* active tab panel, under the same **Entity Information** heading, both
> read-only and both bound to the same property. This is not the usual Ant tabs artefact of an inactive
> panel being retained; it is a genuine duplicate placement in the `LBOpportunity-details` form
> definition. TC-12 asserts across **every** instance so it will keep passing once the duplicate is
> removed. Surfaced only after the TC-12 silent-skip was fixed — see the Recording Notes.

> **BUG-LB-007 (carried over).** `Sole Proprietor (Individual)` is **not selectable** — the dropdown offers 8 options although the `LandBank.Crm/ClientType` reference list still contains it (item value 3). It was selectable on 2026-07-31, so this is a regression. TC-02 asserts the correct behaviour and is an **expected fail** until it is restored.

## Recording Notes (2026-08-21)

- `region` is **hidden by class** on this channel and derived server-side from Province after save (Gauteng → *Central Region*).
- `uploadResAndConsent` is present in the DOM but hidden — the switch simply never surfaces on this channel, so the branch plan's toggle assertions do not apply here.
- **Two different mechanisms hide conditional fields**, and a spec must handle both (this cost a full repair cycle on the sibling plan):
  - **class-based** — the form item stays in the DOM and gains `ant-form-item-hidden`: `region`, `idNumber`, `uploadResAndConsent`, and `organisation` for an Individual.
  - **DOM removal** — the form item is absent entirely: every consent/resolution control on this channel.
- Ant Design conventions: fields anchored on `<label for>` via a **direct-child** chain; select options matched on their `title` inside the open dropdown; once a select holds a value its hidden `<input>` is click-intercepted, so the trigger must be the `.ant-select-selector`.
- **Reading a select's option list must be scoped to that select's own listbox** (`aria-controls="rc_select_<n>_list"`). A dropdown that was just closed only gains `-hidden` asynchronously, so an unscoped read can concatenate two selects' options.
- The Client Type dropdown offers 8 options; `Co-Applicant` (reference-list value 9) is excluded by design as a participant role, not a lead client type.
- **Asserting on the lead details page — two traps, both hit on 2026-08-21:**
  - The page renders reference-list values **word-cased** (`New`), *not* upper-cased (`NEW`) as the `LeadStatus` item name suggests. An assertion on `NEW` fails.
  - Its read-only fields **concatenate with no separators** — `main`'s text reads `…LeadStatusNewAssessment…` — so a `/\bNew\b/` regex never matches either. Anchor on the label instead: `/Lead\s*Status\s*New/i`.
- **The Leads grid is div-based, with no `<thead>` and no real `<table>`.** Column headers are `[role="columnheader"]` cells (the accessibility tree shows `table`/`row` because those are ARIA roles on divs). Asserting `expect(page.locator('table thead')).not.toContainText(...)` **fails on a zero-element locator** rather than passing vacuously — read `allInnerTexts()` off `[role="columnheader"]` and assert in plain JS instead.
- **Opening a record from a grid:** each row's first cell holds an `a.sha-link` pointing at `…-details?id=<guid>`. Read its `href` and `goto` it rather than clicking — unambiguous and immune to row-level click handlers. **Wait for `[role="row"].tr-body` to be visible first**: the grid fetches asynchronously, so a `count()` issued straight after `goto` returns 0.
- **Never put a conditional `test.skip` in a test body.** TC-12 did exactly that — it queried the grid before it had loaded, found 0 rows, and skipped itself with *"run TC-04 first"* on **every** run, despite TC-04 running immediately before it. The test never executed once, and reported a plausible reason each time. Where an earlier TC in the same plan guarantees the precondition, **assert** it. Removing that skip immediately exposed two real faults (see **BUG-LB-014**).
- **The grid's data request is a convenient read-back channel.** `GET /api/services/app/Entities/GetAll?entityType=LandBank.Crm.Domain.LBLead&…` selects `organisation` in its `properties` list even though no column renders it, so TC-13 can verify persistence by observing that response — no separate API authentication needed. (The bearer token is stored base64-encoded in `localStorage` under an obfuscated key, so calling the API by hand is far more trouble.)

## Preconditions
- [ ] App is reachable at the Dev URL; valid RM credentials in `.env`
- [ ] The signed-in RM can see **Leads** and the **New Lead** toolbar button
- [ ] Luhn-valid SA ID numbers available for the downstream Opportunity work: `9001015800088`, `8503155400083`

## Test Cases

### TC-01 — Log in as an RM and open the New Lead form on the Online Digital Channel
- **Type:** Happy path
- **Steps:**
  - NAVIGATE to `/login`
  - TYPE the Username field with the RM username (from `.env`)
  - TYPE the Password field with the RM password (from `.env`)
  - CLICK **Sign In**
  - WAIT for the app to redirect away from `/login`
  - NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table`
  - SNAPSHOT — confirm the **New Lead** button is rendered
  - CLICK **New Lead**
  - WAIT for the **Add New Lead** modal to open
  - SNAPSHOT — confirm **Lead Owner** self-populates with the signed-in RM
  - SELECT Lead Channel — choose `Online Digital Channel`
  - SNAPSHOT — confirm the client-detail block is rendered immediately
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **Add New Lead** modal is displayed
  - [x] ASSERT **Lead Owner** self-populates with the signed-in RM
  - [x] ASSERT selecting `Online Digital Channel` presents the client-detail block **immediately** — Title, First Name, Last Name, Province and Preferred Communication are all shown
  - [x] ASSERT **Save** is enabled from the outset
  - [x] ASSERT no consent or resolution control is present — `manualApproval`, `signatoryConsent`, `resolution`, `signatoryIdNumber`, `companyRegistrationNumber` and `otpPin` are all absent
  - [x] ASSERT no **Request OTP**, **Upload**, or **Download …Template** action is offered
  - [x] ASSERT the *Upload Resolution and Consent?* switch is not shown

---

### TC-02 — The Client Type dropdown offers exactly the eight selectable types
- **Type:** Happy path — inventory check
- **Depends on:** TC-01
- **Steps:**
  - CLICK the Client Type select trigger
  - SNAPSHOT — confirm the full option list
  - EXTRACT every Client Type option
- **Assertions:**
  - [x] ASSERT (BLOCKING) the dropdown offers exactly — `Individual (Individual)`, `Close Corporation (Entity)`, `Co-Operative (Entity)`, `Listed Company (Entity)`, `Trust`, `NGO`, `Partnership`, `Private Company`
  - [x] ASSERT `Co-Applicant` is **not** offered (participant role, excluded by design)
  - [x] ASSERT the option list is identical to the Landbank Branch channel's — Client Type availability does not vary by channel
  - [x] ASSERT `Sole Proprietor (Individual)` **is** offered — *expected FAIL: BUG-LB-007*

---

### TC-03 — Individual: Entity Name is not captured
- **Type:** Happy path (Variant A)
- **Depends on:** TC-01
- **Steps:**
  - SELECT Client Type — choose `Individual (Individual)`
  - SNAPSHOT — confirm the Individual field set
  - SELECT Title — choose `Ms`
  - TYPE the First Name field with `AutoQA`
  - TYPE the Last Name field with `OnlineIndividual`
  - SELECT Province — choose `Gauteng`
  - SELECT Preferred Communication — choose `Email`
  - TYPE the Mobile Number field with `0820000601`
  - TYPE the Email Address field with `autoqa.online.individual@example.com`
  - TYPE the Description field with `AutoQA online digital channel — Individual.`
  - SNAPSHOT — confirm **Save** is enabled
  - CLICK **Save**
  - WAIT for the lead details page to load
  - SNAPSHOT — confirm the saved lead
- **Assertions:**
  - [x] ASSERT (BLOCKING) **Entity Name is hidden** for an Individual
  - [x] ASSERT the eleven common fields are displayed, with only Description optional
  - [x] ASSERT **ID Number is not captured** on this channel — *see BUG-LB-011; contrast with the Branch channel, where it is required for an Individual*
  - [x] ASSERT the lead saves and the URL becomes the lead details route (`/dynamic/LandBank.Crm/LBLead-details?id=`)
  - [x] ASSERT the saved lead shows status `NEW`
  - [x] ASSERT the saved lead records Client Type `Individual (Individual)` and Lead Channel `Online Digital Channel`
  - [x] ASSERT **Region** is derived from the selected Province (`Gauteng` → `Central Region`)
  - [x] ASSERT the **Initiate Pre-Screening** action is available on the saved lead

---

### TC-04 — Close Corporation: Entity Name required
- **Type:** Happy path (Variant B)
- **Depends on:** TC-01
- **Steps:**
  - SELECT Client Type — choose `Close Corporation (Entity)`
  - SNAPSHOT — confirm **Entity Name** is revealed and required
  - SELECT Title — choose `Mr`
  - TYPE the First Name field with `AutoQA`
  - TYPE the Last Name field with `OnlineCloseCorp`
  - TYPE the Entity Name field with `AutoQA Online Close Corp CC`
  - SELECT Province — choose `Gauteng`
  - SELECT Preferred Communication — choose `Email`
  - TYPE the Mobile Number field with `0820000602`
  - TYPE the Email Address field with `autoqa.online.closecorp@example.com`
  - CLICK **Save**
  - WAIT for the lead details page to load
  - SNAPSHOT — confirm the saved lead
- **Assertions:**
  - [x] ASSERT (BLOCKING) **Entity Name is revealed and required** for an `(Entity)`-suffixed client type
  - [x] ASSERT no consent or resolution control appears when an entity client type is selected on this channel
  - [x] ASSERT attempting to save with Entity Name empty is blocked
  - [x] ASSERT the lead saves and records Client Type `Close Corporation (Entity)` and Lead Channel `Online Digital Channel`
  - [x] ASSERT the captured Entity Name is **NOT displayed anywhere on the lead details page** — *flagged as BUG-LB-013: a field the form makes mandatory is never rendered on the saved record*
  - [x] ASSERT the value nevertheless **persists** — proven in TC-13, read back off the Leads grid's own data request

---

### TC-05 — Co-Operative: Entity Name required
- **Type:** Happy path (Variant B)
- **Depends on:** TC-01
- **Steps:** As TC-04, with these substitutions:
  - SELECT Client Type — choose `Co-Operative (Entity)`
  - TYPE the Last Name field with `OnlineCoOp`
  - TYPE the Entity Name field with `AutoQA Online Co-Op`
  - TYPE the Mobile Number field with `0820000603`
  - TYPE the Email Address field with `autoqa.online.coop@example.com`
- **Assertions:**
  - [x] ASSERT (BLOCKING) **Entity Name is required**
  - [x] ASSERT the field set is otherwise identical to Close Corporation's
  - [x] ASSERT the lead saves and records Client Type `Co-Operative (Entity)`

---

### TC-06 — Listed Company: Entity Name required
- **Type:** Happy path (Variant B)
- **Depends on:** TC-01
- **Steps:** As TC-04, with these substitutions:
  - SELECT Client Type — choose `Listed Company (Entity)`
  - TYPE the Last Name field with `OnlineListedCo`
  - TYPE the Entity Name field with `AutoQA Online Listed Co Ltd`
  - TYPE the Mobile Number field with `0820000604`
  - TYPE the Email Address field with `autoqa.online.listedco@example.com`
- **Assertions:**
  - [x] ASSERT (BLOCKING) **Entity Name is required**
  - [x] ASSERT the field set is otherwise identical to Close Corporation's
  - [x] ASSERT the lead saves and records Client Type `Listed Company (Entity)`

---

### TC-07 — Trust: Entity Name optional
- **Type:** Happy path (Variant C)
- **Depends on:** TC-01
- **Steps:**
  - SELECT Client Type — choose `Trust`
  - SNAPSHOT — confirm **Entity Name** is shown but not required
  - SELECT Title — choose `Mr`
  - TYPE the First Name field with `AutoQA`
  - TYPE the Last Name field with `OnlineTrust`
  - SELECT Province — choose `Gauteng`
  - SELECT Preferred Communication — choose `Email`
  - TYPE the Mobile Number field with `0820000605`
  - TYPE the Email Address field with `autoqa.online.trust@example.com`
  - CLICK **Save** *(deliberately leaving Entity Name empty)*
  - WAIT for the lead details page to load
  - SNAPSHOT — confirm the saved lead
- **Assertions:**
  - [x] ASSERT (BLOCKING) **Entity Name is shown but optional** for a non-suffixed client type
  - [x] ASSERT the lead saves **with Entity Name left empty** — *flagged as BUG-LB-009: inconsistent with the `(Entity)`-suffixed types*
  - [x] ASSERT the lead records Client Type `Trust` and Lead Channel `Online Digital Channel`
  - [x] ASSERT no Trust-specific field is requested — this channel captures no trust registration (IT) number

---

### TC-08 — NGO: Entity Name optional
- **Type:** Happy path (Variant C)
- **Depends on:** TC-01
- **Steps:** As TC-07, with these substitutions:
  - SELECT Client Type — choose `NGO`
  - TYPE the Last Name field with `OnlineNgo`
  - TYPE the Mobile Number field with `0820000606`
  - TYPE the Email Address field with `autoqa.online.ngo@example.com`
- **Assertions:**
  - [x] ASSERT (BLOCKING) **Entity Name is shown but optional**
  - [x] ASSERT the lead saves with Entity Name left empty
  - [x] ASSERT the lead records Client Type `NGO`
  - [x] ASSERT no NPO registration number is requested

---

### TC-09 — Partnership: Entity Name optional
- **Type:** Happy path (Variant C)
- **Depends on:** TC-01
- **Steps:** As TC-07, with these substitutions:
  - SELECT Client Type — choose `Partnership`
  - TYPE the Last Name field with `OnlinePartnership`
  - TYPE the Mobile Number field with `0820000607`
  - TYPE the Email Address field with `autoqa.online.partnership@example.com`
- **Assertions:**
  - [x] ASSERT (BLOCKING) **Entity Name is shown but optional**
  - [x] ASSERT the lead saves with Entity Name left empty
  - [x] ASSERT the lead records Client Type `Partnership`

---

### TC-10 — Private Company: Entity Name optional
- **Type:** Happy path (Variant C)
- **Depends on:** TC-01
- **Steps:** As TC-07, with these substitutions:
  - SELECT Client Type — choose `Private Company`
  - TYPE the Last Name field with `OnlinePrivateCo`
  - TYPE the Mobile Number field with `0820000608`
  - TYPE the Email Address field with `autoqa.online.privateco@example.com`
- **Assertions:**
  - [x] ASSERT (BLOCKING) **Entity Name is shown but optional**
  - [x] ASSERT the lead saves with Entity Name left empty — a Private Company lead can be created with no entity name (BUG-LB-009)
  - [x] ASSERT the lead records Client Type `Private Company`

---

### TC-11 — The field matrix holds across every client type, and Save is never gated
- **Type:** Happy path — cross-cutting
- **Depends on:** TC-01
- **Steps:**
  - For each of the eight selectable Client Types:
    - SELECT the Client Type
    - SNAPSHOT — confirm the common field set and the Entity Name state
    - SNAPSHOT — confirm **Save** is enabled with no documents involved
- **Assertions:**
  - [x] ASSERT (BLOCKING) the eleven common fields are present for **every** client type, with only Description optional
  - [x] ASSERT **Entity Name** is hidden for `Individual (Individual)`, required for the three `(Entity)`-suffixed types, and optional for the four non-suffixed types
  - [x] ASSERT **Save is enabled for every client type** — this channel never gates Save behind a document upload
  - [x] ASSERT no consent, resolution, OTP, upload or template control appears for **any** client type
  - [x] ASSERT `region` and `idNumber` remain hidden for every client type
  - [x] ASSERT switching Client Type does not leave a previous type's fields behind

---

### TC-12 — An online-captured lead leaves its consent stage outstanding in the workflow
- **Type:** Happy path — downstream verification, channel-specific
- **Depends on:** TC-04
- **Steps:**
  - NAVIGATE to the lead saved in TC-04
  - CLICK **Initiate Pre-Screening**
  - Answer all seven pre-screening questions to a passing outcome
  - CLICK the confirmation checkbox, then **Submit**
  - WAIT for the lead to convert
  - CLICK the **Converted To Opportunity** link
  - SNAPSHOT — confirm the Opportunity's consent-related fields
- **Assertions:**
  - [x] ASSERT (BLOCKING) the lead converts with Lead Status `Converted` and Assessment `Passed` — *note the word-casing: the page does **not** render `CONVERTED` / `PASSED`*
  - [x] ASSERT the Opportunity carries **no** consent document from lead capture — contrast with the Branch channel, where the uploaded consent carries through
  - [x] ASSERT *Does the client have a resolution?* is **not** set on the converted Opportunity — asserted across **every** rendered instance of the field, because it is duplicated (**BUG-LB-014**)
  - [x] ASSERT once the loan application is initiated, the Inbox presents an outstanding **Upload Entity Consent** action for this ENTITY application — the consent is captured **in the workflow**, not at lead capture
  - [x] ASSERT the equivalent Individual lead presents **Upload Individual Consent**

---

### TC-13 — Entity Name persists on the saved lead although the details page never shows it
- **Type:** Data-integrity verification — isolates **BUG-LB-013** to a rendering gap
- **Depends on:** TC-04, TC-05, TC-06 (the three Entity-Name-required scenarios must have saved)
- **Why this exists:** TC-04..TC-06 assert Entity Name is *absent from the UI* after save. On its own
  that is ambiguous — it could equally mean the value was never stored. This TC settles it, so the two
  failure modes can never be confused. Contrast **BUG-LB-012**, where the value genuinely *is* lost.
- **Steps:**
  - NAVIGATE to the Leads table (`LBLead-table`), sorted newest first
  - API observe the grid's own data request — `GET /api/services/app/Entities/GetAll?entityType=LandBank.Crm.Domain.LBLead&…`
    — whose `properties` list already selects `organisation`, so no separate API authentication is needed
  - EXTRACT `lastName` and `organisation` for every returned lead
- **Assertions:**
  - [x] ASSERT (BLOCKING) for each of `OnlineCloseCorp`, `OnlineCoOp` and `OnlineListedCo`, the persisted `organisation` equals the Entity Name typed at capture, verbatim
  - [x] ASSERT for the optional-variant client types saved with Entity Name left blank, `organisation` persists as `null` — no silent default is substituted
  - [x] ASSERT the Leads grid renders **no Entity Name column**, so the value is unreadable in the UI on the grid as well as the details page

## Test Data Notes
- Leads created by this plan are prefixed `AutoQA` and named `Online<ClientType>`, with mobile numbers in the `08200006xx` range and `@example.com` addresses, so they are easy to filter out of the Dev Leads grid.
- TC-07 → TC-10 deliberately **leave Entity Name empty** to prove it is optional for the non-suffixed types. That is the assertion, not an oversight.
- No documents are needed anywhere in this plan — this channel captures none. `test-data/pdf-test.pdf` is not used.
- TC-12 requires the full Opportunity capture prerequisites before the loan application can be initiated — see [../opportunities/opportunity-loan-application-capture.md](../opportunities/opportunity-loan-application-capture.md) for the mandatory field and document sets, and note **BUG-LB-001** (validation returned as HTTP 500 with no user-facing message) still applies at that step.
- This plan is authored from a **read-only** recording of the form on 2026-08-21 — the field matrix and requiredness were verified live for all eight client types, but no lead was saved. TC-03 → TC-12 will exercise the save path for the first time on their first run.

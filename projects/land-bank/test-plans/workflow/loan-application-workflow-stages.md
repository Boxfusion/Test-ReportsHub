# Test Plan: WF-4.1 — Loan Application Workflow Stages (Inbox → Consent → Verification → Onboarding → Complete)

> **Status:** Ready — entity path recorded end to end; individual path + per-person ID verification pending (see Recording Status)
> **Owner:** QA
> **Last Updated:** 2026-08-05
> **Estimated Duration:** 900s

## Metadata
| Field | Value |
|-------|-------|
| App | Land Bank CRM (Admin Portal) |
| Environment | Dev (`DEV_APP_URL`, active `TEST_ENV=dev`) |
| Login As | RM role (`RM_USERNAME` / `RM_PASSWORD` in the gitignored `.env`) |
| Pages under test | Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`), Workflow action (`/shesha/workflow-action?id=&todoid=`), Opportunity details (`/dynamic/LandBank.Crm/LBOpportunity-details?id=`), Participant details (`/dynamic/LandBank.Crm/application-participant-panels-revised?id=`) |
| Workflow step forms | `loan-application-wf-manual-upload-entity-consent v75`, `loan-application-wf-confirm-verification-outcomes v89`, `complete-pre-onboarding-checklist v16`, `loan-application-wf-pre-onboarding-checklist v37` |
| Supporting forms | `lb-entity-manual-consent v13` (per-approver consent panel), `entity-application-verification-details-details v23` (entity verification dialog), `check-loan-application-verifications v42`, `signatory-new-list v12`, `director-verifications-datalist v4`, `participant-verifications-datalist v4` |
| Upstream plans | [../opportunities/opportunity-loan-application-capture.md](../opportunities/opportunity-loan-application-capture.md), [../leads/lead-to-opportunity-lifecycle.md](../leads/lead-to-opportunity-lifecycle.md) |

> **The Inbox is the only workflow surface these plans use.** *Sent Items*, *My Items* and *Drafts* are explicitly **out of scope** — they are not part of how users interact with workflow items. Every stage-sequence assertion is made by re-reading the **Inbox** after an action, not from a history view.

## Objective
> Validate the **Loan Application Workflow** after initiation: the initiated application appears at the **top of the RM Inbox** with the correct **Action Required**; each stage opens its own workflow page; consent can be satisfied either **electronically (OTP)** or by **manual upload + declaration + Submit**; verification outcomes are confirmed per party through the verification dialog; **Complete Onboarding Checklist** is the final stage for every route and completes the process; the application **status always corresponds** to the outstanding action; and an unsigned/un-uploaded consent terminates the application as **Terminated - Consent Not Provided**.

> **Out of scope (per instruction):** the `Blocked` application status — it belongs to a downstream process.

## Stage Model (recorded live 2026-08-05)

`LoanApplicationStatus` reference list, read from the app's own API — the authoritative status vocabulary:

| Value | Status | Corresponding Action Required |
|---|---|---|
| 1 | `Draft` | *not yet initiated* |
| 2 | `Resolution Pending` | **Upload Resolution** |
| 3 | `Consent Pending` | **Upload Entity Consent** *(ENTITY)* / **Upload Individual Consent** *(PERSONAL)* |
| 4 | `Verification In Progress` | **Confirm verification outcomes** |
| 5 | `Pre-Onboarding` | **Complete Onboarding Checklist** |
| 6 | `Complete` | *process complete* |
| 7 | `Withdrawn` | *terminal* |
| 8 | `Declined` | *terminal* |
| 9 | `Terminated - Consent Not Provided` | *terminal — consent not signed / uploaded in time* |
| 10 | `Terminated - Failed Verification` | *terminal* |
| 11 | `Sent Back` | *returned for rework* |
| 12 | `Blocked` | **out of scope** |

### The consent stage is mandatory, never skipped

Every application passes through a consent stage — **Upload Individual Consent** for a PERSONAL application, **Upload Entity Consent** for an ENTITY one. What varies is *where* the consent is captured:

| Lead Channel | Consent (and resolution, for entities) | Effect on the workflow |
|---|---|---|
| **Online Digital Channel** (and other non-branch channels) | captured **during the workflow**, at the consent stage | the consent stage is outstanding in the Inbox and must be actioned |
| **Landbank Branch** | captured **upfront at lead capture** (*Upload Consent? / Upload Resolution and Consent?* — see the lead plan) | the consent already exists, so the stage is satisfied on arrival |

> **Correction (2026-08-05):** an earlier revision of this plan claimed the consent stage was *conditional/skippable*, inferred from a stage-history view. That was wrong on two counts — the history view is out of scope, and the stage is mandatory. Verified live: `LA2026/14392` (ENTITY, Online Digital Channel) initiated **directly into `CONSENT PENDING` / Upload Entity Consent**, because its resolution had already been supplied on the Opportunity but its consent had not.

### Observed transition, verified live end to end on `LA2026/14392`

```
Initiate  →  CONSENT PENDING / "Upload Entity Consent"
          →  (manual upload + declaration + Submit)
          →  "Confirm verification outcomes"
          →  "Complete Onboarding Checklist"
          →  Complete
```

## Consent stage mechanics (Upload Resolution / Upload Entity Consent / Upload Individual Consent)

All three consent-family stages share the same mechanics — **two routes that may run simultaneously**:

1. **Electronic (OTP) route.** Each required approver is notified and signs electronically. The stage lists one panel per approver (`lb-entity-manual-consent v13`) showing the approver's name, a **status chip** (`NOTIFICATION SENT` on arrival), **Date Sent**, **Date Signed**, and a **Download …Consent Document** link to the generated PDF (e.g. `SignatoryConsent_20260805_200a83d1.pdf`).
   - **If all required approvers sign electronically, the workflow advances on its own** — no Submit is needed. The Inbox may need a **page refresh and a re-navigation to the Inbox** before the Action Required visibly changes.
2. **Manual upload route.** Each approver panel also exposes **Upload Consent Document** (required, `manualApproval`).
   - **If any manual upload is done, the declaration checkbox must be ticked and Submit clicked** to advance. The declaration reads:
     *"I confirm that the manual override of uploading the consent form(s) is intentional"*.
   - **Recorded live:** the **Submit** button is **not rendered at all** until the declaration checkbox is ticked. Ticking it reveals Submit; clicking Submit advances the stage and **redirects straight back to the Inbox**.

**Required approvers per stage:** the **signatories** are the required approvers for **Upload Entity Consent** — directors and shareholders are listed on the page for context but are not consent approvers. For **Upload Individual Consent** the required approver is the **main applicant**, plus the **spouse / surety / co-applicant** where applicable. **Upload Resolution** requires the resolution approvers.

### The two consent stages use different forms and behave differently

Recorded live: **entity** on `LA2026/14392` (2026-08-05) and **individual** on `LA2026/14623` (2026-08-11).

| | **Upload Entity Consent** | **Upload Individual Consent** |
|---|---|---|
| Step form | `loan-application-wf-manual-upload-entity-consent v75` | `lb-manual-upload-consent v52` |
| Section title | *(none)* | **Manual Upload Consent** |
| Per-approver sub-form | `lb-entity-manual-consent v13` | `lb-manual-consent-sub-form v9` |
| Field prefix | *(unprefixed)* — `creationTime`, `blankApproval`, `manualApproval` | **`subForm2_`** — `subForm2_creationTime`, `subForm2_blankApproval`, `subForm2_manualApproval` |
| Download label | **Download Entity Consent Document** (`SignatoryConsent_<date>_<hash>.pdf`) | **Download Consent Document** (`ConsentForm_<date>.pdf`) |
| Upload label | **Upload Consent Document** | **Upload Signed Consent Document** |
| Status chip | `NOTIFICATION SENT` (upper case) | `Notification Sent` (title case) |
| Helper text | *(none)* | *"Please upload your signed consent document below."* |
| Declaration text | *"I confirm that the manual override of uploading the consent form(s) is intentional"* | *"I confirm that the manual consent is intentional"* |
| **Submit before the declaration is ticked** | **not rendered at all** | **rendered but disabled** |
| After ticking the declaration | Submit appears | Submit becomes enabled |
| On Submit | redirects to the Inbox; stage advances | redirects to the Inbox; stage advances |

> Both differences matter for automation: a spec that asserts "Submit is absent" passes on the entity stage and fails on the individual one, and the declaration text differs, so neither can be matched with a single shared locator.

**Who advances to what:**

| Stage | All approvers signed electronically → next stage | Any manual upload → declaration + Submit → next stage |
|---|---|---|
| Upload Resolution | **Upload Entity Consent** | **Upload Entity Consent** |
| Upload Entity Consent | **Confirm verification outcomes** | **Confirm verification outcomes** |
| Upload Individual Consent | **Confirm verification outcomes** | **Confirm verification outcomes** |

## Confirm verification outcomes mechanics

Form `loan-application-wf-confirm-verification-outcomes` (v89 entity / v91 individual). The page lists **every party captured on the Opportunity**, grouped into datalists, plus the **entity itself** when the applicant is an entity.

**ENTITY layout** — recorded on `LA2026/14392`:

| Section | Sub-form | Recorded content |
|---|---|---|
| Company / entity | `check-loan-application-verifications v42` | `AutoQA Listed Co Ltd` — **Company Verifications: Awaiting Review**; `Entity Compliance Status: Completed` |
| Signatories | `signatory-new-list v12` | `Nomsa AutoQASignatory 9001015800088` |
| Directors | `director-verifications-datalist v4` | `Thandiwe AutoQADirector 9207125001083` |
| Shareholders / participants | `participant-verifications-datalist v4` | `Sipho AutoQAShareholder 8503155400083`, with a **Verification Status** column |

**PERSONAL layout** — recorded on `LA2026/14623` (2026-08-11). Only `check-loan-application-verifications v43` is present; there are **no signatory / director / shareholder datalists**:

| Section | Recorded content |
|---|---|
| **Verifications → Main Applicant** | `AutoQA IndivWorkflow` — Outcome **TBD**, status button **Awaiting Review** |
| **Co-Applicant Verifications** | *No data* (populated only when *Does the client have a co-applicant?* is set) |
| **Surety Verifications** | *No data* (populated only when *Does the client have a surety?* is set) |

Page-level actions (both layouts): **Finalise Verification Outcomes** and **Flag As High Risk**.

**Per-party review.** Each party carries a status button (recorded label: **`Awaiting Review`**) which opens that party's verification dialog. For the **entity** the dialog is `entity-application-verification-details-details v23` with tabs **Overview / CIPC / Compliance** and a **Verification Summary** listing each verification and its status (recorded: `CIPC — AWAITING REVIEW`, `Compliance`).

The **CIPC** tab showed a real verification result:
- **Verification Status** `AWAITING REVIEW`, **Date Submitted** `05/08/2026`
- **Reason for Failure** (`cipcVerification_reasonForFailure`): *"Company name mismatch: Trade name '', Company name 'BOXFUSION (PTY)LTD'"*
- **Submitted Information** vs **CIPC Returned Information** side by side (returned: reg no `K2012/225386/07`, company name `BOXFUSION (PTY)LTD`, `IN BUSINESS`, `REQUIRES REVIEW`, Commercial Type `Private Company`, VAT `4760252900`, Age of Business `13 Years 8 Months`, Registration Date `2012-12-19`)
- A downloadable CIPC report (`CIPC_Commercial_Profile_Report_…pdf`)
- **`cipcVerification_companyNameReviewDecision`** — **Company Name Review Decision**, the RM's manual decision, options **`Approve`** / **`Reject`**

The dialog is dismissed with the toolbar **Close** button, which is what refreshes the party's status from `Awaiting Review` to its resolved value.

> **Note on the entity dialog:** it exposes the decision select and **Close** only — there is **no Submit button** in the entity CIPC dialog.

### Per-person verification dialog (recorded live 2026-08-11)

Form `main-applicant-verification-details v15`, opened from a person party's **Awaiting Review** status button. Tabs: **Overview**, **ID Verification**, **KYC Verification**. A standing note reads *"Please note that the PEP and AML results are only visible to compliance."*

The **Overview** tab shows a **Verification Summary** listing every verification for that party with its own status — recorded: **ID Verification `AWAITING REVIEW`**, **KYC Verification Status**, **Photo Verification Status**, **Compliance Status**. The dialog header shows the **Home Affairs-returned identity** alongside the captured one (recorded: header `Oria Moraka 9001015800088` for a party captured as `AutoQA IndivWorkflow`).

The **ID Verification** tab is where the RM's manual decision is made:

| Element | Field | Recorded value / behaviour |
|---|---|---|
| Submitted vs Returned comparison | `idVerification_firstNameSubmitted`, `idVerification_lastNameSubmitted`, `idVerification_idNumberSubmitted` vs the returned block | Submitted `AutoQA / IndivWorkflow / 9001015800088`; Returned `Oria Moraka / 9001015800088 / 01/01/1990 / Male` |
| Photo | — | *"No image available"* |
| Report | `idVerification_pdfReport` | `ID_Biometric_Verification_Report_<hash>_<date>.pdf` |
| Automated checks | `idVerification_nameMatchStatus`, `idVerification_idNumberMatchStatus`, `idVerification_deathCheckStatus`, `idVerification_outcome` | **Name Match `FAILED`**, ID Match `PASSED`, Death Check `PASSED`, Outcome `TBD` |
| Failure reason | `idVerification_reasonForFailure` | read-only |
| **The manual decision** | **`idVerification_firstNameReviewDecision`** — *ID Review Decision* | options **`Approve`** / **`Reject`** |
| **Conditional rejection reason** | **`hanisVerification_reviewReason`** — *Rationale* (textarea) | **hidden** by default; choosing **Reject** reveals it **and marks it required**; choosing **Approve** hides it again |
| Actions | — | **Submit** is **disabled until a decision is chosen**; clicking it **saves without closing the dialog** (verified); **Close** then dismisses it |

> **Finding — the party status does not resolve on the ID decision alone.** After choosing **Approve**, clicking **Submit** and then **Close**, the Main Applicant stayed at **Awaiting Review** with Outcome **TBD**, including after a full page reload. Its **KYC Verification**, **Photo Verification** and **Compliance** statuses were still unresolved. So a party's status flips to **Complete** / **Failed** only once **all** of its verifications resolve — not when the ID Verification decision is submitted. Any test that asserts an immediate status change after Close will fail.

## Complete Onboarding Checklist mechanics

Form `complete-pre-onboarding-checklist v16` (embedded in `loan-application-wf-pre-onboarding-checklist v37`). Fields, with the verbatim question text recorded live:

| Field (`label[for]`) | Question | Type |
|---|---|---|
| `subForm1_yearsOfFarmingExperience` | **Years Of Farming Experience** | number |
| `subForm1_requiresWaterUseRights` | Does this operation require Water Use Rights? | checkbox |
| `subForm1_requiresWaterRightsSupport` | Support with applying for water rights required? | checkbox — **CONDITIONAL** |
| `subForm1_requiresBusinessPlanSupport` | Business Plan Development Support required? | checkbox |
| `subForm1_hasWorkingEquipment` | Is there access to working Equipment and Mechanization? | checkbox |
| `subForm1_hasValidTaxClearance` | Does the client have a Valid Tax Clearance certificate? | checkbox |
| `subForm1_hasAccessToMarkets` | Does the client have access to established markets? | checkbox |
| `subForm1_maintainsFormalFinancialRecords` | Formal Financial Records or Statements maintained? | checkbox |
| `subForm1_hasIdentifiedMentor` | Does the client have an actively engaged Mentor? | checkbox |
| `subForm1_isCompliantWithLaborLaws` | Is the client Compliant with all applicable Labor Laws? | checkbox |

> **The conditional field (verified live).** **"Support with applying for water rights required?"** (`subForm1_requiresWaterRightsSupport`) is **hidden** until **"Does this operation require Water Use Rights?"** (`subForm1_requiresWaterUseRights`) is ticked. On reveal it **defaults to ticked**. Unticking the parent hides it again. This is the only conditional in the checklist.
>
> A second, **read-only** group (`subForm2_*` — `autoVerify`, `isNcaClient`, `hasSurety`, `hasCoApplicant`, `hasResolution`) mirrors Opportunity data and is always disabled.

## Recording Status

| TC | Recorded live? | Notes |
|---|---|---|
| TC-01 Login + Inbox structure | ✅ | 2026-08-05 |
| TC-02 Initiated application tops the Inbox | ✅ | `LA2026/14392` (entity) and `LA2026/14623` (individual) each appeared first |
| TC-03 Status ↔ action correspondence | ✅ | Authoritative reference list + live `CONSENT PENDING` on both paths |
| TC-04 Upload Entity Consent — manual route | ✅ | Full path: upload → declaration reveals Submit → Submit → Inbox advances |
| TC-05 Consent satisfied electronically | ⚠️ **not executed** | Requires a real approver to complete an OTP; cannot be driven from the RM UI |
| TC-06 Upload Individual Consent | ✅ **2026-08-11** | Full path on `LA2026/14623`; forms and behaviour differ from the entity stage |
| TC-07 Upload Resolution | ⚠️ **selectors pending** | Both recorded applications initiated past it (resolution supplied upfront) |
| TC-08 Confirm verification outcomes — page + entity dialog | ✅ | Entity: all four datalists + CIPC dialog. Individual: Main Applicant / Co-Applicant / Surety sections |
| TC-09 Per-person ID Verification dialog | ✅ **2026-08-11** | `main-applicant-verification-details v15`; Approve/Reject, conditional Rationale, Submit-without-close, Close |
| TC-10 Complete Onboarding Checklist + conditional | ✅ | All 10 fields, verbatim text, conditional verified both ways |
| TC-11 Process completes on submit | ⚠️ **not executed** | No application has reached `Pre-Onboarding` first-party; existing ones belong to earlier scenarios |
| TC-12 Terminated - Consent Not Provided | ⚠️ **not reproducible on demand** | Time-based |

> ⚠️ cases are authored from the app's own reference lists plus the verified entity path, so stage names, statuses and sequence are accurate. Their spec lines carry `// TODO[selector]:` markers for AI-repair.

## Known Blockers / Defects

> **BUG-LB-001 (validation surfaced as HTTP 500, silently).** `InitiateLoanApplicationWorkflow` returns business validation failures as **HTTP 500** and the UI discards the message entirely. The gate sequence recorded on `OPP-2026-001244` was: missing mandatory documents (12 named) → *at least one product is required* → *business summary is required* → *Director 2 marital status is required* → *DivorceDecreeOrAncAgreement missing*. Each was fixable; the workflow then initiated successfully. **Defects:** wrong status code, and no user-facing message. Full detail in the opportunities plan.

> **BUG-LB-006 (silent no-op, recorded live 2026-08-11).** On **Confirm verification outcomes**, the
> **Finalise Verification Outcomes** button renders **enabled** but does nothing while any party is still unresolved — it issues
> **no network request at all** (verified on the network log), shows no modal, no toast and no inline message, and the stage does
> not advance. Reproduced twice on `LA2026/14623` while the Main Applicant sat at *Awaiting Review / TBD*. The RM has no way to
> tell that the action is blocked, or which party is blocking it. It should either be disabled with a tooltip, or report which
> verifications are outstanding.

> **BUG-LB-005 (silent save blocker, recorded live 2026-08-05 — replaces the withdrawn BUG-LB-004).** On the participant page, **Save silently does nothing** when an unrelated field fails client-side validation. An **empty Vat Number** raises *"Field validation error for Vat Number"* — rendered inline on a field the RM was not editing, with **no summary, no scroll-to-error and no toast** — and the form never submits (verified: no request is issued). It reads exactly like "Save is broken". Filling Vat Number let the same save succeed (`PUT /ApplicationParticipant/Crud/Update` → **200**, `"maritalStatus":1`) and the value persisted across reload.
>
> *Withdrawn: BUG-LB-004* previously claimed "Marital Status does not persist / no update request is ever issued". The observation was right but the **cause was misdiagnosed** — it was this Vat Number validation, not a broken save path. Marital Status persists correctly.

## Recording Notes (2026-08-05, extended 2026-08-24)

### Reading these grids reliably — four separate traps, all fixed in `readGrid`

`readGrid` was a bare `evaluateAll` snapshot with no waiting. Each of the following produced a
**silent wrong answer** rather than a failure, which is the dangerous kind:

1. **No load wait.** Called straight after a navigation it returned `[]`, indistinguishable from an
   empty grid. Two callers `test.skip`'d themselves on that basis and therefore never ran. The fix
   waits on the **pagination summary**, which renders in *both* states — `"1-10 of 13 items"` when
   populated and `"0 items found"` when empty — so it works for the callers that legitimately expect
   zero rows. Note the matcher has **no trailing `\b`**: the text runs into the page buttons
   (`"1-10 of 13 items1210 / page"`), so `items\b` never matches.
2. **Hardcoded column ordinals had drifted.** The Opportunities grid gained two columns, so
   `appNo: 4` had silently become *Application Type* and `status: 6` the application number. Columns
   are now resolved from the **header row text** on every read.
3. **Reference-list columns hydrate late.** *Application Status*, *Application Type* and *Action
   Required* render from separately-fetched reference lists, so they are `''` for a moment after the
   row appears. **A warm browser session shows them instantly, so this is invisible when reproducing
   by hand** — it only bites a clean context. `readGrid` now waits for the key column to be non-empty
   on every row.
4. **Only page 1 was ever read.** These grids paginate at 10. Any caller looking up a row by Ref No
   or Application Number was searching one page and concluding "not present". `readGrid` now raises
   the page size to the largest option (100) and **throws rather than truncating** if even that
   cannot fit the result set. This alone made TC-12 start executing — the terminated applications it
   looks for were sitting on page 2.


- **Inbox** (`workflows-inbox`, heading **Incoming Items**) columns: *Ref No, Initiator, Type, Name, Action Required, Received Date, Period In Possession, Target Date, Status*. Div-based `role=row` / `role=cell` grid; the row's **first cell** holds `a.sha-link` → `/shesha/workflow-action?id=<instanceId>&todoid=<todoId>`. Rows are ordered **newest Received Date first**, so a freshly initiated application is the top row. The Inbox shows only the **current** outstanding action per instance.
- Ref No format `LA<yyyy>/<nnnnn>` (e.g. `LA2026/14392`) — distinct from `OPP-2026-######` and the application number `LA-2026-######`. **The `todoid` changes at every stage transition while the `id` (instance) stays the same** — so a stage must be re-opened from the Inbox after each advance, never from a stored URL.
- **Workflow action page** header pattern: `<Stage Name>: <Account or Entity Name>`, a status chip `IN PROGRESS`, `Received <relative time>`, `Ref No: <ref>`, `Created by: <initiator> on <relative time>`, then the workflow step form above a read-only embedded loan application (`opportunity-loan-application v229`, tabs Client Info / Loan Info / Farms, plus Directors / Shareholders / Signatories each with **Consent** and **Spousal Consent** sub-tabs at the consent stage).
- **Clicking Submit on a consent stage redirects to the Inbox** — assert the advance by re-reading the Inbox, not by staying on the page.
- The consent **declaration checkbox has no `label[for]`** — it is the only **enabled** `.ant-checkbox-wrapper` in the workflow step form (all the mirrored read-only checkboxes are disabled). Its text sits in a sibling element.
- On the workflow action page the **Add Director / Add Shareholder / Add Signatory** buttons are present but **disabled** — parties cannot be added once the workflow has started.
- Marital data flows through to the verification page: the director row showed `Married`, `Married out of Community with Accrual`, spouse ID `8503155400083`.
- Ant Design conventions carried from the other plans: fields anchored on `<label for>` via a **direct-child** chain; conditional fields hidden with `ant-form-item-hidden`; select options matched on `title` inside the open dropdown; action buttons carry their icon in the accessible name (`"check Save"`); `rc-tabs-*` ids are **not** stable across loads. The verification dialog has **two** elements named *Close* (the modal `×` and the toolbar button) — target `button.sha-toolbar-btn`.

## Preconditions
- [ ] App is reachable at the Dev URL; valid RM credentials in `.env`
- [ ] The RM has **Inbox** visible in the side menu
- [ ] For TC-04 → TC-11: at least one loan application has been successfully initiated (see the opportunities plan for the full capture prerequisites)
- [ ] `test-data/pdf-test.pdf` exists at the hub root

## Test Cases

### TC-01 — Log in as an RM and open the Inbox
- **Type:** Happy path
- **Steps:**
  - NAVIGATE to `/login`
  - TYPE the Username field with the RM username (from `.env`)
  - TYPE the Password field with the RM password (from `.env`)
  - CLICK **Sign In**
  - WAIT for the app to redirect away from `/login`
  - CLICK the **Inbox** item in the side menu
  - WAIT for the Inbox listing to load
  - SNAPSHOT — confirm the Inbox heading and grid
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **Incoming Items** heading is displayed
  - [x] ASSERT the URL is the Inbox route (`/dynamic/Shesha.Workflow/workflows-inbox`)
  - [x] ASSERT the grid exposes the **Ref No**, **Action Required** and **Status** columns

---

### TC-02 — A newly initiated application appears at the top of the Inbox with the correct Action Required
- **Type:** Happy path
- **Depends on:** TC-01
- **Steps:**
  - SNAPSHOT — confirm the Inbox rows and their Action Required values
  - EXTRACT the Ref No, Action Required and Received Date of every row
  - SNAPSHOT — confirm the first row exposes its workflow action link
- **Assertions:**
  - [x] ASSERT (BLOCKING) at least one row is of Type **Loan Application Workflow**
  - [x] ASSERT the rows are ordered newest **Received Date** first, so the most recently initiated application is the top row
  - [x] ASSERT the top row's Ref No matches the `LA<yyyy>/<nnnnn>` format
  - [x] ASSERT the top row's **Action Required** is one of **Upload Resolution**, **Upload Entity Consent**, **Upload Individual Consent**, **Confirm verification outcomes** or **Complete Onboarding Checklist**
  - [x] ASSERT the row **Status** is `In Progress`
  - [x] ASSERT the row's action link targets the workflow action route (`/shesha/workflow-action?id=&todoid=`)
  - [x] ASSERT an **ENTITY** application's consent stage is **Upload Entity Consent** and never **Upload Individual Consent**
  - [x] ASSERT a **PERSONAL** application's consent stage is **Upload Individual Consent** and never **Upload Entity Consent**

---

### TC-03 — Application status corresponds to the outstanding workflow action
- **Type:** Happy path — cross-check
- **Status: ⚠️ NOT EXECUTABLE AS WRITTEN — the two grids cannot be correlated (see below)**
- **Depends on:** TC-01

> **Blocked by an identifier mismatch, discovered 2026-08-24.** This TC correlates an Inbox row to
> an Opportunity by matching the Inbox **Ref No** against the Opportunities **Application Number**.
> Those two columns use different formats, and in the Dev data they do not overlap at all:
>
> | Grid | Column | Format | Example |
> |---|---|---|---|
> | Inbox | `Ref No` | `LA2026/#####` | `LA2026/14657` |
> | Opportunities | `Application Number` | `LA-2026-######` | `LA-2026-001396` |
>
> Checked against the full result set of both grids (13 Inbox rows, all 32 Opportunities): **none of
> the 13 Inbox refs appears in the Opportunities grid**, directly or with separators normalised. The
> sequence numbers are not even in the same range (14657 vs 001396).
>
> So the correlation this TC is built on cannot be made from the two listings alone. Either the
> Inbox is showing workflow instances for applications outside this RM's Opportunities list, or the
> two identifiers are genuinely unrelated and the Application Number must be read from each
> workflow item / Opportunity detail page instead of the grid.
>
> **This needs a product answer before the TC can be rewritten** — worth confirming with the team
> whether an operator is expected to be able to tie an Inbox item to an Opportunity by eye. If not,
> that is itself a usability finding. Until then the remaining assertions in this TC are unverifiable
> and it is expected to FAIL.
- **Steps:**
  - NAVIGATE to the Opportunities listing
  - SNAPSHOT — confirm the Application Status column
  - EXTRACT the Application Status of each Opportunity
  - CLICK the **Inbox** item in the side menu
  - SNAPSHOT — confirm the Action Required of each Inbox row
  - EXTRACT the Action Required per Ref No
- **Assertions:**
  - [x] ASSERT (BLOCKING) every observed Application Status is a member of the `LoanApplicationStatus` reference list
  - [x] ASSERT an application whose outstanding action is **Upload Resolution** has status `Resolution Pending`
  - [x] ASSERT an application whose outstanding action is **Upload Entity Consent** or **Upload Individual Consent** has status `Consent Pending`
  - [x] ASSERT an application whose outstanding action is **Confirm verification outcomes** has status `Verification In Progress`
  - [x] ASSERT an application whose outstanding action is **Complete Onboarding Checklist** has status `Pre-Onboarding`
  - [x] ASSERT an application with **no** outstanding Inbox action is in a terminal or pre-initiation status (`Draft`, `Complete`, `Withdrawn`, `Declined`, `Terminated - *`, `Sent Back`)
  - [x] ASSERT no assertion in this TC evaluates the `Blocked` status (out of scope)

---

### TC-04 — Upload Entity Consent via the manual upload route
- **Type:** Happy path — **recorded live end to end**
- **Depends on:** TC-02, an ENTITY application at `Consent Pending`
- **Steps:**
  - CLICK the **Inbox** item in the side menu
  - SNAPSHOT — confirm a row with Action Required **Upload Entity Consent**
  - EXTRACT that row's Ref No
  - CLICK the workflow action link on that row
  - WAIT for the workflow action page to load
  - SNAPSHOT — confirm the task header, ref no, status chip, and the approver consent panels
  - SNAPSHOT — confirm the **Submit** button is not yet rendered
  - CLICK the **Upload Consent Document** *(press to upload)* control and attach `test-data/pdf-test.pdf`
  - SNAPSHOT — confirm the attached document name is displayed
  - SNAPSHOT — confirm the declaration checkbox is displayed and unticked
  - CLICK the declaration checkbox *I confirm that the manual override of uploading the consent form(s) is intentional*
  - SNAPSHOT — confirm the **Submit** button is now rendered
  - CLICK **Submit**
  - WAIT for the redirect back to the Inbox
  - SNAPSHOT — confirm the Action Required for that Ref No has advanced
- **Assertions:**
  - [x] ASSERT (BLOCKING) the workflow action page header reads `Upload Entity Consent: <entity name>`
  - [x] ASSERT the task Ref No matches the Ref No extracted from the Inbox row
  - [x] ASSERT the task status chip is `IN PROGRESS`
  - [x] ASSERT one consent panel is displayed per required approver (the signatories), each showing a status chip, **Date Sent**, **Date Signed** and a **Download Entity Consent Document** link
  - [x] ASSERT an unsigned approver's status chip reads `NOTIFICATION SENT` and its **Date Signed** is empty
  - [x] ASSERT the **Upload Consent Document** control is marked required
  - [x] ASSERT the **Submit** button is **not rendered** before the declaration is ticked
  - [x] ASSERT ticking the declaration checkbox reveals the **Submit** button
  - [x] ASSERT clicking **Submit** redirects back to the Inbox
  - [x] ASSERT (BLOCKING) the Action Required for that Ref No becomes **Confirm verification outcomes**
  - [x] ASSERT the application status becomes `Verification In Progress`
  - [x] ASSERT the **Add Director**, **Add Shareholder** and **Add Signatory** actions are disabled on the workflow action page

---

### TC-05 — Consent satisfied entirely electronically advances without a Submit
- **Type:** Happy path — **not executable from the RM UI (requires a real approver OTP)**
- **Depends on:** an application at a consent stage whose approvers all sign electronically
- **Steps:**
  - CLICK the **Inbox** item in the side menu
  - EXTRACT the Ref No and Action Required of the consent-stage row
  - WAIT for all required approvers to sign electronically (out-of-band)
  - NAVIGATE away and reload the page, then CLICK the **Inbox** item again
  - SNAPSHOT — confirm the Action Required has changed without any Submit being clicked
- **Assertions:**
  - [x] ASSERT (BLOCKING) once every required approver has signed electronically, the Action Required advances **without** the declaration checkbox or **Submit** being used
  - [x] ASSERT each signed approver's status chip leaves `NOTIFICATION SENT` and its **Date Signed** is populated
  - [x] ASSERT the advance is visible only after a **page refresh and re-navigation to the Inbox**
  - [x] ASSERT **Upload Resolution** completed electronically advances to **Upload Entity Consent**
  - [x] ASSERT **Upload Entity Consent** completed electronically advances to **Confirm verification outcomes**
  - [x] ASSERT **Upload Individual Consent** completed electronically advances to **Confirm verification outcomes**
  - [x] ASSERT the electronic and manual routes can be in progress simultaneously for different approvers on the same stage

---

### TC-06 — Upload Individual Consent via the manual upload route (PERSONAL application)
- **Type:** Happy path — **recorded live 2026-08-11 end to end on `LA2026/14623`**
- **Depends on:** TC-02, a PERSONAL application at `Consent Pending`
- **Steps:**
  - CLICK the **Inbox** item in the side menu
  - SNAPSHOT — confirm a row with Action Required **Upload Individual Consent**
  - EXTRACT that row's Ref No
  - CLICK the workflow action link on that row
  - WAIT for the workflow action page to load
  - SNAPSHOT — confirm the task header, ref no, status chip, and the **Manual Upload Consent** section
  - SNAPSHOT — confirm the approver panel for the main applicant, and for any spouse / surety / co-applicant
  - SNAPSHOT — confirm **Submit** is rendered but disabled
  - CLICK the **Upload Signed Consent Document** *(press to upload)* control and attach `test-data/pdf-test.pdf`
  - SNAPSHOT — confirm the declaration checkbox is displayed and unticked
  - CLICK the declaration checkbox *I confirm that the manual consent is intentional*
  - SNAPSHOT — confirm **Submit** is now enabled
  - CLICK **Submit**
  - WAIT for the redirect back to the Inbox
  - SNAPSHOT — confirm the Action Required for that Ref No has advanced
- **Assertions:**
  - [x] ASSERT (BLOCKING) a PERSONAL application's consent stage is **Upload Individual Consent**, never **Upload Entity Consent**
  - [x] ASSERT the workflow action page header reads `Upload Individual Consent: <client name>`
  - [x] ASSERT the task Ref No matches the Ref No extracted from the Inbox row
  - [x] ASSERT the **Manual Upload Consent** section is displayed
  - [x] ASSERT an approver panel is displayed for the **main applicant**, showing **Date Sent**, **Date Signed** and a **Download Consent Document** link
  - [x] ASSERT an unsigned approver's status chip reads `Notification Sent`
  - [x] ASSERT an approver panel is displayed for the **spouse** when the applicant is married
  - [x] ASSERT an approver panel is displayed for the **surety** when *Does the client have a surety?* is set
  - [x] ASSERT an approver panel is displayed for the **co-applicant** when *Does the client have a co-applicant?* is set
  - [x] ASSERT **Submit** is rendered but **disabled** before the declaration is ticked — *note this differs from the entity stage, where Submit is not rendered at all*
  - [x] ASSERT ticking the declaration checkbox **enables** Submit
  - [x] ASSERT clicking **Submit** redirects back to the Inbox
  - [x] ASSERT (BLOCKING) the Action Required for that Ref No becomes **Confirm verification outcomes**

---

### TC-07 — Upload Resolution (entity applications without an upfront resolution)
- **Type:** Happy path — **selectors pending**
- **Depends on:** TC-02, an ENTITY application at `Resolution Pending`
- **Steps:**
  - CLICK the **Inbox** item in the side menu
  - SNAPSHOT — confirm a row with Action Required **Upload Resolution**
  - EXTRACT that row's Ref No
  - CLICK the workflow action link on that row
  - WAIT for the workflow action page to load
  - SNAPSHOT — confirm the resolution approver panels
  - CLICK the resolution upload control and attach `test-data/pdf-test.pdf`
  - CLICK the declaration checkbox
  - CLICK **Submit**
  - WAIT for the redirect back to the Inbox
  - SNAPSHOT — confirm the Action Required has advanced
- **Assertions:**
  - [x] ASSERT (BLOCKING) the workflow action page header reads **Upload Resolution**
  - [x] ASSERT the application status is `Resolution Pending` while this stage is outstanding
  - [x] ASSERT one panel is displayed per required resolution approver
  - [x] ASSERT the manual route requires the declaration checkbox before **Submit** is rendered
  - [x] ASSERT (BLOCKING) the Action Required advances to **Upload Entity Consent**
  - [x] ASSERT an application whose resolution was captured upfront at lead capture (Landbank Branch) never presents this stage

---

### TC-08 — Confirm verification outcomes lists every captured party and reviews the entity
- **Type:** Happy path — **recorded live**
- **Depends on:** TC-04
- **Steps:**
  - CLICK the **Inbox** item in the side menu
  - SNAPSHOT — confirm a row with Action Required **Confirm verification outcomes**
  - EXTRACT that row's Ref No
  - CLICK the workflow action link on that row
  - WAIT for the workflow action page to load
  - SNAPSHOT — confirm the task header and every party datalist
  - EXTRACT the party names listed in the Signatories, Directors and Shareholders datalists
  - NAVIGATE to the Opportunity's Client Info tab and EXTRACT the parties captured there
  - SNAPSHOT — confirm the entity's **Company Verifications** status button
  - CLICK the entity's **Awaiting Review** status button
  - WAIT for the verification dialog to open
  - SNAPSHOT — confirm the dialog tabs and the Verification Summary
  - CLICK the **CIPC** tab
  - SNAPSHOT — confirm the submitted vs returned information and the failure reason
  - SELECT Company Name Review Decision — choose `Approve`
  - CLICK **Close**
  - SNAPSHOT — confirm the entity's status has updated
- **Assertions:**
  - [x] ASSERT (BLOCKING) the workflow action page header reads `Confirm verification outcomes: <entity name>`
  - [x] ASSERT **every party captured on the Opportunity appears on this step** — each director, shareholder, signatory, and any spouse / surety / co-applicant
  - [x] ASSERT the **entity itself** appears as a reviewable party when the applicant is an entity
  - [x] ASSERT no party appears on this step that was not captured on the Opportunity
  - [x] ASSERT each party exposes a status button whose initial label is **Awaiting Review**
  - [x] ASSERT the party status button opens that party's verification dialog
  - [x] ASSERT the entity dialog exposes the **Overview**, **CIPC** and **Compliance** tabs
  - [x] ASSERT the dialog's **Verification Summary** lists each verification with its own status
  - [x] ASSERT the CIPC tab shows the **Submitted Information** and the **CIPC Returned Information** side by side
  - [x] ASSERT a mismatch is reported in **Reason for Failure** (recorded: *"Company name mismatch: … 'BOXFUSION (PTY)LTD'"*)
  - [x] ASSERT the **Company Name Review Decision** offers exactly **Approve** and **Reject**
  - [x] ASSERT the page exposes the **Finalise Verification Outcomes** and **Flag As High Risk** actions
  - [x] ASSERT closing the dialog updates the party's status away from **Awaiting Review**

---

### TC-09 — Per-person ID Verification is decided in the verification dialog
- **Type:** Happy path — **recorded live 2026-08-11 on `LA2026/14623`**
- **Depends on:** TC-08
- **Steps:**
  - CLICK the Main Applicant's **Awaiting Review** status button
  - WAIT for the verification dialog to open
  - SNAPSHOT — confirm the dialog tabs and the Verification Summary
  - SNAPSHOT — confirm the header shows the Home Affairs-returned identity alongside the captured one
  - CLICK the **ID Verification** tab
  - SNAPSHOT — confirm the submitted vs returned comparison and the automated check results
  - SNAPSHOT — confirm **Submit** is disabled before a decision is chosen
  - SELECT ID Review Decision — choose `Reject`
  - SNAPSHOT — confirm the **Rationale** field is revealed and required
  - SELECT ID Review Decision — choose `Approve`
  - SNAPSHOT — confirm the **Rationale** field is hidden again and **Submit** is enabled
  - CLICK **Submit**
  - SNAPSHOT — confirm the decision is saved and the dialog stays open
  - CLICK **Close**
  - SNAPSHOT — confirm the party row after closing
- **Assertions:**
  - [x] ASSERT (BLOCKING) the dialog exposes the **Overview**, **ID Verification** and **KYC Verification** tabs
  - [x] ASSERT the **Verification Summary** lists every verification for that party with its own status — **ID Verification**, **KYC Verification Status**, **Photo Verification Status**, **Compliance Status**
  - [x] ASSERT the dialog notes that PEP and AML results are visible only to compliance
  - [x] ASSERT the ID Verification tab shows the **Submitted** and **Returned** identity side by side
  - [x] ASSERT the automated checks are reported individually — **Name Match**, **ID Match**, **Death Check**, **Outcome**
  - [x] ASSERT a captured name that differs from the Home Affairs record yields **Name Match `FAILED`** while **ID Match** and **Death Check** still `PASSED`
  - [x] ASSERT a downloadable **ID biometric verification report** is offered
  - [x] ASSERT the **ID Review Decision** must be chosen manually — it is not auto-resolved
  - [x] ASSERT the ID Review Decision offers exactly **Approve** and **Reject**
  - [x] ASSERT **Submit** is disabled until a decision is chosen
  - [x] ASSERT (BLOCKING) choosing **Reject** reveals the **Rationale** field and marks it **required**
  - [x] ASSERT choosing **Approve** hides the **Rationale** field again
  - [x] ASSERT **Submit** saves the decision **without closing** the dialog
  - [x] ASSERT the party's status does **not** resolve on the ID decision alone — it stays **Awaiting Review** with Outcome `TBD` while its KYC / Photo / Compliance verifications are unresolved, including after a page reload
  - [x] ASSERT **Finalise Verification Outcomes** does not advance the stage while a party is unresolved — *expected FAIL on the feedback assertion: BUG-LB-006, the button is enabled, issues no request and reports nothing*

---

### TC-10 — Complete Onboarding Checklist, including its conditional question
- **Type:** Happy path — **recorded live**
- **Depends on:** TC-02, an application at `Pre-Onboarding`
- **Steps:**
  - CLICK the **Inbox** item in the side menu
  - SNAPSHOT — confirm a row with Action Required **Complete Onboarding Checklist**
  - EXTRACT that row's Ref No
  - CLICK the workflow action link on that row
  - WAIT for the workflow action page to load
  - SNAPSHOT — confirm the task header, ref no, and the checklist questions
  - SNAPSHOT — confirm *Support with applying for water rights required?* is hidden
  - CLICK the *Does this operation require Water Use Rights?* checkbox
  - SNAPSHOT — confirm *Support with applying for water rights required?* is revealed
  - CLICK the *Does this operation require Water Use Rights?* checkbox again to untick it
  - SNAPSHOT — confirm the dependent question is hidden again
  - CLICK the *Does this operation require Water Use Rights?* checkbox to re-tick it
  - TYPE the Years Of Farming Experience field with `12`
  - CLICK the *Does the client have a Valid Tax Clearance certificate?* checkbox
  - CLICK the *Formal Financial Records or Statements maintained?* checkbox
  - CLICK the *Is there access to working Equipment and Mechanization?* checkbox
  - CLICK the *Does the client have access to established markets?* checkbox
  - CLICK the *Is the client Compliant with all applicable Labor Laws?* checkbox
  - SNAPSHOT — confirm **Submit** is enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) the workflow action page header reads **Complete Onboarding Checklist**
  - [x] ASSERT the task Ref No matches the Ref No extracted from the Inbox row
  - [x] ASSERT the task status chip is `IN PROGRESS`
  - [x] ASSERT all ten checklist fields are displayed with their recorded question text
  - [x] ASSERT **Years Of Farming Experience** is a numeric field, not a checkbox
  - [x] ASSERT (BLOCKING) *Support with applying for water rights required?* is **hidden** while *Does this operation require Water Use Rights?* is unticked
  - [x] ASSERT ticking *Does this operation require Water Use Rights?* **reveals** *Support with applying for water rights required?*
  - [x] ASSERT the revealed dependent question **defaults to ticked**
  - [x] ASSERT unticking the parent question **hides** the dependent question again
  - [x] ASSERT the `subForm2_*` mirrored compliance checkboxes are read-only
  - [x] ASSERT the ticked checklist items retain their checked state
  - [x] ASSERT the application status is `Pre-Onboarding` while this stage is outstanding
  - [x] ASSERT the **Submit** button is enabled

---

### TC-11 — Submitting the onboarding checklist completes the process
- **Type:** Happy path — **not executed; would advance an instance from an earlier scenario**
- **Depends on:** TC-10
- **Steps:**
  - CLICK **Submit** on the Complete Onboarding Checklist page
  - WAIT for the redirect back to the Inbox
  - SNAPSHOT — confirm the task has left the Inbox
  - NAVIGATE to the Opportunity for that application
  - SNAPSHOT — confirm the final application status
- **Assertions:**
  - [x] ASSERT (BLOCKING) the application status becomes `Complete`
  - [x] ASSERT the task no longer appears in the RM **Inbox**
  - [x] ASSERT no further Action Required is outstanding for that Ref No
  - [x] ASSERT **Complete Onboarding Checklist** is the final stage for every consent route — individual and entity, upfront-consent and in-workflow consent

---

### TC-12 — An unsigned / un-uploaded consent terminates the application
- **Type:** Negative — **not reproducible on demand (time-based)**
- **Depends on:** an application left at a consent stage beyond its consent deadline
- **Steps:**
  - NAVIGATE to the Opportunities listing
  - SNAPSHOT — confirm the Application Status column
  - EXTRACT the status of any application whose consent was never provided
  - CLICK the **Inbox** item in the side menu
  - SNAPSHOT — confirm no outstanding action remains for that application
- **Assertions:**
  - [x] ASSERT (BLOCKING) an application whose consent was not signed or uploaded in time has status `Terminated - Consent Not Provided`
  - [x] ASSERT that status is a member of the `LoanApplicationStatus` reference list (value `9`)
  - [x] ASSERT no Action Required remains outstanding in the Inbox for a terminated application
  - [x] ASSERT a terminated application is **not** reported as `Complete`
  - [x] ASSERT termination applies to both **Upload Individual Consent** and **Upload Entity Consent** stages

## Test Data Notes
- Consent / resolution attachments use `test-data/pdf-test.pdf` at the hub root.
- **The Inbox is the only workflow surface used.** *Sent Items / My Items / Drafts* are out of scope; stage advances are asserted by re-reading the Inbox.
- The `todoid` changes at every stage transition — always re-open a stage from the Inbox rather than reusing a URL.
- TC-10 deliberately stops **before** submitting: the only Dev instances at `Pre-Onboarding` (`LA2026/13092`, `LA2026/13081`) belong to earlier scenarios. During recording the water-rights conditional was toggled on and **reverted without saving**, leaving those items untouched.
- TC-12 depends on a consent deadline elapsing and cannot be forced from the UI. If the team can shorten or trigger the consent timeout in Dev, this TC should be upgraded to drive it directly.
- Recording created `LA2026/14392` from `OPP-2026-001244` and advanced it to **Confirm verification outcomes**, with the entity's Company Name Review Decision set to **Approve**.

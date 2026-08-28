# Test Plan: LEAD-2.1 — Lead to Opportunity Lifecycle (Client Type × Lead Channel × Consent Matrix)

> **Status:** Ready (TC-12 → TC-14 blocked by BUG-LB-001 — see Known Blockers)
> **Owner:** QA
> **Last Updated:** 2026-07-31
> **Estimated Duration:** 1080s

## Metadata
| Field | Value |
|-------|-------|
| App | Land Bank CRM (Admin Portal) |
| Environment | Dev (`DEV_APP_URL`, active `TEST_ENV=dev`) |
| Login As | RM role (username/password resolved from `RM_USERNAME` / `RM_PASSWORD` in the gitignored `.env`) |
| Login page | `/login` |
| Landing page | Dashboard (Management) — `/dynamic/management-dashboard` |
| Pages under test | Leads (`/dynamic/LandBank.Crm/LBLead-table`), Lead details (`/dynamic/LandBank.Crm/LBLead-details?id=`), Opportunities (`/dynamic/LandBank.Crm/LBOpportunity-table`), Opportunity details (`/dynamic/LandBank.Crm/LBOpportunity-details?id=`), Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`), Workflow action (`/shesha/workflow-action?id=&todoid=`) |
| Test document | `test-data/pdf-test.pdf` (hub root) — stand-in consent / resolution attachment |

## Objective
> Validate the end-to-end Land Bank CRM origination chain — **Leads → Opportunity → Inbox → Opportunity** — driven by an RM, across every combination of **Client Type**, **Lead Channel** and (for the Landbank Branch channel) the **consent capture method**. For each combination: capture a lead through the form variant that channel/client-type/consent selection produces, pass pre-screening, confirm the lead auto-converts to an Opportunity (and an Account), and confirm the Opportunity is typed correctly (`PERSONAL` for Individual, `ENTITY` for Listed Company / Close Corporation). Then initiate the loan application, action the resulting task from the RM Inbox, and confirm the Opportunity reflects the completed step.

## Combination Matrix

**Online Digital Channel** — full client capture form shown immediately, no consent step.

| TC | Client Type | Lead Channel | Expected Application Type | Entity Name field |
|----|-------------|--------------|---------------------------|-------------------|
| TC-03 | Individual (Individual) | Online Digital Channel | PERSONAL | hidden |
| TC-04 | Listed Company (Entity) | Online Digital Channel | ENTITY | required |
| TC-05 | Close Corporation (Entity) | Online Digital Channel | ENTITY | required |

**Landbank Branch** — consent-driven progressive form. The consent toggle governs which fields appear.

| TC | Client Type | Consent toggle | Toggle label | Path exercised |
|----|-------------|----------------|--------------|----------------|
| TC-06 | Individual (Individual) | **True** | Upload Consent? | Upload signed consent → `Upload` → client capture |
| TC-07 | Individual (Individual) | **False** | Upload Consent? | Request OTP → `otpPin` + Submit OTP |
| TC-08 | Listed Company (Entity) | **True** | Upload Resolution and Consent? | Signatory ID + Company Reg No + 2 uploads → `Upload` → CIPC auto-populate |
| TC-09 | Listed Company (Entity) | **False** | Upload Resolution and Consent? | Plain manual capture (no OTP, no uploads) |
| TC-10 | Close Corporation (Entity) | **True** | Upload Resolution and Consent? | Signatory ID + Company Reg No + 2 uploads → `Upload` → CIPC auto-populate |
| TC-11 | Close Corporation (Entity) | **False** | Upload Resolution and Consent? | Plain manual capture (no OTP, no uploads) |

> **Naming note (recorded live 2026-07-31):** the Lead Channel reflist renders the branch option as **`Landbank Branch`** (one word, no space) — not "Land Bank Branch". Available options are *Landbank Branch, Online Digital Channel, Landbank Partnerships, Call Centre*.

> **Regression noted 2026-08-20 — `Sole Proprietor (Individual)` is no longer selectable.** When this plan was recorded on
> 2026-07-31 the Client Type dropdown offered **9** options, including `Sole Proprietor (Individual)`. As of 2026-08-20 it offers
> only **8** — Sole Proprietor is filtered out by the form even though it remains in the `LandBank.Crm/ClientType` reference list
> (item value 3). Tracked as **BUG-LB-007** in [branch-manual-document-upload.md](branch-manual-document-upload.md). No test case
> in *this* plan uses Sole Proprietor, so none of its coverage is affected; only the recorded option list is stale for that entry.

## Preconditions
- [ ] App is reachable at the Dev URL (`DEV_APP_URL`)
- [ ] Valid RM credentials are present in `.env` (`RM_USERNAME` / `RM_PASSWORD`)
- [ ] The signed-in RM has **Leads**, **Opportunities**, and **Inbox** visible in the side menu
- [ ] The RM is selectable as **Lead Owner** (the field self-populates with the signed-in RM)
- [ ] `test-data/pdf-test.pdf` exists at the hub root (consent / resolution attachment)
- [ ] For TC-13 / TC-14 an in-flight *Complete Onboarding Checklist* item exists in the RM Inbox

## Known Blockers

> **BUG-LB-001 (re-characterised 2026-08-05 — the original description below was an incomplete diagnosis).**
> Clicking **Initiate Loan Application** fires `POST .../InitiateLoanApplicationWorkflow?opportunityId=<guid>`, which returns
> **HTTP 500** with **no user-facing feedback** — no toast, no inline error, and the Opportunity silently stays `DRAFT`.
> *Originally recorded as "the workflow cannot start".* In fact the 500 response body carries a **precise business validation
> message**, and the call is a submission gate: it rejects until every mandatory document, product, business summary and party
> field is present. See BUG-LB-001 / BUG-LB-004 in
> [../opportunities/opportunity-loan-application-capture.md](../opportunities/opportunity-loan-application-capture.md) for the
> full gate sequence recorded on `OPP-2026-001244`.
> **The defects are:** (a) a validation failure returned as **HTTP 500** instead of 400, and (b) the message never surfaced.
> **Consequence for this plan:** TC-12's blocking assertion is still expected to FAIL — a lead converted by this plan has none of
> the required documents or parties captured — and TC-13 / TC-14 therefore exercise the Inbox leg against a **pre-existing**
> in-flight workflow item rather than one this run created. The workflow stages themselves are covered by
> [../workflow/loan-application-workflow-stages.md](../workflow/loan-application-workflow-stages.md).

> **BUG-LB-002 (data quality, recorded live 2026-07-31).** On the **Individual + Landbank Branch + Upload Consent = False**
> path, **Save is enabled immediately** and a lead can be saved **without completing the OTP verification** — and because that
> form variant never displays the Client Information block, the lead is created with **blank First Name, Last Name, Province and
> Preferred Communication** even though all four are marked required (`*`) on every other variant. Reproduced on lead
> `73f45144-dd3f-4f99-b468-0474c9e6500a`, whose detail header renders as just `","` and whose Region is blank. A pre-existing
> lead in the Dev grid (29/07/2026 09:40, Individual, Landbank Branch, blank names) shows the same signature.
> **Consequence for this plan:** TC-07's *non-blocking* name assertion is expected to FAIL until this is fixed. It is
> deliberately non-blocking so the rest of TC-07 still reports.

## Recording Notes (2026-07-31, captured live as the RM)

**Form mechanics** — carried into the paired spec:
- The **Add New Lead** modal and every Shesha detail form use Ant Design form items whose inputs carry **no `id` and no `data-testid`**; the only stable anchor is `<label for="<fieldName>">` (e.g. `firstName`, `leadType`, `channel`, `organisation`, `idNumber`, `signatoryIdNumber`, `companyRegistrationNumber`, `signatoryConsent`, `resolution`, `otpPin`, `manualApproval`).
- Forms **nest**, so a field must be scoped by a **direct-child** label match (`.ant-form-item:has(> .ant-row > .ant-col.ant-form-item-label > label[for="…"])`). A plain `:has()` also matches ancestor form items — it resolved to 42 inputs during recording.
- Select **options expose no `role=option`**; they are matched by their `title` attribute inside the open (non-hidden) dropdown. Once a select holds a value, its hidden `<input>` is **click-intercepted** by the selection-item span, so the trigger must be the `.ant-select-selector`.
- Conditional fields are hidden via the `ant-form-item-hidden` class rather than being removed from the DOM — visibility must be asserted on that class, not on presence.
- The **Pre-Screening Assessment** radio groups carry **no label association at all** — they are matched by ordinal position (7 groups, fixed order).
- The **Inbox** is a div-based `role=row` / `role=cell` grid (not a real `<table>` like the Leads grid); the row's first cell holds the `a.sha-link` that opens the workflow action page.
- **Region** is derived server-side from Province (Gauteng → *Central Region*).
- **Opportunity action buttons carry their icon in the accessible name** — `Edit` is `"edit Edit"`, `Save` is `"check Save"`, `Cancel` is `"close Cancel"`, `Initiate Loan Application` is `"plus Initiate Loan Application"`. An exact-name match on the bare label will not match; substring matching is required. (Corrected 2026-07-31 while recording [../opportunities/opportunity-loan-application-capture.md](../opportunities/opportunity-loan-application-capture.md).)
- **`rc-tabs-*` element ids are not stable across page loads** — address tabs by role + accessible name, never by id.

**Lead Channel drives the whole form shape.** *Online Digital Channel* shows the full client capture form immediately. Selecting **Landbank Branch collapses it** — only Lead Owner, Lead Channel and Client Type remain, and the rest reveals progressively based on Client Type and the consent toggle.

**Individual + Landbank Branch:**
- Initially visible: Mobile Number, Email Address, **ID Number**, an **unlabelled** *Upload Consent?* switch (the label sits in a preceding label-only form item — the switch's own form item has no `for`), and a **Request OTP** button. The Client Information block is hidden.
- **ID Number is Luhn-validated** — an invalid value raises *"Please enter a valid South African ID number"*. Valid test IDs used: `9001015800088`, `8503155400083`, `9207125001083`.
- **Consent = True:** toggling ON hides *Request OTP* and reveals `manualApproval` **Upload Consent** (file) + **Download Consent Template**, and **disables Save**. Attaching a file surfaces an **Upload** button; clicking **Upload** reveals the Client Information block, re-enables Save, and **clears the previously typed Mobile Number / Email Address / ID Number** (info text: *"Please upload the document and click 'Upload' to retrieve and auto-populate"*). Client fields must therefore be filled **after** Upload.
- **Consent = False:** Save is enabled immediately. **Request OTP** reveals `otpPin` **OTP** + **Submit OTP** and retains the entered values. See BUG-LB-002.

**Entity (Listed Company / Close Corporation) + Landbank Branch:**
- Initially visible: the **full** Client Information block, `organisation` **Entity Name** (required), Mobile Number, Email Address, and the **labelled** `uploadResAndConsent` *Upload Resolution and Consent?* switch. No ID Number, no Request OTP.
- **Consent = True:** toggling ON hides the Client Information block and reveals `signatoryIdNumber` **Signatory ID Number**\*, `companyRegistrationNumber` **Company Registration Number**\*, `signatoryConsent` **Upload Consent**\* + *Download Consent Template*, and `resolution` **Upload Resolution**\* + *Download Resolution Template*. **Save is disabled.** Attaching both documents surfaces an **Upload** button; clicking it runs a **CIPC lookup keyed off the Company Registration Number** — with `2012/225386/07` the Entity Name auto-populated to **`BOXFUSION (PTY)LTD`** and the registration number was normalised to **`K2012/225386/07`**. The Client Information block then reappears (empty) and Save enables.
- **Consent = False:** no signatory fields, no uploads, **no OTP** — a plain manual capture with Save enabled from the start.

> **Asymmetry worth noting:** Individual + Consent = False offers an **OTP** route; Entity + Consent = False offers **no** verification route at all.

> **Why the branch consent toggle matters downstream (clarified 2026-08-05).** The consent stage in the loan application workflow is
> **mandatory for every application** — *Upload Individual Consent* for a PERSONAL application, *Upload Entity Consent* for an
> ENTITY one. The Lead Channel decides **where** consent is captured, not **whether**:
> - **Landbank Branch** → consent (and, for entities, the resolution) is captured **upfront here at lead capture**, so the workflow's
>   consent stage arrives already satisfied.
> - **Online Digital Channel** (and other non-branch channels) → consent is captured **later, inside the workflow**, so the consent
>   stage is outstanding in the RM Inbox and must be actioned there.
>
> Verified live: an ENTITY lead captured via *Online Digital Channel* whose resolution was supplied on the Opportunity initiated
> straight into `CONSENT PENDING` / **Upload Entity Consent** (`LA2026/14392`). See
> [../workflow/loan-application-workflow-stages.md](../workflow/loan-application-workflow-stages.md).

## Test Cases

### TC-01 — Log in to Land Bank CRM as an RM
- **Type:** Happy path
- **Steps:**
  - NAVIGATE to `/login`
  - SNAPSHOT — confirm the login form (Username + Password fields, Sign In button) is rendered
  - TYPE the Username field with the RM username (from `.env`)
  - SNAPSHOT — confirm the Password field is rendered
  - TYPE the Password field with the RM password (from `.env`)
  - SNAPSHOT — confirm the **Sign In** button is enabled
  - CLICK **Sign In**
  - WAIT for the app to redirect away from `/login`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the app redirects away from `/login`
  - [x] ASSERT the RM lands on Dashboard (Management) — `/dynamic/management-dashboard`
  - [x] ASSERT the side menu shows **Leads**, **Opportunities** and **Inbox**

---

### TC-02 — Navigate to Leads from the side menu
- **Type:** Happy path
- **Depends on:** TC-01 (authenticated session)
- **Steps:**
  - SNAPSHOT — confirm the side menu is rendered and the **Leads** item is visible
  - CLICK the **Leads** item in the side menu
  - WAIT for the Leads listing to load
  - SNAPSHOT — confirm the Leads page heading, grid, and toolbar
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **All Leads** heading is displayed
  - [x] ASSERT the URL is the Leads listing route (`/dynamic/LandBank.Crm/LBLead-table`)
  - [x] ASSERT the Leads data grid is displayed
  - [x] ASSERT the **New Lead** toolbar button is displayed

---

### TC-03 — Individual lead via Online Digital Channel converts to a PERSONAL Opportunity
- **Type:** Happy path (Online Digital Channel, row 1)
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table`
  - SNAPSHOT — confirm the **New Lead** button is rendered
  - CLICK **New Lead**
  - WAIT for the **Add New Lead** modal to open
  - SNAPSHOT — confirm **Lead Owner** self-populates with the signed-in RM
  - SELECT Lead Channel — choose `Online Digital Channel`
  - SNAPSHOT — confirm the Client Information section is rendered
  - SELECT Client Type — choose `Individual (Individual)`
  - SNAPSHOT — confirm the **Entity Name** field stays hidden for an Individual client type
  - SELECT Title — choose `Mr`
  - TYPE the First Name field with `AutoQA`
  - TYPE the Last Name field with `IndivOnline`
  - SELECT Province — choose `Gauteng`
  - SELECT Preferred Communication — choose `Email`
  - TYPE the Mobile Number field with `0820000101`
  - TYPE the Email Address field with `autoqa.indivonline@example.com`
  - SNAPSHOT — confirm the **Save** button is enabled
  - CLICK **Save**
  - WAIT for the lead details page to load
  - SNAPSHOT — confirm the lead header, status, and action toolbar
  - CLICK **Initiate Pre-Screening**
  - WAIT for the **Pre-Screening Assessment** modal to open
  - SNAPSHOT — confirm all seven pre-screening questions are rendered and **Submit** is disabled
  - CLICK `Yes` for *Is the applicant a South African citizen?*
  - CLICK `Yes` for *Is the farming land located in South Africa?*
  - CLICK `Yes` for *Do the intended farming activities fall within the Land Bank mandate?*
  - CLICK `No` for *Is the client blacklisted?*
  - CLICK `No` for *Is the client currently under debt review?*
  - CLICK `Yes` for *Is the client's current Country of Residence South Africa?*
  - CLICK `Yes` for *Does the client currently have access to suitable land for farming activities?*
  - SNAPSHOT — confirm the confirmation checkbox is now enabled
  - CLICK the confirmation checkbox *I confirm the selected criteria are correct…*
  - SNAPSHOT — confirm **Submit** is now enabled
  - CLICK **Submit**
  - WAIT for the pre-screening modal to close and the lead header to refresh
  - SNAPSHOT — confirm the lead status, assessment outcome, and conversion links
  - EXTRACT the **Converted To Opportunity** display name
  - CLICK the **Converted To Opportunity** link
  - WAIT for the Opportunity details page to load
  - SNAPSHOT — confirm the Opportunity header and tab strip
- **Assertions:**
  - [x] ASSERT the lead saves and the URL becomes the lead details route (`/dynamic/LandBank.Crm/LBLead-details?id=`)
  - [x] ASSERT the newly created lead shows status `NEW` before pre-screening
  - [x] ASSERT the **Region** is derived from the selected Province (`Gauteng` → `Central Region`)
  - [x] ASSERT the confirmation checkbox is disabled until all seven questions are answered
  - [x] ASSERT the pre-screening assessment outcome is `PASSED`
  - [x] ASSERT (BLOCKING) the lead status becomes `CONVERTED` after a passing pre-screening
  - [x] ASSERT a **Converted To Opportunity** reference is displayed
  - [x] ASSERT a **Converted To Account** reference is displayed
  - [x] ASSERT the URL becomes the Opportunity details route (`/dynamic/LandBank.Crm/LBOpportunity-details?id=`)
  - [x] ASSERT the Opportunity status is `DRAFT`
  - [x] ASSERT the Opportunity **Application Type** is `PERSONAL`
  - [x] ASSERT the Opportunity exposes the **Client Info**, **Loan Info** and **Farms** tabs

---

### TC-04 — Listed Company lead via Online Digital Channel converts to an ENTITY Opportunity
- **Type:** Happy path (Online Digital Channel, row 2)
- **Depends on:** TC-01
- **Steps:** As TC-03, with these substitutions:
  - SELECT Client Type — choose `Listed Company (Entity)`
  - SNAPSHOT — confirm the **Entity Name** field is revealed for an Entity client type
  - TYPE the Entity Name field with `AutoQA Listed Co Ltd`
  - TYPE the Last Name field with `ListedOnline`
  - TYPE the Mobile Number field with `0820000103`
  - TYPE the Email Address field with `autoqa.listedonline@example.com`
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **Entity Name** field is revealed when an Entity client type is selected
  - [x] ASSERT the pre-screening assessment outcome is `PASSED`
  - [x] ASSERT the lead status becomes `CONVERTED` after a passing pre-screening
  - [x] ASSERT the Opportunity **Application Type** is `ENTITY`
  - [x] ASSERT the Entity Name carries through to the Opportunity's **Entity Information** section
  - [x] ASSERT the Opportunity exposes the **Directors**, **Shareholders** and **Signatories** tabs

---

### TC-05 — Close Corporation lead via Online Digital Channel converts to an ENTITY Opportunity
- **Type:** Happy path (Online Digital Channel, row 3)
- **Depends on:** TC-01
- **Steps:** As TC-04, with these substitutions:
  - SELECT Client Type — choose `Close Corporation (Entity)`
  - TYPE the Entity Name field with `AutoQA Close Corp CC`
  - TYPE the Last Name field with `CloseCorpOnline`
  - TYPE the Mobile Number field with `0820000105`
  - TYPE the Email Address field with `autoqa.closecorponline@example.com`
- **Assertions:**
  - [x] ASSERT the **Entity Name** field is revealed for a Close Corporation client type
  - [x] ASSERT the pre-screening assessment outcome is `PASSED`
  - [x] ASSERT (BLOCKING) the lead status becomes `CONVERTED` after a passing pre-screening
  - [x] ASSERT the Opportunity **Application Type** is `ENTITY`

---

### TC-06 — Individual lead via Landbank Branch with Upload Consent = True
- **Type:** Happy path (Landbank Branch, consent uploaded)
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table`
  - SNAPSHOT — confirm the **New Lead** button is rendered
  - CLICK **New Lead**
  - WAIT for the **Add New Lead** modal to open
  - SELECT Lead Channel — choose `Landbank Branch`
  - SNAPSHOT — confirm the Client Information block collapses for the Landbank Branch channel
  - SELECT Client Type — choose `Individual (Individual)`
  - SNAPSHOT — confirm **ID Number**, the *Upload Consent?* switch and **Request OTP** are rendered
  - CLICK the *Upload Consent?* switch to turn it ON
  - SNAPSHOT — confirm **Upload Consent**, **Download Consent Template** are revealed and **Request OTP** is hidden
  - CLICK the **Upload Consent** *(press to upload)* control and attach `test-data/pdf-test.pdf`
  - SNAPSHOT — confirm the attached document name is displayed and the **Upload** button is available
  - CLICK **Upload**
  - WAIT for the Client Information block to be revealed
  - SNAPSHOT — confirm the Client Information block is now rendered and **Save** is enabled
  - SELECT Title — choose `Mr`
  - TYPE the First Name field with `AutoQA`
  - TYPE the Last Name field with `IndivBranchConsentYes`
  - SELECT Province — choose `Gauteng`
  - SELECT Preferred Communication — choose `Email`
  - TYPE the Mobile Number field with `0820000201`
  - TYPE the Email Address field with `autoqa.indivbranch.consentyes@example.com`
  - TYPE the ID Number field with `9001015800088`
  - CLICK **Save**
  - WAIT for the lead details page to load
  - SNAPSHOT — confirm the lead header, status, and action toolbar
- **Assertions:**
  - [x] ASSERT selecting `Landbank Branch` hides the Client Information block until consent is captured
  - [x] ASSERT the **ID Number** field is displayed for an Individual on the Landbank Branch channel
  - [x] ASSERT (BLOCKING) turning *Upload Consent?* ON reveals the **Upload Consent** control and **disables Save** until a document is uploaded
  - [x] ASSERT turning *Upload Consent?* ON hides the **Request OTP** button
  - [x] ASSERT the **Download Consent Template** action is offered
  - [x] ASSERT the attached document name (`pdf-test.pdf`) is displayed against **Upload Consent**
  - [x] ASSERT clicking **Upload** reveals the Client Information block and re-enables **Save**
  - [x] ASSERT the lead saves and the URL becomes the lead details route
  - [x] ASSERT the saved lead shows status `NEW`, Client Type `Individual (Individual)` and Lead Channel `Landbank Branch`
  - [x] ASSERT the saved lead retains the captured First Name and Last Name
  - [x] ASSERT the **Initiate Pre-Screening** action is available on the saved lead

---

### TC-07 — Individual lead via Landbank Branch with Upload Consent = False (OTP route)
- **Type:** Alternate path (Landbank Branch, consent via OTP) — **BUG-LB-002 expected on the name assertion**
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table`
  - CLICK **New Lead**
  - WAIT for the **Add New Lead** modal to open
  - SELECT Lead Channel — choose `Landbank Branch`
  - SELECT Client Type — choose `Individual (Individual)`
  - SNAPSHOT — confirm the *Upload Consent?* switch is OFF and **Request OTP** is displayed
  - TYPE the Mobile Number field with `0820000202`
  - TYPE the Email Address field with `autoqa.indivbranch.consentno@example.com`
  - TYPE the ID Number field with `8503155400083`
  - SNAPSHOT — confirm no ID validation error is raised for a valid South African ID number
  - CLICK **Request OTP**
  - WAIT for the OTP field to be revealed
  - SNAPSHOT — confirm the **OTP** field and **Submit OTP** button are rendered
  - CLICK **Save**
  - WAIT for the lead details page to load
  - SNAPSHOT — confirm the saved lead header and captured fields
- **Assertions:**
  - [x] ASSERT the *Upload Consent?* switch defaults to OFF
  - [x] ASSERT (BLOCKING) with *Upload Consent?* OFF the **Request OTP** action is offered
  - [x] ASSERT the **Upload Consent** control is not displayed while the toggle is OFF
  - [x] ASSERT clicking **Request OTP** reveals the **OTP** field and the **Submit OTP** button
  - [x] ASSERT the entered Mobile Number, Email Address and ID Number are retained after requesting the OTP
  - [x] ASSERT an invalid ID number is rejected with *"Please enter a valid South African ID number"*
  - [x] ASSERT the lead saves and the URL becomes the lead details route
  - [x] ASSERT the saved lead records Client Type `Individual (Individual)` and Lead Channel `Landbank Branch`
  - [x] ASSERT the saved lead retains a First Name and Last Name — *expected FAIL: BUG-LB-002, this path never exposes the required Client Information fields, so the lead saves nameless (non-blocking)*

---

### TC-08 — Listed Company lead via Landbank Branch with Upload Resolution and Consent = True
- **Type:** Happy path (Landbank Branch, resolution + consent uploaded)
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table`
  - CLICK **New Lead**
  - WAIT for the **Add New Lead** modal to open
  - SELECT Lead Channel — choose `Landbank Branch`
  - SELECT Client Type — choose `Listed Company (Entity)`
  - SNAPSHOT — confirm the Client Information block, **Entity Name** and the *Upload Resolution and Consent?* switch are rendered
  - CLICK the *Upload Resolution and Consent?* switch to turn it ON
  - SNAPSHOT — confirm the signatory fields and both upload controls are revealed and **Save** is disabled
  - TYPE the Signatory ID Number field with `9207125001083`
  - TYPE the Company Registration Number field with `2012/225386/07`
  - CLICK the **Upload Consent** *(press to upload)* control and attach `test-data/pdf-test.pdf`
  - CLICK the **Upload Resolution** *(press to upload)* control and attach `test-data/pdf-test.pdf`
  - TYPE the Mobile Number field with `0820000203`
  - TYPE the Email Address field with `autoqa.listedbranch.resyes@example.com`
  - SNAPSHOT — confirm both attached document names are displayed and the **Upload** button is available
  - CLICK **Upload**
  - WAIT for the CIPC lookup to auto-populate the entity details
  - SNAPSHOT — confirm the auto-populated Entity Name and normalised Company Registration Number
  - SELECT Title — choose `Mr`
  - TYPE the First Name field with `AutoQA`
  - TYPE the Last Name field with `ListedBranchResYes`
  - SELECT Province — choose `Gauteng`
  - SELECT Preferred Communication — choose `Email`
  - CLICK **Save**
  - WAIT for the lead details page to load
  - SNAPSHOT — confirm the lead header, status, and action toolbar
- **Assertions:**
  - [x] ASSERT (BLOCKING) turning *Upload Resolution and Consent?* ON reveals **Signatory ID Number**, **Company Registration Number**, **Upload Consent** and **Upload Resolution**, and **disables Save**
  - [x] ASSERT turning the switch ON hides the Client Information block
  - [x] ASSERT both **Download Consent Template** and **Download Resolution Template** actions are offered
  - [x] ASSERT both attached document names (`pdf-test.pdf`) are displayed against their upload controls
  - [x] ASSERT clicking **Upload** re-enables **Save**
  - [x] ASSERT the CIPC lookup auto-populates the **Entity Name** from the Company Registration Number (`2012/225386/07` → `BOXFUSION (PTY)LTD`)
  - [x] ASSERT the Company Registration Number is normalised to its `K`-prefixed form (`K2012/225386/07`)
  - [x] ASSERT the Client Information block is revealed again after **Upload**
  - [x] ASSERT the lead saves and the URL becomes the lead details route
  - [x] ASSERT the saved lead records Client Type `Listed Company (Entity)` and Lead Channel `Landbank Branch`

---

### TC-09 — Listed Company lead via Landbank Branch with Upload Resolution and Consent = False
- **Type:** Alternate path (Landbank Branch, manual capture)
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE to `/dynamic/LandBank.Crm/LBLead-table`
  - CLICK **New Lead**
  - WAIT for the **Add New Lead** modal to open
  - SELECT Lead Channel — choose `Landbank Branch`
  - SELECT Client Type — choose `Listed Company (Entity)`
  - SNAPSHOT — confirm the *Upload Resolution and Consent?* switch is OFF and no upload controls are rendered
  - SELECT Title — choose `Mr`
  - TYPE the First Name field with `AutoQA`
  - TYPE the Last Name field with `ListedBranchResNo`
  - TYPE the Entity Name field with `AutoQA Listed Branch Ltd`
  - SELECT Province — choose `Gauteng`
  - SELECT Preferred Communication — choose `Email`
  - TYPE the Mobile Number field with `0820000204`
  - TYPE the Email Address field with `autoqa.listedbranch.resno@example.com`
  - CLICK **Save**
  - WAIT for the lead details page to load
  - SNAPSHOT — confirm the saved lead header and captured fields
- **Assertions:**
  - [x] ASSERT the *Upload Resolution and Consent?* switch defaults to OFF
  - [x] ASSERT with the switch OFF neither **Upload Consent** nor **Upload Resolution** is displayed
  - [x] ASSERT with the switch OFF the **Signatory ID Number** and **Company Registration Number** fields are not displayed
  - [x] ASSERT no **Request OTP** action is offered for an Entity client type
  - [x] ASSERT the **Entity Name** field is required and displayed
  - [x] ASSERT **Save** is enabled without any document upload
  - [x] ASSERT (BLOCKING) the lead saves and the URL becomes the lead details route
  - [x] ASSERT the saved lead retains the captured First Name, Last Name and Entity Name
  - [x] ASSERT the saved lead records Client Type `Listed Company (Entity)` and Lead Channel `Landbank Branch`

---

### TC-10 — Close Corporation lead via Landbank Branch with Upload Resolution and Consent = True
- **Type:** Happy path (Landbank Branch, resolution + consent uploaded)
- **Depends on:** TC-01
- **Steps:** As TC-08, with these substitutions:
  - SELECT Client Type — choose `Close Corporation (Entity)`
  - TYPE the Last Name field with `CloseCorpBranchResYes`
  - TYPE the Mobile Number field with `0820000205`
  - TYPE the Email Address field with `autoqa.closecorpbranch.resyes@example.com`
- **Assertions:**
  - [x] ASSERT (BLOCKING) turning *Upload Resolution and Consent?* ON reveals the signatory fields and both upload controls, and **disables Save**
  - [x] ASSERT both attached document names (`pdf-test.pdf`) are displayed against their upload controls
  - [x] ASSERT clicking **Upload** re-enables **Save**
  - [x] ASSERT the CIPC lookup auto-populates the **Entity Name** from the Company Registration Number
  - [x] ASSERT the lead saves and records Client Type `Close Corporation (Entity)` and Lead Channel `Landbank Branch`

---

### TC-11 — Close Corporation lead via Landbank Branch with Upload Resolution and Consent = False
- **Type:** Alternate path (Landbank Branch, manual capture)
- **Depends on:** TC-01
- **Steps:** As TC-09, with these substitutions:
  - SELECT Client Type — choose `Close Corporation (Entity)`
  - TYPE the Last Name field with `CloseCorpBranchResNo`
  - TYPE the Entity Name field with `AutoQA Close Corp Branch CC`
  - TYPE the Mobile Number field with `0820000206`
  - TYPE the Email Address field with `autoqa.closecorpbranch.resno@example.com`
- **Assertions:**
  - [x] ASSERT the *Upload Resolution and Consent?* switch defaults to OFF
  - [x] ASSERT with the switch OFF neither upload control nor the signatory fields are displayed
  - [x] ASSERT no **Request OTP** action is offered for an Entity client type
  - [x] ASSERT **Save** is enabled without any document upload
  - [x] ASSERT (BLOCKING) the lead saves and the URL becomes the lead details route
  - [x] ASSERT the saved lead records Client Type `Close Corporation (Entity)` and Lead Channel `Landbank Branch`

---

### TC-12 — Capture Loan Info and initiate the loan application workflow
- **Type:** Happy path — **currently blocked by BUG-LB-001**
- **Depends on:** TC-04 (a converted ENTITY Opportunity in `DRAFT`)
- **Steps:**
  - NAVIGATE to the Opportunity details page for a converted lead in `DRAFT`
  - SNAPSHOT — confirm the Opportunity status is `DRAFT` and **Initiate Loan Application** is displayed
  - CLICK **Edit**
  - WAIT for the form to enter edit mode (**Cancel** and **Save** appear)
  - SNAPSHOT — confirm the inner tab strip is rendered
  - CLICK the **Loan Info** tab
  - SNAPSHOT — confirm the Loan Info fields are rendered
  - TYPE the Requested Amount field with `1500000`
  - TYPE the Application Details field with `AutoQA end-to-end origination smoke test.`
  - CLICK **Save**
  - WAIT for the form to leave edit mode
  - SNAPSHOT — confirm the saved Requested Amount is reflected
  - CLICK **Initiate Loan Application**
  - WAIT for the Opportunity header to refresh
  - SNAPSHOT — confirm the Opportunity status after initiation
- **Assertions:**
  - [x] ASSERT the Requested Amount persists after **Save**
  - [x] ASSERT (BLOCKING) the Opportunity leaves `DRAFT` after **Initiate Loan Application** — *expected FAIL: BUG-LB-001, `InitiateLoanApplicationWorkflow` returns HTTP 500 and the status stays `DRAFT`*
  - [x] ASSERT no unhandled server error (HTTP 5xx) is raised by the initiation call — *expected FAIL: BUG-LB-001*
  - [x] ASSERT an **Application Number** is allocated to the Opportunity

---

### TC-13 — Action the Complete Onboarding Checklist task from the RM Inbox
- **Type:** Happy path
- **Depends on:** TC-01. Consumes the **oldest in-flight** *Complete Onboarding Checklist* item in the RM Inbox — TC-12 cannot supply one while BUG-LB-001 stands.
- **Steps:**
  - CLICK the **Inbox** item in the side menu
  - WAIT for the Inbox listing to load
  - SNAPSHOT — confirm the **Incoming Items** heading and the inbox grid
  - EXTRACT the Ref No of the first *Complete Onboarding Checklist* row
  - SNAPSHOT — confirm the row exposes its workflow action link
  - CLICK the workflow action link on that row
  - WAIT for the workflow action page to load
  - SNAPSHOT — confirm the task header, ref no, and the embedded loan application form
  - CLICK the **Compliance** tab
  - SNAPSHOT — confirm the onboarding checklist checkboxes are rendered and enabled
  - CLICK the *Has valid tax clearance* checkbox
  - CLICK the *Maintains formal financial records* checkbox
  - CLICK the *Has working equipment* checkbox
  - CLICK the *Has access to markets* checkbox
  - CLICK the *Is compliant with labor laws* checkbox
  - SNAPSHOT — confirm **Submit** is enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **Incoming Items** heading is displayed
  - [x] ASSERT the URL is the Inbox route (`/dynamic/Shesha.Workflow/workflows-inbox`)
  - [x] ASSERT at least one row shows Action Required `Complete Onboarding Checklist`
  - [x] ASSERT the inbox row's action link targets the workflow action route (`/shesha/workflow-action?id=`)
  - [x] ASSERT the workflow action page header reads `Complete Onboarding Checklist`
  - [x] ASSERT the task status is `IN PROGRESS`
  - [x] ASSERT the task Ref No matches the Ref No extracted from the Inbox row
  - [x] ASSERT the nine onboarding checklist checkboxes are enabled
  - [x] ASSERT the ticked checklist items retain their checked state
  - [x] ASSERT the **Submit** button is enabled

---

### TC-14 — Confirm the Opportunity reflects the completed Inbox step
- **Type:** Happy path — **read-only verification**
- **Depends on:** TC-13
- **Steps:**
  - CLICK the **Opportunities** item in the side menu
  - WAIT for the Opportunities listing to load
  - SNAPSHOT — confirm the **All Opportunities** heading and the grid
  - SNAPSHOT — confirm the Application Status column is rendered
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **All Opportunities** heading is displayed
  - [x] ASSERT the URL is the Opportunities listing route (`/dynamic/LandBank.Crm/LBOpportunity-table`)
  - [x] ASSERT the grid exposes the **Application Status** and **Application Number** columns
  - [x] ASSERT every Opportunity created by TC-03 → TC-05 is listed
  - [x] ASSERT an Opportunity whose workflow has started shows a status beyond `DRAFT` (`BLOCKED` observed on `OPP-2026-001203`, `OPP-2026-001201`, `OPP-2026-001187`)

## Test Data Notes
- Leads created by this plan are prefixed `AutoQA` with mobile numbers in the `08200001xx` (Online Digital Channel) and `08200002xx` (Landbank Branch) ranges and `@example.com` e-mail addresses, so they are easy to filter out of the Dev Leads grid.
- **Mobile Number** is capped at 10 characters by the form (`maxlength=10`); **ID Number** at 13.
- **ID numbers must pass the Luhn check.** The plan uses `9001015800088` (TC-06), `8503155400083` (TC-07) and `9207125001083` (signatory, TC-08 / TC-10).
- **Consent / resolution attachments** use `test-data/pdf-test.pdf`. It is not a real Land Bank consent form, so the *document-driven* auto-populate does nothing — the Individual consent path therefore requires the client fields to be typed manually after **Upload**. The *entity* auto-populate is keyed off the **Company Registration Number**, not the PDF, so it does fire (`2012/225386/07` → `BOXFUSION (PTY)LTD`).
- The **OTP cannot be completed automatically** — the OTP is delivered to the captured mobile/e-mail, which are fictitious test values. TC-07 therefore verifies that the OTP *challenge* is offered and retains its inputs, then saves without verifying, which is what exposes BUG-LB-002.
- TC-13 deliberately stops **before** submitting the onboarding checklist: submitting would advance a workflow instance this plan did not create. Once BUG-LB-001 is fixed, TC-12 will supply a first-party task and TC-13 can be extended to click **Submit** and assert the task leaves the Inbox.

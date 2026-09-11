# Test Plan: OPP-3.1 — Opportunity Loan Application Capture (Client Info, Party Tables, Loan Info, Documents)

> **Status:** Ready (TC-11 blocked by BUG-LB-001 — see Known Blockers)
> **Owner:** QA
> **Last Updated:** 2026-07-31
> **Estimated Duration:** 900s

## Metadata
| Field | Value |
|-------|-------|
| App | Land Bank CRM (Admin Portal) |
| Environment | Dev (`DEV_APP_URL`, active `TEST_ENV=dev`) |
| Login As | RM role (username/password resolved from `RM_USERNAME` / `RM_PASSWORD` in the gitignored `.env`) |
| Pages under test | Opportunities (`/dynamic/LandBank.Crm/LBOpportunity-table`), Opportunity details (`/dynamic/LandBank.Crm/LBOpportunity-details?id=`) |
| Embedded forms | `LandBank.Crm/opportunity-loan-application v224` (Client Info / Loan Info / Farms), `LandBank.Crm/loan-application-documents-subform v22` (Documents), `LandBank.Crm/LBApplication-director-create v39` (Director + Shareholder), `LandBank.Crm/LBApplication-signatory-create v5` (Signatory), `LandBank.Crm/application-loan-purpose-create v3` (Loan Purpose), `LandBank.Crm/managed-file-version-history v2` (document upload) |
| Test document | `test-data/pdf-test.pdf` (hub root) |
| Upstream plan | [../leads/lead-to-opportunity-lifecycle.md](../leads/lead-to-opportunity-lifecycle.md) |

## Objective
> Validate that an RM can populate a converted Opportunity's loan application end to end: the **Client Info** tab (including the **Directors / Shareholders / Signatories** party tables for entity applications), the **Loan Info** tab (including at least one **Loan Purpose** and its amount rule), and the **Documents** tab (uploading each required document). Covers every client-type scenario carried forward from the lead plan.

## Scenario Coverage

At the Opportunity stage the form variant is driven **only by Application Type**, which is derived from the lead's Client Type. **Lead Channel and the lead consent method do not change the Opportunity form** — they govern lead capture only (verified live 2026-07-31). Each lead-plan scenario is therefore traced to the Opportunity form variant it produces:

| Lead plan TC | Client Type | Lead Channel | Consent | → Opportunity variant | Covered by |
|---|---|---|---|---|---|
| LEAD TC-03 | Individual | Online Digital Channel | n/a | PERSONAL | **TC-03** |
| LEAD TC-06 | Individual | Landbank Branch | Upload = True | PERSONAL | **TC-04** |
| LEAD TC-07 | Individual | Landbank Branch | Upload = False | PERSONAL | **TC-05** |
| LEAD TC-04 | Listed Company | Online Digital Channel | n/a | ENTITY | **TC-06** |
| LEAD TC-08 / TC-09 | Listed Company | Landbank Branch | Res+Consent = True / False | ENTITY | **TC-07** |
| LEAD TC-05 | Close Corporation | Online Digital Channel | n/a | ENTITY | **TC-08** |
| LEAD TC-10 / TC-11 | Close Corporation | Landbank Branch | Res+Consent = True / False | ENTITY | **TC-09** |

> Each scenario TC runs the **same three-tab capture sequence** against an Opportunity of the matching Application Type, and asserts the variant-specific structure (section heading, field set, party tables, document requirement sets).

## Form variant differences (recorded live 2026-07-31)

| Aspect | PERSONAL (Individual) | ENTITY (Listed Company / Close Corporation) |
|---|---|---|
| Client Info section heading | **Individual Client Information** | **Entity Information** |
| Client Info fields | 18 — incl. `loanApplication_clientIdNumber` (Client ID Number), `loanApplication_title` (**Client Title**), `loanApplication_clientName` (**Client Name**), `loanApplication_clientSurname` (**Client Surname**), `loanApplication_countryOfOrigin`, `loanApplication_region`, `loanApplication_maritalStatus` | 28 — incl. `loanApplication_entityName`, `loanApplication_companyRegistrationNumber`, `loanApplication_annualTurnover`, `loanApplication_yearsInOperation`, `loanApplication_title` (**Contact Person Title**), `loanApplication_clientName` (**Contact Person Name**), `loanApplication_clientSurname` (**Contact Person Surname**), `loanApplication_itcStatus`, `loanApplication_totalOwners`, `loanApplication_isNcaClient`, `loanApplication_beeeLevel`, `loanApplication_hasResolution`, `loanApplication_countryOfIncorporation`, `loanApplication_financialYearEnd`, `loanApplication_vatNumber`, `loanApplication_incomeTaxNumber` |
| Party tables | **none** | **Directors**, **Shareholders**, **Signatories** (each its own single-tab section inside Client Info) |
| Document sections | Application Documents (10), Main Applicant and Spouse Documents (4), Related Party Documents | Application Documents (9), **Entity Documents (9)**, Main Applicant and Spouse Documents (1), Related Party Documents |
| Loan Info | identical | identical |

## Recorded reference data

**Client Info — shared field names** (both variants): `loanApplication_emailAddress`, `loanApplication_mobileNumber`, `loanApplication_preferredCommunication`, `loanApplication_countryOfResidence`, `loanApplication_citizenship`, `loanApplication_hasSurety`, `loanApplication_hasCoApplicant`, `loanApplication_clientClassification`, `loanApplication_address`, `loanApplication_province`, `loanApplication_provincialOffice`.

**Loan Info fields:** `loanApplication_requiredProducts` (Products, multi-select), `loanApplication_businessSummary` (Application Details, textarea), `loanApplication_requestedAmount` (Requested Amount, `ant-input-number`), `loanApplication_existingRelationship` (Existing Relationship with Bank), `loanApplication_sourcesOfIncome` (Sources Of Income, multi-select), plus the **Loan Purpose** table and its **Add Loan Purpose** action.

**Loan Purpose modal** — *Add Loan Purpose(s)*, form `application-loan-purpose-create v3`. Fields: `purpose` (select, required), `otherPurposeDescription` (**Purpose Description**, textarea, **required for every purpose — not only "Other"**), `amount` (`ant-input-number`, required). Read-only display of **Your Requested Amount**. Save button is **Save Loan Purpose**. Purpose options:
`Improvements To Farming Property`, `Purchase Of Livestock`, `Financing Agri-Debt`, `Establishment Costs`, `Purchase Of Movable Assets`, `Purchase Of Production Inputs For Crops`, `Purchase Of Production Inputs For Livestock`, `Production loan re-advance`, `Revolving facility review`, `Other (Please specify)`.
Stated rule: *"At least one loan purpose is required. The total amount across all loan purposes cannot exceed the requested amount."*

**Director / Shareholder modal** — *Create Director* / *Create Shareholder*, both the **same** form (`LBApplication-director-create v39`), 26 fields: `applicantType` (Personal | Entity, defaults **Personal**), `citizenshipStatus` (South African Citizen | South African Permanent Resident | Foreign National), `firstname`, `lastname`, `idNumber`, `passportNumber`, `sharePercentage` (**Ownership%**), `hasDisability`, `gender`, `bpNumber`, `race`, `citizenship`, `countryOfResidence`, `countryOfOrigin`, `maritalStatus`, `maritalRegime`, `address_addressLine1`, `mobileNumber`, `province`, `emailAddress`, `financialYearEnd`, `vatNumber`, `incomeTaxNumber`, `ultimateBOwner`, `hasEffectiveControl`, `partOf` (hidden). Save buttons: **Save Director** / **Save Shareholder**.
Conditionals: `citizenshipStatus = South African Citizen` → **`idNumber` shown, `passportNumber` hidden**; `maritalRegime` hidden until a Marital Status is chosen; `hasEffectiveControl` hidden until `ultimateBOwner` is ticked.

**Signatory modal** — *Create Signatory*, a **different, smaller** form (`LBApplication-signatory-create v5`), 5 fields only: `firstname`, `lastname`, `idNumber`, `emailAddress`, `mobileNumber`. Save button: **Save Signatory**.

**Directors table columns:** Entity Name, First Name, Last Name, ID Number, Company Registration Number, Email, Mobile, Ownership, Citizenship, BPNumber, Ultimate BOwner, Has Effective Control, Marital Status, Marital Regime, Spouse ID Number.

**Document requirement sets:**
- *Application Documents* (**PERSONAL**): Business Plan, Bank Statements, Cash Flow Projections, Consent, Deeds Office Search, Water Rights Certificate / Proof of Application, Proof of VAT / Income Tax Registration, Offtake Agreement, ITC Report and Proof of Debt, Funding Request Documentation.
- *Application Documents* (**ENTITY**): Business Plan, Deeds Office Search, Funding Request Documentation, Cash Flow Projections, Consent, Water Rights Certificate / Proof of Application, Offtake Agreement, Bank Statements, Lease Agreement / Permission to Occupy.
- *Entity Documents* (**ENTITY only**): Change of Directors / Address (CoR39 / CoR21), Directors' / Shareholders' Resolutions, VAT / Tax Registration, Share Register / Share Certificates, Notice of Incorporation (CoR14.1), Shareholders Agreement, Memorandum of Incorporation (CoR15 series), CIPC Search, ITC Reports for Directors and Company.
- *Main Applicant and Spouse Documents* (**PERSONAL**): Permanent Residency Certificate, Proof of Address (FICA), SA ID / Temporary ID, Lease Agreement / Permission to Occupy. (**ENTITY**): SA ID / PR Certificate for Directors / Shareholders.
- *Related Party Documents*: carries an extra **Document Owner** column. **It is populated from the party tables** (recorded live) — adding a director/shareholder creates a **SA ID / Temporary ID** row per party, and marking a party **Married** adds a **Divorce Decree / ANC Agreement** row for them. It shows *No Data* only while no parties exist.

**Mandatory documents to initiate — the two Application Types require different sets** (recorded live from the initiation gate, which names them explicitly):

| | **ENTITY** (recorded 2026-08-05 on `OPP-2026-001244`) | **PERSONAL** (recorded 2026-08-11 on `AutoQA IndivWorkflow`) |
|---|---|---|
| Count | 11 + one `SaIdOrTemporaryId` **per related party** | **8** |
| Mandatory | `VatTaxRegistration`, `NoticeOfIncorporationCoR141`, `SaIdOrPrCertificateForDirectorsShareholders`, `FundingRequestDocumentation`, `CashFlowProjections`, `Consent`, `MemorandumOfIncorporationCoR15`, `CipcSearch`, `ItcReportsForDirectorsAndCompany`, `BankStatements`, `SaIdOrTemporaryId` (×N parties) | `FundingRequestDocumentation`, `Consent`, `BankStatements`, **`BusinessPlan`**, `ItcReportAndProofOfDebt`, `ProofOfAddressFica`, `CashFlowProjections`, `SaIdOrTemporaryId` |
| Conditional extra | `DivorceDecreeOrAncAgreement` once a party is marked *Married* | *(not exercised — the recorded applicant was Single)* |
| Not mandatory | Business Plan, Deeds Office Search, Water Rights Certificate, Offtake Agreement, Lease Agreement / Permission to Occupy, Change of Directors (CoR39/CoR21), Directors'/Shareholders' Resolutions, Share Register / Share Certificates, Shareholders Agreement | Deeds Office Search, Water Rights Certificate, Offtake Agreement, Proof of VAT / Income Tax Registration, Permanent Residency Certificate, Lease Agreement / Permission to Occupy |

> **Note the inversion:** **Business Plan is mandatory for a PERSONAL application but not for an ENTITY one.** A shared "upload every mandatory document" helper must therefore be driven from the Application Type, not from a single list.

**Non-document initiation gates (recorded live).** Beyond documents, the workflow also refused to initiate until each of these was supplied — each returned as its own HTTP 500 with a distinct message:
`at least one product is required` (`loanApplication_requiredProducts`), `business summary is required` (`loanApplication_businessSummary`), `existing relationship with bank is required` (`loanApplication_existingRelationship` — **hit on the PERSONAL path**), and `Director <n> marital status is required` (each party's `maritalStatus` — entity path only).
- Document rows expose Document | Status | Last Updated | Uploaded By, status **Not Uploaded** until a file is attached. Clicking the row's link opens the **Manage File Versions** modal (*Current Document*, *Upload / Replace Document*, `(press to upload)`, `Cancel`, `OK`). After **OK** the row status becomes **Uploaded** with today's date and the uploader's name.

## Preconditions
- [ ] App is reachable at the Dev URL (`DEV_APP_URL`)
- [ ] Valid RM credentials are present in `.env` (`RM_USERNAME` / `RM_PASSWORD`)
- [ ] At least one **PERSONAL** and one **ENTITY** Opportunity in `DRAFT` exist, produced by the upstream lead plan
- [ ] `test-data/pdf-test.pdf` exists at the hub root

## Known Blockers

> **BUG-LB-001 (re-characterised 2026-08-05 — the earlier description was an incomplete diagnosis).**
> **Initiate Loan Application** fires `POST .../InitiateLoanApplicationWorkflow?opportunityId=<guid>`, which returns **HTTP 500**
> — but the response body carries a **precise business validation message** that the UI discards entirely (no toast, no inline
> error, status silently stays `DRAFT`). The workflow is **not** broken; the call is a submission gate. Walking the gates in order
> on `OPP-2026-001244` produced, one after another:
> 1. `Cannot submit. The following mandatory documents are missing: VatTaxRegistration, NoticeOfIncorporationCoR141, SaIdOrPrCertificateForDirectorsShareholders, FundingRequestDocumentation, CashFlowProjections, Consent, MemorandumOfIncorporationCoR15, CipcSearch, ItcReportsForDirectorsAndCompany, BankStatements, SaIdOrTemporaryId, SaIdOrTemporaryId`
> 2. `Cannot initiate workflow: at least one product is required.`
> 3. `Cannot initiate workflow: business summary is required.`
> 4. `Cannot initiate workflow: Director 2 marital status is required.` → now blocked by **BUG-LB-004**
>
> **The defects are:** (a) a validation failure returned as **HTTP 500** instead of 400, and (b) the message **never surfaced** to
> the user. The same silent pattern affects the Opportunity **Save**, where a 400 carrying *"A signed resolution document must be
> attached when HasResolution is true."* also produced no visible feedback.
> TC-13's blocking assertion is expected to FAIL until the remaining gate (BUG-LB-004) is cleared.

> **BUG-LB-005 (silent save blocker, recorded live 2026-08-05 — replaces the withdrawn BUG-LB-004).** On the participant page
> (`/dynamic/LandBank.Crm/application-participant-panels-revised?id=<participantId>`), **Save silently does nothing** when an
> unrelated field fails client-side validation. An **empty Vat Number** raises *"Field validation error for Vat Number"* — rendered
> inline on a field the RM was never editing, with **no error summary, no scroll-to-error and no toast** — and the form never
> submits (verified: no request is issued at all). It reads exactly like "Save is broken". **Filling Vat Number made the same save
> succeed** (`PUT /api/dynamic/LandBank.Crm/ApplicationParticipant/Crud/Update` → **200**, payload `"maritalStatus":1`) and the
> value persisted across a reload.
>
> *Withdrawn — BUG-LB-004* previously claimed "Marital Status does not persist / no update request is ever issued" and called it a
> blocker to initiating any ENTITY application. **The observation was right but the cause was misdiagnosed** — it was this Vat
> Number validation, not a broken save path. Marital Status persists correctly, and the ENTITY application **was** initiated
> successfully once the gates were cleared (`LA2026/14392`).

> **Party marital-status rules (recorded live 2026-08-05).** A party's **Marital Status** (`maritalStatus`: `Single`, `Married`,
> `Divorced`, `Widowed`, `Separated`, `Domestic Partnership`) is required before the workflow can be initiated. Selecting
> **`Married`** reveals five further fields, all of which must be captured to initiate:
> `maritalRegime` (**Marital Regime** — `Married in Community of Property`, `Married out of Community with Accrual`,
> `Married out of Community without Accrual`), `spouseFirstname`, `spouseLastname`, `spouseIdNumber`, `spouseEmailAddress`.
> None of them carry a required mark in the UI — the requirement is enforced only at initiation.
> Marking a party **Married** also adds a **conditional mandatory document**: a **Divorce Decree / ANC Agreement**
> (`DivorceDecreeOrAncAgreement`) row appears under *Related Party Documents* for that party and must be uploaded before the
> workflow will initiate.

> **Mandatory-field corrections (recorded live 2026-08-05).** Fields this plan previously treated as optional are in fact
> **required to initiate**: `loanApplication_requiredProducts` (**Products** — an *entity picker*, opened via its ellipsis button,
> selected by **double-clicking** a row in the *Select Item* dialog; 9 products exist, e.g. `Production Finance`),
> `loanApplication_businessSummary` (**Application Details**), and each party's **Marital Status**. Read mode also exposes fields
> the edit-mode inventory missed: `loanApplication_documentSigningMethod` (**Document Signing Method**, observed `URLUpload`),
> `loanApplication_autoVerify`, `loanApplication_entityOrgType`, and `loanApplication_manualApproval` (**Resolution Document**),
> which is revealed only when *Does the client have a resolution?* is ticked. `loanApplication_provincialOffice` and
> `loanApplication_hasResolution` are each bound to **two** form items (one hidden), so locators must filter on
> `:not(.ant-form-item-hidden)`. **Requested Amount renders blank in edit mode** and must be re-entered on each edit pass.

> **BUG-LB-003 (validation / UX, recorded live 2026-07-31).** The Loan Purpose modal states *"the total amount across all loan
> purposes cannot exceed the requested amount"*, but that rule is **not enforced client-side and its rejection is invisible**.
> Against an Opportunity with a **Requested Amount of R1,500,000**, entering a purpose amount of **R2,000,000** leaves
> **Save Loan Purpose enabled**, raises **no inline validation error**, and on click the modal **closes as though it succeeded**
> — no error toast. The purpose is silently discarded: the Loan Purpose table still showed *"No data is available for this
> table"* after a full page reload. The same modal with **R500,000** persisted correctly
> (`Purchase Of Livestock / R 500 000,00`), which confirms the save path works and the over-limit value was rejected rather
> than lost to an unrelated fault. Reproduced on `OPP-2026-001244`.
> **Consequence for this plan:** TC-10 asserts the correct behaviour (either an inline error or a visible failure message) and
> is expected to FAIL while this stands.

## Recording Notes (2026-07-31, captured live as the RM)

- **Edit-mode inversion — this dictates the capture order.** The **Add Loan Purpose** button is enabled **only in edit mode** (disabled in read mode), while **Add Director / Add Shareholder / Add Signatory** are enabled **only in read mode** (visible but disabled while the form is in edit mode). So loan purposes must be added *inside* an Edit session and party members *outside* one. This asymmetry is unintuitive and worth raising with the team.
- **Action buttons carry their icon in the accessible name** — `Edit` is `"edit Edit"`, `Save` is `"check Save"`, `Cancel` is `"close Cancel"`, `Initiate Loan Application` is `"plus Initiate Loan Application"`, `Add Director` is `"plus-circle Add Director"`. An `exact: true` name match on the bare label **will not match**; use substring matching.
- **`rc-tabs-*` element ids are not stable across page loads** — the same Loan Info tab was `rc-tabs-5-tab-…` on one load and `rc-tabs-4-tab-…` on the next. Tabs must be addressed by role + accessible name, never by id.
- **The document upload field's `label[for]` is a generated GHOST id** (`_&@#GH0ST_<guid>`) and changes per render. The upload control inside **Manage File Versions** must be reached through the modal + its `input[type="file"]`, not via a label anchor.
- Ant Design form items expose **no `id` and no `data-testid`**; fields are anchored on `<label for="<fieldName>">` scoped by a **direct-child** chain (a plain `:has()` also matches ancestor form items in these nested forms).
- Conditional fields are hidden with the `ant-form-item-hidden` class rather than removed from the DOM.
- Select **options expose no `role=option`** — matched on their `title` attribute inside the open (non-hidden) dropdown; once a select holds a value its hidden `<input>` is click-intercepted, so the trigger must be the `.ant-select-selector`.
- The **Requested Amount** and **Loan Purpose Amount** fields are `ant-input-number` controls that display a thousands-formatted value (`2,000,000`) — assert on the formatted text, not the raw digits.
- **Directors / Shareholders / Signatories are not sibling tabs** of Client Info — each is its own single-tab container nested *inside* the Client Info panel.

## Test Cases

### TC-01 — Log in as an RM and open the Opportunities listing
- **Type:** Happy path
- **Steps:**
  - NAVIGATE to `/login`
  - SNAPSHOT — confirm the login form is rendered
  - TYPE the Username field with the RM username (from `.env`)
  - TYPE the Password field with the RM password (from `.env`)
  - CLICK **Sign In**
  - WAIT for the app to redirect away from `/login`
  - CLICK the **Opportunities** item in the side menu
  - WAIT for the Opportunities listing to load
  - SNAPSHOT — confirm the listing heading and grid
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **All Opportunities** heading is displayed
  - [x] ASSERT the URL is the Opportunities listing route (`/dynamic/LandBank.Crm/LBOpportunity-table`)
  - [x] ASSERT the grid exposes the **Application Type** and **Application Status** columns

---

### TC-02 — Open a DRAFT Opportunity and confirm the loan application tab structure
- **Type:** Happy path
- **Depends on:** TC-01
- **Steps:**
  - SNAPSHOT — confirm at least one `DRAFT` Opportunity row is listed
  - CLICK the details link on the first `DRAFT` Opportunity row
  - WAIT for the Opportunity details page to load
  - SNAPSHOT — confirm the header, action toolbar, and both tab strips
- **Assertions:**
  - [x] ASSERT (BLOCKING) the URL is the Opportunity details route (`/dynamic/LandBank.Crm/LBOpportunity-details?id=`)
  - [x] ASSERT the outer tabs **Loan Application Details**, **Tasks**, **Notes** and **Documents** are displayed
  - [x] ASSERT the inner tabs **Client Info**, **Loan Info** and **Farms** are displayed
  - [x] ASSERT the **Edit**, **Audit Log** and **Initiate Loan Application** actions are displayed
  - [x] ASSERT the Opportunity status is `DRAFT`

---

### TC-03 — PERSONAL Opportunity: populate the Client Info tab (Individual via Online Digital Channel)
- **Type:** Happy path — traces LEAD TC-03
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE to a `PERSONAL` Opportunity in `DRAFT`
  - SNAPSHOT — confirm the **Application Type** is `PERSONAL`
  - CLICK the **Client Info** inner tab
  - SNAPSHOT — confirm the **Individual Client Information** section is rendered
  - CLICK **Edit**
  - WAIT for edit mode (**Cancel** and **Save** appear)
  - TYPE the Address field with `12 Test Farm Road, Centurion`
  - SELECT Province — choose `Gauteng`
  - SELECT Country Of Residence — choose `South Africa`
  - SELECT Citizenship — choose `South Africa`
  - SELECT Client Classification — choose `Commercial`
  - SELECT Preferred Communication — choose `Email`
  - CLICK the *Does the client have a surety?* checkbox
  - SNAPSHOT — confirm the captured values before saving
  - CLICK **Save**
  - WAIT for the form to leave edit mode
  - SNAPSHOT — confirm the saved Client Info values
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Client Info section heading is **Individual Client Information**
  - [x] ASSERT the individual-only fields are displayed — **Client ID Number**, **Client Title**, **Client Name**, **Client Surname**, **Country Of Origin**, **Region**, **Marital Status**
  - [x] ASSERT the entity-only fields are **not** displayed — **Entity Name**, **Company Registration Number**, **Annual Turnover**, **Years In Operation**
  - [x] ASSERT no **Directors**, **Shareholders** or **Signatories** party table is displayed for a PERSONAL application
  - [x] ASSERT the captured Address and Province persist after **Save**
  - [x] ASSERT the *Does the client have a surety?* selection persists after **Save**

---

### TC-04 — PERSONAL Opportunity from a Landbank Branch lead with Upload Consent = True
- **Type:** Happy path — traces LEAD TC-06
- **Depends on:** TC-01
- **Steps:** As TC-03, against the Opportunity converted from the *Individual / Landbank Branch / Upload Consent = True* lead.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Client Info section heading is **Individual Client Information**
  - [x] ASSERT the Opportunity **Application Type** is `PERSONAL` regardless of the originating Lead Channel
  - [x] ASSERT the Client Info field set matches the PERSONAL variant (no entity fields, no party tables)
  - [x] ASSERT the captured Client Info values persist after **Save**

---

### TC-05 — PERSONAL Opportunity from a Landbank Branch lead with Upload Consent = False
- **Type:** Happy path — traces LEAD TC-07
- **Depends on:** TC-01
- **Steps:** As TC-03, against the Opportunity converted from the *Individual / Landbank Branch / Upload Consent = False* lead.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Client Info section heading is **Individual Client Information**
  - [x] ASSERT the Opportunity **Application Type** is `PERSONAL`
  - [x] ASSERT the Client Name / Client Surname fields are editable so the RM can complete details the OTP lead path never captured (see BUG-LB-002 in the lead plan)
  - [x] ASSERT the captured Client Info values persist after **Save**

---

### TC-06 — ENTITY Opportunity: populate Client Info and all three party tables (Listed Company via Online Digital Channel)
- **Type:** Happy path — traces LEAD TC-04
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE to an `ENTITY` Opportunity in `DRAFT`
  - SNAPSHOT — confirm the **Application Type** is `ENTITY`
  - CLICK the **Client Info** inner tab
  - SNAPSHOT — confirm the **Entity Information** section and the three party tables are rendered
  - CLICK **Edit**
  - WAIT for edit mode
  - TYPE the Annual Turnover field with `8500000`
  - TYPE the Years In Operation field with `14`
  - TYPE the Total Owners field with `2`
  - TYPE the Vat Number field with `4123456789`
  - TYPE the Income Tax Number field with `9123456789`
  - TYPE the Address field with `1 Agri Park, Sandton`
  - SELECT Province — choose `Gauteng`
  - SELECT Country Of Residence — choose `South Africa`
  - SELECT Country Of Incorporation — choose `South Africa`
  - SELECT Client Classification — choose `Commercial`
  - CLICK the *National Credit Act (NCA) Client?* checkbox
  - CLICK the *Does the client have a resolution?* checkbox
  - CLICK **Save**
  - WAIT for the form to leave edit mode
  - SNAPSHOT — confirm the saved Entity Information values and that the party **Add** actions are now enabled
  - CLICK **Add Director**
  - WAIT for the **Create Director** modal to open
  - SNAPSHOT — confirm the director form is rendered and **Applicant Type** defaults to `Personal`
  - SELECT Citizenship Status — choose `South African Citizen`
  - SNAPSHOT — confirm **ID Number** is revealed and **Passport Number** stays hidden
  - TYPE the First Name field with `Thandiwe`
  - TYPE the Last Name field with `AutoQADirector`
  - TYPE the ID Number field with `9207125001083`
  - TYPE the Ownership% field with `60`
  - TYPE the Email Address field with `autoqa.director@example.com`
  - TYPE the Mobile Number field with `0820000301`
  - CLICK **Save Director**
  - WAIT for the Directors table to refresh
  - SNAPSHOT — confirm the new director row
  - CLICK **Add Shareholder**
  - WAIT for the **Create Shareholder** modal to open
  - SELECT Citizenship Status — choose `South African Citizen`
  - TYPE the First Name field with `Sipho`
  - TYPE the Last Name field with `AutoQAShareholder`
  - TYPE the ID Number field with `8503155400083`
  - TYPE the Ownership% field with `40`
  - TYPE the Email Address field with `autoqa.shareholder@example.com`
  - CLICK **Save Shareholder**
  - WAIT for the Shareholders table to refresh
  - SNAPSHOT — confirm the new shareholder row
  - CLICK **Add Signatory**
  - WAIT for the **Create Signatory** modal to open
  - SNAPSHOT — confirm the signatory form exposes only the five recorded fields
  - TYPE the First Name field with `Nomsa`
  - TYPE the Last Name field with `AutoQASignatory`
  - TYPE the ID Number field with `9001015800088`
  - TYPE the Email Address field with `autoqa.signatory@example.com`
  - TYPE the Mobile Number field with `0820000302`
  - CLICK **Save Signatory**
  - WAIT for the Signatories table to refresh
  - SNAPSHOT — confirm the new signatory row
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Client Info section heading is **Entity Information**
  - [x] ASSERT the entity-only fields are displayed — **Entity Name**, **Company Registration Number**, **Annual Turnover**, **Years In Operation**, **ITC Status**, **Total Owners**, **BEEE Level**, **Country Of Incorporation**, **Financial Year End**, **Vat Number**, **Income Tax Number**
  - [x] ASSERT the individual-only fields are **not** displayed — **Client ID Number**, **Marital Status**
  - [x] ASSERT all three party tables — **Directors**, **Shareholders**, **Signatories** — are displayed
  - [x] ASSERT the captured Entity Information values persist after **Save**
  - [x] ASSERT the party **Add** actions are disabled while the form is in edit mode and enabled once it leaves edit mode
  - [x] ASSERT **Applicant Type** defaults to `Personal` in the party modal
  - [x] ASSERT choosing Citizenship Status `South African Citizen` reveals **ID Number** and keeps **Passport Number** hidden
  - [x] ASSERT the saved director appears in the Directors table with its First Name, Last Name, ID Number, Email and Ownership
  - [x] ASSERT the saved shareholder appears in the Shareholders table
  - [x] ASSERT the saved signatory appears in the Signatories table
  - [x] ASSERT the **Create Signatory** form exposes only `First Name`, `Last Name`, `ID Number`, `Email Address` and `Mobile Number`

---

### TC-07 — ENTITY Opportunity from a Landbank Branch Listed Company lead
- **Type:** Happy path — traces LEAD TC-08 / TC-09
- **Depends on:** TC-01
- **Steps:** As TC-06, against an Opportunity converted from a *Listed Company / Landbank Branch* lead (either consent method).
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Client Info section heading is **Entity Information**
  - [x] ASSERT the Opportunity **Application Type** is `ENTITY` regardless of the originating Lead Channel or consent method
  - [x] ASSERT all three party tables are displayed
  - [x] ASSERT a director can be added and appears in the Directors table
  - [x] ASSERT the captured Entity Information values persist after **Save**

---

### TC-08 — ENTITY Opportunity from a Close Corporation lead via Online Digital Channel
- **Type:** Happy path — traces LEAD TC-05
- **Depends on:** TC-01
- **Steps:** As TC-06, against an Opportunity converted from a *Close Corporation / Online Digital Channel* lead.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Client Info section heading is **Entity Information**
  - [x] ASSERT the Close Corporation Opportunity presents the identical ENTITY field set and party tables as a Listed Company
  - [x] ASSERT a director can be added and appears in the Directors table
  - [x] ASSERT the captured Entity Information values persist after **Save**

---

### TC-09 — ENTITY Opportunity from a Landbank Branch Close Corporation lead
- **Type:** Happy path — traces LEAD TC-10 / TC-11
- **Depends on:** TC-01
- **Steps:** As TC-06, against an Opportunity converted from a *Close Corporation / Landbank Branch* lead (either consent method).
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Client Info section heading is **Entity Information**
  - [x] ASSERT the Opportunity **Application Type** is `ENTITY`
  - [x] ASSERT all three party tables are displayed
  - [x] ASSERT the captured Entity Information values persist after **Save**

---

### TC-10 — Populate the Loan Info tab and add a Loan Purpose
- **Type:** Happy path + negative — **BUG-LB-003 expected on the over-limit assertion**
- **Depends on:** TC-02
- **Steps:**
  - NAVIGATE to an Opportunity in `DRAFT`
  - CLICK **Edit**
  - WAIT for edit mode
  - CLICK the **Loan Info** inner tab
  - SNAPSHOT — confirm the Loan Info fields and the Loan Purpose table are rendered
  - TYPE the Requested Amount field with `1500000`
  - TYPE the Application Details field with `AutoQA: mixed crop and livestock expansion.`
  - SELECT Existing Relationship with Bank — choose `None`
  - CLICK **Save**
  - WAIT for the form to leave edit mode
  - SNAPSHOT — confirm the saved Requested Amount
  - CLICK **Edit**
  - CLICK the **Loan Info** inner tab
  - SNAPSHOT — confirm **Add Loan Purpose** is enabled in edit mode
  - CLICK **Add Loan Purpose**
  - WAIT for the **Add Loan Purpose(s)** modal to open
  - SNAPSHOT — confirm the modal shows **Your Requested Amount** and that **Save Loan Purpose** is disabled
  - SELECT Purpose — choose `Purchase Of Livestock`
  - TYPE the Purpose Description field with `AutoQA: purchase of livestock within requested amount.`
  - TYPE the Amount field with `500000`
  - SNAPSHOT — confirm **Save Loan Purpose** is now enabled
  - CLICK **Save Loan Purpose**
  - WAIT for the Loan Purpose table to refresh
  - SNAPSHOT — confirm the new loan purpose row
  - CLICK **Add Loan Purpose**
  - SELECT Purpose — choose `Purchase Of Movable Assets`
  - TYPE the Purpose Description field with `AutoQA: over-limit negative check.`
  - TYPE the Amount field with `2000000`
  - SNAPSHOT — confirm how the form responds to a total that exceeds the requested amount
  - CLICK **Save Loan Purpose**
  - WAIT for the modal to settle
  - SNAPSHOT — confirm whether the over-limit purpose was accepted, rejected with a message, or silently dropped
- **Assertions:**
  - [x] ASSERT the Loan Purpose guidance text states that at least one purpose is required and the total cannot exceed the requested amount
  - [x] ASSERT **Add Loan Purpose** is disabled outside edit mode and enabled in edit mode
  - [x] ASSERT **Save Loan Purpose** is disabled until Purpose, Purpose Description and Amount are all supplied
  - [x] ASSERT the **Purpose Description** field is required even for a non-`Other` purpose
  - [x] ASSERT the modal displays **Your Requested Amount** matching the saved Requested Amount
  - [x] ASSERT (BLOCKING) a within-limit loan purpose is saved and listed with its Purpose, Description and Amount (`Purchase Of Livestock` / `R 500 000,00`)
  - [x] ASSERT the Requested Amount persists after **Save**
  - [x] ASSERT an over-limit loan purpose is rejected **visibly** — either an inline validation error or an error message — rather than closing the modal as if it succeeded — *expected FAIL: BUG-LB-003, the modal closes silently and the purpose is discarded*

---

### TC-11 — Upload every required document on the Documents tab
- **Type:** Happy path
- **Depends on:** TC-02
- **Steps:**
  - NAVIGATE to an Opportunity in `DRAFT`
  - CLICK the **Documents** outer tab
  - WAIT for the document requirement tables to load
  - SNAPSHOT — confirm the document sections and their initial statuses
  - CLICK the **Business Plan** document row link
  - WAIT for the **Manage File Versions** modal to open
  - SNAPSHOT — confirm the modal names the current document and offers an upload control
  - CLICK the *(press to upload)* control and attach `test-data/pdf-test.pdf`
  - SNAPSHOT — confirm the attached file name is listed
  - CLICK **OK**
  - WAIT for the document row to refresh
  - SNAPSHOT — confirm the Business Plan row status
  - CLICK the **Bank Statements** document row link and attach `test-data/pdf-test.pdf`, then CLICK **OK**
  - CLICK the **Cash Flow Projections** document row link and attach `test-data/pdf-test.pdf`, then CLICK **OK**
  - SNAPSHOT — confirm all three uploaded rows
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **Application Documents** section is displayed with a Document / Status / Last Updated / Uploaded By column set
  - [x] ASSERT every document row starts at status **Not Uploaded**
  - [x] ASSERT the **Related Party Documents** section carries the extra **Document Owner** column
  - [x] ASSERT the document row link opens the **Manage File Versions** modal naming the selected document
  - [x] ASSERT the attached file name is listed in the modal before confirming
  - [x] ASSERT the **Business Plan** row status becomes **Uploaded** after **OK**
  - [x] ASSERT the uploaded row records today's date and the signed-in RM as **Uploaded By**
  - [x] ASSERT the **Bank Statements** and **Cash Flow Projections** rows also become **Uploaded**

---

### TC-12 — Document requirement sets differ by Application Type
- **Type:** Happy path — read-only verification
- **Depends on:** TC-01
- **Steps:**
  - NAVIGATE to a `PERSONAL` Opportunity and CLICK the **Documents** outer tab
  - SNAPSHOT — confirm the PERSONAL document sections
  - NAVIGATE to an `ENTITY` Opportunity and CLICK the **Documents** outer tab
  - SNAPSHOT — confirm the ENTITY document sections
- **Assertions:**
  - [x] ASSERT (BLOCKING) an **ENTITY** application shows the **Entity Documents** section
  - [x] ASSERT a **PERSONAL** application does **not** show the **Entity Documents** section
  - [x] ASSERT the PERSONAL *Application Documents* set includes **Proof of VAT / Income Tax Registration** and **ITC Report and Proof of Debt**
  - [x] ASSERT the ENTITY *Entity Documents* set includes **CIPC Search**, **Memorandum of Incorporation (CoR15 series)** and **Notice of Incorporation (CoR14.1)**
  - [x] ASSERT the PERSONAL *Main Applicant and Spouse Documents* set includes **SA ID / Temporary ID** and **Proof of Address (FICA)**
  - [x] ASSERT the ENTITY *Main Applicant and Spouse Documents* set includes **SA ID / PR Certificate for Directors / Shareholders**

---

### TC-13 — Initiate the loan application once capture is complete
- **Type:** Happy path — **currently blocked by BUG-LB-001**
- **Depends on:** TC-06, TC-10, TC-11
- **Steps:**
  - NAVIGATE to the fully populated Opportunity
  - SNAPSHOT — confirm Client Info, Loan Info and Documents are populated and the status is `DRAFT`
  - CLICK **Initiate Loan Application**
  - WAIT for the Opportunity header to refresh
  - SNAPSHOT — confirm the Opportunity status after initiation
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Opportunity leaves `DRAFT` after **Initiate Loan Application** — *expected FAIL: BUG-LB-001, the call returns HTTP 500 and the status stays `DRAFT`*
  - [x] ASSERT no unhandled server error (HTTP 5xx) is raised by the initiation call — *expected FAIL: BUG-LB-001*
  - [x] ASSERT an **Application Number** is allocated to the Opportunity

## Test Data Notes
- Party members created by this plan are suffixed `AutoQADirector` / `AutoQAShareholder` / `AutoQASignatory` with `@example.com` addresses and mobile numbers in the `08200003xx` range.
- **ID numbers must pass the Luhn check.** The plan uses `9207125001083`, `8503155400083` and `9001015800088`.
- The **Loan Purpose Amount** and **Requested Amount** are `ant-input-number` fields; assert the displayed thousands-formatted value (`R 500 000,00`, `1 500 000`) rather than raw digits.
- `test-data/pdf-test.pdf` stands in for every required document; the app accepts it for all document types recorded.
- TC-10 leaves an intentional over-limit attempt behind. Because BUG-LB-003 discards it silently, no cleanup is needed — but if the bug is fixed to *accept* over-limit values, that TC will need a cleanup step.
- One director (`Thandiwe AutoQADirector`, ID `9207125001083`, 60% ownership) and one uploaded **Business Plan** were created on `OPP-2026-001244` during recording.

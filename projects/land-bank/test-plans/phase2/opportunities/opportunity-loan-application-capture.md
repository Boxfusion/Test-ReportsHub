# Test Plan: P2-OPP-3.1 — Opportunity Loan Application Capture (Individual / Landbank Branch path)

> **Status:** Ready — structure confirmed live against Phase 2 (`OPP` id `44e9a263-0357-467a-92a9-3de727398288`, Account "Sanele Xulu"); selectors not yet recorded via `/CreateTest`
> **Owner:** QA
> **Last Updated:** 2026-08-25
> **Estimated Duration:** unverified

## Metadata
| Field | Value |
|-------|-------|
| App | Land Bank CRM (Admin Portal) — **Phase 2** |
| Environment | Phase2 (`PHASE2_APP_URL`, requires `TEST_ENV=phase2`) |
| Login As | RM role (`PHASE2_RM_USERNAME` / `PHASE2_RM_PASSWORD` in the gitignored `.env`) |
| Pages under test | Opportunities (`/dynamic/LandBank.Crm/LBOpportunity-table`), Opportunity details (`/dynamic/LandBank.Crm/LBOpportunity-details?id=`) |
| Embedded forms (confirmed live) | `LandBank.Crm/opportunity-loan-application v46` (Client Info / Loan Info / DE Scorecard / Pre-Onboarding Checklist), `LandBank.Crm/complete-pre-onboarding-checklist v6` |
| Upstream plan | [../leads/lead-to-opportunity-lifecycle.md](../leads/lead-to-opportunity-lifecycle.md) — TC-06 (Individual / Landbank Branch / Upload Consent = True) |
| Dev counterpart | [../../dev/opportunities/opportunity-loan-application-capture.md](../../dev/opportunities/opportunity-loan-application-capture.md) — OPP-3.1, covers PERSONAL + ENTITY across every lead-plan scenario (Dev's inner tabs are Client Info / Loan Info / **Farms**); this plan narrows scope to **one PERSONAL scenario** — Individual lead captured via **Landbank Branch** |
| Source recording | Scribe walkthrough — [*Creating and Processing a New Loan Lead*](https://scribehow.com/o/gfgv2johTcScLr2LqrgTxQ/viewer/Creating_and_Processing_a_New_Loan_Lead__t9gg08kUQeCnioP1ERM6Ag) (195 steps). Steps 42–176 map to this plan; the resulting live Opportunity was re-opened and read in full (2026-08-25) to resolve every field the recording only showed generically |
| DevOps context | [111967](https://dev.azure.com/boxfusion/LandBankCrm/_workitems/edit/111967) *Update Domain and endpoints to cater for new attributes* and [112009](https://dev.azure.com/boxfusion/LandBankCrm/_workitems/edit/112009) *Configure UI to show attributes and test Process* (both `Testing`, children of [109815](https://dev.azure.com/boxfusion/LandBankCrm/_workitems/edit/109815) *Update Land Bank Branch Signatory Consent content*) — confirms the expanded Individual Client Information field set below is an **intentional to-be change**, not a bug. Comment on 111967: *"update the forms as well for individual and entity"*. [101191](https://dev.azure.com/boxfusion/LandBankCrm/_workitems/edit/101191) *Document Requirements* is the to-be source for the per-client-type document checklist (confirmed to match this recording's PERSONAL document set) |

## Objective
> Validate that an RM can populate a converted **PERSONAL** Opportunity's loan application on Phase 2 — Client Info, Loan
> Info (Loan Programme / Sources Of Income / Loan Purpose / Exposure), and Documents — for an **Individual** lead
> captured via **Landbank Branch** with consent uploaded, then completed through to `Complete` status.

## Confirmed live: the Client Info tab (`Individual Client Information`)

Read in full from the completed Opportunity (`Application Type: Personal`, `Application Status: Complete`). The section
heading **matches Dev** (`Individual Client Information`) — **no discrepancy there**. The field *set* is materially
larger than Dev's documented 18 fields; every field below is confirmed by direct read, not inferred.

**Individual Information** (two-column layout):

| Field | Recorded value | In Dev's plan? |
|---|---|---|
| Individual Type | `Natural Person` | ❌ new |
| Business Partner Number | `09000` | ❌ new |
| Client Title | `Ms` | ✅ (Dev: Client Title) |
| Client Surname | `Xulu` | ✅ |
| Gender | `Female` | ❌ new |
| Country Of Residence | `South Africa` | ✅ (shared field) |
| Citizenship | `South Africa` | ✅ (shared field) |
| ITCStatus | `Positive` | ❌ new |
| Existing Relationship | `Existing Client` | ❌ new |
| *Is the applicant currently under debt review or applied for debt review?* | `Yes` | ❌ new |
| *Is the applicant a Domestic Prominent Influential Person ("DPIP") or a Foreign Prominent Public Official ("FPPO")?* | `No` | ❌ new |
| Does the client have a surety? | (unticked) | ✅ (Dev: `hasSurety`, shared field) |
| Does the client have a co-applicant? | (unticked) | ✅ (Dev: `hasCoApplicant`, shared field) |
| Application Status | `Complete` | — (read-only header field) |
| Client ID Number | `0306180580087` | ✅ (Dev: Client ID Number) |
| Client Name | `Sanele` | ✅ (Dev: Client Name) |
| Race | `African` | ❌ new |
| Persons with Disability | `No` | ❌ new |
| Country Of Origin | `South Africa` | ✅ |
| Client Classification | `Development` | ✅ (shared field, but this recording's value — `Development` — is not one Dev's example values (`Commercial`) suggested; **Client Classification's option set differs from what Dev's example implied**) |
| National Credit Act (NCA) Client? | `Yes, NCA client` | ❌ new |
| *Is the applicant a Full Time Farmer, Part Time Farmer or new farming?* | `Full-Time Farmer` | ❌ new |
| *Has the applicant ever been declared insolvent?* | `No` | ❌ new |
| Has Surety | (unticked) | — (appears to duplicate "Does the client have a surety?") |
| Marital Status | `Single` | ✅ (Dev: Marital Status) |

**Producer Profile** (❌ entirely new section, not in Dev's PERSONAL field list at all):

| Field | Recorded value |
|---|---|
| Industry/Sector | `Soft Citrus` |
| Producer Categorisation | `Small Scale Producer` |

**Fiscal Data** (❌ new section):

| Field | Recorded value |
|---|---|
| Income Tax Number | `4000000000` |

**Contact Details:**

| Field | Recorded value | Note |
|---|---|---|
| Address | `62 ELLIS STREET SHERWOOD GARDENS BRAKPAN 1541` | ⚠️ **not typed during this recording** — the recording only shows two generic `test`/`test` text entries at this point in the sequence, which resolved instead to *Reason for Application* and *Business Background* (see Background, below). This Address, and the Email Address below, must have come from somewhere other than direct typing — see Key Difference #1 |
| Region | `Central Region` | derived from Province (Gauteng), same mechanic as Dev |
| Email Address | `sanele.xulu@boxfusion.io` | ⚠️ **differs from the email typed at the lead-capture stage** (`autoqap2.indivbranch.consentyes@example.com`, per the upstream lead plan's TC-06 steps) |
| Province | `Gauteng` | ✅ confirmed, matches the lead |
| Provincial Office | `Douglas` | ❌ new field (this is what the Scribe recording's ambiguous "search field → Douglas" step resolved to — **not** a general town/city field, a specific **Provincial Office** picker) |
| Mobile Number | `0900000000` | ✅ matches the lead |

**Preferred Method of Correspondence:**

| Field | Recorded value |
|---|---|
| Correspondence Language | `isiZulu` |
| Preferred Communication | `Email` |

**Main Applicant Consent** (❌ table not documented anywhere in the Dev plan — a Phase 2 addition to the Opportunity's Client Info tab):

| Status | Applicant First Name | Applicant Last Name | Form Of Approval | Date Signed |
|---|---|---|---|---|
| `Completed Manually` | `Sanele` | `Xulu` | `Manual` | *(blank)* |

This is the **upfront Landbank Branch consent captured at lead capture**, now surfaced read-only on the Opportunity —
confirms the same upfront-consent mechanic the Dev workflow plan documents, but Phase 2 additionally **mirrors it onto
the Opportunity's Client Info tab**, which Dev's Opportunity plan does not describe.

**Background** (❌ new section):

| Field | Recorded value |
|---|---|
| Reason for Application | `test` |
| Business Background | `test` |

### Key Difference #1 — a duplicate/account-match, not a genuine capture gap

The Address and Email Address values above **do not match anything typed during the recording** (the lead was captured
with a fictitious `autoqap2.indivbranch...@example.com` email, and no address was ever typed at the Opportunity stage —
only two `test` fields, which resolved to different fields entirely). The Opportunity's linked **Account** is named
`Sanele Xulu` and links to `/dynamic/LandBank.Crm/LBAccount-details?id=1dba6b32-defe-42d5-bdf2-3a9fabb74535` — the
signed-in RM's own name. **Working conclusion: Phase 2 matched this lead to a pre-existing Account (by name and/or
mobile number `0900000000`, which is shared across several of today's test leads) and pulled that Account's Address and
Email Address onto the Opportunity**, overriding what was captured at lead stage. This is a materially different
behaviour from Dev, which documents no such account-matching step. **Flag to the team:** confirm whether this is
intended CRM deduplication behaviour or an unintended cross-contamination risk when multiple test leads share a mobile
number — worth raising given `0900000000` is reused across this session's several other test leads (see the lead plan's
Leads-grid observations).

## Confirmed live: the Loan Info tab

**Loan Information:**

| Field | Recorded value |
|---|---|
| Loan Programmes | `Land Bank Loan` |
| Total loan Amount | `R 70,000` *(computed from the Loan Purpose row, not typed directly)* |
| Total Insurance | `0` |
| Sources Of Income | `Salary, Farming income` (multi-select) |
| Drought Relief Funding? | `Yes` |
| Is >80% of income from farming? | `Yes` |
| Applicable Grant to Loan Ratio | `0:100` |
| **Initiation Fees** | a **radio choice** between *"The initiation fees will be paid on approval and acceptance of loan."* (selected) and *"The initiation fees must be included in the Principal Debt for repayment over the period of the credit agreement."* — ❌ **not documented anywhere in the Dev plan** |

### Key Difference #2 — Loan Purpose is an inline-editable grid row, not Dev's 3-field modal

Dev's plan documents **Add Loan Purpose(s)** as a modal with exactly three fields (`purpose`, `otherPurposeDescription`,
`amount`). On Phase 2, confirmed live, the same action adds a row directly into a **7-column table**:

| Loan Purpose | Product Group | Loan Product | Term (Yrs) | Loan Amount | Own Contribution | Other Purpose Description |
|---|---|---|---|---|---|---|
| `Debt financing` | `Mortgage Finance` | `Mortgage Loan` | `7` | `70000` | `8000` | `test` |

The heading above the table reads **"LandBank Loan"** (echoing the selected Loan Programme), and a guidance alert states
*"Please Note: At least one loan purpose is required. The total amount across all loan purposes cannot exceed the
requested amount."* — the same rule Dev documents (and the same rule Dev's BUG-LB-003 found unenforced; **not
re-verified here**, since this recording's single Loan Purpose stayed within the Loan Amount). The **Subtotal** row sums
to `R 70,000.00`, confirming the "Loan Amount" column, not "Own Contribution", drives the total.

**Field mapping from the raw Scribe recording, now resolved:**
- "Select field → `Mortgage Finance`" = **Product Group**
- "Select field → `Mortgage Loan`" = **Loan Product**
- "Type `7`" = **Term (Yrs)**
- "Select field → `Debt financing`" = **Loan Purpose** (the actual purpose value — **not** one of Dev's ten documented options, e.g. `Improvements To Farming Property` — confirming Phase 2's Purpose reference list differs from Dev's)
- "Type `70000 [Tab] 8000 [Tab] test [Tab] [Tab] [Enter]`" = **Loan Amount, Own Contribution, Other Purpose Description**, entered by tabbing across the inline row

### Key Difference #3 — Exposure tables (❌ entirely new, not in Dev's Loan Info at all)

Two further tables, **Land Bank Exposure** and **Other Financiers**, each with columns **Product, Purpose, Existing
Grant (50%), Existing Exposure, Interest Rate, Term End**, editable inline via a `+`/`×` row-add control:

| Table | Product | Purpose | Existing Grant (50%) | Existing Exposure | Interest Rate | Term End |
|---|---|---|---|---|---|---|
| Land Bank Exposure | `test` | `test` | `40000` | `30000` | `3` | `31/08/2026` |
| Other Financiers | `test2` | `test2` | `500000` | `40000` | `3` | `31/08/2026` |

Each table shows running totals ("Total Existing Grant:", "Total Existing Exposure:"). This entire section is absent
from the Dev plan's documented Loan Info structure — flag to the team as either a Phase 2 addition worth documenting
upstream too, or confirm it already exists on Dev and was simply missed when that plan was authored.

## Confirmed live: the Documents tab — matches Dev exactly

The 10 **Application Documents** + 4 **Main Applicant and Spouse Documents** rows, all `Uploaded` by `Fatima Abrahams`
on `25/08/2026`:

**Application Documents (10):** Cash Flow Projections, Consent, Proof of VAT / Income Tax Registration, Business Plan,
Deeds Office Search, ITC Report and Proof of Debt, Offtake Agreement, Water Rights Certificate / Proof of Application,
Funding Request Documentation, Bank Statements.

**Main Applicant and Spouse Documents (4):** Proof of Address (FICA), Permanent Residency Certificate, SA ID /
Temporary ID, Lease Agreement / Permission to Occupy.

**This exactly matches the Dev plan's documented PERSONAL document sets, name for name.** No discrepancy — the
Scribe recording's 13 upload actions (of the 14 rows total) map cleanly onto this list; ⚠️ confirm whether a 14th row
(not caught by this read, since the panel may have had a third **Related Party Documents** section) was also uploaded,
or deliberately left for a later stage.

## Confirmed live: `Pre-Onboarding Checklist` is a fourth inner tab on the Opportunity itself

Dev's plan treats **Complete Onboarding Checklist** purely as an Inbox workflow step (form
`complete-pre-onboarding-checklist v16`). On Phase 2, the same form (**v6**) is **also embedded as a fourth read-only
tab directly on the Opportunity**, alongside Client Info / Loan Info / **DE Scorecard** (replacing Dev's **Farms** tab —
❌ confirm whether DE Scorecard is a rename or a genuinely different feature; not explored in this pass). All fields on
this tab were rendered **disabled** — read-only mirror of whatever was submitted via the Inbox workflow step (see the
paired [workflow plan](../workflow/loan-application-workflow-stages.md)).

Confirmed field set (9 visible — the tenth, conditional field stayed hidden since its parent was unticked):

| Field | Recorded value |
|---|---|
| **Years Of Farming Experience** | **`Up to 2 Years`** — ❌ **a bucketed select, not Dev's typed number field.** This is the single most load-bearing confirmed difference in this plan: any spec written against Dev's mechanics (`fill('12')`) will not work here. |
| Does this operation require Water Use Rights? | unticked |
| Business Plan Development Support required? | **ticked** |
| Is there access to working Equipment and Mechanization? | unticked |
| Does the client have a Valid Tax Clearance certificate? | unticked |
| Does the client have access to established markets? | unticked |
| Formal Financial Records or Statements maintained? | unticked |
| Does the client have an actively engaged Mentor? | unticked |
| Is the client Compliant with all applicable Labor Laws? | unticked |

The tenth field, *Support with applying for water rights required?*, stayed hidden — consistent with Dev's documented
conditional (only reveals once *Does this operation require Water Use Rights?* is ticked).

## Preconditions
- [ ] App is reachable at the Phase 2 URL (`PHASE2_APP_URL`), `TEST_ENV=phase2`
- [ ] Valid RM credentials are present in `.env` (`PHASE2_RM_USERNAME` / `PHASE2_RM_PASSWORD`)
- [ ] A PERSONAL Opportunity in `DRAFT`, converted from an Individual / Landbank Branch / Upload Consent = True lead, exists (produced by [../leads/lead-to-opportunity-lifecycle.md](../leads/lead-to-opportunity-lifecycle.md) TC-06)
- [ ] `test-data/pdf-test.pdf` exists at the hub root (stand-in document for every upload)

## Test Cases

### TC-01 — Log in as an RM and open the converted Opportunity
- **Type:** Happy path
- **Steps:**
  - NAVIGATE to `/login`
  - TYPE the Username field with the Phase 2 RM username (from `.env`)
  - TYPE the Password field with the Phase 2 RM password (from `.env`)
  - CLICK **Sign In**
  - WAIT for the app to redirect away from `/login`
  - NAVIGATE to the Opportunity converted from the Individual / Landbank Branch / Upload Consent = True lead
- **Assertions:**
  - [x] ASSERT (BLOCKING) the URL is the Opportunity details route (`/dynamic/LandBank.Crm/LBOpportunity-details?id=`)
  - [x] ASSERT the Opportunity **Application Type** is `Personal`
  - [x] ASSERT the inner tabs read **Client Info**, **Loan Info**, **DE Scorecard**, **Pre-Onboarding Checklist** — *note: Dev's third tab is named **Farms**, not **DE Scorecard**; confirm whether this is a rename or a different feature*

---

### TC-02 — Populate the Client Info tab
- **Type:** Happy path
- **Depends on:** TC-01
- **Steps:**
  - CLICK the **Client Info** inner tab
  - CLICK **Edit**
  - SELECT Individual Type — choose `Natural Person`
  - TYPE the Business Partner Number field with `09000`
  - SELECT Gender — choose `Female`
  - SELECT ITCStatus — choose `Positive`
  - SELECT Existing Relationship — choose `Existing Client`
  - SELECT the debt-review declaration — choose `Yes`
  - SELECT the DPIP/FPPO declaration — choose `No`
  - SELECT Race — choose `African`
  - SELECT Persons with Disability — choose `No`
  - SELECT Client Classification — choose `Development`
  - SELECT National Credit Act (NCA) Client? — choose `Yes, NCA client`
  - SELECT the Full-Time/Part-Time Farmer declaration — choose `Full-Time Farmer`
  - SELECT the insolvency declaration — choose `No`
  - SELECT Industry/Sector (Producer Profile) — choose `Soft Citrus`
  - SELECT Producer Categorisation — choose `Small Scale Producer`
  - TYPE the Income Tax Number field (Fiscal Data) with `4000000000`
  - SELECT Provincial Office — choose `Douglas`
  - SELECT Correspondence Language — choose `isiZulu`
  - TYPE the Reason for Application field (Background) with a test value
  - TYPE the Business Background field with a test value
  - CLICK **Save**
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Client Info section heading is **Individual Client Information**, matching Dev
  - [x] ASSERT the fields confirmed above (Individual Type, Gender, ITCStatus, Existing Relationship, Race, Persons with Disability, National Credit Act (NCA) Client?, the Full-Time Farmer declaration, Producer Profile, Fiscal Data, Provincial Office, Correspondence Language, Background) are present — *this is a materially larger field set than the Dev plan's 18-field PERSONAL variant; update the Dev plan's "Form variant differences" table once this is confirmed as intentional (see DevOps 111967/112009)*
  - [x] ASSERT a **Main Applicant Consent** table is displayed, reflecting the upfront Landbank Branch consent captured at lead stage — *not documented in the Dev Opportunity plan*
  - [x] ASSERT (BLOCKING) the captured values persist after **Save**
  - [x] ASSERT whether Address and Email Address are pre-filled from a matched Account rather than requiring manual entry — *if confirmed, this is the account-matching behaviour in Key Difference #1 and should be raised with the team as either intended or a data-integrity risk*

---

### TC-03 — Populate the Loan Info tab: Loan Programme, Sources Of Income, Loan Purpose, and Exposure
- **Type:** Happy path
- **Depends on:** TC-01
- **Steps:**
  - CLICK the **Loan Info** inner tab
  - CLICK **Edit**
  - SELECT Loan Programmes — choose `Land Bank Loan`
  - SELECT Sources Of Income — choose `Salary` and `Farming income`
  - SELECT Drought Relief Funding? — choose `Yes`
  - SELECT Is >80% of income from farming? — choose `Yes`
  - CLICK the Initiation Fees radio option *"The initiation fees will be paid on approval and acceptance of loan."*
  - CLICK **Save**
  - CLICK **Add Loan Purpose**
  - SELECT Product Group — choose `Mortgage Finance`
  - SELECT Loan Product — choose `Mortgage Loan`
  - TYPE the Term (Yrs) field with `7`
  - SELECT Loan Purpose — choose `Debt financing`
  - TYPE the Loan Amount field with `70000`
  - TYPE the Own Contribution field with `8000`
  - TYPE the Other Purpose Description field with a test value
  - CLICK the row-add control to commit the Loan Purpose row
  - CLICK the Land Bank Exposure `+` control and TYPE Product / Purpose / Existing Grant / Existing Exposure / Interest Rate / SELECT Term End
  - CLICK the Other Financiers `+` control and repeat with a second set of values
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **Products** field (Loan Programmes) accepts `Land Bank Loan`
  - [x] ASSERT the **Sources Of Income** multi-select accepts both `Salary` and `Farming income`
  - [x] ASSERT the Initiation Fees radio group offers exactly the two options recorded above — *not documented in the Dev plan; confirm whether Dev has an equivalent field*
  - [x] ASSERT (BLOCKING) **Add Loan Purpose** adds an inline-editable row to a 7-column table (**Loan Purpose, Product Group, Loan Product, Term (Yrs), Loan Amount, Own Contribution, Other Purpose Description**), not a modal — *a confirmed structural difference from Dev; the Dev plan's TC-10 and its `application-loan-purpose-create v3` modal reference need updating if this holds on Dev too, or flagging as Phase-2-only*
  - [x] ASSERT the Loan Purpose reflist accepts `Debt financing` — *not one of Dev's ten documented Purpose options; flag to the team whether the reference list has been intentionally extended*
  - [x] ASSERT the guidance text *"At least one loan purpose is required. The total amount across all loan purposes cannot exceed the requested amount."* is displayed, matching Dev's documented rule
  - [x] ASSERT the Subtotal reflects the sum of Loan Amount values, not Own Contribution
  - [x] ASSERT (BLOCKING) the **Land Bank Exposure** and **Other Financiers** tables accept rows with Product / Purpose / Existing Grant (50%) / Existing Exposure / Interest Rate / Term End — *entirely absent from the Dev plan; confirm whether Dev has this too*

---

### TC-04 — Upload the required documents
- **Type:** Happy path
- **Depends on:** TC-01
- **Steps:**
  - CLICK the **Documents** outer tab
  - CLICK each of the 10 **Application Documents** rows in turn (Cash Flow Projections, Consent, Proof of VAT / Income Tax Registration, Business Plan, Deeds Office Search, ITC Report and Proof of Debt, Offtake Agreement, Water Rights Certificate / Proof of Application, Funding Request Documentation, Bank Statements), attach `test-data/pdf-test.pdf`, click **OK** for each
  - CLICK each of the 4 **Main Applicant and Spouse Documents** rows (Proof of Address (FICA), Permanent Residency Certificate, SA ID / Temporary ID, Lease Agreement / Permission to Occupy), attach `test-data/pdf-test.pdf`, click **OK** for each
- **Assertions:**
  - [x] ASSERT (BLOCKING) the **Application Documents (10)** and **Main Applicant and Spouse Documents (4)** sections list exactly the names above, **identical to Dev's PERSONAL document set** — no discrepancy found here
  - [x] ASSERT every row starts at status **Not Uploaded**
  - [x] ASSERT each row becomes **Uploaded** after its **OK**, recording today's date and the signed-in RM as **Uploaded By**

---

### TC-05 — Confirm the Pre-Onboarding Checklist mirror on the Opportunity is read-only and reflects the Inbox submission
- **Type:** Happy path — read-only verification
- **Depends on:** [../workflow/loan-application-workflow-stages.md](../workflow/loan-application-workflow-stages.md) TC-04
- **Steps:**
  - CLICK the **Pre-Onboarding Checklist** inner tab
- **Assertions:**
  - [x] ASSERT (BLOCKING) all nine visible fields are **disabled** (read-only)
  - [x] ASSERT **Years Of Farming Experience** renders as a select with a bucketed value (e.g. `Up to 2 Years`), not a typed number
  - [x] ASSERT the field values match whatever was submitted via the Inbox workflow step in the paired workflow plan
  - [x] ASSERT the tenth, conditional field (*Support with applying for water rights required?*) stays hidden while its parent is unticked

## Test Data Notes
- This plan covers **only** the Individual / Landbank Branch scenario. The Dev plan's PERSONAL-via-Online-Digital-Channel and ENTITY scenarios are not re-derived here.
- **Account-matching risk:** every `AutoQAP2`/test lead captured today shares similar mobile-number ranges; this recording's lead used `0900000000`, which is also used by at least one other test Close Corporation lead in the grid. If Phase 2 does perform account-matching by mobile number (Key Difference #1), running this plan repeatedly against the same test mobile number risks silently reusing/overwriting a prior test Account's Address and Email. Consider using a mobile number unique to this plan's run.
- `test-data/pdf-test.pdf` stands in for every document upload.
- **Next step before this plan can run as an automated spec:** use `/CreateTest` (or a manual Playwright MCP recording pass) against a live Phase 2 PERSONAL Opportunity to resolve each field's real `label[for]` / accessible name (the field *identities* and *values* in this plan are now confirmed by direct read; only the underlying selectors remain to be recorded), then author the paired `.spec.ts`.

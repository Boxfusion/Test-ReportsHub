# Test Plan: ECDEDEA-TP — EC DEDEA Bid Management (Tender Process)

> **Status:** Ready — 16/16 green on both variants (90/10 and 80/20) via `run-plan.js`, 2026-07-27
> **Owner:** QA
> **Last Updated:** 2026-07-27
> **Estimated Duration:** 1200s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://ecdedea-smartgov2-adminportal-qa.shesha.app/login |
| Environment | QA |
| Login As | Maanda-awe / 123qwe |
| ADO Plan | *(none — the PD-SupplyChainManagement plans #57472 / #57473 describe the PD build and are stale for EC DEDEA; this plan is recorded from the live app)* |
| Ported from | `projects/bid-management/test-plans/tender-process/bid-supply-chain-management.md` (PD build) |

## Objective
> Validate the end-to-end Bid Management (Tender Process) lifecycle on the **EC DEDEA SmartGov2** admin portal — from drafting a tender through review/approval/publication, supplier-response consolidation and compliance verification, BEC evaluation and calibration, BAC recommendation and approval, to appointment-letter upload and order capture (tender **Completed / Awarded**).

## Why this is a separate plan from the PD one
EC DEDEA is a **different client deployment on a different Shesha build** than PD Supply Chain Management. Verified deltas (live, 2026-07-27):

| # | Delta | PD build | EC DEDEA build |
|---|---|---|---|
| 1 | Stage-3 **Recommendation Status** of the rank-1 supplier | shows **"Not Recommended"** (inverted-flag defect) | shows **"Recommended"** — **fixed**; this plan asserts the correct behaviour as a regression guard |
| 2 | **Finalise Compliance** enablement | 5 checklist N/A + status + dialog confirm | *also* requires **every** document row's *Is Compliant?* checkbox ticked, incl. non-mandatory Cert / Test DOC rows |
| 3 | Mandatory response documents | RFQ Document, Test, TAX Clearance Cert | RFQ Document, TAX Clearance Cert |
| 4 | BEC evaluators | Nathi / Nelly / Thabitha | **Cedrick / BokangN / BonoloB** |
| 5 | Tender-creation entry point | Create New → Tender Process | same, but reached from **Workflows → My Items** |
| 6 | Step-1 **Supporting documents** | mandatory (gates Next) | **optional** — no asterisk; Next enables without it |
| 7 | Step-1 extra fields | — | adds **Is On Procurement Plan** + **Procurement plan** upload (both optional) |
| 8 | Grid icon buttons (add / edit / save) | expose accessible names | **no accessible name** — must be targeted by icon class |

## Recording notes (live, 2026-07-27, REF2026-2223)
Recorded by driving the chain end to end as each role. Findings that shaped the spec:

- **Grid icon buttons carry no accessible name** on this build. `getByRole('button', { name: 'edit' })` matches nothing — use `button:has(.anticon-edit)` / `.anticon-save` / `.anticon-plus-circle`. The inline add-row is `[role="row"].sha-new-row`.
- **Stale AntD dropdowns stay mounted** (hidden) in the DOM, so option lookups must be scoped to `.ant-select-dropdown:not(.ant-select-dropdown-hidden)`.
- **Grids reorder** after edits and uploads (the compliance document table and the responses table both did), so every row must be matched by its text, never by index.
- **The compliance dialog needs one real click per control.** Ticking its checkboxes in a batch leaves the DOM checked but the form model stale: Finalise then fails with *"A comment is required when the document is not marked as compliant"* and the dialog wedges — cancel and reopen to recover.
- **Inline row saves are asynchronous.** One Specific-Goal-Points save hung for ~2 minutes (`PUT RfxResponse/Crud/Update` never returned) and the app dropped to "Initializing…"; the value did not persist and the row had to be re-edited after the environment recovered. The spec therefore waits on the saved *value*, not on the spinner, with a 60s budget.
- **The sidebar accordion collapses under automation** — every page is reached by URL.
- **Duplicate-supplier dropdown defect is present here too:** after A & A Stationers was captured it was still offered in the Add-Response supplier list (same defect class as PD REF2026-1172). Not asserted in the happy path.
- The tender auto-opens the next same-user action after Publish→Consolidate→Verify Compliance→Goal Points and Attendance→Monitor Progress, so those stages arrive on a new `todoid` rather than via the Inbox.

## Preconditions
- [ ] App is reachable at https://ecdedea-smartgov2-adminportal-qa.shesha.app/
- [ ] All workflow users exist and share password `123qwe` (see Roles)
- [ ] View mode is switched **Live → Latest** after login for every config-editing user
- [ ] Suppliers **A & A Stationers**, **Telkom** and **BOXFUSION** exist in the supplier master

## Roles
| Stage(s) | User |
|---|---|
| TC-01 Tender Initiation | Maanda-awe |
| TC-02 Review & Approve | MhlotiM |
| TC-03/04/05/06 Publish → Consolidate → Verify Compliance → Goal Points | TumisangM |
| TC-07/08/10/11/12 BEC chair & secretariat | ThabisoM |
| TC-09 Functionality scoring | Cedrick, BokangN, BonoloB |
| TC-13 Capture Outcome from BAC | MoshadiM |
| TC-14 Approve Recommendation from BAC | ThulileM |
| TC-15/16 Appointment Letter → Order Details | TumisangM |

## Test data
| Supplier | Price | Goal pts | Cedrick | BokangN | BonoloB | Expected rank |
|---|---|---|---|---|---|---|
| A & A Stationers | 100000 | 10 | 90 | 88 | 92 | **1 — Recommended → Awarded** |
| Telkom | 120000 | 8 | 75 | 78 | 70 | 2 |
| BOXFUSION | 150000 | 6 | 60 | 65 | 55 | 3 |

Single technical criterion **TEC-01** (Max 100, minimum score 60). Evaluation Criteria defaults to **90/10**; override per run with `EVAL_CRITERIA=80/20` (both splits verified live 2026-07-27 — REF2026-2200 and REF2026-2210).

## Test Cases

### TC-01 — Draft Tender
*Initiate a tender from My Items and populate all five wizard steps.*

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to `/login` and sign in as **Maanda-awe / 123qwe**
  2. SWITCH the header view-mode selector from Live to **Latest**
  3. CLICK Workflows → My Items
  4. ASSERT the My Items list shows Create New and Export
  5. CLICK **Create New → Tender Process**
  6. ASSERT (BLOCKING) Step 1 "Capture Tender Details" is displayed; CAPTURE the app-assigned **Ref No** (`REF2026-nnnn`) for every downstream stage
  7. CLICK the **EVAL_CRITERIA** radio (90/10 by default), then **Compulsory**, then **Hybrid** — radios first, they re-render the section
  8. TYPE Tender Name, Description, Meeting link, Briefing Session Venue, Contact person name, Telephone, Email
  9. PICK date **+ time** for Briefing Session Start Time, Bid publication Date and Bid closing Date (panel → hour → OK)
  10. ATTACH the mandatory Supporting Document
  11. CLICK Next → STEP 2 ATTACH the Bid document → Next
  12. STEP 3 (Response Documents, pre-populated) → Next
  13. STEP 4 ADD criterion **TEC-01 / Technical Capability / Max 100**, set Minimum score required **60** → Next
  14. STEP 5 CLICK Submit
- **Expected result:** The tender is submitted and appears in My Items.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Draft Tender wizard opens on Capture Tender Details
  - [x] ASSERT the app-assigned Ref No is captured
  - [x] ASSERT (BLOCKING) submit returns to the My Items list

---

### TC-02 — Review and Approve Tender Details
- **User:** MhlotiM
- **Steps:**
  1. SIGN IN as MhlotiM and OPEN the Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`)
  2. OPEN the target tender (match on the captured **Ref No**) at the **Review and Approve Tender Details** stage
  3. ASSERT (BLOCKING) the "Review and Approve Tender Details" page opens
  4. REVIEW the read-only Tender Details tab (Evaluation Criteria = EVAL_CRITERIA), then the Publication tab (Briefing Method Hybrid)
  5. CLICK **Approve**, then **Submit**
- **Expected result:** The tender is approved and advances to Publish Tender.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the item opens on the Review-and-Approve page
  - [x] ASSERT the read-only Evaluation Criteria matches EVAL_CRITERIA
  - [x] ASSERT (BLOCKING) the item leaves the Review-and-Approve inbox

---

### TC-03 — Publish Tender
- **User:** TumisangM
- **Steps:**
  1. SIGN IN as TumisangM and OPEN the Inbox
  2. OPEN the target tender at the **Publish Tender** stage
  3. SELECT publication method **Supplier Portal**
  4. CHECK the "I can confirm … publish the Tender" confirmation
  5. CLICK Submit
- **Expected result:** The tender becomes **Advertised** and advances to Consolidate Responses.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the item opens on the Publish Tender page
  - [x] ASSERT (BLOCKING) the tender publishes and advances out of the stage

---

### TC-04 — Consolidate Supplier Responses
- **User:** TumisangM
- **Note:** the app auto-opens this stage straight after TC-03's submit (same user).
- **Steps:**
  1. OPEN the target tender at the **Consolidate Responses** stage
  2. For each of **A & A Stationers (100000)**, **Telkom (120000)**, **BOXFUSION (150000)**: CLICK "Add New Response", select Supplier + Submission method, TYPE the Proposal Price, ATTACH a file for **RFQ Document** and **TAX Clearance Cert**, CLICK Submit on the dialog
  3. ASSERT the three responses appear in the Manual Responses table
  4. CHECK "…received and consolidated. Proceed for evaluation" and CLICK Submit
- **Expected result:** Three responses are captured and the tender advances to Verify Compliance.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Consolidate Responses page opens
  - [x] ASSERT three supplier responses are captured with their mandatory documents
  - [x] ASSERT (BLOCKING) consolidation submits and advances out of the stage

---

### TC-05 — Verify Compliance
- **User:** TumisangM
- **⚠ EC DEDEA delta:** "Finalise Compliance" stays **disabled** until **every** document row's *Is Compliant?* checkbox is ticked — including the non-mandatory Cert / Test DOC rows with no upload — on top of the 5 checklist N/A answers, Compliance status = Compliant and the dialog confirmation.
- **Steps:**
  1. OPEN the target tender at the **Verify Compliance** stage
  2. For each supplier response: CLICK the row edit icon → answer all Checklist items **N/A** → tick **every** document row's *Is Compliant?* → set Compliance status **Compliant** → tick the dialog confirmation → CLICK **Finalise Compliance**
  3. ASSERT every response shows **COMPLIANT**
  4. CHECK the page-level confirmation and CLICK Submit
- **Expected result:** All three responses are compliant and the tender advances to Calculate Specific Goal Points.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Verify Compliance page opens
  - [x] ASSERT Finalise Compliance only enables once every Is-Compliant checkbox is ticked
  - [x] ASSERT (BLOCKING) the review submits and advances out of the stage

---

### TC-06 — Calculate Specific Goal Points
- **User:** TumisangM
- **Steps:**
  1. OPEN the target tender at the **Calculate Specific Goal Points** stage
  2. Inline-edit each response and TYPE its goal points — A & A Stationers **10**, Telkom **8**, BOXFUSION **6** — then save the row
  3. UPLOAD the mandatory Calculation spreadsheet
  4. CHECK the confirmation and CLICK Submit
- **Expected result:** Each supplier carries a distinct goal-points score and the tender advances to Invite BEC members.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Calculate Specific Goal Points page opens
  - [x] ASSERT each response is given its goal-points score
  - [x] ASSERT (BLOCKING) the scoring submits and advances out of the stage

---

### TC-07 — Invite BEC Members
- **User:** ThabisoM
- **Steps:**
  1. OPEN the target tender at the **Invite BEC members** stage
  2. For each evaluator (**Cedrick**, **BokangN**, **BonoloB**): search the Name combobox, select the match (Job Title + Email auto-fill), CLICK plus-circle
  3. CAPTURE the Meeting date and time, Meeting Link and Venue
  4. CHECK the confirmation and CLICK Submit
- **Expected result:** Three evaluators are invited and the tender advances to Confirm Attendance & Open Evaluation.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Invite BEC members page opens
  - [x] ASSERT the three evaluators appear in the Attendees table
  - [x] ASSERT (BLOCKING) the invite submits and advances out of the stage

---

### TC-08 — Confirm Attendance & Open Evaluation
- **User:** ThabisoM
- **Steps:**
  1. OPEN the target tender at the **Confirm Attendance and Open Evaluation** stage
  2. For each invited evaluator: CLICK the row edit icon, CHECK "Is Present?", CLICK save
  3. CLICK **Open Evaluation**
- **Expected result:** All three evaluators are present and the tender advances to BEC: Monitor Evaluation Progress.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Confirm Attendance page opens
  - [x] ASSERT the three evaluators are marked present
  - [x] ASSERT (BLOCKING) Open Evaluation advances the tender out of the stage

---

### TC-09 — Capture Functionality Scores
- **Users:** Cedrick, BokangN, BonoloB
- **Note:** the collapsed sidebar's flyouts don't open under automation — reach the page by URL. Evaluate Tenders = `/dynamic/Shesha.SupplyChainManagement/tenders-to-evaluate`; the list search matches the **Ref No**, not the tender name.
- **Steps (per evaluator):**
  1. SIGN IN as the evaluator (clear storage → `/login`)
  2. NAVIGATE to tenders-to-evaluate, SEARCH the captured Ref No, OPEN the tender's Capture Functionality Scores page
  3. For each supplier: CLICK **Evaluate** → edit **TEC-01** → TYPE Point Awarded → save → **Finalise Score**
- **Expected result:** All three evaluators score all three suppliers; A & A Stationers averages highest (90).
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Capture Functionality Scores page lists the three suppliers
  - [x] ASSERT each supplier receives its distinct finalised score
  - [x] ASSERT all scores are above the minimum (60)

---

### TC-10 — BEC: Monitor Evaluation Progress → Begin Calibration
- **User:** ThabisoM
- **Steps:** OPEN the target tender at the **BEC: Monitor Evaluation Progress** stage, REVIEW the per-evaluator Evaluation Scores, CLICK **Begin Calibration**.
- **Expected result:** The tender advances to Monitor calibration and finalise scoring.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the page opens with the per-evaluator scores
  - [x] ASSERT (BLOCKING) Begin Calibration advances the tender

---

### TC-11 — Monitor Calibration and Finalise Scoring
- **User:** ThabisoM
- **Steps:** OPEN the target tender at the **Monitor calibration and finalise scoring** stage, ASSERT the Evaluator Scores averages (A & A **90**, Telkom **74.33**, BOXFUSION **60** — all Above Minimum), CLICK **Finalise Scoring**.
- **Expected result:** The tender advances to BEC: Finalise recommendation.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the calibration page opens with the aggregated averages
  - [x] ASSERT every supplier is flagged Above Minimum
  - [x] ASSERT (BLOCKING) Finalise Scoring advances the tender

---

### TC-12 — BEC: Finalise Recommendation
- **User:** ThabisoM
- **Steps:** OPEN the target tender at the **BEC: Finalise recommendation** stage, ASSERT the Final Evaluation ranks **A & A Stationers #1** and pre-selects it as Recommended Supplier, CLICK **Approve Recommendation**, FILL the required BEC Report, CLICK **Submit Recommendation**.
- **Expected result:** The tender advances to Capture outcome from the BAC.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Finalise-recommendation page opens
  - [x] ASSERT A & A Stationers ranks #1 and is the Recommended Supplier
  - [x] ASSERT (BLOCKING) Submit Recommendation advances the tender

---

### TC-13 — Capture Outcome from the BAC
- **User:** MoshadiM
- **⚠ EC DEDEA regression guard (delta vs PD):** in the Stage-3 table the rank-1 supplier **A & A Stationers must show Recommendation Status "Recommended"** (and the losers "Not Recommended"). On the PD build this flag is inverted; on EC DEDEA it is correct, so this plan asserts it — a failure here means the inverted-flag defect has reached this build.
- **Steps:** OPEN the target tender at the **Capture outcome from the BAC** stage, REVIEW the Stage 1/2/3 adjudication summaries, ASSERT the Stage-3 recommendation flags, CLICK **Approve Recommendation**, CLICK Submit.
- **Expected result:** The tender advances to Approve Recommendation from BAC.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Capture-outcome page opens with the three-stage summary
  - [x] ASSERT Stage 3 ranks A & A Stationers #1 and flags it **Recommended**
  - [x] ASSERT (BLOCKING) Approve Recommendation + Submit advances the tender

---

### TC-14 — Approve Recommendation from BAC
- **User:** ThulileM
- **Steps:** OPEN the target tender at the **Approve Recommendation from BAC** stage, ASSERT Stage 3 still flags A & A Stationers **Recommended**, TICK the approval confirmation, CLICK Submit.
- **Expected result:** The tender advances to Upload Appointment letter.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Approve-Recommendation page opens
  - [x] ASSERT the Stage-3 Recommended flag is still correct
  - [x] ASSERT (BLOCKING) confirmation + Submit advances the tender

---

### TC-15 — Upload Appointment Letter
- **User:** TumisangM
- **Steps:** OPEN the target tender at the **Upload Appointment letter** stage, UPLOAD the appointment letter, SELECT a Contract Management Unit Email, TICK the confirmation, CLICK Submit.
- **Expected result:** The tender status becomes **Awarded** and it advances to Capture Order Details.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Upload-Appointment-letter page opens
  - [x] ASSERT the uploaded letter surfaces and Submit enables once all three inputs are set
  - [x] ASSERT (BLOCKING) Submit awards the tender and advances it

---

### TC-16 — Capture Order Details
- **User:** TumisangM
- **Note:** the app auto-opens this stage straight after TC-15's submit.
- **Steps:** OPEN the target tender at the **Capture Order Details** stage, FILL Purchase Order No, PICK Purchase Order Date (date-only picker), FILL Purchase Order Amount **100000**, UPLOAD the Order Attachment, CLICK Submit.
- **Expected result:** The order is captured and the tender reaches **Completed** — it leaves the workflow entirely.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the Capture Order Details page opens (status Awarded)
  - [x] ASSERT Submit enables once all four fields are set
  - [x] ASSERT (BLOCKING) Submit completes the lifecycle and the item leaves the inbox

---

## Teardown
- Close the browser after the last test case.

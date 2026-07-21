# Test Plan: BID-SCM — BID: Supply Chain Management

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-06-02
> **Estimated Duration:** 900s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://linux-supplychainmanagement-adminportal-qa.azurewebsites.net/login |
| Environment | QA Site |
| Login As | Maanda-awe / 123qwe |
| ADO Plan | [#57472](https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_testPlans/execute?planId=57472&suiteId=57473) |
| ADO Suite | #57473 — BID: Supply Chain Management |

## Objective
> Validate the end-to-end Bid Management (tender) lifecycle in the Supply Chain Management admin portal — from authentication and drafting a tender, through review/approval/publication, supplier-response consolidation and compliance review, BEC evaluation and calibration, BAC recommendation and approval, to appointment-letter compilation and order capture.

## Preconditions
- [ ] App is reachable at https://linux-supplychainmanagement-adminportal-qa.azurewebsites.net/login
- [ ] Admin credentials are valid (Maanda-awe / 123qwe)
- [ ] The signed-in user has the SCM/Bid Management roles required to see the **Workflows** (Inbox / My Items) and **BID Management** menus
- [ ] For the review/evaluation cases (TC-02 onward) at least one tender work item exists in the user's **Inbox** in the matching workflow state
- [ ] For the evaluation case (TC-09) at least one tender is available under **BID Management → Evaluate Tenders**

> **Note on shared steps:** ADO shared step **#57498 ("Tabs")** — the read-only document-tab review (Tender details, Publication, Tender documents, Response Documents, Technical Evaluation Criteria, history & zip downloads) — is appended to every Inbox-review case below. It is represented in each such TC by a single condensed *"Review document tabs"* step + assertion to avoid repeating 10 identical download steps. Shared step **#57480 ("'Press to Upload' Documents")** has no defined steps in ADO and is omitted.

## Test Cases

### TC-01 — Draft Tender (ADO #57475)

*Initiate a new tender process from My Items, populate every step of the Draft Tender wizard (Tender Details, Tender Documents, Response Documents, Technical Evaluation) and submit it.*

> **Note (2026-06-03):** This case was updated against the live QA app. The original ADO steps only validated Step 1 field toggling and stopped at "Next"; the current form is a 5-step wizard that must be fully populated and submitted. Selections used: Evaluation Criteria **90/10**, Briefing Session Requirement **Compulsory**, Briefing Method **Hybrid**; the three date fields take a **date + time**; attachments come from the `test-data/` folder.

- **Type:** Happy path (end-to-end create + submit)
- **Steps:**
  1. NAVIGATE to the landing page (logged in as Maanda-awe)
  2. CLICK the header view-mode selector (shows "Live") and select **Latest** so the form renders its latest configured fields
  3. CLICK Workflows to expand it, then CLICK My Items
  4. ASSERT My Items list is shown with Create New and Export buttons
  5. CLICK Create New → CLICK Tender Process
  6. ASSERT (BLOCKING) the Draft tender page (Step 1: Capture Tender Details) is displayed
  7. TYPE the Tender Name and Description
  8. CLICK the **90/10** radio on Evaluation Criteria
  9. CLICK the **Compulsory** radio on Briefing Session Requirement (Start Time / Method / Venue become mandatory)
  10. CLICK the **Hybrid** radio on Briefing Method (Meeting link + Briefing Session Venue become mandatory)
  11. TYPE the Meeting link, Briefing Session Venue, Contact person name, Telephone and Email
  12. SELECT a **date + time** for Briefing Session Start Time, Bid publication Date and Bid closing Date (via the picker panel + OK)
  13. ATTACH the mandatory Supporting Document from `test-data/`
  14. ASSERT the Next button is enabled once all mandatory fields are populated; CLICK Next
  15. STEP 2 (Tender Documents): ATTACH the mandatory Bid document from `test-data/`; CLICK Next
  16. STEP 3 (Response Documents): the required-documents list is pre-populated; CLICK Next
  17. STEP 4 (Technical Evaluation): ADD one criterion (Ref No, Criteria, Description, Max Points) and set the Minimum score required; CLICK Next
  18. STEP 5 (Summary): CLICK Submit
  19. ASSERT the wizard submits and returns to the My Items workflow list
- **Expected result:** A user can open the Draft Tender wizard, populate all five steps and submit; the new tender appears in My Items with status **Submitted**.
- **Assertions:**
  - [x] ASSERT My Items list shows Create New and Export buttons
  - [x] ASSERT (BLOCKING) the Draft tender page (Step 1: Capture Tender Details) is displayed after clicking Tender Process
  - [x] ASSERT (BLOCKING) the tender submits and the app returns to the My Items list

---

### TC-02 — Review and Approve (ADO #57497)

*As the reviewer, open a submitted tender from the Inbox, review it on the Review and Approve page, approve it and submit (happy path).*

> **Note (2026-06-03):** Updated against the live QA app. Logged in as the **reviewer MhlotiM / 123qwe** (not the initiator) — the submitted tender lands in MhlotiM's Inbox at the "Review and Approve Tender Details" stage. Verified live against item **REF2026-1399** (a tender created by TC-01); approving it advanced it out of the inbox (item count 47 → 46). The View-in-PDF / Download-Batch download assertions from the original ADO steps are omitted from the happy path for now.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the login page and sign in as **MhlotiM / 123qwe** (view mode persists as Latest)
  2. CLICK Workflows to expand it, then CLICK Inbox
  3. ASSERT the Inbox ("Incoming Items") list and Export button are shown
  4. CLICK the magnifying-glass icon on the target submitted tender (a "TC-01 Automated Draft Tender" item at the Review and Approve stage)
  5. ASSERT (BLOCKING) the item opens on the "Review and Approve Tender Details" page
  6. REVIEW the read-only Tender Details tab (Tender Number, Name, Evaluation Criteria 90/10)
  7. CLICK the Publication tab and ASSERT the read-only publication details (e.g. Briefing Method Hybrid) are shown
  8. CLICK the Approve button
  9. ASSERT the Submit button becomes enabled
  10. CLICK Submit
  11. ASSERT the approval submits, the app returns to a workflow list and the item leaves the Review-and-Approve inbox
- **Expected result:** The reviewer can open a submitted tender, review its read-only tabs, approve it and submit; the item advances out of the Review-and-Approve inbox.
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "Review and Approve Tender Details" page
  - [x] ASSERT the Tender Details tab shows read-only details
  - [x] ASSERT (BLOCKING) the approval submits and the item leaves the inbox

---

### TC-03 — Publish Tender (ADO #57500)

*As the publisher, open an approved tender from the Inbox, review it on the Publish Tender page, select a publication method and submit to publish it (happy path).*

> **Note (2026-06-03):** Updated against the live QA app. Logged in as the **publisher TumisangM / 123qwe** — an approved tender lands in TumisangM's Inbox at the "Publish Tender" stage. Verified live against **REF2026-1399** (approved in TC-02): selecting a publication method, confirming and submitting set the tender to **Advertised** and advanced it to the Consolidate Responses stage. The View-in-PDF / Download-Batch download assertions from the original ADO steps are omitted from the happy path for now.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the login page and sign in as **TumisangM / 123qwe**
  2. CLICK Workflows to expand it, then CLICK Inbox
  3. ASSERT the Inbox ("Incoming Items") list and Export button are shown
  4. CLICK the magnifying-glass icon on the target approved tender (a "TC-01 Automated Draft Tender" item at the Publish Tender stage)
  5. ASSERT (BLOCKING) the item opens on the "Publish Tender" page
  6. REVIEW the read-only Tender Details (Tender Number, Evaluation Criteria 90/10). The Bid publication / closing dates are pre-filled from the draft.
  7. SELECT a Publication Method under "Where will you be publishing this Tender?" (e.g. Supplier Portal)
  8. CHECK the confirmation checkbox ("I can confirm ... I would like to publish the Tender")
  9. ASSERT the Submit button becomes enabled
  10. CLICK Submit
  11. ASSERT (BLOCKING) the tender is published — it becomes Advertised and advances to the Consolidate Responses stage (or returns to a workflow list)
- **Expected result:** The publisher can open an approved tender, select publication method(s), confirm and publish; the tender becomes Advertised and advances out of the Publish-Tender inbox.
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "Publish Tender" page
  - [x] ASSERT the Tender Details tab shows read-only details
  - [x] ASSERT (BLOCKING) the tender publishes and advances out of the inbox

---

### TC-04 — Consolidate Supplier Responses (ADO #57551)

*As the consolidator, open an advertised tender from the Inbox, capture multiple manual supplier responses (with the mandatory documents attached), confirm and submit for evaluation (happy path).*

> **Note (2026-06-03):** Updated against the live QA app. Logged in as **TumisangM / 123qwe** (who both publishes and consolidates). Verified live against **REF2026-1399** (advertised in TC-03): three manual responses were captured for three different suppliers (A & A Stationers, BOXFUSION, Telkom), each attaching a file for every mandatory response document (RFQ Document, Test, TAX Clearance Cert), then the consolidation was confirmed and submitted — the tender advanced to the **Review Compliance** stage. The View-in-PDF / Download-Batch download assertions are omitted from the happy path for now. **Implementation note:** the per-response document table reorders after each upload, so attachments must be targeted by their exact Document-Name, not by row position.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the login page and sign in as **TumisangM / 123qwe**
  2. CLICK Workflows to expand it, then CLICK Inbox
  3. ASSERT the Inbox ("Incoming Items") list and Export button are shown
  4. CLICK the magnifying-glass icon on the target advertised tender (a "TC-01 Automated Draft Tender" item at the Consolidate Responses stage)
  5. ASSERT (BLOCKING) the item opens on the "Consolidate Responses" page
  6. CLICK "Add New Response" and capture the **first** supplier (A & A Stationers): select the Supplier + Submission method, type a Proposal Price, attach a document for each mandatory response document (RFQ Document, Test, TAX Clearance Cert), and CLICK Submit on the dialog.
  7. REGRESSION CHECK (duplicate-supplier guard, **opt-in via `CHECK_SUPPLIER_DEDUPE=1`**, runs **after** all three suppliers are captured so it can't disrupt the add sequence): CLICK "Add New Response" again, open the Supplier dropdown, ASSERT a never-captured **control** supplier (Coca-cola) **is** listed (proves the dropdown rendered — so the check can't pass vacuously), then ASSERT a captured supplier (A & A Stationers) is **no longer listed**; CLOSE the dialog without adding. *(Off by default so it never destabilises the lifecycle chain. Guards the separate "system allows the same supplier to be added more than once" defect (REF2026-1172); see `test-reports/bugs/2026-06-04-bid-supply-chain-management-evaluate-duplicate-supplier.md`. NOTE: a DIFFERENT defect from the functionality-scores "one supplier ×N" duplication.)*
  8. Capture the remaining **two suppliers** (BOXFUSION, Telkom) the same way as step 6
  9. ASSERT the three supplier responses appear in the Manual Responses table
  10. CHECK the confirmation ("I confirm that the supplier responses have been received and consolidated. Proceed for evaluation")
  11. CLICK Submit
  12. ASSERT (BLOCKING) the consolidation submits and the tender advances to the Review Compliance stage
- **Expected result:** The consolidator can capture multiple supplier responses with their mandatory documents, confirm consolidation and submit; the tender advances to Review Compliance. A supplier already captured is not offered again in the Add-Response dropdown.
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "Consolidate Responses" page
  - [x] ASSERT three supplier responses are captured with their mandatory documents
  - [ ] ASSERT (non-blocking, regression) a captured supplier is excluded from the Add-Response Supplier dropdown — *currently FAILS: the dropdown still lists already-added suppliers (duplicate-supplier bug)*
  - [x] ASSERT (BLOCKING) consolidation submits and advances out of the Consolidate stage

---

### TC-05 — Review Compliance (ADO #57553)

*As the compliance reviewer, open a tender at the Verify-Compliance stage, assess each consolidated supplier response as compliant, confirm the review and submit (happy path).*

> **Note (2026-06-03):** Updated against the live QA app. Logged in as **TumisangM / 123qwe**. The Inbox action is labelled **"Verify Compliance"** and the page heading is **"Verify Compliance"**. Verified live against **REF2026-1399** (consolidated in TC-04): each of the three supplier responses (A & A Stationers, Telkom, BOXFUSION) was opened via its edit icon and marked **Compliant** — in the per-supplier dialog the five Checklist items are required (set to **N/A** for these JV/consortium items), then Compliance status = **Compliant** + the dialog confirmation enable **Finalise Compliance**. After all suppliers were finalised, the page-level confirmation was ticked and submitted, advancing the tender to the next evaluation stage. The View-in-PDF / Download-Batch download assertions are omitted from the happy path for now.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the login page and sign in as **TumisangM / 123qwe**
  2. CLICK Workflows to expand it, then CLICK Inbox
  3. ASSERT the Inbox ("Incoming Items") list and Export button are shown
  4. CLICK the magnifying-glass icon on the target tender at the **Verify Compliance** stage (a "TC-01 Automated Draft Tender" item)
  5. ASSERT (BLOCKING) the item opens on the "Verify Compliance" page
  6. For each consolidated supplier response:
     a. CLICK the edit icon on the response row
     b. In the Supplier compliance dialog, answer the Checklist items (N/A), set Compliance status = **Compliant** and tick the confirmation
     c. CLICK Finalise Compliance
  7. ASSERT every supplier response shows **COMPLIANT**
  8. CHECK the page-level confirmation ("I confirm that I have reviewed all the provided information ...")
  9. CLICK Submit
  10. ASSERT (BLOCKING) the compliance review submits and the tender advances out of the Verify Compliance stage
- **Expected result:** The reviewer can mark every supplier response compliant, confirm and submit; the tender advances to the next evaluation stage.
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "Verify Compliance" page
  - [x] ASSERT every supplier response is marked Compliant
  - [x] ASSERT (BLOCKING) the review submits and advances out of the Verify Compliance stage

---

### TC-06 — Capture Pricing and Specific Goals (ADO #60812)

*Open a tender at the Calculate-Specific-Goal-Points stage, capture a Specific Goal Points score for each supplier response, upload the calculation spreadsheet, confirm and submit (happy path).*

> **Note (2026-06-03):** Updated against the live QA app. Logged in as **TumisangM / 123qwe**. The Inbox action and page heading are **"Calculate Specific Goal Points"**. Verified live against **REF2026-1399**: each supplier response was given a **different** Specific Goal Points score via inline row-edit (A & A Stationers = 8, Telkom = 10, BOXFUSION = 6), the mandatory **Calculation spreadsheet** was uploaded, the confirmation was ticked and submitted — the tender advanced out of the stage. The View-in-PDF / Download-Batch download assertions are omitted from the happy path for now.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the login page and sign in as **TumisangM / 123qwe**
  2. CLICK Workflows to expand it, then CLICK Inbox
  3. ASSERT the Inbox ("Incoming Items") list and Export button are shown
  4. CLICK the magnifying-glass icon on the target tender at the **Calculate Specific Goal Points** stage (a "TC-01 Automated Draft Tender" item)
  5. ASSERT (BLOCKING) the item opens on the "Calculate Specific Goal Points" page
  6. For each supplier response in the table:
     a. CLICK the row edit icon
     b. TYPE a **Specific Goal Points** score (a different value per supplier) and an optional comment
     c. CLICK save on the row
  7. UPLOAD the mandatory Calculation spreadsheet
  8. CHECK the confirmation ("I confirm that I have reviewed all the provided information and captured the information accurately")
  9. CLICK Submit
  10. ASSERT (BLOCKING) the scoring submits and the tender advances out of the Calculate Specific Goal Points stage
- **Expected result:** The user can capture a different Specific Goal Points score for each supplier, upload the calculation spreadsheet, confirm and submit; the tender advances.
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "Calculate Specific Goal Points" page
  - [x] ASSERT each supplier response is given a Specific Goal Points score
  - [x] ASSERT (BLOCKING) the scoring submits and advances out of the stage

---

### TC-07 — Invite BEC Members (ADO #60813)

*As the BEC chair, open a tender at the Invite-BEC-members stage, capture the meeting details, invite the evaluators (BEC members), confirm and submit (happy path).*

> **Note (2026-06-03):** Updated against the live QA app. Logged in as **ThabisoM / 123qwe**. Verified live against **REF2026-1399**: the BEC meeting details (date+time, link, venue) were captured and three evaluators were invited by searching the Name dropdown — **Nathi → Nkosinathi Sibiya, Nelly → Nelly Tears, Thabitha → Thabitha Modula** (Job Title and Email auto-fill on select). After confirming, submission advanced the tender to the **Confirm Attendance & Open Evaluation** stage. The View-in-PDF / Download-Batch download assertions are omitted from the happy path for now.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the login page and sign in as **ThabisoM / 123qwe**
  2. CLICK Workflows to expand it, then CLICK Inbox
  3. ASSERT the Inbox ("Incoming Items") list and Export button are shown
  4. CLICK the magnifying-glass icon on the target tender at the **Invite BEC members** stage (a "TC-01 Automated Draft Tender" item)
  5. ASSERT (BLOCKING) the item opens on the "Invite BEC members" page
  6. CAPTURE the Meeting Details: Meeting date and time, Meeting Link, Venue
  7. For each evaluator (Nathi, Nelly, Thabitha): search the Name dropdown, select the matching user (Job Title + Email auto-fill), and CLICK the add (plus) button
  8. ASSERT the three evaluators appear in the Attendees/Evaluators table
  9. CHECK the confirmation ("I confirm that I have invited all the relevant attendees ...")
  10. CLICK Submit
  11. ASSERT (BLOCKING) the invite submits and the tender advances out of the Invite BEC members stage
- **Expected result:** The BEC chair can capture meeting details, invite multiple evaluators, confirm and submit; the tender advances to Confirm Attendance & Open Evaluation.
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "Invite BEC members" page
  - [x] ASSERT three evaluators are invited
  - [x] ASSERT (BLOCKING) the invite submits and advances out of the stage

---

### TC-08 — Confirm Attendance & Open Evaluation (ADO #60814)

*As the BEC chair, open a tender at the Confirm-Attendance stage, add a backup evaluator, mark the attending evaluators present, and open the evaluation (happy path).*

> **Note (2026-06-03):** Updated against the live QA app. Logged in as **ThabisoM / 123qwe**. Verified live against **REF2026-1399**: a backup evaluator (**Maand-awe Mamathuntsha**) was added (left not-present, as a stand-in if an evaluator is absent), the three invited evaluators (**Nelly Tears, Nkosinathi Sibiya, Thabitha Modula**) were marked **present** via each row's edit → "Is Present?" → save, and **Open Evaluation** advanced the tender to **BEC: Monitor Evaluation Progress**. Each row's "Is Present?" checkbox is read-only until the row is in edit mode. **Spec caveat:** the add-backup step reuses the same Shesha inline-grid add as TC-07, which is not yet green under automation — so the automated spec may be pending like TC-07.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the login page and sign in as **ThabisoM / 123qwe**
  2. CLICK Workflows to expand it, then CLICK Inbox
  3. ASSERT the Inbox ("Incoming Items") list and Export button are shown
  4. CLICK the magnifying-glass icon on the target tender at the **Confirm Attendance and Open Evaluation** stage (a "TC-01 Automated Draft Tender" item)
  5. ASSERT (BLOCKING) the item opens on the "Confirm Attendance and Open Evaluation" page
  6. ADD a backup evaluator via the Attendees/Evaluators add-row (e.g. Maand-awe Mamathuntsha), leaving "Is Present?" unchecked
  7. For each invited evaluator (Nkosinathi Sibiya, Nelly Tears, Thabitha Modula): CLICK the row edit icon, CHECK "Is Present?", and CLICK save
  8. ASSERT the three evaluators are marked present
  9. CLICK Open Evaluation
  10. ASSERT (BLOCKING) the evaluation opens and the tender advances to BEC: Monitor Evaluation Progress
- **Expected result:** The BEC chair can add a backup attendee, mark the attending evaluators present, and open the evaluation; the tender advances to BEC: Monitor Evaluation Progress.
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "Confirm Attendance and Open Evaluation" page
  - [x] ASSERT a backup is added and the three evaluators are marked present
  - [x] ASSERT (BLOCKING) Open Evaluation advances the tender out of the stage

---

### TC-09 — Capture Functionality Score (ADO #60821)

*Each BEC evaluator scores every supplier on the functionality criteria via Evaluate Tenders, giving distinct scores so a best supplier emerges.*

> **Note (2026-06-03):** Verified live against **REF2026-1399** by logging in as **each evaluator (Nathi, Nelly, Thabitha / 123qwe)** in turn and scoring all three suppliers. Distinct scores were given so **A & A Stationers** is the clear winner — Nathi: A&A 90 / Telkom 75 / BOXFUSION 60; Nelly: 88 / 78 / 65; Thabitha: 92 / 70 / 55 (criterion "Technical Capability", Max 100).
>
> **Navigation/automation notes (important):**
> - The collapsed Shesha sidebar's submenu flyouts **do not open under automation**; reach the page directly: **Evaluate Tenders** = `/dynamic/Shesha.SupplyChainManagement/tenders-to-evaluate`; each tender card links to `/dynamic/Shesha.SupplyChainManagement/tender-wf-capturefunctionalityscores?id=<tenderId>`.
> - Shesha **toolbar buttons** (Evaluate, the row edit/save pencils, Finalise Score, even Sign In) do **not** respond to Playwright's positional click — trigger them with a DOM click (`locator.evaluate(el => el.click())`). Plain inputs (the Point Awarded number) still need a real Playwright `fill` to register.
> - Switching evaluators: clear `localStorage`/`sessionStorage`, reload `/login`, sign in (DOM-click Sign In).

- **Type:** Happy path
- **Steps (repeat for each evaluator — Nathi, Nelly, Thabitha):**
  1. NAVIGATE to `/login` and sign in as the evaluator (123qwe)
  2. NAVIGATE to `tenders-to-evaluate`, open the target tender's **Capture Functionality Scores** page (REF2026-1399)
  3. ASSERT the **My Score** table lists the three suppliers, each with an **Evaluate** button
  4. For each supplier (A & A Stationers, Telkom, BOXFUSION):
     a. CLICK **Evaluate** → the **Tender Response Evaluation** dialog opens
     b. CLICK the criterion's **edit** pencil, TYPE the **Point Awarded** (a distinct score per supplier) and a comment, CLICK **save**
     c. CLICK **Finalise Score** — the supplier's row now shows the score and a **View** link
  5. ASSERT all three suppliers show their (distinct) finalised scores
- **Expected result:** Each evaluator can score every supplier on the functionality criteria; with distinct scores, the highest-scoring supplier (A & A Stationers) can be chosen.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the item opens on the "Capture Functionality Scores" page with the three suppliers
  - [x] ASSERT each supplier receives a distinct finalised score
  - [x] ASSERT the scores rank the suppliers so a best one emerges

---

### TC-10 — BEC Secretariat: Monitor Evaluation and Begin Calibration (ADO #60815)

*As the BEC Secretariat, open a tender at the BEC: Monitor Evaluation Progress stage, review the per-evaluator functionality scores, and click Begin Calibration to advance it to the calibration stage (happy path).*

> **Note (2026-06-04):** Updated against the live QA app. Logged in as **ThabisoM / 123qwe** (the original draft's "Maanda-awe" and the Export/View-in-PDF/Download-Batch steps were stale ADO steps). Verified live against **REF2026-1399** (functionality scoring completed in TC-09): the item sits in ThabisoM's Inbox with Action Required **"BEC: Monitor Evaluation Progress"**. Opening it (form `tender-wf-monitor-progress-and-begin-calibration`) shows the read-only review tabs plus an **Evalution Scores** summary listing each evaluator's score per supplier (A & A Stationers 92/90/88, Telkom 70/75/78, BOXFUSION 55/60/65 — matching TC-09). Clicking **Begin Calibration** advanced the tender to the **Monitor calibration and finalise scoring** stage (TC-11). The page's only actions are Close and Begin Calibration — there is no Export/PDF/Download on this happy path.
>
> **Navigation note:** the Inbox is at `/dynamic/Shesha.Workflow/workflows-inbox`; open the item by its magnifying-glass `workflow-action?id=...&todoid=...` link.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to `/login` and sign in as **ThabisoM** (123qwe)
  2. OPEN the Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`)
  3. ASSERT the target tender row is shown with Action Required **"BEC: Monitor Evaluation Progress"**
  4. CLICK the magnifying-glass icon on the target tender (a "TC-01 Automated Draft Tender" item at the BEC: Monitor Evaluation Progress stage)
  5. ASSERT the item opens on the "BEC: Monitor Evaluation Progress" page (form `tender-wf-monitor-progress-and-begin-calibration`)
  6. ASSERT the Tender Details tab shows read-only details and the Evalution Scores table lists each evaluator's score per supplier
  7. CLICK **Begin Calibration**
  8. ASSERT (BLOCKING) the tender advances out of the stage to the Monitor calibration and finalise scoring stage
- **Expected result:** The BEC Secretariat can review the captured evaluation scores and begin calibration; the tender advances to the Monitor Calibration & Finalise Scoring stage.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the item opens on the "BEC: Monitor Evaluation Progress" page with the per-evaluator scores
  - [x] ASSERT the Tender Details tab shows read-only details
  - [x] ASSERT (BLOCKING) Begin Calibration advances the tender out of the stage

---

### TC-11 — BEC Secretariat: Monitor Calibration and Finalise Scoring (ADO #60822)

*As the BEC Secretariat, open a tender at the Monitor-calibration stage from the Inbox, review the aggregated evaluator scores, and Finalise Scoring to advance it (happy path).*

> **Note (2026-06-04):** Updated against the live QA app. Logged in as **ThabisoM / 123qwe** (the original draft's "Maanda-awe" login and the Export-to-Excel / View-in-PDF / Download-Batch steps were stale ADO steps). Verified live against **REF2026-1399** (advanced here by TC-10): the item sits in ThabisoM's Inbox with Action Required **"Monitor calibration and finalise scoring"**. Opening it (form `tender-wf-calibratescores`) shows the read-only review tabs (Tender Details, Publication, Tender Documents, Response Documents, Technical Evaluation Criteria, Responses) plus an **Evaluator Scores** summary that aggregates the TC-09 functionality scores and computes a per-supplier Average + Above-Minimum flag (A & A Stationers 92/90/88 → avg 90, Telkom 70/75/78 → avg 74.33, BOXFUSION 55/60/65 → avg 60 — all Above Minimum). The page's only actions are Close, Send Back and **Finalise Scoring** — there is no Export/PDF/Download on this happy path. Clicking **Finalise Scoring** advanced the tender to the **BEC: Finalise recommendation** stage (TC-12).

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to `/login` and sign in as **ThabisoM** (123qwe)
  2. OPEN the Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`)
  3. ASSERT the Inbox list and Export button are shown
  4. ASSERT the target tender row is shown with Action Required **"Monitor calibration and finalise scoring"**
  5. CLICK the magnifying-glass icon on the target tender (a "TC-01 Automated Draft Tender" item at the Monitor-calibration stage)
  6. ASSERT the item opens on the "Monitor calibration and finalise scoring" page (form `tender-wf-calibratescores`)
  7. CLICK through the read-only tabs (Tender Details, Publication, Responses)
  8. ASSERT the Tender Details tab shows read-only details and the Evaluator Scores table lists each evaluator's score per supplier with an Average and Above-Minimum flag
  9. CLICK **Finalise Scoring**
  10. ASSERT (BLOCKING) the tender advances out of the stage to **BEC: Finalise recommendation**
- **Expected result:** The BEC Secretariat can review the aggregated evaluator scores on the monitor-calibration page and finalise scoring; the tender advances to the BEC: Finalise recommendation stage.
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "Monitor calibration and finalise scoring" page with the aggregated Evaluator Scores
  - [x] ASSERT the Tender details tab shows read-only details
  - [x] ASSERT (BLOCKING) Finalise Scoring advances the tender to BEC: Finalise recommendation

---

### TC-12 — BEC: Finalise Recommendation (ADO #60835)

*As the BEC, open a tender at the BEC: Finalise recommendation stage, review the consolidated evaluation/ranking, approve the recommended (top-ranked) supplier, capture the BEC report, and submit the recommendation (happy path).*

> **Note (2026-06-04):** Updated against the live QA app. Logged in as **ThabisoM / 123qwe** (the original draft's "Maanda-awe" login was stale; the ADO Export-to-Excel step is also stale, though View-in-PDF / Download-Batch buttons **do** exist on this page). Verified live against **REF2026-1399** (advanced here by TC-11's Finalise Scoring): the item sits in ThabisoM's Inbox with Action Required **"BEC: Finalise recommendation"**. Opening it (form `tender-wf-finaliserecommendation-details`) shows the read-only review tabs, an **Evaluator Scores** summary, a **Final Evaluation** table that combines pricing + specific-goal points into an Overall Score and Ranking (A & A Stationers 98 → **Rank 1**, Telkom 92 → Rank 2, BOXFUSION 81 → Rank 3), and a **BEC Recommendation** section pre-populating **Recommended Supplier = A & A Stationers**. The decision is set via one of three buttons (**Approve Recommendation** / Recommend another Supplier / Bid is non-responsive); **BEC Report** is a required free-text field (Supporting Documents upload is optional). **Submit Recommendation** stays disabled until a decision is selected and the BEC Report is filled. Clicking **Approve Recommendation**, filling the BEC Report, then **Submit Recommendation** advanced the tender to the **Capture Outcome of the BAC** stage (TC-13) — it left ThabisoM's inbox and the app redirected to My Items.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to `/login` and sign in as **ThabisoM** (123qwe)
  2. OPEN the Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`)
  3. ASSERT the Inbox list and Export button are shown
  4. ASSERT the target tender row is shown with Action Required **"BEC: Finalise recommendation"**
  5. CLICK the magnifying-glass icon on the target tender (a "TC-01 Automated Draft Tender" item at the BEC: Finalise-recommendation stage)
  6. ASSERT the item opens on the "BEC: Finalise recommendation" page (form `tender-wf-finaliserecommendation-details`)
  7. CLICK through the read-only tabs; wait for the Evaluator Scores and Final Evaluation tables to finish loading
  8. ASSERT the Final Evaluation table ranks A & A Stationers #1 (Overall Score 98) and the Recommended Supplier is **A & A Stationers**
  9. CLICK **Approve Recommendation** (the button becomes active/selected)
  10. FILL the required **BEC Report** field
  11. ASSERT **Submit Recommendation** becomes enabled
  12. CLICK **Submit Recommendation**
  13. ASSERT (BLOCKING) the recommendation submits and the tender advances out of the stage to **Capture Outcome of the BAC** (item leaves the inbox / redirect to My Items)
- **Expected result:** The BEC can review the consolidated ranking, approve the top-ranked supplier (A & A Stationers), capture the BEC report and submit; the tender advances to the Capture Outcome of the BAC stage.
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "BEC: Finalise recommendation" page
  - [x] ASSERT the Final Evaluation ranks A & A Stationers #1 and pre-selects it as Recommended Supplier
  - [x] ASSERT (BLOCKING) Submit Recommendation advances the tender to Capture Outcome of the BAC

---

### TC-13 — Capture Outcome of the BAC (ADO #60836)

*As the BAC, open a tender at the Capture-outcome-from-the-BAC stage, review the three-stage adjudication summary and the BEC recommendation, capture the BAC's Approve Recommendation decision, and submit (happy path).*

> **Note (2026-06-04):** Updated against the live QA app. Logged in as **MoshadiM / 123qwe** (the BAC adjudicator — the original draft's "Maanda-awe" login and the Export-to-Excel step are stale; View-in-PDF / Download-Batch buttons exist but aren't on the happy path). Verified live against **REF2026-1399** (advanced here by TC-12's Submit Recommendation): it sits in MoshadiM's Inbox with Action Required **"Capture outcome from the BAC"** (status "Adjudicate In Progress"). Opening it (form `tender-wf-captureoutcomeofthebac-finalrecommendation`) shows read-only Tender Information + Publication, and three collapsible adjudication summaries: **Stage 1 – Administrative Compliance** (all Compliant), **Stage 2 – Technical Evaluation** (A&A 90, Telkom 74, BOXFUSION 60 — all Compliant), **Stage 3 – Price and Specific Goal Points** (A&A Overall 98 Rank 1, Telkom 92 Rank 2, BOXFUSION 81 Rank 3), a read-only **BEC Recommendation** (Recommended Supplier = A & A Stationers + BEC report) and a **BAC Recommendation** decision row (**Approve Recommendation** / Send back for re-evaluation / Change Recommendation / Bid is Non-Responsive / Cancel Tender). **Submit** is disabled until a BAC decision is selected. Selecting **Approve Recommendation** then **Submit** advanced the tender to **Approve Recommendation From BAC** (TC-14) — it left MoshadiM's inbox and the app redirected to My Items.
>
> **⚠️ Observed anomaly (not yet logged as a bug, per QA — re-check on a full rerun):** in the Stage 3 table the **Recommendation Status** of **A & A Stationers** (rank 1, the BEC-recommended supplier) reads **"Not Recommended"**, while the two losing suppliers show a blank status. Selecting the BAC's "Approve Recommendation" did **not** change it. The recommended/top-ranked supplier being flagged "Not Recommended" looks like an inverted/mis-defaulted status flag — flagged for observation when the chain is re-run end-to-end.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to `/login` and sign in as **MoshadiM** (123qwe)
  2. OPEN the Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`)
  3. ASSERT the Inbox list and Export button are shown
  4. ASSERT the target tender row is shown with Action Required **"Capture outcome from the BAC"**
  5. CLICK the magnifying-glass icon on the target tender (a "TC-01 Automated Draft Tender" item at the Capture-outcome stage)
  6. ASSERT the item opens on the "Capture outcome from the BAC" page (form `tender-wf-captureoutcomeofthebac-finalrecommendation`)
  7. WAIT for the Stage 1/2/3 summaries to load and ASSERT Stage 3 ranks A & A Stationers #1 (Overall 98) and BEC Recommended Supplier = A & A Stationers
  8. CLICK the BAC **Approve Recommendation** decision button (it becomes active/selected)
  9. ASSERT the **Submit** button becomes enabled
  10. CLICK **Submit**
  11. ASSERT (BLOCKING) the BAC outcome is captured and the tender advances out of the stage to **Approve Recommendation From BAC** (item leaves the inbox / redirect to My Items)
- **Expected result:** The BAC can review the three-stage adjudication and BEC recommendation, approve the recommendation, and submit; the tender advances to the Approve Recommendation From BAC stage.
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "Capture outcome from the BAC" page with the three-stage adjudication summary
  - [x] ASSERT Stage 3 ranks A & A Stationers #1 and BEC Recommended Supplier = A & A Stationers
  - [x] ASSERT (BLOCKING) selecting Approve Recommendation + Submit advances the tender to Approve Recommendation From BAC

---

### TC-14 — Approve Recommendation From BAC (ADO #60843)

*As the approving authority, open a tender at the Approve-Recommendation-from-BAC stage, review the consolidated evaluations and final BEC/BAC recommendation, tick the confirmation, and submit to approve (happy path).*

> **Note (2026-06-04):** Updated against the live QA app. Logged in as **ThulileM / 123qwe** (the approving authority — the ADO draft's "Maanda-awe" login and the Export-to-Excel step are stale; View-in-PDF / Download-Batch buttons exist but aren't on the happy path). Verified live against **REF2026-1399** (advanced here by TC-13's BAC Submit): it sits in ThulileM's Inbox with Action Required **"Approve Recommendation from BAC"** (status "Adjudicate In Progress"). Opening it (form `tender-wf-approverecommendationfrombac-details`) shows the read-only Tender Details tabs, an **"Evaluations and final BEC and BAC recommendation"** section with the Stage 1/2/3 summaries, and an **Approve BAC Recommendation** block: an info alert ("Review all the information above and approve the recommendation from the Bid Adjudication Commitee") plus a confirmation checkbox ("I confirm I have reviewed all the provided information and approve the recommmendation from the Bid Adjudication Commitee" — note the app's "recommmendation"/"Commitee" typos). **Submit** is disabled until the checkbox is ticked. Ticking it then **Submit** advanced the tender to the next stage (**Compile and Upload Appointment Letter**, TC-15) — it left ThulileM's inbox and the app redirected to My Items.
>
> **⚠️ Anomaly still present (carried from TC-13, not logged — re-check on rerun):** Stage 3 again shows the recommended/rank-1 supplier **A & A Stationers as "Not Recommended"** while the losing suppliers are blank. Same suspected inverted-flag issue surfaced in TC-13; it persists into this page.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to `/login` and sign in as **ThulileM** (123qwe)
  2. OPEN the Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`)
  3. ASSERT the Inbox list and Export button are shown
  4. ASSERT the target tender row is shown with Action Required **"Approve Recommendation from BAC"**
  5. CLICK the magnifying-glass icon on the target tender (a "TC-01 Automated Draft Tender" item at the Approve-Recommendation-from-BAC stage)
  6. ASSERT the item opens on the "Approve Recommendation from BAC" page (form `tender-wf-approverecommendationfrombac-details`)
  7. WAIT for the Stage 1/2/3 summaries to load and ASSERT Stage 3 ranks A & A Stationers #1 (Overall 98)
  8. TICK the **Approve BAC Recommendation** confirmation checkbox
  9. ASSERT the **Submit** button becomes enabled
  10. CLICK **Submit**
  11. ASSERT (BLOCKING) the recommendation is approved and the tender advances out of the stage to **Compile and Upload Appointment Letter** (item leaves the inbox / redirect to My Items)
- **Expected result:** The approving authority can review the consolidated evaluations and BEC/BAC recommendation, confirm, and submit; the tender advances to the Compile and Upload Appointment Letter stage.
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "Approve Recommendation from BAC" page
  - [x] ASSERT Stage 3 ranks A & A Stationers #1 (Overall 98)
  - [x] ASSERT (BLOCKING) ticking the confirmation + Submit advances the tender to Compile and Upload Appointment Letter

---

### TC-15 — Compile and Upload Appointment Letter (ADO #60845)

*Open a tender at the Compile-and-Upload-Appointment-Letter stage, upload the signed appointment letter for the successful bidder, pick the Contract Management Unit email, confirm and submit — awarding the tender (happy path).*

> **Note (2026-06-04):** Updated against the live QA app. Logged in as **TumisangM / 123qwe** (handles the appointment-letter upload — the ADO draft's "Maanda-awe" login and the Export-to-Excel step are stale; View-in-PDF / Download-Batch buttons exist but aren't on the happy path). Verified live against **REF2026-1399** (advanced here by TC-14's approval): it sits in TumisangM's Inbox with Action Required **"Upload Appointment letter"** (status "Adjudicate In Progress"). Opening it (form `tender-wf-compileanduploadappointmentletter-details`) shows the read-only Tender Details tabs + Stage 1/2/3 summaries, an **Upload Appointment Letter** section (hint "Upload the Appointment Letter for the Successful Bidder"; required **Appointment Letter** file upload + required **Contract Management Unit Email** select, e.g. "Andrew Jack"), and a **Confirm** checkbox ("I confirm that the appointment letter has been compiled and signed"). **Submit** is disabled until the file, email and checkbox are all set. Uploading the file (hub-root `test-data/pdf-test.pdf`), selecting the email, ticking confirm, then **Submit** flipped the tender status to **Awarded** and advanced it to the **Capture Order Details** stage (TC-16, form `tender-wf-captureorder-details`) — which also lands in TumisangM's queue (the app auto-opened the next action).
>
> **⚠️ Anomaly still present (carried from TC-13/14, not logged — re-check on rerun):** Stage 3 again shows the rank-1 supplier **A & A Stationers as "Not Recommended"** while the losing suppliers are blank.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to `/login` and sign in as **TumisangM** (123qwe)
  2. OPEN the Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`)
  3. ASSERT the Inbox list and Export button are shown
  4. ASSERT the target tender row is shown with Action Required **"Upload Appointment letter"**
  5. CLICK the magnifying-glass icon on the target tender (a "TC-01 Automated Draft Tender" item at the Upload-Appointment-letter stage)
  6. ASSERT the item opens on the "Upload Appointment letter" page (form `tender-wf-compileanduploadappointmentletter-details`)
  7. UPLOAD the Appointment Letter (`test-data/pdf-test.pdf`) and ASSERT the file surfaces
  8. SELECT a Contract Management Unit Email (e.g. Andrew Jack)
  9. TICK the **Confirm** checkbox ("I confirm that the appointment letter has been compiled and signed")
  10. ASSERT the **Submit** button becomes enabled
  11. CLICK **Submit**
  12. ASSERT (BLOCKING) the tender status becomes **Awarded** and it advances to the **Capture Order Details** stage
- **Expected result:** The successful-bidder appointment letter is uploaded, the contract-management email captured, and on submit the tender is Awarded and advances to Capture Order Details.
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "Upload Appointment letter" page
  - [x] ASSERT the uploaded appointment letter surfaces and the Submit button enables after the required fields are set
  - [x] ASSERT (BLOCKING) Submit awards the tender and advances it to Capture Order Details

---

### TC-16 — Capture Order Details (ADO #60848)

*Open the Awarded tender at the Capture-Order-Details stage, capture the purchase order details (number, date, amount) and attach the order document, then submit — completing the tender lifecycle (happy path).*

> **Note (2026-06-04):** Updated against the live QA app. Logged in as **TumisangM / 123qwe** (the same user who uploaded the appointment letter in TC-15 — the ADO draft's "Maanda-awe" login and the Export-to-Excel step are stale; only a Download-Batch button exists here, no View-in-PDF). Verified live against **REF2026-1399** — after TC-15's Submit the app auto-opened this stage (the tender is now **Awarded**). Form `tender-wf-captureorder-details` shows the read-only Tender Details tabs + Stage 1/2/3 summaries and an **Order Details** section (hint "Specify the purchase order details and attach order document(s) to proceed.") with four required fields: **Purchase Order No** (text), **Purchase Order Date** (date-only picker — no time/OK), **Purchase Order Amount** (AntD InputNumber spinbutton) and **Order Attachment** (file upload). **Submit** is disabled until all four are set. Filling them (PO `PO-REF2026-1399-TC18`, date today, amount 150000, attachment `test-data/pdf-test.pdf`) and **Submit** completed the workflow — the item left TumisangM's inbox entirely (no further action required), closing the lifecycle.
>
> **⚠️ Anomaly still present (carried from TC-13/14/15, not logged — re-check on rerun):** Stage 3 again shows the rank-1 supplier **A & A Stationers as "Not Recommended"** while the losing suppliers are blank.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to `/login` and sign in as **TumisangM** (123qwe)
  2. OPEN the Inbox (`/dynamic/Shesha.Workflow/workflows-inbox`)
  3. ASSERT the Inbox list and Export button are shown
  4. ASSERT the target tender row is shown with Action Required **"Capture Order Details"** (status Awarded)
  5. CLICK the magnifying-glass icon on the target tender (a "TC-01 Automated Draft Tender" item at the Capture-Order-Details stage)
  6. ASSERT the item opens on the "Capture Order Details" page (form `tender-wf-captureorder-details`)
  7. FILL **Purchase Order No** (e.g. PO-REF2026-1399-TC18)
  8. PICK **Purchase Order Date** (e.g. today) via the date picker
  9. FILL **Purchase Order Amount** (e.g. 150000)
  10. UPLOAD an **Order Attachment** (`test-data/pdf-test.pdf`)
  11. ASSERT the **Submit** button becomes enabled
  12. CLICK **Submit**
  13. ASSERT (BLOCKING) the order is captured and the tender leaves the workflow (item no longer in the inbox — lifecycle complete)
- **Expected result:** The purchase order details and attachment are captured and on submit the tender lifecycle completes (item leaves the inbox).
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "Capture Order Details" page (status Awarded)
  - [x] ASSERT the Submit button enables once the four Order Details fields are set
  - [x] ASSERT (BLOCKING) Submit captures the order and the tender leaves the workflow (no further inbox action)

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).

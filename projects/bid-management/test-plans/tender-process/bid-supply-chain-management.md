# Test Plan: BID-SCM — BID: Supply Chain Management

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-30
> **Estimated Duration:** 900s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-supplychainmanagement-adminportal-qa.shesha.app/login |
| Environment | QA Site |
| Login As | Maanda-awe / 123qwe |
| ADO Plan | [#57472](https://dev.azure.com/boxfusion/PD-SupplyChainManagement/_testPlans/execute?planId=57472&suiteId=57473) |
| ADO Suite | #57473 — BID: Supply Chain Management |

## Objective
> Validate the end-to-end Bid Management (tender) lifecycle in the Supply Chain Management admin portal — from authentication and drafting a tender, through review/approval/publication, supplier-response consolidation and compliance review, BEC evaluation and calibration, BAC recommendation and approval, to appointment-letter compilation and order capture.

## Preconditions
- [ ] App is reachable at https://pd-supplychainmanagement-adminportal-qa.shesha.app/login
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
  12. SELECT a **date + time** for Briefing Session Start Time, Bid publication Date and Bid closing Date (via the picker panel + OK). **All three must be FUTURE dates, computed relative to today — never hardcoded.** The AntD picker renders past days as `.ant-picker-cell-disabled` and a disabled cell silently swallows the click, so a hardcoded date rots into a 15 s click timeout (this broke the 2026-07-29 run). Keep the ordering briefing < publication < closing; the spec uses today +3 / +4 / +30.
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
>
> **Note (2026-07-30) — the Supplier dropdown is PAGED.** It renders only the **first 10 suppliers alphabetically** (on this run: A & A Stationers → PHINGOSHE HOLDINGS), so any supplier further down the alphabet is simply absent from the initial option list. **Telkom** is not on page 1 — the 80/20 run of 2026-07-30 died here on a 15 s click timeout once the supplier master data grew past 10 entries. Always **type the supplier name to filter** (search server-side) before clicking the option; never rely on the option being pre-rendered. Search on the longest word in the name ("Stationers", not "A & A ").

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

> **Note (2026-07-29) — how this stage must be driven and verified.** Per supplier dialog, each Tender
> Document row needs **both** a **Comments** value **and** its **Is Compliant?** checkbox: the checkbox is
> what *enables* Finalise Compliance, the comment is what makes the *save* succeed. With the comment
> missing, Finalise still enables but the click fails silently (`Checklist:Update` in the console only) and
> nothing persists. **Compliance status must be `Compliant`** — with `Non Compliant` the button never
> enables (open question, see the bug doc).
> Both assertions must be *positive*: read the **Compliance Status column back as COMPLIANT** for every
> supplier (proves the dialogs saved), and confirm the tender is **no longer offered at Verify Compliance
> in the inbox** (proves the workflow advanced). An earlier version only checked that the browser had
> landed on a list page, which let TC-05 report PASS while the stage still had to be completed by hand.
> See [test-reports/bugs/2026-07-29-finalise-compliance-action-fails.md](../../test-reports/bugs/2026-07-29-finalise-compliance-action-fails.md).
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

*As the BEC chair, open a tender at the Confirm-Attendance stage, add a backup evaluator (marked present), mark the attending evaluators present, and open the evaluation (happy path).*

> **⚠️ Requirement change (2026-07-30, per the test lead):** at this stage an attendee **can only be added if "Is Present?" is ticked** in the add-row. The row will not commit for a person left absent. This supersedes the 2026-06-03 note below (which added the backup *not present*) and it **retires the "backup evaluator won't commit" finding** — the grid was enforcing this rule, not failing. The step is a normal blocking assertion again.

> **Note (2026-06-03):** Updated against the live QA app. Logged in as **ThabisoM / 123qwe**. Verified live against **REF2026-1399**: a backup evaluator (**Maand-awe Mamathuntsha**) was added (left not-present, as a stand-in if an evaluator is absent), the three invited evaluators (**Nelly Tears, Nkosinathi Sibiya, Thabitha Modula**) were marked **present** via each row's edit → "Is Present?" → save, and **Open Evaluation** advanced the tender to **BEC: Monitor Evaluation Progress**. Each row's "Is Present?" checkbox is read-only until the row is in edit mode. **Spec caveat:** the add-backup step reuses the same Shesha inline-grid add as TC-07, which is not yet green under automation — so the automated spec may be pending like TC-07.

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the login page and sign in as **ThabisoM / 123qwe**
  2. CLICK Workflows to expand it, then CLICK Inbox
  3. ASSERT the Inbox ("Incoming Items") list and Export button are shown
  4. CLICK the magnifying-glass icon on the target tender at the **Confirm Attendance and Open Evaluation** stage (a "TC-01 Automated Draft Tender" item)
  5. ASSERT (BLOCKING) the item opens on the "Confirm Attendance and Open Evaluation" page
  6. ADD a backup evaluator via the Attendees/Evaluators add-row (e.g. Maand-awe Mamathuntsha): select the Name, **TICK "Is Present?" in the add-row** (mandatory — the row will not commit otherwise), then CLICK the add (plus) button
  7. For each invited evaluator (Nkosinathi Sibiya, Nelly Tears, Thabitha Modula): CLICK the row edit icon, CHECK "Is Present?", and CLICK save
  8. ASSERT the three evaluators are marked present
  9. CLICK Open Evaluation
  10. ASSERT (BLOCKING) the evaluation opens and the tender advances to BEC: Monitor Evaluation Progress
- **Expected result:** The BEC chair can add a backup attendee, mark the attending evaluators present, and open the evaluation; the tender advances to BEC: Monitor Evaluation Progress.
- **Assertions:**
  - [x] ASSERT Inbox list and Export button are shown
  - [x] ASSERT (BLOCKING) the item opens on the "Confirm Attendance and Open Evaluation" page
  - [x] ASSERT a backup is added (marked present) and the three evaluators are marked present
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

> **Note (2026-06-04):** Updated against the live QA app. Logged in as **ThabisoM / 123qwe** (the original draft's "Maanda-awe" login and the Export-to-Excel / View-in-PDF / Download-Batch steps were stale ADO steps). Verified live against **REF2026-1399** (advanced here by TC-10): the item sits in ThabisoM's Inbox with Action Required **"Monitor calibration and finalise scoring"**. Opening it (form `tender-wf-calibratescores`) shows the read-only review tabs (Tender Details, Publication, Tender Documents, Response Documents, Technical Evaluation Criteria, Responses) plus an **Evaluator Scores** summary that aggregates the TC-09 functionality scores and computes a per-supplier Average + Above-Minimum flag (A & A Stationers 92/90/88 → avg 90, Telkom 70/75/78 → avg 74.33, BOXFUSION 55/60/65 → avg 60 — all Above Minimum). The page's only commit action is **Finalise Scoring** — there is no Export/PDF/Download on this happy path. Clicking **Finalise Scoring** advanced the tender to the **BEC: Finalise recommendation** stage (TC-12).
>
> **Correction (2026-07-30):** the 2026-06-04 note above originally claimed this page also offers **Send Back**. **It does not.** Verified **twice** — by the automated `PROBE_SENDBACK=1` discovery pass and by live page inspection on REF2026-1053 — the only buttons on `tender-wf-calibratescores` are **Reply**, **Hide**, **Download Zip**, the three per-supplier expanders and **Finalise Scoring**. The footer **Send Back** exists only on the pre-evaluation stages (TC-02 → TC-08); see **TC-18**. Rework from this stage is instead reached *backwards*, via the BAC's own "Send back for re-evaluation" decision (**TC-19**).

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

### TC-17 — Review and Approve: Send Back for rework (NEGATIVE) — no ADO case

*As the reviewer, instead of approving a submitted tender, send it back to the initiator with mandatory comments; the initiator corrects the draft and re-submits, and the tender returns to the reviewer's Review-and-Approve queue.*

> **Verified live 2026-07-30** against **REF2026-1047** (80/20). This is the first negative branch recorded
> for this plan. Notes from the live drive:
> - The Review-and-Approve page (`tender-wf-review-and-approve-details v27`) offers **three** decisions —
>   **Approve**, **Disapprove** and **Send Back**. Approve/Disapprove sit in the *Publish Tender* section;
>   **Send Back is in the page footer**, beside Submit.
> - **Send Back opens its own dialog** (`Shesha.Workflow/user-task-send-back v4`) with two mandatory
>   fields: **Step** (a "Select a User Task" picker) and **Comments**.
> - The Step picker offered exactly **one** target — **Capture Tender Details**, shown as *Completed by
>   Maand-awe Mamathuntsha*, *Assigned to: Maand-awe Mamathuntsha*. You can only send back to the
>   originating draft step.
> - **The dialog's OK submits the send-back immediately** and redirects to the Inbox. The footer
>   **Submit stays disabled and is never used** — unlike the Approve path, where Submit is the commit.
> - The item returns to the initiator's **Inbox** (not My Items) as **Capture Tender Details**, opening the
>   fully **editable 5-step wizard** with the draft intact (meeting link, uploads, evaluation criteria all
>   preserved). The reviewer's comment is displayed **inline on the item, with a Reply button**.
> - After correcting a field and walking Next ×4 → **Submit**, the tender went back to the reviewer's
>   Review-and-Approve queue (a **third** todoid) and the reviewer **sees the corrected value** (old value
>   gone) **and the send-back comment thread**. No validation errors anywhere in the re-submit.
> - **Observation (minor, not logged as a bug):** the status stays **Submitted** for the whole round trip —
>   in the Inbox, in My Items and on the item header — even while the tender sits with the initiator for
>   rework. A sent-back tender is indistinguishable from a freshly submitted one by status alone.
> - **Not yet tested:** the **Disapprove** decision (expected to be terminal).

- **Type:** Negative / rework loop
- **Preconditions:** a tender submitted by TC-01 sitting at **Review and Approve Tender Details**. In the
  automated spec this TC **skips** (with a message) rather than failing when no such tender is pinned, so
  it never breaks a happy-path chain run. To run it: `--grep "TC-01"` first, then `--grep "TC-17"` (the REF
  persists in `test-results/chain-ref.json` between invocations), or pin an existing tender with
  `RUN_REF=<REF2026-nnnn> --grep "TC-17"`.
- **Steps:**
  1. NAVIGATE to the login page and sign in as the reviewer **MhlotiM / 123qwe**
  2. CLICK Workflows → Inbox and open the target tender at the **Review and Approve Tender Details** stage
  3. ASSERT (BLOCKING) the item opens on the "Review and Approve Tender Details" page
  4. ASSERT all three decisions are offered: **Approve**, **Disapprove**, **Send Back**
  5. CLICK **Send Back** (footer) → the Send Back dialog opens
  6. ASSERT the dialog requires **Step** and **Comments** (both marked `*`)
  7. SELECT the Step — **Capture Tender Details** — and ASSERT it is the only user task offered
  8. TYPE the mandatory Comments explaining what must be corrected
  9. CLICK **OK**
  10. ASSERT (BLOCKING) the send-back commits on OK and the item leaves the reviewer's Inbox
  11. SIGN IN as the initiator **Maanda-awe / 123qwe** and ASSERT the item is in the **Inbox** with Action Required **Capture Tender Details**
  12. OPEN the item and ASSERT the reviewer's comment is displayed on it
  13. ASSERT the draft is editable and its previously-captured values are intact
  14. EDIT the field the reviewer asked about (Briefing Session Venue), then CLICK Next through steps 2–5
  15. ASSERT no validation errors block the re-submit, then CLICK **Submit**
  16. ASSERT the item returns to My Items as **Submitted**
  17. SIGN IN as **MhlotiM** again and ASSERT (BLOCKING) the tender is back at **Review and Approve Tender Details** and the **corrected value** is visible on the Publication tab
- **Expected result:** A reviewer can reject-for-rework via Send Back with mandatory step + comments; the tender returns to the initiator's draft step editable and annotated; after correction it re-enters the reviewer's queue with the corrected data and the full comment trail.
- **Assertions:**
  - [x] ASSERT (BLOCKING) the item opens on the Review-and-Approve page with Approve / Disapprove / Send Back
  - [x] ASSERT the Send Back dialog enforces Step + Comments, and offers only Capture Tender Details
  - [x] ASSERT (BLOCKING) OK commits the send-back and the item leaves the reviewer's inbox
  - [x] ASSERT the item reaches the initiator's Inbox at Capture Tender Details, editable, with the comment shown
  - [x] ASSERT (BLOCKING) after correction + re-submit the tender is back at Review and Approve with the corrected value visible

---

### TC-18 — Send Back rework loop at every stage that offers it (NEGATIVE) — no ADO case

*For each workflow stage that exposes a footer **Send Back**, send the tender back to its immediately preceding step, have that actor re-action the step, and confirm the tender returns to the sending stage so the happy path can continue — one run therefore exercises both the rework loop and the forward chain.*

> **Verified live 2026-07-30** against **REF2026-1047** (80/20), which completed the **full** lifecycle to
> *Awarded* + order captured with all seven send-backs woven in. Notes:
> - **The footer Send Back exists ONLY on the pre-evaluation stages.** Seven loops were driven end-to-end,
>   all passing:
>
>   | Stage sending back | Target step chosen | Re-actioned by |
>   |---|---|---|
>   | TC-02 Review and Approve Tender Details | Capture Tender Details | Maand-awe (draft wizard) |
>   | TC-03 Publish Tender | Review and Approve Tender Details | MhlotiM |
>   | TC-04 Consolidate Responses | Publish Tender | Tumisang |
>   | TC-05 Verify Compliance | Consolidate Responses | Tumisang |
>   | TC-06 Calculate Specific Goal Points | Verify Compliance | Tumisang |
>   | TC-07 Invite BEC members | Calculate Specific Goal Points | Tumisang |
>   | TC-08 Confirm Attendance and Open Evaluation | Invite BEC members | ThabisoM |
>
> - **NO footer Send Back at TC-10, TC-11, TC-12, TC-13, TC-14, TC-15 or TC-16.** From the evaluation
>   stages onward the app expresses rework through stage-specific decision buttons instead (see TC-19).
>   The stale TC-11 note claiming otherwise is corrected above.
> - Each Send Back dialog offers **every completed predecessor**, not just the previous one — Review&Approve
>   offers 1 target, Publish 2, Consolidate 3, Verify Compliance 4, Calculate SGP 5, Invite BEC 6. This TC
>   always picks the immediate predecessor as the cheapest, most realistic rework.
> - **Send Back preserves all captured data and clears only the confirmation checkbox**, so recovery is
>   usually "tick the confirmation again and Submit". The draft wizard, Approve and Publish stages need a
>   little more and have explicit recovery branches.
> - **Finding (minor): the post-send-back redirect is inconsistent** — three different destinations were
>   observed after OK: the Inbox list, `/shesha/workflow`, and `/shesha/workflow-action` (auto-opening the
>   next action). Any assertion that waits for "a workflows list" is therefore wrong.
> - **Finding (copy): confirmation labels use a lowercase `l` where `I` belongs** — Invite BEC reads
>   "*l confirm that l have invited…*" against Publish's "*I can confirm…*"; "should be send to" also
>   appears. Same family as the known "recommmendation" / "Commitee" typos → copy review for the BA.
>   Automation must match on `/confirm/i`, never the literal "I confirm".
> - **Observation:** as in TC-17, the status never reflects rework — it stays *Submitted* /
>   *Adjudicate In Progress* through every loop.

- **Type:** Negative / rework loop (per stage)
- **Preconditions:** a tender pinned via TC-01 (or `RUN_REF`). The branches are **opt-in** so they can
  never slow or break a clean happy-path chain run:
  `SEND_BACKS=all` instruments every stage that offers Send Back, or `SEND_BACKS=2,3,5` a chosen subset
  (numbers are stage/TC numbers).
- **Steps (repeated per instrumented stage):**
  1. ARRIVE at the stage on the happy path as its mapped actor
  2. ASSERT whether the page offers a footer **Send Back** — if it does not, LOG it and continue the happy
     path (no negative branch exists to drive)
  3. CLICK **Send Back** → the dialog `Shesha.Workflow/user-task-send-back v4` opens
  4. ASSERT the dialog requires **Step** and **Comments**
  5. ASSERT the Step picker offers the immediately preceding step (among all completed predecessors)
  6. SELECT the preceding step, TYPE mandatory comments, CLICK **OK**
  7. ASSERT (BLOCKING) OK commits the send-back and the item leaves the current actor's inbox
  8. SIGN IN as the **previous** stage's actor and ASSERT the tender is in their Inbox at that step
  9. RE-ACTION that step (data is preserved — usually re-tick the confirmation and Submit)
  10. ASSERT (BLOCKING) the tender returns to the sending stage for its own actor
  11. RUN the normal happy action so the chain continues to the next stage
- **Expected result:** Every stage that offers Send Back can return the tender to any completed predecessor
  with mandatory step + comments; the previous actor sees it in their Inbox with the data intact and the
  comment attached; re-actioning returns it to the sender, and the lifecycle still completes to Awarded.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Send Back is present on TC-02 → TC-08 and absent on TC-10 → TC-16
  - [x] ASSERT the dialog enforces Step + Comments and lists every completed predecessor
  - [x] ASSERT (BLOCKING) OK commits and the item moves to the target step's actor
  - [x] ASSERT captured data survives the round trip and only the confirmation is cleared
  - [x] ASSERT (BLOCKING) each loop returns the tender to the sending stage and the chain completes to Awarded (REF2026-1047)

---

### TC-19 — Capture Outcome of the BAC: Send back for re-evaluation (NEGATIVE) — no ADO case

*As the BAC adjudicator, instead of approving the BEC recommendation, choose **Send back for re-evaluation**, pick a re-evaluation step, and confirm the tender lands in that actor's inbox properly assigned, is workable, and returns to the BAC once re-actioned.*

> **Verified live 2026-07-30** against **REF2026-1053** (80/20), then closed automatically. Notes:
> - The BAC stage does **not** use the generic send-back. "Send back for re-evaluation" opens its **own**
>   form `Shesha.SupplyChainManagement/re-evaluation-user-task-send-back v3`, with mandatory **Step** and
>   **Comments**. As with the generic dialog, **OK commits** — the page's Submit is never used.
> - The Step picker offers a **curated three**, not every predecessor: *Verify Compliance* (→ Tumisang),
>   *Confirm Attendance and Open Evaluation* (→ ThabisoM), *Monitor calibration and finalise scoring*
>   (→ ThabisoM).
> - Taking the **calibration** route: the item left MoshadiM's inbox and arrived in **ThabisoM's** inbox
>   **properly assigned** under a new todoid, with the **BAC's comment visible**, and **Finalise Scoring
>   enabled** → advanced to *BEC: Finalise recommendation*. Re-actioning that stage (TC-12) put it **back in
>   MoshadiM's inbox at "Capture outcome from the BAC"** — the loop is closed, **with no dead end**.
> - **Contrast with DHA Invoice Tracking**, where the equivalent re-route leaves the item unassigned and
>   stuck. This app routes it correctly.
> - ~~**Finding: the BAC stage carries undocumented decisions** — "Hold In abeyance pending further due
>   dilligence" (sic) and Cancel Tender rendered twice.~~ **⚠️ NOT REPRODUCIBLE 2026-07-30 (evening).** On a
>   re-inspection of this same stage on REF2026-1053, the BAC Recommendation row rendered exactly **five**
>   buttons — *Approve Recommendation*, *Send back for re-evaluation*, *Change Recommendation*, *Bid is
>   Non-Responsive*, *Cancel Tender* — with **no "Hold In abeyance" anywhere on the page and no duplicated
>   Cancel Tender**. A whole-page text search for "abeyance" found nothing, here or on the TC-14 page.
>   **Treat the earlier observation as unconfirmed until someone sees it again** — and record the view mode
>   when they do (today's TC-14 check was in **Latest**; the view mode of the earlier BAC observation was not
>   captured, so a Live-vs-Latest form-version difference remains the most likely explanation but is
>   unproven).
>
> **Partial update (2026-07-30 evening, on REF2026-1122's BAC task):** the DOM here contains **two** buttons
> whose text is exactly *"Cancel Tender"* — but **only one is visible**; the second has zero size. So there is a
> real **latent duplicate in the markup**, consistent with this form family leaving conditionally-hidden
> controls mounted (cf. the orphaned hidden *Motivation* textarea in TC-26). **A user does not see two buttons**,
> so the original "rendered TWICE" wording remains unconfirmed as a visible defect. **"Hold In abeyance" was
> still absent** from the whole page.
> - **Finding (open, from TC-08's machinery):** a **backup evaluator blocks calibration.** Because an
>   attendee can only be added when *Is Present?* is ticked, a backup becomes a full evaluator — a fourth
>   column in Evaluation Scores with its own scorecard — and **"Begin Calibration" stays DISABLED with no
>   on-screen reason until they score.** Proven both ways on REF2026-1047 and REF2026-1053: disabled at
>   3-of-4 scored, passing ~12s after the fourth scored. **The "add a backup, leave them absent as a
>   stand-in" intent is no longer achievable — needs a BA ruling.**

- **Type:** Negative / re-evaluation loop
- **Preconditions:** a tender pinned via `RUN_REF` sitting at **Capture outcome from the BAC**
  (TC-12 leaves it there). Driven with `SEND_BACKS=13`.
- **Steps:**
  1. NAVIGATE to the login page and sign in as the BAC adjudicator **MoshadiM / 123qwe**
  2. OPEN Workflows → Inbox and open the pinned tender at **Capture outcome from the BAC**
  3. ASSERT the BAC Recommendation decision row offers Approve Recommendation / **Send back for
     re-evaluation** / Change Recommendation / Bid is Non-Responsive / Cancel Tender
  4. ASSERT the undocumented extras are present: **Hold In abeyance…** and the **duplicated Cancel Tender**
  5. CLICK **Send back for re-evaluation** → ASSERT the dedicated form
     `re-evaluation-user-task-send-back v3` opens with mandatory **Step** and **Comments**
  6. ASSERT the Step picker offers exactly three curated targets (Verify Compliance / Confirm Attendance and
     Open Evaluation / Monitor calibration and finalise scoring)
  7. SELECT **Monitor calibration and finalise scoring**, TYPE mandatory comments, CLICK **OK**
  8. ASSERT (BLOCKING) OK commits and the tender leaves MoshadiM's inbox
  9. SIGN IN as **ThabisoM / 123qwe** and ASSERT (BLOCKING) the tender is in their Inbox at *Monitor
     calibration and finalise scoring*, **assigned** (a new todoid), with the BAC comment visible
  10. ASSERT **Finalise Scoring** is enabled, then CLICK it
  11. ASSERT the tender advances to **BEC: Finalise recommendation**
  12. RE-ACTION that stage per TC-12 (Approve Recommendation + BEC report → Submit Recommendation)
  13. ASSERT (BLOCKING) the tender is back in **MoshadiM's** Inbox at **Capture outcome from the BAC**
- **Expected result:** The BAC can return a recommendation for re-evaluation to one of three curated steps
  with mandatory comments; the target actor receives it assigned and workable with the BAC's comment, and
  re-actioning it returns the tender to the BAC — no dead end.
- **Assertions:**
  - [x] ASSERT the BAC decision row offers Send back for re-evaluation (plus the two undocumented extras)
  - [x] ASSERT the dedicated re-evaluation form enforces Step + Comments and OK commits
  - [x] ASSERT the Step picker offers exactly the three curated targets
  - [x] ASSERT (BLOCKING) the item reaches ThabisoM's Inbox **assigned**, with the BAC comment, Finalise Scoring enabled
  - [x] ASSERT (BLOCKING) after re-actioning, the tender returns to MoshadiM at Capture outcome from the BAC

---

### TC-20 — Review and Approve: Disapprove (NEGATIVE) — no ADO case — 🔴 BLOCKED BY DEFECT

*As the reviewer, take the third decision — **Disapprove** — instead of Approve or Send Back, and establish what it does: terminal rejection or a rework loop.*

> **Driven live 2026-07-30 against REF2026-1106 and REF2026-1110 (both 80/20).**
> **RESULT: BLOCKED — Disapprove is completely non-functional.** Clicking it puts the button into a
> **loading spinner that never resolves** (observed >50 s); no dialog, no toast, no validation message, and
> **no workflow request is ever sent**. The tender is left untouched at *Review and Approve*.
>
> **Root cause (identified, not guessed):** the action loads the form
> `Shesha.SupplyChainManagement/tender-reason for disapproval` (which exists — 304), but that form's model
> container is configured as **`Boxfusion.BidManagement.Domain.Tenders.Tender`**, and
> `Metadata/Get?container=…Tenders.Tender` returns **404**. Form init throws in `applyFormSettingsAsync`,
> the dialog never renders, and the swallowed throw leaves the spinner up forever. The same page's working
> calls bind to **`Shesha.SupplyChainManagement.Domain.RfxWorkflow`** — the disapproval form appears to
> carry a **pre-rename namespace**.
>
> Reproduced **3/3** across two independent tenders → not data-specific. **Approve** and **Send Back** on
> the same page are unaffected. Full write-up:
> [`test-reports/bugs/2026-07-30-disapprove-hangs-metadata-404.md`](../../test-reports/bugs/2026-07-30-disapprove-hangs-metadata-404.md).
>
> **Consequence for this TC:** the *expected* behaviour of Disapprove — terminal rejection vs a rework loop
> — **cannot be established until the form loads.** Steps 6 onward below are therefore provisional, and
> this TC is deliberately **NOT encoded in the spec** so it cannot turn the demo-ready happy-path suite red.
> Re-verify with the parked retest data (**REF2026-1106**, **REF2026-1110**) once dev has repointed the form.

- **Type:** Negative / terminal decision — **currently blocked**
- **Preconditions:** a tender submitted by TC-01 sitting at **Review and Approve Tender Details**.
  **Retest data already parked:** REF2026-1106 and REF2026-1110, both in MhlotiM's Inbox, untouched.
- **Steps:**
  1. NAVIGATE to the login page and sign in as the reviewer **MhlotiM / 123qwe**; switch view mode to **Latest**
  2. OPEN Workflows → Inbox and open the target tender at **Review and Approve Tender Details**
  3. ASSERT (BLOCKING) three decisions are offered: **Approve**, **Disapprove**, and footer **Send Back**
  4. CLICK **Disapprove**
  5. ASSERT (BLOCKING) the reason-for-disapproval form opens — **🔴 FAILS TODAY: permanent loading spinner,
     `Metadata/Get?container=Boxfusion.BidManagement.Domain.Tenders.Tender` → 404**
  6. *(provisional)* CAPTURE the mandatory disapproval reason and COMMIT the decision
  7. *(provisional)* ASSERT the tender leaves the reviewer's Inbox
  8. *(provisional)* ASSERT the resulting state — establish whether Disapprove is **terminal** (e.g. a
     Rejected/Declined status with no onward task, as in eLeave's Not Approve) or routes back to the
     initiator like Send Back, and whether the reason is visible to the initiator
  9. *(provisional)* ASSERT the status reflects the outcome (note: every other branch so far leaves the
     status at *Submitted* — see TC-17/TC-18)
- **Expected result:** *Undetermined — blocked.* Once the form loads, Disapprove is expected to be a
  **terminal** rejection distinct from Send Back's rework loop, with a mandatory captured reason. This must
  be confirmed against the BA rather than assumed.
- **Assertions:**
  - [x] ASSERT (BLOCKING) all three decisions are offered on the page
  - [ ] 🔴 ASSERT (BLOCKING) clicking Disapprove opens the reason-for-disapproval form — **FAILED, see bug**
  - [ ] ASSERT the reason is mandatory — *blocked*
  - [ ] ASSERT the resulting state and whether it is terminal — *blocked*

---

### TC-21 — Verify Compliance: Non-Compliant supplier (NEGATIVE) — no ADO case

*Mark one supplier's response **Non Compliant** (an expired mandatory document), assess the others Compliant, and confirm the stage still submits and the non-compliant supplier is excluded from the next stage.*

> **Verified live 2026-07-30** on **REF2026-0890** (90/10, three responses: A & A 30 000, BOXFUSION 40 000,
> Telkom 50 000). **The rule works correctly.** Notes:
> - Telkom was marked **Non Compliant** with the TAX Clearance Cert row left *not compliant* + a per-row
>   comment; A & A and BOXFUSION were assessed Compliant. All three persisted in the **Compliance Status**
>   column.
> - Submit advanced the tender to **Calculate Specific Goal Points**, whose response tables list **only
>   BOXFUSION and A & A Stationers** — **Telkom is correctly excluded from further evaluation.**
> - **The Checklist section is effectively mandatory but unmarked.** A first attempt that left the five
>   Checklist Yes/No/N/A questions unanswered failed **silently and destructively**: `Failed to execute action
>   'Checklist:Update'` + 5 × `Action name is mandatory` in the console, the dialog just sat there with no
>   message, and on reopening **everything was blank** — including the five per-document rows whose
>   `FlatResponseDocument/Crud/Update` PUTs had returned **200**. A 200 on those PUTs proves nothing.
>   This **downgrades the 2026-07-29 "Finalise Compliance" blocker to a missing-validation defect** — see
>   that bug's 2026-07-30 retest section.
> - Fill order that works: per-document comments → Is Compliant? ticks → all 5 Checklist answers →
>   Compliance status → Compliance Comments → confirmation → Finalise Compliance.

- **Type:** Negative / business rule
- **Preconditions:** a tender at **Verify Compliance** with at least two consolidated supplier responses.
- **Steps:**
  1. NAVIGATE to the login page and sign in as **TumisangM / 123qwe**; switch view mode to **Latest**
  2. OPEN Workflows → Inbox and open the target tender at **Verify Compliance**
  3. On one supplier row CLICK the **edit** (pencil) icon → the *Supplier compliance* dialog opens
  4. ASSERT the dialog states *"A comment is required when the document is not marked as compliant."*
  5. FILL a comment on every Tender Document row; TICK **Is Compliant?** on all but the mandatory
     **TAX Clearance Cert**, whose comment records the non-compliance reason
  6. ANSWER all five **Checklist** questions (N/A)
  7. SELECT **Compliance status = Non Compliant**, TYPE the Compliance Comments, TICK the confirmation
  8. ASSERT (BLOCKING) **Finalise Compliance** enables, commits, and the dialog closes
  9. ASSERT (BLOCKING) the supplier row's **Compliance Status** reads **Non Compliant**
  10. REPEAT for the remaining suppliers as **Compliant**
  11. TICK the page confirmation and CLICK **Submit**
  12. ASSERT (BLOCKING) the tender advances to **Calculate Specific Goal Points**
  13. ASSERT (BLOCKING) the next stage's response tables **exclude the Non-Compliant supplier**
- **Expected result:** A non-compliant response is recorded with its reason, does not block the stage, and is
  excluded from pricing/specific-goal evaluation onward.
- **Assertions:**
  - [x] ASSERT (BLOCKING) Non Compliant persists in the Compliance Status column
  - [x] ASSERT (BLOCKING) the stage submits with a mix of Compliant and Non Compliant responses
  - [x] ASSERT (BLOCKING) the Non-Compliant supplier is excluded from the next stage
  - [x] ASSERT an unanswered Checklist fails silently and discards the dialog's work (defect, logged)

---

### TC-22 — Capture Outcome of the BAC: Change Recommendation (NEGATIVE) — no ADO case — 🔴 DEFECTS FOUND

*As the BAC adjudicator, override the BEC's recommended supplier via **Change Recommendation** with a mandatory motivation, and confirm the override is recorded as the BAC's decision and the tender advances.*

> **Driven live 2026-07-30** on **REF2026-1053** (80/20), twice (the second pass restored the original
> recommendation). **The override saves, but three things are wrong** — full write-up in
> [`bugs/2026-07-30-bac-change-recommendation-silent-no-advance.md`](../../test-reports/bugs/2026-07-30-bac-change-recommendation-silent-no-advance.md):
> 1. 🔴 **The first Submit persisted the change but never completed the user task** — `RfxEvaluation` and
>    `Rfx` updates returned 200, **no `Process/UserTaskComplete` was sent**, and the tender stayed on the
>    **same todoid** with the decision reset and **no error shown**. An identical second Submit completed it
>    (`UserTaskComplete` 200 → advanced). **Intermittent, silent** — same shape as the DHA ITS
>    "Register Submit is intermittent, just click Submit again" issue.
> 2. 🔴 **The override overwrites the BEC's own field** — afterwards the read-only *BEC Recommendation →
>    Recommended Supplier* panel reads the BAC's pick, so what the BEC actually recommended is gone.
> 3. 🔴 **The page then contradicts itself** — Stage 3 still shows the original supplier as Rank 1
>    *RECOMMENDED* directly above a BEC Recommendation panel naming the other supplier.
>
> **Working correctly:** the decision is inline (no dialog) with mandatory **New Recommended Supplier** +
> **Motivation**, and the page's Submit is the commit.
>
> ⚠️ **RETRACTED claim (2026-07-30):** an earlier version said the dropdown "offers only functionality-compliant
> suppliers excluding the current recommendation". **That was inferred from page 1 of a server-filtered search**
> — I never typed to filter, so **no exclusion rule is established.** Any assertion about this picker's contents
> must be made *after* searching. **Still solid** (from the tables, not the dropdown): BOXFUSION scored
> **59.5 → NON COMPLIANT** at Stage 2 and is absent from **Stage 3** — which does evidence the below-minimum
> exclusion for a single failing bidder.

- **Type:** Negative / decision override
- **Preconditions:** a tender at **Capture outcome from the BAC** with a BEC recommendation in place, and at
  least two functionality-compliant suppliers (otherwise the dropdown has nothing to offer).
- **Steps:**
  1. NAVIGATE to the login page and sign in as **MoshadiM / 123qwe**
  2. OPEN the tender at **Capture outcome from the BAC**; RECORD the BEC's Recommended Supplier and the
     Stage 3 ranking
  3. CLICK **Change Recommendation**
  4. ASSERT two mandatory inline fields appear: **New Recommended Supplier** and **Motivation**
  5. ASSERT the supplier dropdown excludes the current recommendation and any below-minimum supplier
  6. SELECT the alternative supplier, TYPE the Motivation, CLICK **Submit**
  7. 🔴 ASSERT (BLOCKING) the tender advances to **Approve Recommendation from BAC** — **FAILS on the first
     Submit (defect 1): it stays on the same todoid with no message. Re-Submitting advances it.**
  8. 🔴 ASSERT the BEC's original recommendation is still readable — **FAILS (defect 2): overwritten**
  9. 🔴 ASSERT Stage 3's Recommendation Status matches the new recommendation — **FAILS (defect 3)**
- **Expected result:** The BAC can substitute a different supplier with a recorded motivation; the override is
  stored **as the BAC's decision** with the BEC's recommendation preserved for audit, Stage 3 is consistent
  with it, and the tender advances on the first Submit.
- **Assertions:**
  - [x] ASSERT the decision exposes mandatory New Recommended Supplier + Motivation inline
  - [ ] ⚠️ ASSERT what the supplier picker offers — **RETRACTED, must be re-tested by typing to search** (the rendered list is only page 1 of a server-filtered query)
  - [ ] 🔴 ASSERT (BLOCKING) the first Submit advances the tender — **FAILED, intermittent, see bug**
  - [ ] 🔴 ASSERT the BEC's recommendation survives the override — **FAILED, see bug**
  - [ ] 🔴 ASSERT Stage 3 is consistent with the new recommendation — **FAILED, see bug**

---

### TC-23 — Approve Recommendation from BAC: is there a reject path? (NEGATIVE) — no ADO case — 🔴 GAP FOUND

*Establish what the approving authority can do other than approve.*

> **Inspected live 2026-07-30** on **REF2026-1053** as **ThulileM / 123qwe** (view mode **Latest**, form
> `tender-wf-approverecommendationfrombac-details v21`). **There is no reject path.** Every button on the page
> is *Reply · Hide · View In PDF · Download Batch · Download Zip · **Submit***, gated by one confirmation
> checkbox. **No Disapprove/Reject/Decline, no Send Back, no refer-back-to-BAC.** An approving authority who
> disagrees can only approve anyway or leave the tender parked. Needs a BA ruling — full write-up in
> [`bugs/2026-07-30-approve-recommendation-from-bac-has-no-reject-path.md`](../../test-reports/bugs/2026-07-30-approve-recommendation-from-bac-has-no-reject-path.md).
> Copy defects on the same page: "the **recommmendation**" and "Bid Adjudication **Commitee**".

- **Type:** Negative / coverage probe (non-destructive — inspection only, nothing submitted)
- **Steps:**
  1. SIGN IN as **ThulileM / 123qwe** and OPEN the tender at **Approve Recommendation from BAC**
  2. ENUMERATE every action offered on the page
  3. ASSERT whether any rejection, decline or send-back route exists
- **Expected result:** *Undetermined — pending a BA ruling on whether approve-only is intended.*
- **Assertions:**
  - [x] ASSERT the stage offers Submit gated by a confirmation checkbox
  - [x] ASSERT (documented) **no** reject/decline/send-back route exists at this stage

---

### TC-24 — Direct-URL authorisation: decisions vs attachments (NEGATIVE) — no ADO case — 🔴 PARTIAL FAILURE

*Confirm the workflow-action URL is authorised per assignee, not merely unlinked from other users' inboxes — for both the stage's decisions and the tender's documents.*

> **Verified live 2026-07-30. Decisions are protected; documents are NOT.**
>
> ✅ **Decisions — correct.** Signed in as **TumisangM** and opened **REF2026-1110**'s workflow-action URL, a
> task assigned to **MhlotiM** at *Review and Approve Tender Details*: the page rendered
> **"Requested action is not available"** and fell back to the read-only `tender-wf-details-view v27` — **no
> Approve, Disapprove, Send Back or Submit**. No privilege escalation.
>
> ✅ **Replay — also correct.** Re-opening a **completed** todoid (REF2026-1053's finished BAC task
> `f96a7a67…`), as **MoshadiM — the very user who completed it** — gives the same refusal and read-only view,
> with no BAC decision buttons. A finished task cannot be re-actioned from its URL.
>
> 🔴 **Attachments — FAILS. Logged as a High bug:**
> [`bugs/2026-07-30-non-participant-can-upload-and-delete-tender-attachments.md`](../../test-reports/bugs/2026-07-30-non-participant-can-upload-and-delete-tender-attachments.md).
> The same read-only page still renders a **live** upload control. As **MoshadiM**, with **no task at all** on
> **REF2026-2561**: `PUT /api/StoredFile` → **200**, the file persisted **across a full page reload**, and
> `DELETE /api/StoredFile/Delete` → **200** removed it again. So any authenticated user can plant or remove
> procurement evidence on any tender, outside the workflow and outside its audit trail.
>
> **Read access** (tender name, criteria, document tabs, response tables) is visible to non-participants too —
> arguably by design, but worth a BA opinion given the above.
>
> **Not tested:** the same write path against a *completed* tender, and against the compliance document rows
> (`RfxResponseDocument`) — the latter is the higher-value target, since Verify Compliance decisions hang off
> those documents.

- **Type:** Negative / authorisation
- **Steps:**
  1. CAPTURE a workflow-action URL from user A's inbox row (`/shesha/workflow-action?id=…&todoid=…`)
  2. SIGN IN as user B, who has SCM roles but is not the assignee, and NAVIGATE to that URL
  3. ASSERT (BLOCKING) no action controls are rendered and the app states the action is unavailable
  4. REPEAT with a **completed** todoid, as the user who completed it — ASSERT it cannot be re-actioned
  5. On the read-only view, ATTEMPT a document **upload** via "(press to upload)"
  6. ASSERT (BLOCKING) the upload is rejected — **🔴 FAILS: `PUT /api/StoredFile` → 200, persists**
  7. ATTEMPT a **delete** of an attachment — ASSERT it is rejected — **🔴 FAILS: `DELETE` → 200**
- **Expected result:** A user with no actionable task on a tender can, at most, read it. Neither decisions nor
  documents may be modified, and a completed task cannot be replayed.
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Requested action is not available" is shown to a non-assignee
  - [x] ASSERT (BLOCKING) no Approve / Disapprove / Send Back / Submit control is rendered
  - [x] ASSERT (BLOCKING) a completed todoid cannot be re-actioned, even by the user who completed it
  - [ ] 🔴 ASSERT (BLOCKING) a non-participant cannot upload an attachment — **FAILED, see bug**
  - [ ] 🔴 ASSERT (BLOCKING) a non-participant cannot delete an attachment — **FAILED, see bug**
  - [ ] ASSERT read access for non-participants is intended — *open question for the BA*

- **Type:** Negative / authorisation
- **Steps:**
  1. CAPTURE a workflow-action URL from user A's inbox row (`/shesha/workflow-action?id=…&todoid=…`)
  2. SIGN IN as user B, who has SCM roles but is not the assignee, and NAVIGATE to that URL
  3. ASSERT (BLOCKING) no action controls are rendered and the app states the action is unavailable
- **Expected result:** Only the assignee can action a task; others get, at most, a read-only view.
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Requested action is not available" is shown to a non-assignee
  - [x] ASSERT (BLOCKING) no Approve / Disapprove / Send Back / Submit control is rendered
  - [ ] ASSERT read access for non-participants is intended — *open question for the BA*

---

### TC-25 — Capture Order Details: invalid Purchase Order Amount (NEGATIVE) — no ADO case — 🔴 DEFECT FOUND

*Enter purchase-order amounts that cannot be valid — a negative value, and one far above the awarded bid price — and confirm the stage rejects them.*

> **Driven live 2026-07-30 on two parked tenders. 🔴 BOTH WERE ACCEPTED and both tenders reached AWARDED.**
> No inline validation, no toast, no server rejection — see
> [`bugs/2026-07-30-purchase-order-amount-not-validated.md`](../../test-reports/bugs/2026-07-30-purchase-order-amount-not-validated.md).
>
> | Tender | Awarded price | Amount entered | Outcome |
> |---|---|---|---|
> | **REF2026-0944** (90/10) | A & A Stationers **R 30 000** | **−5 000** | **AWARDED** |
> | **REF2026-2573** (80/20) | A & A Stationers **R 30 000** | **300 000** (10×) | **AWARDED** |
>
> The award is adjudicated on price (A & A won on 80/90 price points at R 30 000), so an unconstrained order
> amount defeats the upstream price scoring. There is also **no footer Send Back at TC-16**, so a wrong amount
> captured here cannot be corrected through the workflow.

- **Type:** Negative / validation
- **Preconditions:** a tender at **Capture Order Details** with an Order Attachment present.
- **Steps:**
  1. SIGN IN as **TumisangM / 123qwe** and OPEN the tender at **Capture Order Details**
  2. RECORD the awarded supplier's **Bid Price Incl Tax** from the Stage 3 table
  3. FILL Purchase Order No and Purchase Order Date
  4. ENTER a **negative** Purchase Order Amount
  5. 🔴 ASSERT (BLOCKING) it is rejected — **FAILS: no error, Submit enabled, submit accepted, tender AWARDED**
  6. On a second tender, ENTER an amount **far above the awarded bid price**
  7. 🔴 ASSERT (BLOCKING) it is rejected or requires a justification — **FAILS: accepted, tender AWARDED**
- **Expected result:** A negative or zero amount is refused; an amount above the awarded bid price is blocked
  or gated behind a mandatory variance justification (rule to be confirmed with the BA).
- **Assertions:**
  - [ ] 🔴 ASSERT (BLOCKING) a negative Purchase Order Amount is rejected — **FAILED, see bug**
  - [ ] 🔴 ASSERT (BLOCKING) an amount far above the awarded price is rejected/justified — **FAILED, see bug**
  - [ ] ASSERT zero, non-numeric and overflow values — *not tested*
  - [ ] ASSERT a Purchase Order Date before the award date is rejected — *not tested*

---

### TC-26 — No supplier meets the functionality minimum (NEGATIVE) — no ADO case — 🔴 DEAD END FOUND

*Score every bidder below the functionality minimum and establish what the app does when no bid qualifies technically.*

> **Driven live 2026-07-30 on a purpose-built chain, REF2026-1122 (80/20), TC-01 → TC-12.** This was the
> single biggest untested business rule in the plan. **Answer: the tender reaches BEC: Finalise recommendation
> and the one procedurally correct outcome there — "Bid is non-responsive" — is dead.** The item itself is
> **assigned and actionable** in ThabisoM's inbox; the other two decisions were **not committed**, so whether
> they would advance it is untested. Full write-up:
> [`bugs/2026-07-30-no-qualifying-bid-has-no-working-outcome.md`](../../test-reports/bugs/2026-07-30-no-qualifying-bid-has-no-working-outcome.md).
>
> **The minimum is 60 and inclusive** — an average of exactly 60 read COMPLIANT (REF2026-0944) while 59.5 read
> NON COMPLIANT (REF2026-1053), so the boundary case is settled too.
>
> Scores used (all four evaluators, via the new `FUNC_SCORE_MODE=below` gate):
> A & A **50.25** · Telkom **44.5** · BOXFUSION **37.75** — all flagged **Above Minimum = No**.
>
> What the app did:
> - **TC-10 Begin Calibration — enabled, no warning.** Advanced normally.
> - **TC-11 Finalise Scoring — enabled, no warning**, even with all three flagged No. Advanced normally.
> - **TC-12** — Final Evaluation table **empty ("No Data")**, Recommended Supplier **blank** (both correct),
>   but every decision is broken:
>   - 🔴 **Bid is non-responsive** (the correct outcome) — **DEAD**: permanent spinner, and the network trace
>     shows it loads the **same `tender-reason for disapproval` form whose metadata 404s** as *Disapprove*
>     (TC-20). One mis-bound form, two dead decisions.
>   - 🔴 **Approve Recommendation** — with the BEC Report filled, **Submit Recommendation becomes ENABLED with
>     a blank Recommended Supplier**. (Not committed — see the bug's limitations.)
>   - 🔴 **Recommend another Supplier — the picker falls back to the ENTIRE SUPPLIER MASTER, and a non-bidder
>     can be recommended.** Retested properly on a second below-minimum chain (**REF2026-1133**) by **typing to
>     search**, with **REF2026-1128** (normal scores) as the control:
>
>     | Search | REF2026-1128 (normal) | REF2026-1133 (all below minimum) |
>     |---|---|---|
>     | `Stationers` | 0 — is the current recommendation | **A & A ×10** |
>     | `Telkom` | **1** — qualifying, not recommended | **Telkom ×10** |
>     | `BOXFUSION` | 0 — below minimum | **BOXFUSION ×10** |
>     | `HOLDINGS` | 0 — not a bidder | 🔴 **PHINGOSHE HOLDINGS ×10** |
>
>     Selecting the **non-bidder** PHINGOSHE HOLDINGS **committed** (`RfxEvaluation/Crud/Update` 200,
>     `UserTaskComplete` 200) and advanced the tender to the BAC, which now shows **Recommended Supplier =
>     PHINGOSHE HOLDINGS** above an empty Stage 3. **Logged Critical:**
>     [`bugs/2026-07-30-non-bidder-can-be-recommended-when-no-bid-qualifies.md`](../../test-reports/bugs/2026-07-30-non-bidder-can-be-recommended-when-no-bid-qualifies.md).
>     On a normal tender the same picker is scoped correctly, so this is specific to the no-qualifier state.
> - Page also throws `Cannot read properties of undefined` for `technicalEvaluation` ×14, `tableData` ×11,
>   `some` ×9 — the scripts don't expect an empty evaluation set.
> - A second stale namespace 404s on page load:
>   `Boxfusion.BidManagement.Domain.Domain.TenderEvaluations.EvaluationPanelMember` (**doubled `.Domain.`**).

- **Type:** Negative / business rule
- **Preconditions:** none — this TC builds its own chain.
- **How to reproduce the data:**
  ```
  FUNC_SCORE_MODE=below EVAL_CRITERIA=80/20 HEADED=1 node scripts/run-plan.js \
    projects/bid-management/test-plans/tender-process/bid-supply-chain-management.md --grep "TC-0[1-9]"
  ```
  The gate is **opt-in** and resolved at read time, so the documented happy-path scores are untouched.
- **Steps:**
  1. RUN TC-01 → TC-09 with `FUNC_SCORE_MODE=below` so every evaluator scores every supplier under 60
  2. As **ThabisoM**, OPEN the tender at **BEC: Monitor Evaluation Progress**
  3. ASSERT the app signals that no bid qualifies — **🔴 FAILS: no warning; Begin Calibration is enabled**
  4. CLICK Begin Calibration; at **Monitor calibration and finalise scoring** ASSERT **Above Minimum = No** for
     every supplier (**passes**) and that Finalise Scoring is gated — **🔴 FAILS: enabled, no warning**
  5. CLICK Finalise Scoring; at **BEC: Finalise recommendation** ASSERT the Final Evaluation table is empty and
     Recommended Supplier is blank (**both pass**)
  6. CLICK **Bid is non-responsive** — ASSERT (BLOCKING) the tender terminates as non-responsive
     — **🔴 FAILS: permanent spinner, metadata 404**
  7. ASSERT **Approve Recommendation** cannot be submitted with no supplier — **🔴 FAILS: Submit enables**
  8. ASSERT **Recommend another Supplier** offers only functionality-compliant suppliers — **🔴 FAILS**
- **Expected result:** A tender in which no bid meets the functionality minimum can be closed out as
  non-responsive, and the app should say so before the secretariat clicks through two more stages.
- **Assertions:**
  - [x] ASSERT the functionality minimum is 60 and inclusive (60 passes, 59.5 fails)
  - [x] ASSERT Above Minimum = No is computed correctly for every below-minimum supplier
  - [x] ASSERT the Final Evaluation table is empty and no supplier is pre-recommended
  - [ ] 🔴 ASSERT (BLOCKING) **Bid is non-responsive** terminates the tender — **FAILED: dead (metadata 404)**
  - [ ] 🔴 ASSERT **Recommend another Supplier** lists each supplier once — **FAILED: every match appears ×10**
  - [ ] 🔴 ASSERT the picker is scoped to this tender's qualifying bidders — **FAILED on a below-minimum tender: it returns the ENTIRE supplier master (failed bidders AND non-bidders). Correct on a normal tender.**
  - [ ] 🔴 ASSERT a **non-bidder** cannot be recommended — **FAILED: PHINGOSHE HOLDINGS committed and advanced**
  - [ ] 🔴 ASSERT a non-bidder cannot be **AWARDED** — **FAILED: driven TC-13→TC-16 (4/4 passed); REF2026-1133 is `AWARDED` to a company that never bid, with every real bidder below the minimum. No stage objected.**
  - [ ] 🔴 ASSERT an invalid selection gives a validation message — **FAILED: an already-evaluated bidder gives a raw silent 500**
  - [ ] 🔴 ASSERT **Approve Recommendation** cannot submit a blank recommendation — **FAILED: it COMMITS and advances an empty recommendation to the BAC**
  - [ ] 🔴 ASSERT the BAC is not asked to adjudicate an empty recommendation — **FAILED: Stage 3 "No Data", Recommended Supplier blank, no warning**
  - [ ] ASSERT TC-10/TC-11 warn that no bid qualifies — **FAILED (no warning at either stage)**

> **All three decisions driven to a conclusion 2026-07-30 (evening).** The tender is **not** trapped: *Approve
> Recommendation* commits (`UserTaskComplete` 200) and advances REF2026-1122 to **Capture outcome from the BAC**,
> where the adjudicator is shown an **empty Stage 3 ("No Data")** and a **blank Recommended Supplier**. So the
> defect is not a dead end but the reverse — **the only working route is the wrong one, taken silently.**
> *Recommend another Supplier* fails with a **500** (`could not execute batch command`) and no UI message at all.

---

## Teardown
- Log out of the admin portal after test completion (optional for automated runs).

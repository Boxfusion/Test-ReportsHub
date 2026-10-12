# Test Plan: ELEAVE-VERIFY — Verify Leave Application & Verify Attachments

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-10-08
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-hcm-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | GOV003 / 123qwe (applicant), admin / P@ssw0rd (verifier), GOV012 / 123qwe (recommender — routing check only) |
| ADO Plan | [#79625](https://dev.azure.com/boxfusion/pd-Hcm/_testPlans/define?planId=79625&suiteId=86523) |
| ADO Suites | #86523 — eleave-wf-verifyleaveapplication-details, #86562 — eleave-wf-verifyattachments-details |

## Objective
> Validate the two verification steps of the eLeave workflow end-to-end on a freshly captured leave application: the applicant submits a **Family Responsibility** leave with a supporting document, then admin works the **Verify Leave** and **Verify Attachments** steps — viewing captured details, downloading documents, the Verify-button gating on download + acknowledgement, the Send Back / Close dialogs, and Verify routing the item onwards to **Recommend Leave**.

## Preconditions
- [ ] App is reachable at https://pd-hcm-adminportal-qa.shesha.app/
- [ ] GOV003, admin and GOV012 credentials are valid
- [ ] GOV003 has Family Responsibility leave days available in the current cycle
- [ ] admin is the assignee for both the Verify Leave and Verify Attachments steps (QA config at 2026-10-08)
- [ ] Fixture `test-plans/HCM/eLeave/fixtures/family-responsibility-supporting-doc.pdf` exists (the upload only accepts PDF / Word / Excel / PNG / GIF)

## Notes
- TCs run **serially** and pass the application Ref No forward. Each run submits a real leave application for GOV003 and leaves it at Recommend Leave (GOV012).
- QA spells the category `Family Rsponsibility ` (typo + trailing space) — the spec selects it by that exact title.
- The UI labels the plans' "Refer Back" action as **Send Back**.
- On both steps the **Verify** button stays disabled until the supporting documents are downloaded **and** the acknowledgement checkbox is ticked.
- Download tracking is per user and per file, not per step — admin's download at Verify Leave also satisfies the gate at Verify Attachments (see TC-09).
- The Send Back / Close dialog TCs only open and dismiss the dialog — they never confirm, so the item stays at its step.

## Test Cases

### TC-01 — Applicant captures and submits a Family Responsibility leave with an attachment

- **Type:** Setup / Happy path
- **Steps:**
  1. NAVIGATE to the login page and log in as `GOV003` / `123qwe`
  2. CLICK Workflows in the side menu, then CLICK My Items
  3. CLICK the Create New button, then CLICK New Leave Application
  4. SELECT Category — choose `Family Rsponsibility `
  5. SELECT Sub-Category — choose `Family Responsibility (Sick)`
  6. SELECT Family Relationship — choose `Children`
  7. TYPE Start Date and End Date with the same future weekday (pick a new date if it overlaps existing leave)
  8. TYPE Address with `265 West Avenue`
  9. CLICK the Supporting documents upload button and upload `family-responsibility-supporting-doc.pdf`
  10. SNAPSHOT — confirm the file is listed under Supporting documents
  11. CLICK the certification checkbox
  12. CLICK the Submit button
  13. CLICK Don't Delegate on the Delegate pop-up
  14. EXTRACT the Ref No of the top SaGov Leave Application row in My Items
- **Expected result:** The application is submitted and listed In Progress in My Items
- **Assertions:**
  - [x] ASSERT the hint "You have selected to take 1 day off" is shown after the dates are entered
  - [x] ASSERT `family-responsibility-supporting-doc.pdf` is listed under Supporting documents
  - [x] ASSERT (BLOCKING) The user is on My Items and the top row is an In Progress SaGov Leave Application for Family Responsibility (Sick) with a Ref No starting `LA`

---

### TC-02 — Verify Leave: captured leave application details are displayed (ADO #86535)

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the login page and log in as `admin` / `P@ssw0rd`
  2. NAVIGATE to Workflows › Inbox
  3. CLICK the magnifying glass (search) icon on the row with the application Ref No and Action Required `Verify Leave`
  4. SNAPSHOT — confirm the Leave Application Details section
- **Expected result:** The captured details are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The "Verify Leave: …" view opens and shows the Ref No
  - [x] ASSERT Leave Type is `Family Responsibility (Sick)`, Family Relationship is `Children`, Address is `265 West Avenue`
  - [x] ASSERT `family-responsibility-supporting-doc.pdf` is listed under Supporting Documents

---

### TC-03 — Verify Leave: cannot verify without downloading the supporting documents (ADO #86532)

- **Type:** Negative
- **Steps:**
  1. Log in as `admin` and open the `Verify Leave` Inbox item for the Ref No
  2. SNAPSHOT — confirm the "Please download and review all attachments…" warning is shown
  3. CLICK the acknowledgement checkbox (without downloading anything)
- **Expected result:** Verify stays disabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Verify button is disabled while the checkbox is ticked and no document has been downloaded

---

### TC-04 — Verify Leave: Send Back opens the Send Back dialog (ADO #86528)

- **Type:** Happy path
- **Steps:**
  1. Log in as `admin` and open the `Verify Leave` Inbox item for the Ref No
  2. CLICK the Send Back button
  3. SNAPSHOT — confirm the dialog
  4. CLICK Cancel
- **Expected result:** The Send Back dialog is displayed with Step and Comments fields
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "Send Back" dialog is shown with a Step selector, Comments field, Cancel and OK buttons
  - [x] ASSERT The dialog closes on Cancel

---

### TC-05 — Verify Leave: Close opens the Close Leave Application dialog (ADO #86530)

- **Type:** Happy path
- **Steps:**
  1. Log in as `admin` and open the `Verify Leave` Inbox item for the Ref No
  2. CLICK the Close button
  3. SNAPSHOT — confirm the dialog
  4. CLICK the dialog's Close button (dismiss without confirming)
- **Expected result:** The Close Leave Application dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "Close Leave Application" dialog is shown with "You are about close the Leave Application, do you wish to proceed?"
  - [x] ASSERT The dialog closes without closing the application

---

### TC-06 — Verify Leave: download the document, Verify needs acknowledgement too (ADO #86536, #86533)

- **Type:** Happy path / Negative
- **Steps:**
  1. Log in as `admin` and open the `Verify Leave` Inbox item for the Ref No
  2. CLICK the `family-responsibility-supporting-doc.pdf` link
  3. SNAPSHOT — confirm Verify is still disabled (checkbox not ticked)
  4. CLICK the acknowledgement checkbox
- **Expected result:** The document downloads; Verify only enables once the download is reviewed and acknowledged
- **Assertions:**
  - [x] ASSERT (BLOCKING) `family-responsibility-supporting-doc.pdf` is downloaded
  - [x] ASSERT The Verify button is disabled after the download while the checkbox is unticked
  - [x] ASSERT (BLOCKING) The Verify button is enabled once the checkbox is ticked

---

### TC-07 — Verify Leave: Verify routes the item to Verify Attachments (ADO #86525, #86526)

- **Type:** Happy path
- **Steps:**
  1. Log in as `admin` and open the `Verify Leave` Inbox item for the Ref No
  2. CLICK the `family-responsibility-supporting-doc.pdf` link
  3. CLICK the acknowledgement checkbox
  4. CLICK the Verify button
- **Expected result:** The item moves on to the Verify Attachments step. Because admin is also the Verify Attachments assignee, the app opens that next task directly instead of returning to the inbox
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Successfully Submitted" is shown
  - [x] ASSERT (BLOCKING) The user is taken to the "Verify Attachments: …" view for the same application

---

### TC-08 — Verify Attachments: captured leave application details are displayed (ADO #86576)

- **Type:** Happy path
- **Steps:**
  1. Log in as `admin`
  2. NAVIGATE to Workflows › Inbox
  3. CLICK the magnifying glass icon on the row with the Ref No and Action Required `Verify Attachments`
  4. SNAPSHOT — confirm the Leave Application Details section
- **Expected result:** The captured details are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The "Verify Attachments: …" view opens and shows the Ref No
  - [x] ASSERT Leave Type is `Family Responsibility (Sick)` and `family-responsibility-supporting-doc.pdf` is listed under Supporting Documents

---

### TC-09 — Verify Attachments: download gate carries over from Verify Leave (ADO #86573)

*Download tracking is per user and per file (`userHasDownloaded` on `StoredFile/FilesList`), not per step. admin already downloaded the document at Verify Leave (TC-06/07), so on this step only the acknowledgement checkbox is still outstanding. The "verify without downloading" negative is covered at Verify Leave (TC-03); it cannot be reproduced here while the same user works both steps.*

- **Type:** Negative
- **Steps:**
  1. Log in as `admin` and open the `Verify Attachments` Inbox item for the Ref No
  2. SNAPSHOT — confirm the "Please download and review all attachments…" warning is shown
  3. SNAPSHOT — confirm Verify is disabled before the checkbox is ticked
  4. CLICK the acknowledgement checkbox (without downloading anything on this step)
- **Expected result:** Verify stays disabled until the acknowledgement is given, then enables because admin's earlier download counts
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Verify button is disabled before the checkbox is ticked
  - [x] ASSERT The Verify button is enabled once the checkbox is ticked, without a new download

---

### TC-10 — Verify Attachments: Send Back opens the Send Back dialog (ADO #86567)

- **Type:** Happy path
- **Steps:**
  1. Log in as `admin` and open the `Verify Attachments` Inbox item for the Ref No
  2. CLICK the Send Back button
  3. CLICK Cancel
- **Expected result:** The Send Back dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "Send Back" dialog is shown with a Step selector, Comments field, Cancel and OK buttons
  - [x] ASSERT The dialog closes on Cancel

---

### TC-11 — Verify Attachments: Close opens the Close Leave Application dialog (ADO #86569)

- **Type:** Happy path
- **Steps:**
  1. Log in as `admin` and open the `Verify Attachments` Inbox item for the Ref No
  2. CLICK the Close button
  3. CLICK the dialog's Close button (dismiss without confirming)
- **Expected result:** The Close Leave Application dialog is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) A "Close Leave Application" dialog is shown with "You are about close the Leave Application, do you wish to proceed?"
  - [x] ASSERT The dialog closes without closing the application

---

### TC-12 — Verify Attachments: Download Zip, Verify activates only after review (ADO #86577, #86574, #86571)

- **Type:** Happy path / Negative
- **Steps:**
  1. Log in as `admin` and open the `Verify Attachments` Inbox item for the Ref No
  2. CLICK the Download Zip button
  3. SNAPSHOT — confirm Verify is still disabled (checkbox not ticked)
  4. CLICK the acknowledgement checkbox
- **Expected result:** The documents download as a zip; Verify activates once the download is acknowledged
- **Assertions:**
  - [x] ASSERT (BLOCKING) `Files.zip` is downloaded
  - [x] ASSERT The Verify button is disabled after the download while the checkbox is unticked
  - [x] ASSERT (BLOCKING) The Verify button is enabled once the checkbox is ticked

---

### TC-13 — Verify Attachments: Verify routes the item on and redirects home (ADO #86564, #86565)

- **Type:** Happy path
- **Steps:**
  1. Log in as `admin` and open the `Verify Attachments` Inbox item for the Ref No
  2. CLICK the Download Zip button
  3. CLICK the acknowledgement checkbox
  4. CLICK the Verify button
  5. NAVIGATE to Workflows › Inbox
- **Expected result:** The item leaves admin's inbox and admin is redirected to their My Items home page
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Successfully Submitted" is shown
  - [x] ASSERT (BLOCKING) The user is redirected to the My Items home page (`workflows-my-items`)
  - [x] ASSERT The Ref No is no longer in admin's Inbox

---

### TC-14 — Routing check: the item reaches the recommender at Recommend Leave

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to the login page and log in as `GOV012` / `123qwe`
  2. NAVIGATE to Workflows › Inbox
- **Expected result:** The application is waiting for GOV012 to recommend
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Inbox has a row for the Ref No with Action Required `Recommend Leave`

---

## Teardown
- The submitted application is left at Recommend Leave (GOV012). No cleanup is required for QA; it does not block later runs because each run picks a fresh random date.

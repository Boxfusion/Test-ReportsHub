# Test Plan: JOBS-106368 — Verify Apply for a Job

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-30
> **Estimated Duration:** 5-6 min

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104521) |
| ADO Suite | #104521 — Jobs |
| ADO Test Case | [#106368](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106368) — Verify apply for a job |

## Objective
> Validate the full "apply for a job" flow — opening a job's details, opening the Apply dialog, uploading/replacing/deleting the Z83 and CV attachments, checking both consent checkboxes, and submitting the application.

## ⚠️ Stateful / destructive test
- **This test submits a real job application in QA.** Per ADO step 14's expected result, the job post applied for **no longer appears** in the Jobs listing afterward. This consumes a real seeded job posting from the QA dataset — unlike every other Jobs/Home test case in this suite (which are read-only searches), this one mutates shared QA data.
- The job applied to is **whichever job is first in the Jobs page's unfiltered listing** at run time (not hardcoded), to avoid always consuming the same fixed record. The actual job applied to is recorded in the run's TC-03 step result / report.
- Run only with explicit authorization; re-running this plan will consume another job posting each time.

## Notes on file uploads
- ADO steps 6-8 / 9-11 / 20-22 / 28-30 describe interacting with a native OS file picker ("File explorer should open", "Select a file", "click Open button"). Playwright cannot drive a native OS dialog directly (nor can any browser-automation tool) — the correct, equivalent automation is `page.waitForEvent('filechooser')` + `fileChooser.setFiles(path)`, which performs the same net effect (select a file, close the picker, file attaches) in one step. This plan treats "click upload field" + "select file" + "click Open" as a single combined action per ADO's own effective outcome ("file rendered under Z83/CV").
- No "blank document" fixture existed in this repo. Two minimal placeholder PDFs were generated for this run: `fixtures/blank document.pdf` (used for all "select blank document" steps) and `fixtures/replacement document.pdf` (used for the "select a different file" replace steps).

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] At least one job posting exists in the unfiltered Jobs listing

## Test Cases

### TC-01 — Login as Fred

- **Steps:**
  1. NAVIGATE to https://pd-recruitment-publicportal-1-qa.shesha.app/login
  2. TYPE Username field with `Fred`
  3. TYPE Password field with `Metaganemr%03`
  4. CLICK the Sign In button
  5. WAIT for the Dashboard to load
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Dashboard is visible

---

### TC-02 — Click on Jobs menu item (ADO #106368 step 3)

- **Steps:**
  1. CLICK the Jobs menu item
- **Assertions:**
  - [x] ASSERT (BLOCKING) Jobs page is displayed with at least one job listing

---

### TC-03 — Click View & Apply on a job post (ADO #106368 step 4)

- **Steps:**
  1. CLICK "View & Apply" on the first job post in the unfiltered listing
- **Expected result:** Selected job post opens in details view
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job details view is displayed

---

### TC-04 — Click Apply button (ADO #106368 step 5)

- **Steps:**
  1. SCROLL to the bottom of the page
  2. CLICK the Apply button
- **Expected result:** Apply for a job dialog opens successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) Apply for a job dialog is visible

---

### TC-05 — Upload Z83 file (ADO #106368 steps 6-8)

- **Steps:**
  1. CLICK the Z83 field to upload
  2. SELECT `blank document.pdf`
- **Expected result:** File explorer closes and the selected file renders under the Z83 UI
- **Assertions:**
  - [x] ASSERT (BLOCKING) `blank document.pdf` is shown under the Z83 attachment UI

---

### TC-06 — Replace Z83 file (ADO #106368 steps 15-17)

- **Steps:**
  1. CLICK the Replace icon on the Z83 attachment
  2. SELECT `replacement document.pdf`
- **Expected result:** A different file is rendered under the Z83 panel
- **Assertions:**
  - [x] ASSERT (BLOCKING) `replacement document.pdf` is shown under the Z83 attachment UI

---

### TC-07 — Delete Z83 file (ADO #106368 steps 18-19)

- **Steps:**
  1. CLICK the Delete icon on the Z83 attachment
  2. CLICK Yes on the Delete attachment confirmation dialog
- **Expected result:** File is removed successfully from the Z83 panel
- **Assertions:**
  - [x] ASSERT (BLOCKING) Delete attachment dialog appeared with Cancel/Yes buttons
  - [x] ASSERT (BLOCKING) Z83 attachment UI no longer shows a file

---

### TC-08 — Re-upload Z83 file (ADO #106368 steps 20-22)

- **Steps:**
  1. CLICK the Z83 field to upload
  2. SELECT `blank document.pdf`
- **Expected result:** File explorer closes and the selected file renders under the Z83 UI
- **Assertions:**
  - [x] ASSERT (BLOCKING) `blank document.pdf` is shown under the Z83 attachment UI

---

### TC-09 — Upload CV file (ADO #106368 steps 9-11)

- **Steps:**
  1. CLICK the CV field to upload
  2. SELECT `blank document.pdf`
- **Expected result:** File explorer closes and the selected file renders under the CV UI
- **Assertions:**
  - [x] ASSERT (BLOCKING) `blank document.pdf` is shown under the CV attachment UI

---

### TC-10 — Replace CV file (ADO #106368 steps 23-25)

- **Steps:**
  1. CLICK the Replace icon on the CV attachment
  2. SELECT `replacement document.pdf`
- **Expected result:** A different file is rendered under the CV panel
- **Assertions:**
  - [x] ASSERT (BLOCKING) `replacement document.pdf` is shown under the CV attachment UI

---

### TC-11 — Delete CV file (ADO #106368 steps 26-27)

- **Steps:**
  1. CLICK the Delete icon on the CV attachment
  2. CLICK Yes on the Delete attachment confirmation dialog
- **Expected result:** File is removed successfully from the CV panel
- **Assertions:**
  - [x] ASSERT (BLOCKING) Delete attachment dialog appeared with Cancel/Yes buttons
  - [x] ASSERT (BLOCKING) CV attachment UI no longer shows a file

---

### TC-12 — Re-upload CV file (ADO #106368 steps 28-30)

- **Steps:**
  1. CLICK the CV field to upload
  2. SELECT `blank document.pdf`
- **Expected result:** File explorer closes and the selected file renders under the CV UI
- **Assertions:**
  - [x] ASSERT (BLOCKING) `blank document.pdf` is shown under the CV attachment UI

---

### TC-13 — Check both consent checkboxes (ADO #106368 steps 12-13)

- **Steps:**
  1. CHECK the "I confirm that all the information..." checkbox
  2. CHECK the "I hereby authorise the Department of Home Affairs..." checkbox
- **Expected result:** Both checkboxes are checked; Submit Application button becomes enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Both checkboxes are checked
  - [x] ASSERT (BLOCKING) Submit Application button is enabled

---

### TC-14 — Submit Application (ADO #106368 step 14)

*Note on observed behaviour vs. ADO wording: ADO says the system "navigates to Job postings page" after submitting. Confirmed live 2026-07-30: the app does NOT navigate away — it stays on the job's own details page. The real, reliable post-submission indicator is that page's Apply button changing to **"Continue Application"**. The "job post applied for should not appear under the job posting" part of ADO's expected result was confirmed accurate, but only visible by separately navigating to the Jobs listing page — the current job-details page still shows its own title in its heading, which is not the same thing.*

- **Steps:**
  1. CLICK the Submit Application button
- **Expected result:** The job's own details page shows "Continue Application" instead of "Apply"; navigating to the Jobs listing shows the applied-for job post no longer present
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Continue Application" button is shown on the job details page
  - [x] ASSERT (BLOCKING) The applied-for job post is no longer present in the Jobs listing (checked via a fresh navigation to Jobs)

---

## Teardown
- No teardown — this test intentionally consumes one seeded job posting per run (see warning above).

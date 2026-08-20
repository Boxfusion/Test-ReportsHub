# Test Plan: JOBS-106369 — Cancel Job Application

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-30
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104521) |
| ADO Suite | #104521 — Jobs |
| ADO Test Case | [#106369](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/106369) — Cancel Job Application |

## Objective
> Validate that closing the Apply dialog without submitting prompts a confirmation ("Close Without submitting"), that Cancel keeps the dialog open, and that confirming the close returns to the Jobs listing with the job post still present (no application was created).

## Notes
- This test is **read-only / non-destructive** with respect to the shared QA job data — unlike test case #106368 ("Verify apply for a job"), it never clicks Submit Application, so the job applied to remains in the listing throughout and afterward.
- The job used is whichever is first in the unfiltered Jobs listing at run time — the shared QA dataset is under concurrent modification by other testers/processes (confirmed during #106368), so this is dynamic on purpose.

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

### TC-02 — Click on Jobs menu item (ADO #106369 step 3)

- **Steps:**
  1. CLICK the Jobs menu item
- **Assertions:**
  - [x] ASSERT (BLOCKING) Jobs page is displayed with at least one job listing

---

### TC-03 — Click View & Apply on a job post (ADO #106369 step 4)

- **Steps:**
  1. CLICK "View & Apply" on the first job post in the unfiltered listing
- **Expected result:** Selected job post opens in details view
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job details view is displayed

---

### TC-04 — Click Apply button (ADO #106369 step 5)

- **Steps:**
  1. SCROLL to the bottom of the page
  2. CLICK the Apply button
- **Expected result:** Apply for a job dialog opens successfully
- **Assertions:**
  - [x] ASSERT (BLOCKING) Apply for a job dialog is visible

---

### TC-05 — Click Close button (ADO #106369 step 6)

- **Steps:**
  1. CLICK the Close button
- **Expected result:** "Close Without submitting" popup appears
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close Without submitting" confirmation popup is visible

---

### TC-06 — Click Cancel (ADO #106369 step 7)

- **Steps:**
  1. CLICK Cancel on the confirmation popup
- **Expected result:** Popup closes; Apply dialog remains open
- **Assertions:**
  - [x] ASSERT (BLOCKING) Confirmation popup is no longer visible
  - [x] ASSERT (BLOCKING) Apply for a job dialog is still visible

---

### TC-07 — Click Close button again (ADO #106369 step 8)

- **Steps:**
  1. CLICK the Close button
- **Expected result:** "Close Without submitting" popup appears again
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Close Without submitting" confirmation popup is visible

---

### TC-08 — Click Confirm button (ADO #106369 step 9)

- **Steps:**
  1. CLICK the Confirm button
- **Expected result:** System auto-refreshes and navigates back to the Jobs Postings page; the job post selected in TC-03 still appears in the listing
- **Assertions:**
  - [x] ASSERT (BLOCKING) Apply dialog is closed
  - [x] ASSERT (BLOCKING) Jobs listing page is displayed
  - [x] ASSERT (BLOCKING) The job post selected in TC-03 is still present in the listing (no application was submitted)

---

## Teardown
- No teardown required — this test does not mutate QA job data (no application is submitted).

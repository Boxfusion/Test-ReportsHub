# Test Plan: ADMINPORTAL-102826 — Upload Approved Submission Document

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-04
> **Estimated Duration:** 300s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | kamogelos / 123qwe |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #102826 has no `Tested By` relation) — same situation as #102822, see `AdminPortal/create-job-posting-valid.md`. |
| ADO Test Case | [#102826](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/102826) — Upload Approved Submission Document |

## Objective
> Validate the Documentation step of the Job Posting wizard: after completing Job Information Summary and Output and Competencies (steps 3-17, shared with #102822), upload a document into the "Approved Submission" box, confirm it appears in the file list with no errors, then additionally verify the Replace and Delete controls on the uploaded attachment (not explicit ADO steps, added at the requester's instruction to cover the full attachment lifecycle).

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (kamogelos / 123qwe)
- [ ] Fixture files exist: `fixtures/blank document.pdf`, `fixtures/replacement document.pdf`

## Test Cases

### TC-01 — Login as kamogelos

- **Steps:**
  1. NAVIGATE to https://pd-recruitment-adminportal-qa.shesha.app/login
  2. TYPE Username field with `kamogelos`
  3. TYPE Password field with `123qwe`
  4. CLICK the Sign In button
- **Expected result:** User is logged in
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Complete Job Information Summary and advance to Output and Competencies (ADO #102826 steps 3-12)

*Shared setup, identical to TC-02..TC-11 of `create-job-posting-valid.md` — expand Workflows, My Items, Create New → JobPosting, fill Recruiter/Job Info Summary fields, click Next.*

- **Expected result:** Wizard transitions to step 2 (Output and Competencies), step 1 shows completed, no network error
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Output and Competencies" step is active

---

### TC-03 — Complete Output and Competencies and advance to Documentation (ADO #102826 steps 13-17)

*Fill Requirements, Required Skills and Competencies, Duties; click Next.*

- **Expected result:** Wizard transitions to Stepper 3 (Documentation), Stepper 2 shows completed, no network errors
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Documentation" step is active

---

### TC-04 — Click inside the Approved Submission upload box (ADO #102826 step 18)

- **Steps:**
  1. CLICK the Approved Submission upload area
- **Expected result:** Upload (file chooser) dialog opens
- **Assertions:**
  - [x] ASSERT (BLOCKING) a file chooser event is emitted

---

### TC-05 — Select a valid file and upload (ADO #102826 step 19)

- **Steps:**
  1. SELECT `fixtures/blank document.pdf` in the file chooser
- **Expected result:** File is accepted and begins uploading
- **Assertions:**
  - [x] ASSERT (BLOCKING) "blank document.pdf" appears in the Approved Submission file list

---

### TC-06 — Assert file appears in the Approved Submission list (ADO #102826 step 20)

- **Steps:**
  1. VERIFY the uploaded file name in the list
- **Expected result:** Uploaded file name is displayed in the list
- **Assertions:**
  - [x] ASSERT (BLOCKING) "blank document.pdf" text is visible

---

### TC-07 — Verify no error message is displayed (ADO #102826 step 21)

- **Steps:**
  1. VERIFY no error/warning notification is shown
- **Expected result:** No error or warning messages appear
- **Assertions:**
  - [x] ASSERT (BLOCKING) no `.ant-message-error` / `.ant-notification-notice-error` element is present

---

### TC-08 — Replace the uploaded document (additional coverage, not an explicit ADO step)

- **Steps:**
  1. CLICK the Replace (sync icon) control on the "blank document.pdf" list item
  2. SELECT `fixtures/replacement document.pdf` in the file chooser
- **Expected result:** The list item now shows "replacement document.pdf" and "blank document.pdf" is gone
- **Assertions:**
  - [x] ASSERT (BLOCKING) "replacement document.pdf" is visible
  - [x] ASSERT (BLOCKING) "blank document.pdf" is no longer present

---

### TC-09 — Delete the uploaded document (additional coverage, not an explicit ADO step)

- **Steps:**
  1. CLICK the Remove (delete icon) control on the "replacement document.pdf" list item
  2. CLICK "Yes" on the "Delete Attachment" confirmation modal
- **Expected result:** The attachment is removed from the Approved Submission list
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Delete Attachment" confirmation modal is shown before deletion
  - [x] ASSERT (BLOCKING) "replacement document.pdf" is no longer present after confirming

---

## Teardown
- No teardown required for automated runs. Each TC re-runs the full flow from login (this hub's serial-TC convention), so every execution creates a fresh Draft JobPosting record in the shared QA dataset. A unique Job Reference Number is generated per TC run to avoid collisions.

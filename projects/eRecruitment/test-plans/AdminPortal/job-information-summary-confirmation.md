# Test Plan: ADMINPORTAL-102830 — Job Information Summary (Confirmation carryover)

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-04
> **Estimated Duration:** 320s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | kamogelos / 123qwe |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #102830 has no `Tested By` relation) — same situation as #102822/#102826/#102827. |
| ADO Test Case | [#102830](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/102830) — Job Information Summary |

## Objective
> Validate that after completing the Job Posting wizard (Job Information Summary → Output and Competencies → Documentation, uploading a Supporting Document) and advancing to the Confirmation step, the values captured under Job Information Summary — Job Reference Number, Province/Branch, Salary Range, Centre/Office Name, and Closing Date — are correctly carried over and displayed read-only on the Confirmation step's "Job Information Summary" tab. Additionally verifies the Replace and Delete controls on the uploaded Supporting Document (not explicit ADO steps, added at the requester's instruction to cover the full attachment lifecycle).

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

### TC-02 — Complete Job Information Summary and advance to Output and Competencies (ADO #102830 steps 3-12)

*Shared setup — expand Workflows, My Items, Create New → JobPosting, fill Recruiter/Job Info Summary fields, click Next.*

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Output and Competencies" step is active

---

### TC-03 — Complete Output and Competencies and advance to Documentation (ADO #102830 steps 13-17)

*Fill Requirements, Required Skills and Competencies, Duties; click Next.*

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Documentation" step is active

---

### TC-04 — Click inside the Supporting Documents upload box (ADO #102830 step 18)

- **Assertions:**
  - [x] ASSERT (BLOCKING) a file chooser event is emitted

---

### TC-05 — Select a valid file and upload (ADO #102830 step 19)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "blank document.pdf" appears in the Supporting Documents file list

---

### TC-06 — Assert file appears in the Supporting Documents list (ADO #102830 step 20)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "blank document.pdf" text is visible

---

### TC-07 — Verify no error message is displayed (ADO #102830 step 21)

- **Assertions:**
  - [x] ASSERT (BLOCKING) no `.ant-message-error` / `.ant-notification-notice-error` element is present

---

### TC-08 — Click Next button (ADO #102830 step 23)

- **Expected result:** System navigates to the next step, Confirmation
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Confirmation" step is active and the "Job Information Summary" tab is shown

---

### TC-09 — Check that Job Reference Number field is populated (ADO #102830 step 24)

- **Expected result:** Field matches the value entered under the Job Information Summary step
- **Assertions:**
  - [x] ASSERT (BLOCKING) Confirmation's Job Reference Number equals the value typed earlier

---

### TC-10 — Check that Province/Branch field is populated (ADO #102830 step 25)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Confirmation's Province / Branch equals the value typed earlier

---

### TC-11 — Check that Salary Range field is populated (ADO #102830 step 26)

- **Expected result:** Field matches the Salary Range derived from the selected Salary Level
- **Assertions:**
  - [x] ASSERT (BLOCKING) Confirmation's Salary Range is populated (non-empty, formatted as a currency range)

---

### TC-12 — Check that Centre/Office Name field is populated (ADO #102830 step 27)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Confirmation's Centre / Office Name equals the value selected earlier

---

### TC-13 — Check that Closing Date field is populated (ADO #102830 step 28)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Confirmation's Closing Date equals the date picked earlier

---

### TC-14 — Replace the uploaded document (additional coverage, not an explicit ADO step)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "replacement document.pdf" is visible after replacing
  - [x] ASSERT (BLOCKING) "blank document.pdf" is no longer present

---

### TC-15 — Delete the uploaded document (additional coverage, not an explicit ADO step)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Delete Attachment" confirmation modal is shown before deletion
  - [x] ASSERT (BLOCKING) attachment is no longer present after confirming

---

## Teardown
- No teardown required for automated runs. Each TC re-runs the full flow from login (this hub's serial-TC convention), so every execution creates a fresh Draft JobPosting record in the shared QA dataset. A unique Job Reference Number is generated per TC run to avoid collisions.

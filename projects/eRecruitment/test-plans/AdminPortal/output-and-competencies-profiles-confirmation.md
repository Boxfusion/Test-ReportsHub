# Test Plan: ADMINPORTAL-102834 — Output and Competencies Profiles

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
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #102834 has no `Tested By` relation) — same situation as #102822/#102826/#102827/#102830. |
| ADO Test Case | [#102834](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/102834) — Output and Competencies Profiles |

## Objective
> Validate that after completing the Job Posting wizard (Job Information Summary → Output and Competencies → Documentation, uploading a Supporting Document) and advancing to the Confirmation step, the values captured under Output and Competencies — Requirements, Required Skills and Competencies, and Duties — are correctly carried over and displayed read-only on the Confirmation step's "Output and Competency Profiles" tab.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (kamogelos / 123qwe)
- [ ] Fixture file exists: `fixtures/blank document.pdf`

## Test Cases

### TC-01 — Login as kamogelos

- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Complete Job Information Summary and advance to Output and Competencies (ADO #102834 steps 3-12)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Output and Competencies" step is active

---

### TC-03 — Complete Output and Competencies and advance to Documentation (ADO #102834 steps 13-17)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "Documentation" step is active

---

### TC-04 — Click inside the Supporting Documents upload box (ADO #102834 step 18)

- **Assertions:**
  - [x] ASSERT (BLOCKING) a file chooser event is emitted

---

### TC-05 — Select a valid file and upload (ADO #102834 step 19)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "blank document.pdf" appears in the Supporting Documents file list

---

### TC-06 — Assert file appears in the Supporting Documents list (ADO #102834 step 20)

- **Assertions:**
  - [x] ASSERT (BLOCKING) "blank document.pdf" text is visible

---

### TC-07 — Verify no error message is displayed (ADO #102834 step 21)

- **Assertions:**
  - [x] ASSERT (BLOCKING) no `.ant-message-error` / `.ant-notification-notice-error` element is present

---

### TC-08 — Click Next button (ADO #102834 step 23)

- **Expected result:** System navigates to the next step, Confirmation
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Confirmation" step is active

---

### TC-09 — Click on Output and Competencies tab (ADO #102834 step 22)

- **Steps:**
  1. CLICK the "Output and Competency Profiles" tab on the Confirmation step
- **Expected result:** Output and competencies details should be displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Competency Profile" panel with Requirements/Required Skills and Competencies/Duties is visible

---

### TC-10 — Check if the Requirements field is populated (ADO #102834 step 24)

- **Expected result:** Field matches the Requirements value populated under the Output and Competencies step
- **Assertions:**
  - [x] ASSERT (BLOCKING) Confirmation's Requirements equals the value typed earlier

---

### TC-11 — Check that Required Skills and Competencies is populated (ADO #102834 step 25)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Confirmation's Required Skills and Competencies equals the value typed earlier

---

### TC-12 — Check that Duties field is populated (ADO #102834 step 26)

- **Assertions:**
  - [x] ASSERT (BLOCKING) Confirmation's Duties equals the value typed earlier

---

## Teardown
- No teardown required for automated runs. Each TC re-runs the full flow from login (this hub's serial-TC convention), so every execution creates a fresh Draft JobPosting record in the shared QA dataset. A unique Job Reference Number is generated per TC run to avoid collisions.

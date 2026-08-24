# Test Plan: ADMINPORTAL-102822 — Create Job Post (Valid)

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-08-04
> **Estimated Duration:** 240s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-adminportal-qa.shesha.app/ |
| Environment | QA |
| Login As | kamogelos / 123qwe |
| ADO Plan | [#99437 — eRecruitment Test Plan](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437) |
| ADO Suite | Not currently linked to a suite in Test Plan #99437 (work item #102822 has no `Tested By` relation). Near-duplicate test cases with the same title exist as suite members: [#102820](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/102820) in suite #102817 "Job information Summary", and [#100689](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/100689) in suite #99962 "Create a Job Post". |
| ADO Test Case | [#102822](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/102822) — Create Job Post ( Valid) |

## Objective
> Validate that a recruiter can capture a new Job Posting on the Admin Portal: expand the Workflows menu, open My Items, create a new Job Posting, complete the Job Information Summary (recruiter, reference/post/branch details, centre/office, salary level, closing date), and complete the Output and Competencies step (requirements, required skills, duties), confirming the wizard advances correctly at each gate and the enabled/disabled state of the "Next" button tracks form validity.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-adminportal-qa.shesha.app/
- [ ] Recruiter credentials are valid (kamogelos / 123qwe)

## Test Cases

### TC-01 — Login as kamogelos

- **Type:** Happy path
- **Steps:**
  1. NAVIGATE to https://pd-recruitment-adminportal-qa.shesha.app/login
  2. TYPE Username field with `kamogelos`
  3. TYPE Password field with `123qwe`
  4. CLICK the Sign In button
  5. WAIT for the landing page to load
- **Expected result:** User is logged in and the landing page is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login`

---

### TC-02 — Expand the Workflows menu (ADO #102822 step 3)

- **Steps:**
  1. CLICK the Workflows sidebar icon
- **Expected result:** The submenus (Inbox, Sent Items, My Items, Draft) should be displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "My Items" submenu item is visible

---

### TC-03 — Navigate to My Items submenu (ADO #102822 step 4)

- **Steps:**
  1. CLICK the My Items submenu item
- **Expected result:** My Items page is displayed with the Create New and Export buttons, and an index table
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Create New" button is visible
  - [x] ASSERT (BLOCKING) "Export" button is visible

---

### TC-04 — Click on the Create New button (ADO #102822 step 5)

- **Steps:**
  1. CLICK the Create New button
- **Expected result:** The Job Posting menu item should be displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) "JobPosting" menu item is visible

---

### TC-05 — Click on the Job posting item (ADO #102822 step 6)

- **Steps:**
  1. CLICK the Job posting menu item
- **Expected result:** Two panels are displayed: Recruiter Details and Job Information Summary
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Recruiter Details" panel is visible
  - [x] ASSERT (BLOCKING) "Job Information Summary" panel is visible

---

### TC-06 — Click on the Name and Surname dropdown (ADO #102822 step 7)

- **Steps:**
  1. CLICK the Name and Surname dropdown
- **Expected result:** The list of recruiters is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Recruiter option list is visible

---

### TC-07 — Select a valid option from Name and Surname (ADO #102822 step 8)

- **Steps:**
  1. SELECT a valid recruiter from the Name and Surname dropdown
- **Expected result:** The selected name is displayed successfully, and the linked Email Address / Contact No auto-populate
- **Assertions:**
  - [x] ASSERT (BLOCKING) Name and Surname field shows the selected recruiter

---

### TC-08 — Fill Job Reference Number, Province/Branch, Post Name (ADO #102822 step 9)

- **Steps:**
  1. TYPE a unique reference into the Job Reference Number field
  2. TYPE a value into the Province / Branch field
  3. TYPE a value into the Post Name field
- **Expected result:** The alphanumeric characters appear clearly in all three text boxes
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Reference Number field contains the typed value
  - [x] ASSERT (BLOCKING) Province / Branch field contains the typed value
  - [x] ASSERT (BLOCKING) Post Name field contains the typed value

---

### TC-09 — Select Centre/Office Name and Salary Level (ADO #102822 step 10)

- **Steps:**
  1. SELECT a valid option from the Centre / Office Name dropdown
  2. SELECT a valid option from the Salary Level dropdown
- **Expected result:** The chosen options load and lock into both dropdown boxes
- **Assertions:**
  - [x] ASSERT (BLOCKING) Centre / Office Name field shows the selected value
  - [x] ASSERT (BLOCKING) Salary Level field shows the selected value

---

### TC-10 — Pick a valid future Closing Date (ADO #102822 step 11)

- **Steps:**
  1. CLICK the Closing Date datepicker icon
  2. SELECT a valid future date
- **Expected result:** The "Next" button instantly shifts from disabled to a fully active, clickable state
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Next" button is enabled

---

### TC-11 — Click the Next button (ADO #102822 step 12)

- **Steps:**
  1. CLICK the Next button
- **Expected result:** The wizard transitions smoothly to step 2 (Output and Competencies)
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Output and Competencies" step is active

---

### TC-12 — Type into the Requirements text area (ADO #102822 step 13)

- **Steps:**
  1. CLICK into the Requirements text area
  2. TYPE a valid description block
- **Expected result:** Alphanumeric characters populate smoothly inside the container
- **Assertions:**
  - [x] ASSERT (BLOCKING) Requirements field contains the typed value

---

### TC-13 — Type into the Required Skills and Competencies text area (ADO #102822 step 14)

- **Steps:**
  1. CLICK into the Required Skills and Competencies text area
  2. TYPE a valid list of qualifications
- **Expected result:** Alphanumeric characters populate smoothly inside the container
- **Assertions:**
  - [x] ASSERT (BLOCKING) Required Skills and Competencies field contains the typed value

---

### TC-14 — Type into the Duties text area (ADO #102822 step 15)

- **Steps:**
  1. CLICK into the Duties text area
  2. TYPE a valid summary of core responsibilities
- **Expected result:** Alphanumeric characters populate smoothly inside the container
- **Assertions:**
  - [x] ASSERT (BLOCKING) Duties field contains the typed value

---

### TC-15 — Assert Next button state change (ADO #102822 step 16)

- **Steps:**
  1. VERIFY the form wizard navigation control after the final mandatory field is populated
- **Expected result:** The "Next" button instantly shifts from disabled to a fully active, clickable state the moment the final mandatory text area is populated
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Next" button is enabled

---

### TC-16 — Click the newly enabled Next button (ADO #102822 step 17)

- **Steps:**
  1. CLICK the Next button
- **Expected result:** The wizard transitions smoothly to Stepper 3 (Documentation), Stepper 2 updates to a completed visual state, and no network errors are thrown
- **Assertions:**
  - [x] ASSERT (BLOCKING) "Documentation" step is active
  - [x] ASSERT (BLOCKING) no error toast/notification is shown

---

## Teardown
- No teardown required for automated runs. Each TC re-runs the full flow from login (per this hub's serial-TC convention), so every execution creates a fresh Draft JobPosting record in the shared QA dataset — this is expected and matches the stateful pattern used by other specs in this project (e.g. `Jobs/verify-apply-for-a-job.md`). A unique Job Reference Number is generated per TC run to avoid collisions.

# Test Plan: PROFILE-104637 — Add Work Experience

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-16
> **Estimated Duration:** 150s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104637](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104637) — Add Work Experience |

## Objective
> Validate adding a Work Experience entry via the "Add Experience" modal — Company Name, Sector dropdown, Job Title, the "Is this current employer?" toggle (which hides Reason for Leaving and simplifies Employment Period to a single date), the Employment Period date picker, Duties and Responsibilities, submitting via OK, and advancing to Skills.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Tertiary Qualifications steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- ADO step 6 wording about Personal Details is stale for this environment, as with prior Profile plans — Manage Profile opens directly on the next incomplete step.
- **"Add Experience" opens a modal** (`.ant-modal`), the same pattern as Tertiary Qualifications' "Add Qualification".
- **Employment Period is a date-range picker by default** (separate "Start date" / "End date" inputs). Toggling **"Is this current employer?"** ON hides the **Reason for Leaving** textarea entirely and collapses Employment Period to a **single** date field (placeholder changes from "Start date"/"End date" to "Select date") — matching ADO step 13's "employment start and end dates should be hidden" (the end-date half of the range disappears; a single start-style date remains, now generically labelled).
- **Sector** options (Public Sector / Private Sector) are directly clickable, unlike some other dropdowns in this suite that have hidden-node click issues.
- Every TC deletes any existing row(s) first (same delete + Popconfirm "OK" pattern as Tertiary Qualifications), so repeated runs don't accumulate duplicates.

## Test Cases

### TC-01 — Login as Fred

- **Steps:**
  1. NAVIGATE to https://pd-recruitment-publicportal-1-qa.shesha.app/login
  2. TYPE Username field with `Fred`
  3. TYPE Password field with `Metaganemr%03`
  4. CLICK the Sign In button
  5. WAIT for the Dashboard to load
- **Expected result:** User is logged in and the Dashboard is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) URL no longer contains `/login` and the Dashboard is visible

---

### TC-02 — Click on Work Experience tab (ADO #104637 steps 6-7)

*Work Experience page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Work Experience step in the left rail
- **Expected result:** Work Experience heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Work Experience heading is visible

---

### TC-03 — Click Add Experience button (ADO #104637 step 8)

*Add Work Experience modal should open successfully.*

- **Steps:**
  1. Delete any existing work experience row(s) first (precondition, not an ADO step)
  2. CLICK the Add Experience button
- **Expected result:** Add Work Experience modal opens with Company Name, Sector, Job Title, Is this current employer, Employment Period, Reason for Leaving and Duties and Responsibilities fields
- **Assertions:**
  - [x] ASSERT (BLOCKING) The "Add Work Experience" modal is visible

---

### TC-04 — Populate Company Name (ADO #104637 step 9)

*Company name should be populated successfully.*

- **Steps:**
  1. TYPE a company name (e.g. "Boxfusion")
- **Expected result:** The field displays the typed value
- **Assertions:**
  - [x] ASSERT (BLOCKING) Company Name field contains the typed value

---

### TC-05 — Sector dropdown (ADO #104637 steps 10-11)

*Selecting an option should display it in the field.*

- **Steps:**
  1. CLICK the Sector dropdown
  2. SELECT "Public Sector"
- **Expected result:** The list shows Public Sector and Private Sector; the selected option is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Sector field displays "Public Sector"

---

### TC-06 — Populate Job Title (ADO #104637 step 12)

*Job title should be populated successfully.*

- **Steps:**
  1. TYPE a job title (e.g. "Software Engineer")
- **Expected result:** The field displays the typed value
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Title field contains the typed value

---

### TC-07 — Switch on "Is this Current Employer" toggle (ADO #104637 step 13)

*Reason for Leaving and the end-date half of Employment Period should be hidden.*

- **Steps:**
  1. CLICK/toggle the "Is this current employer?" switch on
- **Expected result:** Reason for Leaving textarea is hidden; Employment Period collapses to a single date field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Reason for Leaving field is not visible
  - [x] ASSERT (BLOCKING) Employment Period's End date input is no longer present

---

### TC-08 — Employment Period datepicker (ADO #104637 steps 14-15)

*Calendar should open and accept a previous date.*

- **Steps:**
  1. CLICK the Employment Period date field
  2. SELECT a previous date from the calendar
- **Expected result:** Calendar opens; selected date is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) The calendar picker (`.ant-picker-panel`) is visible when the field is clicked
  - [x] ASSERT (BLOCKING) Employment Period field is non-empty after selection

---

### TC-09 — Populate Duties and Responsibilities and click OK (ADO #104637 steps 16-17)

*Submitting should add the row and enable Save/Next.*

- **Steps:**
  1. TYPE duties and responsibilities (e.g. "Test Case Generation")
  2. CLICK the OK button
- **Expected result:** The experience is added to the table; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) The new row (Company Name="Boxfusion") is visible in the table after OK
  - [x] ASSERT (BLOCKING) Next button is enabled

---

### TC-10 — Click Next button (ADO #104637 step 18)

*System should move to Skills.*

- **Steps:**
  1. CLICK the Next button
- **Expected result:** The system moves to the next step, Skills
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Skills heading is visible after clicking Next

---

## Teardown
- No teardown required for automated runs — each run deletes any pre-existing row(s) before adding its own (see TC-03), so repeated runs don't accumulate duplicates.

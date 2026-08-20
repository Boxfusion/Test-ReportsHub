# Test Plan: PROFILE-104638 — Add Work Experience Not a current employer

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-16
> **Estimated Duration:** 160s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104638](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104638) — Add Work Experience Not a current employer |

## Objective
> Validate adding a Work Experience entry via the "Add Experience" modal when **NOT** marked as a current employer — the sibling case to PROFILE-104637 (which toggles "Is this current employer?" ON). This case leaves the toggle OFF, so Employment Period stays a start/end date-range picker (two calendars) and Reason for Leaving must be populated, then submits via OK and advances to Skills.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Tertiary Qualifications steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- Steps 6-12 are identical to PROFILE-104637 (Add Experience modal, Company Name="Boxfusion", Sector="Public Sector", Job Title="Software Engineer").
- With the "Is this current employer?" toggle left OFF, **Employment Period renders as a dual-calendar range picker** — clicking the field opens two month panels (the current month and the next). Selecting a start date does **not** close the picker; the end date is then selected from the **same open picker** (the second panel showed all dates disabled in this run, so the end date was selected from the first panel too, on a day after the start day).
- **Dates after "today" are disabled** in the calendar (Employment End cannot be in the future) — this plan picks small, clearly-past days (5th and 15th of the currently-displayed month) for start/end to stay safely clear of that boundary regardless of which day of the month the test runs on.
- Reason for Leaving is populated here (e.g. "New Challenges"), unlike PROFILE-104637 where it's hidden by the current-employer toggle.

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

### TC-02 — Click on Work Experience tab (ADO #104638 steps 6-7)

*Work Experience page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Work Experience step in the left rail
- **Expected result:** Work Experience heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Work Experience heading is visible

---

### TC-03 — Click Add Experience button (ADO #104638 step 8)

*Add Work Experience modal should open successfully.*

- **Steps:**
  1. Delete any existing work experience row(s) first (precondition, not an ADO step)
  2. CLICK the Add Experience button
- **Expected result:** Add Work Experience modal opens
- **Assertions:**
  - [x] ASSERT (BLOCKING) The "Add Work Experience" modal is visible

---

### TC-04 — Populate Company Name (ADO #104638 step 9)

*Company name should be populated successfully.*

- **Steps:**
  1. TYPE a company name (e.g. "Boxfusion")
- **Expected result:** The field displays the typed value
- **Assertions:**
  - [x] ASSERT (BLOCKING) Company Name field contains the typed value

---

### TC-05 — Sector dropdown (ADO #104638 steps 10-11)

*Selecting an option should display it in the field.*

- **Steps:**
  1. CLICK the Sector dropdown
  2. SELECT "Public Sector"
- **Expected result:** The list shows Public Sector and Private Sector; the selected option is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Sector field displays "Public Sector"

---

### TC-06 — Populate Job Title (ADO #104638 step 12)

*Job title should be populated successfully.*

- **Steps:**
  1. TYPE a job title (e.g. "Software Engineer")
- **Expected result:** The field displays the typed value
- **Assertions:**
  - [x] ASSERT (BLOCKING) Job Title field contains the typed value

---

### TC-07 — Employment Period datepicker opens (ADO #104638 step 13)

*Two calendars for start date and end date should open.*

- **Steps:**
  1. CLICK the Employment Period date field
- **Expected result:** Two calendar panels open
- **Assertions:**
  - [x] ASSERT (BLOCKING) Two `.ant-picker-panel` calendar panels are visible

---

### TC-08 — Select start and end dates (ADO #104638 steps 14-15)

*Start Date and End Date should appear in the field.*

- **Steps:**
  1. SELECT a previous day for the start date
  2. SELECT a later (but still past) day for the end date
- **Expected result:** Start Date and End Date both display in the Employment Period field
- **Assertions:**
  - [x] ASSERT (BLOCKING) Employment Period field shows both the selected start and end dates

---

### TC-09 — Populate Reason for Leaving and Duties, click OK (ADO #104638 steps 16-18)

*Submitting should add the row and enable Save/Next.*

- **Steps:**
  1. TYPE reason for leaving (e.g. "New Challenges")
  2. TYPE duties and responsibilities (e.g. "Test Case Generation")
  3. CLICK the OK button
- **Expected result:** The experience is added to the table; Save and Next buttons are enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) The new row (Company Name="Boxfusion") is visible in the table after OK
  - [x] ASSERT (BLOCKING) Next button is enabled

---

### TC-10 — Click Next button (ADO #104638 step 19)

*System should move to Skills.*

- **Steps:**
  1. CLICK the Next button
- **Expected result:** The system moves to the next step, Skills
- **Assertions:**
  - [x] ASSERT (BLOCKING) The Skills heading is visible after clicking Next

---

## Teardown
- No teardown required for automated runs — each run deletes any pre-existing row(s) before adding its own (see TC-03), so repeated runs don't accumulate duplicates.

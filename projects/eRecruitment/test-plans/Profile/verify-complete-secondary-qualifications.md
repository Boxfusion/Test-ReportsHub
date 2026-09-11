# Test Plan: PROFILE-104623 — Verify Complete Secondary Qualifications

> **Status:** Ready
> **Owner:** QA
> **Last Updated:** 2026-07-06
> **Estimated Duration:** 90s

## Metadata
| Field | Value |
|-------|-------|
| App URL | https://pd-recruitment-publicportal-1-qa.shesha.app/ |
| Environment | QA |
| Login As | Fred / Metaganemr%03 |
| ADO Plan | [#99437](https://dev.azure.com/boxfusion/pd-recruitment/_testPlans/define?planId=99437&suiteId=104586) |
| ADO Suite | #104586 — Profile Details |
| ADO Test Case | [#104623](https://dev.azure.com/boxfusion/pd-recruitment/_workitems/edit/104623) — Verify Complete Secondary Qualifications |

## Objective
> Validate the **Secondary Qualifications** step of the Manage Profile flow — Institution/Qualification Name fields, the Qualification Type dropdown, and specifically the **Complete** Qualification Status option, which reveals a Date Obtained date picker.

## Preconditions
- [ ] App is reachable at https://pd-recruitment-publicportal-1-qa.shesha.app/
- [ ] Applicant credentials are valid (Fred / Metaganemr%03)
- [ ] Personal Details through Languages steps are already complete for Fred

## Notes on observed behaviour vs. ADO wording
- Unlike Languages, **Secondary Qualifications is a single-record form**, not a repeatable add-to-table flow — there is no `+`/add button. Values are simply overwritten on Save/Next, so this plan doesn't need cleanup logic.
- **Qualification Type** options are Grade 9 (default), Grade 10 and National (vocational) Certificates level 2, Grade 11 and National (vocational) Certificates level 3, Grade 12 (National Senior Certificate) and National (vocational) Certificates level 4, Higher Certificates and Advanced National (vocational) Certificates level 5 (ADO mentions "Grade 9, Grade 10 etc." and "Higher Certificates" — matches).
- **Qualification Status** options are In Progress (default) and Complete, matching ADO exactly.
- ADO step 16 is blank in the work item (an empty ActionStep) — this plan interprets it as continuing to click Next, verifying the step saves and moves to Tertiary Qualifications.

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

### TC-02 — Click on Secondary Qualifications tab (ADO #104623 step 7)

*Secondary Qualifications page should open successfully.*

- **Steps:**
  1. CLICK the Manage Profile menu item
  2. CLICK the Secondary Qualifications step in the left rail
- **Expected result:** Secondary Qualifications heading and its fields are displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Secondary Qualifications heading is visible

---

### TC-03 — Populate Institution and Qualification Name (ADO #104623 steps 8-9)

*Both fields should be populated successfully.*

- **Steps:**
  1. TYPE an institution name (e.g. "Tshwane High School")
  2. TYPE a qualification name (e.g. "NSC")
- **Expected result:** Both fields display the typed values
- **Assertions:**
  - [x] ASSERT (BLOCKING) Institution field contains the typed value
  - [x] ASSERT (BLOCKING) Qualification Name field contains the typed value

---

### TC-04 — Qualification Type dropdown (ADO #104623 steps 10-11)

*Selecting an option should display it in the field.*

- **Steps:**
  1. CLICK the Qualification Type dropdown
  2. SELECT "Higher Certificates and Advanced National (vocational) Certificates level 5"
- **Expected result:** The list shows Grade 9, Grade 10, Grade 11, Grade 12, Higher Certificates...; the selected option is displayed
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Type field displays the selected "Higher Certificates..." option

---

### TC-05 — Qualification Status: Complete reveals Date Obtained (ADO #104623 steps 12-13)

*Date Obtained date picker field should be enabled when Complete is selected.*

- **Steps:**
  1. CLICK the Qualification Status dropdown
  2. SELECT "Complete"
- **Expected result:** The list shows In Progress, Complete; Date Obtained field appears and is enabled
- **Assertions:**
  - [x] ASSERT (BLOCKING) Qualification Status field displays "Complete"
  - [x] ASSERT (BLOCKING) Date Obtained field is visible and enabled

---

### TC-06 — Date Obtained picker and Next navigation (ADO #104623 steps 14-16)

*Calendar should open, accept a previous date, and enable Save/Next; clicking Next should proceed to Tertiary Qualifications.*

- **Steps:**
  1. CLICK the Date Obtained field
  2. SELECT a previous date from the calendar
  3. CLICK the Next button
- **Expected result:** Calendar opens; selected date is displayed; Save and Next buttons are enabled; the system moves to Tertiary Qualifications
- **Assertions:**
  - [x] ASSERT (BLOCKING) The calendar picker (`.ant-picker-panel`) is visible when the field is clicked
  - [x] ASSERT (BLOCKING) Date Obtained field is non-empty after selection
  - [x] ASSERT (BLOCKING) Next button is enabled
  - [x] ASSERT (BLOCKING) The Tertiary Qualifications heading is visible after clicking Next

---

## Teardown
- No teardown required for automated runs (single-record form; values are overwritten on the next run, not accumulated).
